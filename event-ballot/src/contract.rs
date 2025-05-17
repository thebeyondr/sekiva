#![doc = include_str!("../README.md")]
#![allow(unused_variables)]

#[macro_use]
extern crate pbc_contract_codegen;
extern crate pbc_contract_common;
extern crate pbc_lib;

mod zk_compute;

use create_type_spec_derive::CreateTypeSpec;
use pbc_contract_common::address::Address;
use pbc_contract_common::address::Shortname;
use pbc_contract_common::context::ContractContext;
use pbc_contract_common::events::EventGroup;
use pbc_contract_common::sorted_vec_map::SortedVecMap;
use pbc_contract_common::zk::CalculationStatus;
use pbc_contract_common::zk::{SecretVarId, ZkInputDef, ZkState, ZkStateChange};
use pbc_traits::ReadWriteState;
use pbc_zk::Sbi8;
use read_write_rpc_derive::ReadWriteRPC;
use read_write_state_derive::ReadWriteState;

// Event shortname constants
const STATUS_CHANGED_SHORTNAME: Shortname = Shortname::from_u32(0x50);

/// Secret vote metadata
#[derive(ReadWriteState, ReadWriteRPC, Debug)]
#[repr(u8)]
enum SecretVarType {
    #[discriminant(0)]
    Vote {},
    #[discriminant(1)]
    TallyResult {},
}

#[derive(CreateTypeSpec, ReadWriteState, Debug, PartialEq, Clone, Copy, ReadWriteRPC)]
#[repr(u8)]
enum BallotStatus {
    #[discriminant(0)]
    Created {},
    #[discriminant(1)]
    Active {},
    #[discriminant(2)]
    Tallying {},
    #[discriminant(3)]
    Completed {},
    #[discriminant(4)]
    Cancelled {},
}

#[derive(CreateTypeSpec, ReadWriteState, Debug, PartialEq, Clone, Copy)]
#[repr(u8)]
enum BallotProcessState {
    #[discriminant(0)]
    Created {},
    #[discriminant(1)]
    Deployed {},
    #[discriminant(2)]
    Active {},
    #[discriminant(3)]
    Tallying {},
    #[discriminant(4)]
    Completed {},
    #[discriminant(5)]
    Cancelled {},
}

#[derive(CreateTypeSpec, ReadWriteState, Debug, PartialEq, Clone, Copy)]
#[repr(u8)]
enum ProcessState {
    #[discriminant(0)]
    Received {},
    #[discriminant(1)]
    Complete {},
    #[discriminant(2)]
    Ignored {},
}

#[derive(CreateTypeSpec, ReadWriteState, Clone)]
struct Tally {
    pub option_0: u32,
    pub option_1: u32,
    pub option_2: u32,
    pub option_3: u32,
    pub option_4: u32,
    pub total: u32,
}

#[derive(CreateTypeSpec, ReadWriteState, Clone)]
struct TallyResult {
    pub option_0: u32,
    pub option_1: u32,
    pub option_2: u32,
    pub option_3: u32,
    pub option_4: u32,
}

#[derive(CreateTypeSpec, ReadWriteState, ReadWriteRPC, Clone)]
#[repr(u8)]
enum BallotEvent {
    #[discriminant(0)]
    MembersUpdated {
        added: Vec<Address>,
        removed: Vec<Address>,
        timestamp: u64,
        process_id: String,
    },
    #[discriminant(1)]
    VoteCast {
        voter: Address,
        timestamp: u64,
        process_id: String,
    },
    #[discriminant(2)]
    TallyStarted { timestamp: u64, process_id: String },
    #[discriminant(3)]
    TallyCompleted { timestamp: u64, process_id: String },
    #[discriminant(4)]
    StatusChanged {
        status: BallotStatus,
        timestamp: u64,
        process_id: String,
    },
}

#[derive(CreateTypeSpec, ReadWriteState, ReadWriteRPC, Clone)]
#[repr(u8)]
enum OrganizationEvent {
    #[discriminant(0)]
    BallotDeployed {
        organization: Address,
        ballot: Address,
        title: String,
        timestamp: u64,
        process_id: String,
    },
    #[discriminant(1)]
    MembersAdded {
        members: Vec<Address>,
        organization: Address,
        timestamp: u64,
        process_id: String,
        nonce: u64,
    },
    #[discriminant(2)]
    MembersRemoved {
        members: Vec<Address>,
        organization: Address,
        timestamp: u64,
        process_id: String,
        nonce: u64,
    },
    #[discriminant(3)]
    BallotDeployFailed {
        organization: Address,
        reason: String,
        timestamp: u64,
        process_id: String,
    },
}

