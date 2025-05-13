#![doc = include_str!("../README.md")]
#![allow(unused_variables)]

#[macro_use]
extern crate pbc_contract_codegen;
extern crate pbc_contract_common;
extern crate pbc_lib;

mod zk_compute;

use create_type_spec_derive::CreateTypeSpec;
use pbc_contract_common::address::Address;
use pbc_contract_common::context::ContractContext;
use pbc_contract_common::events::EventGroup;
use pbc_contract_common::zk::CalculationStatus;
use pbc_contract_common::zk::{SecretVarId, ZkInputDef, ZkState, ZkStateChange};
use pbc_traits::ReadWriteState;
use pbc_zk::Sbi8;
use read_write_rpc_derive::ReadWriteRPC;
use read_write_state_derive::ReadWriteState;

/// Secret vote metadata
#[derive(ReadWriteState, ReadWriteRPC, Debug)]
#[repr(u8)]
enum SecretVarType {
    #[discriminant(0)]
    Vote {},
    #[discriminant(1)]
    TallyResult {},
}

#[derive(CreateTypeSpec, ReadWriteState, Debug, PartialEq, Clone, Copy)]
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
    voters: Vec<Address>,
    tally: Option<Tally>,
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
) -> BallotState {
    assert!(options.len() <= 5, "At most 5 options are supported");
    assert!(options.len() > 1, "At least 2 options are required");

    BallotState {
        organization,
        administrator: ctx.sender,
        title,
        description,
        options,
        start_time: 0,
        end_time: 0,
        status: Some(BallotStatus::Created {}),
        tally: None,
        voters: vec![],
    }
}

/// Allows the administrator to start the voting period.
#[action(shortname = 0x48, zk = true)]
fn set_vote_active(
    context: ContractContext,
    state: BallotState,
    zk_state: ZkState<SecretVarType>,
) -> BallotState {
    assert_eq!(
        context.sender, state.administrator,
        "Only administrator can start computation"
    );

    BallotState {
        status: Some(BallotStatus::Active {}),
        ..state
    }
}

#[zk_on_secret_input(shortname = 0x40)]
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
        zk_state
            .secret_variables
            .iter()
            .chain(zk_state.pending_inputs.iter())
            .all(|(_, v)| v.owner != context.sender),
        "Each address is only allowed to send one vote. Sender: {:?}",
        context.sender
    );

    let input_def = ZkInputDef::<SecretVarType, Sbi8>::with_metadata(
        Some(SHORTNAME_VOTE_INPUTTED),
        SecretVarType::Vote {},
    );

    (state, vec![], input_def)
}

#[zk_on_variable_inputted(shortname = 0x41)]
fn vote_inputted(
    context: ContractContext,
    mut state: BallotState,
    zk_state: ZkState<SecretVarType>,
    inputted_variable: SecretVarId,
) -> BallotState {
    assert!(
        state.status.unwrap() == BallotStatus::Active {},
        "Ballot is not active"
    );

    state.voters.push(context.sender);
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

    (
        BallotState {
            status: Some(BallotStatus::Tallying {}),
            ..state
        },
        vec![],
        vec![zk_compute::tally_votes_start(
            Some(SHORTNAME_TALLY_COMPUTE_COMPLETE),
            &[SecretVarType::TallyResult {}],
        )],
    )
}

/// Automatically called when the computation is completed
///
/// The only thing we do is to instantly open/declassify the output variables.
#[zk_on_compute_complete(shortname = 0x42)]
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
        state.tally = Some(new_tally);
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