#[state]
struct BallotState {
    organization: Address,
    administrator: Address,
    title: String,
    description: String,
    options: Vec<String>,
    start_time: u64,
    end_time: u64,
    status: Option<BallotStatus>,
    tally: Option<Tally>,
    eligible_voters: Vec<Address>,
    already_voted: Vec<Address>, // Track addresses that have already voted
    process_state: BallotProcessState, // Track the current process state of this ballot
    process_id: String,          // Unique identifier for this ballot process
    event_processes: SortedVecMap<String, ProcessState>, // Track processes from events
}

/// Generates a unique process ID using timestamp and transaction bytes
fn generate_process_id(ctx: &ContractContext) -> String {
    let bytes_hex = ctx.original_transaction.bytes[0..8]
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect::<String>();
    format!("{}-{}", ctx.block_time, bytes_hex)
}

/// Initializes contract
///
/// Creates a new ballot with the given options.
#[init(zk = true)]
fn initialize(
    ctx: ContractContext,
    _zk_state: ZkState<SecretVarType>,
    options: Vec<String>,
    title: String,
    description: String,
    organization: Address,
    administrator: Address,
    eligible_voters: Vec<Address>,
) -> BallotState {
    assert!(options.len() <= 5, "At most 5 options are supported");
    assert!(options.len() > 1, "At least 2 options are required");

    assert_ne!(
        administrator, organization,
        "Administrator cannot be the organization."
    );

    // Generate a process ID for this ballot
    let process_id = generate_process_id(&ctx);

    BallotState {
        organization,
        administrator,
        title,
        description,
        options,
        start_time: 0,
        end_time: 0,
        status: Some(BallotStatus::Created {}),
        tally: None,
        eligible_voters,
        already_voted: Vec::new(),
        process_state: BallotProcessState::Created {}, // Initialize process state
        process_id,                                    // Set the process ID
        event_processes: SortedVecMap::new(),          // Initialize empty event process tracking
    }
}

/// Allows the administrator to start the voting period.
#[action(shortname = 0x09, zk = true)]
fn set_vote_active(
    context: ContractContext,
    state: BallotState,
    zk_state: ZkState<SecretVarType>,
) -> (BallotState, Vec<EventGroup>) {
    assert_eq!(
        context.sender, state.administrator,
        "Only administrator can set vote active"
    );

    // Generate a process ID for this status change
    let process_id = generate_process_id(&context);

    // Set the new status
    let new_status = BallotStatus::Active {};

    // Update process tracking directly in state instead of emitting self-event
    let mut processes = state.event_processes.clone();
    processes.insert(process_id.clone(), ProcessState::Complete {});

    // No events emitted to self - we're directly updating state

    (
        BallotState {
            status: Some(new_status),
            start_time: context.block_time as u64,
            end_time: context.block_time as u64 + 604800, // One week in seconds
            process_state: BallotProcessState::Active {},
            event_processes: processes,
            ..state
        },
        vec![], // No events
    )
}

/// Handles events from the organization contract
#[action(shortname = 0x30, zk = true)]
fn handle_org_event(
    ctx: ContractContext,
    state: BallotState,
    _zk_state: ZkState<SecretVarType>,
    event: OrganizationEvent,
) -> (BallotState, Vec<EventGroup>) {
    assert_eq!(
        ctx.sender, state.organization,
        "Only parent org can emit events"
    );

    // Extract process_id from event
    let process_id = match &event {
        OrganizationEvent::MembersAdded { process_id, .. } => process_id.clone(),
        OrganizationEvent::MembersRemoved { process_id, .. } => process_id.clone(),
        OrganizationEvent::BallotDeployed { process_id, .. } => process_id.clone(),
        OrganizationEvent::BallotDeployFailed { process_id, .. } => process_id.clone(),
    };

    // Track the process
    let mut processes = state.event_processes.clone();
    processes.insert(process_id.clone(), ProcessState::Received {});

    let mut event_groups = Vec::new();

    // Process based on ballot status
    match state.status {
        Some(BallotStatus::Active {}) | Some(BallotStatus::Created {}) => {
            let mut voters = state.eligible_voters.clone();

            match event {
                OrganizationEvent::MembersAdded { members, .. } => {
                    // Add new members to eligible voters
                    voters.extend(members.clone());
                    processes.insert(process_id.clone(), ProcessState::Complete {});

                    // Emit MembersUpdated event to track changes in ballot
                    let mut event_group = EventGroup::builder();
                    event_group
                        .call(ctx.contract_address, STATUS_CHANGED_SHORTNAME)
                        .argument(BallotEvent::MembersUpdated {
                            added: members,
                            removed: Vec::new(),
                            timestamp: ctx.block_time as u64,
                            process_id,
                        })
                        .done();
                    event_groups.push(event_group.build());
                }
                OrganizationEvent::MembersRemoved { members, .. } => {
                    // Remove members from eligible voters
                    let removed_members = members.clone();
                    voters.retain(|voter| !members.contains(voter));
                    processes.insert(process_id.clone(), ProcessState::Complete {});

                    // Emit MembersUpdated event to track changes in ballot
                    let mut event_group = EventGroup::builder();
                    event_group
                        .call(ctx.contract_address, STATUS_CHANGED_SHORTNAME)
                        .argument(BallotEvent::MembersUpdated {
                            added: Vec::new(),
                            removed: removed_members,
                            timestamp: ctx.block_time as u64,
                            process_id,
                        })
                        .done();
                    event_groups.push(event_group.build());
                }
                _ => {
                    processes.insert(process_id, ProcessState::Ignored {});
                }
            }

            (
                BallotState {
                    eligible_voters: voters,
                    event_processes: processes,
                    ..state
                },
                event_groups,
            )
        }
        _ => {
            // Mark as ignored if not in appropriate state
            processes.insert(process_id, ProcessState::Ignored {});

            (
                BallotState {
                    event_processes: processes,
                    ..state
                },
                vec![],
            )
        }
    }
}

#[zk_on_secret_input(shortname = 0x60, secret_type = "Sbi8")]
fn cast_vote(
    context: ContractContext,
    state: BallotState,
    zk_state: ZkState<SecretVarType>,
) -> (
    BallotState,
    Vec<EventGroup>,
    ZkInputDef<SecretVarType, Sbi8>,
) {
    assert!(
        state.status.unwrap() == BallotStatus::Active {},
        "Ballot is not active"
    );
    assert!(
        state.eligible_voters.contains(&context.sender),
        "Not eligible to vote"
    );

    assert!(
        !state.already_voted.contains(&context.sender),
        "Already voted"
    );

    let mut voted = state.already_voted.clone();
    voted.push(context.sender);

    // Generate a process ID for this vote
    let process_id = generate_process_id(&context);

    // Update process tracking directly in state instead of emitting self-event
    let mut processes = state.event_processes.clone();
    processes.insert(process_id.clone(), ProcessState::Complete {});

    let input_def = ZkInputDef::<SecretVarType, Sbi8>::with_metadata(
        Some(SHORTNAME_VOTE_INPUTTED),
        SecretVarType::Vote {},
    );

    (
        BallotState {
            already_voted: voted,
            event_processes: processes,
            ..state
        },
        vec![], // No events
        input_def,
    )
}

#[zk_on_variable_inputted(shortname = 0x61)]
fn vote_inputted(
    context: ContractContext,
    state: BallotState,
    zk_state: ZkState<SecretVarType>,
    inputted_variable: SecretVarId,
) -> BallotState {
    assert!(
        state.status.unwrap() == BallotStatus::Active {},
        "Ballot is not active"
    );
    state
}

/// Allows the administrator to start the computation of the tally.
///
/// The tally computation is automatic beyond this call, involving several steps, as described in the module documentation.
#[action(shortname = 0x01, zk = true)]
fn compute_tally(
    context: ContractContext,
    state: BallotState,
    zk_state: ZkState<SecretVarType>,
) -> (BallotState, Vec<EventGroup>, Vec<ZkStateChange>) {
    assert_eq!(
        context.sender, state.administrator,
        "Only administrator can start computation"
    );
    assert_eq!(
        zk_state.calculation_state,
        CalculationStatus::Waiting,
        "Computation must start from Waiting state, but was {:?}",
        zk_state.calculation_state,
    );

    // Generate a process ID for this tally
    let process_id = generate_process_id(&context);

    // Update process tracking directly in state instead of emitting self-event
    let mut processes = state.event_processes.clone();
    processes.insert(process_id.clone(), ProcessState::Complete {});

    (
        BallotState {
            status: Some(BallotStatus::Tallying {}),
            process_state: BallotProcessState::Tallying {},
            event_processes: processes,
            ..state
        },
        vec![], // No events
        vec![zk_compute::tally_votes_start(
            Some(SHORTNAME_TALLY_COMPUTE_COMPLETE),
            &[SecretVarType::TallyResult {}],
        )],
    )
}

/// Automatically called when the computation is completed
///
/// The only thing we do is to instantly open/declassify the output variables.
#[zk_on_compute_complete(shortname = 0x62)]
fn tally_compute_complete(
    context: ContractContext,
    state: BallotState,
    zk_state: ZkState<SecretVarType>,
    output_variables: Vec<SecretVarId>,
) -> (BallotState, Vec<EventGroup>, Vec<ZkStateChange>) {
    (
        state,
        vec![],
        vec![ZkStateChange::OpenVariables {
            variables: output_variables,
        }],
    )
}

/// Automatically called when a variable is opened/declassified.
///
/// We can now read the sum variable, and compute the average, which will be our final result.
#[zk_on_variables_opened]
fn open_tally_result(
    context: ContractContext,
    mut state: BallotState,
    zk_state: ZkState<SecretVarType>,
    opened_variables: Vec<SecretVarId>,
) -> (BallotState, Vec<EventGroup>, Vec<ZkStateChange>) {
    assert_eq!(
        opened_variables.len(),
        1,
        "Unexpected number of output variables"
    );

    let opened_variable = zk_state
        .get_variable(*opened_variables.first().unwrap())
        .unwrap();

    // Use our helper function to read the TallyResult
    let tally_result = read_variable(&zk_state, &opened_variable.variable_id);

    let new_tally = Tally {
        option_0: tally_result.option_0,
        option_1: tally_result.option_1,
        option_2: tally_result.option_2,
        option_3: tally_result.option_3,
        option_4: tally_result.option_4,
        total: tally_result.option_0
            + tally_result.option_1
            + tally_result.option_2
            + tally_result.option_3
            + tally_result.option_4,
    };

    let mut zk_state_changes = vec![];

    if let SecretVarType::TallyResult {} = opened_variable.metadata {
        // Generate a process ID for this result
        let process_id = generate_process_id(&context);

        // Update process tracking directly in state
        let mut processes = state.event_processes.clone();
        processes.insert(process_id.clone(), ProcessState::Complete {});

        state.tally = Some(new_tally);
        state.eligible_voters = Vec::new(); // Reset eligible voters
        state.already_voted = Vec::new(); // Reset voted list
        state.status = Some(BallotStatus::Completed {});
        state.process_state = BallotProcessState::Completed {};
        state.event_processes = processes;
        zk_state_changes = vec![ZkStateChange::ContractDone]
    }

    (state, vec![], zk_state_changes)
}

/// Reads a variable's data as a TallyResult.
fn read_variable(zk_state: &ZkState<SecretVarType>, variable_id: &SecretVarId) -> TallyResult {
    let variable = zk_state.get_variable(*variable_id).unwrap();
    let buffer: Vec<u8> = variable.data.clone().unwrap();

    TallyResult::state_read_from(&mut buffer.as_slice())
}

#[action(shortname = 0x11, zk = true)]
fn cancel_ballot(
    ctx: ContractContext,
    state: BallotState,
    _zk_state: ZkState<SecretVarType>,
) -> (BallotState, Vec<EventGroup>) {
    assert_eq!(
        ctx.sender, state.administrator,
        "Only administrator can cancel ballot"
    );

    assert!(
        state.status.unwrap() != BallotStatus::Completed {},
        "Cannot cancel completed ballot"
    );

    // Generate a process ID for this cancellation
    let process_id = generate_process_id(&ctx);

    // Set the new status
    let new_status = BallotStatus::Cancelled {};

    // Update process tracking directly in state instead of emitting self-event
    let mut processes = state.event_processes.clone();
    processes.insert(process_id.clone(), ProcessState::Complete {});

    // No events emitted to self - we're directly updating state

    (
        BallotState {
            status: Some(new_status),
            process_state: BallotProcessState::Cancelled {},
            event_processes: processes,
            ..state
        },
        vec![], // No events
    )
}

#[action(shortname = 0x50, zk = true)]
fn status_changed(
    ctx: ContractContext,
    state: BallotState,
    _zk_state: ZkState<SecretVarType>,
    event: BallotEvent,
) -> (BallotState, Vec<EventGroup>) {
    // Process the status changed event
    match event {
        BallotEvent::StatusChanged {
            status, process_id, ..
        } => {
            // Track the process
            let mut processes = state.event_processes.clone();
            processes.insert(process_id, ProcessState::Complete {});

            (
                BallotState {
                    event_processes: processes,
                    ..state
                },
                vec![],
            )
        }
        BallotEvent::MembersUpdated { process_id, .. } => {
            // Track the process for member updates
            let mut processes = state.event_processes.clone();
            processes.insert(process_id, ProcessState::Complete {});

            (
                BallotState {
                    event_processes: processes,
                    ..state
                },
                vec![],
            )
        }
        _ => (state, vec![]), // Ignore other event types
    }
}
