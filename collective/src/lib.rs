#![doc = include_str!("../README.md")]
#![allow(unused_variables)]

#[macro_use]
extern crate pbc_contract_codegen;
extern crate pbc_contract_common;

use create_type_spec_derive::CreateTypeSpec;
use pbc_contract_common::address::{Address, AddressType, Shortname};
use pbc_contract_common::context::{CallbackContext, ContractContext};
use pbc_contract_common::events::EventGroup;
use pbc_contract_common::sorted_vec_map::{SortedVecMap, SortedVecSet};
use pbc_traits::WriteRPC;
use read_write_rpc_derive::ReadWriteRPC;
use read_write_state_derive::ReadWriteState;

// https://browser.testnet.partisiablockchain.com/contracts/018bc1ccbb672b87710327713c97d43204905082cb/deployContractV3
const DEPLOY_ZK_CONTRACT_ADDRESS: Address = Address {
    address_type: AddressType::SystemContract,
    identifier: [
        0x8b, 0xc1, 0xcc, 0xbb, 0x67, 0x2b, 0x87, 0x71, 0x03, 0x27, 0x71, 0x3c, 0x97, 0xd4, 0x32,
        0x04, 0x90, 0x50, 0x82, 0xcb,
    ],
};
const DEPLOY_ZK_SHORTNAME: Shortname = Shortname::from_u32(2);
const ZK_BINDER_ID: i32 = 11;
const BALLOT_DEPLOYED_SHORTNAME: Shortname = Shortname::from_u32(0x40);
const BALLOT_DEPLOY_FAILED_SHORTNAME: Shortname = Shortname::from_u32(0x43);
const HANDLE_ORG_EVENT_SHORTNAME: Shortname = Shortname::from_u32(0x11);

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

#[derive(CreateTypeSpec, ReadWriteState, ReadWriteRPC, Clone)]
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

#[derive(CreateTypeSpec, ReadWriteState, ReadWriteRPC, Clone)]
struct BallotInit {
    options: Vec<String>,
    title: String,
    description: String,
    administrator: Address,
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

/// The state of the petition, which is persisted on-chain.
#[state]
pub struct OrganizationState {
    owner: Address,
    administrators: SortedVecSet<Address>, // can make changes to the org, members and add proposals
    members: SortedVecSet<Address>,
    name: String,
    description: String,
    profile_image: String,
    banner_image: String,
    website: String,
    x_account: String,
    discord_server: String,
    ballot_contract_zkwa: Vec<u8>,
    ballot_contract_abi: Vec<u8>,
    ballots: SortedVecSet<Address>,
    event_nonce: u64, // Track event nonce for security
    ballot_processes: SortedVecMap<String, BallotProcessState>, // Track ballot processes by process_id
    factory_address: Address, // Address of the factory that created this collective
}

// UI link example:
// https://propostr.xyz/0x1234567890123456789012345678901234567890/p/0x1234567890123456789012345678901234567890

/// Generates a unique process ID using timestamp and transaction bytes
fn generate_process_id(ctx: &ContractContext) -> String {
    let bytes_hex = ctx.original_transaction.bytes[0..8]
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect::<String>();
    format!("{}-{}", ctx.block_time, bytes_hex)
}

/// Initialize a new organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `name` - the name of the organization.
/// * `description` - the description of the organization.
/// * `profile_image` - the profile image of the organization.
/// * `banner_image` - the banner image of the organization.
/// * `website` - the website of the organization.
/// * `x_account` - the X account of the organization.
/// * `discord_server` - the Discord server of the organization.
/// * `administrator` - the administrator of the organization.
/// * `ballot_contract_zkwa` - the binary of the ballot contract.
/// * `ballot_contract_abi` - the ABI of the ballot contract.
/// * `factory_address` - the address of the factory that created this collective.
///
/// # Returns
///
/// The initial state of the organization.
///
#[init]
pub fn initialize(
    ctx: ContractContext,
    name: String,
    description: String,
    profile_image: String,
    banner_image: String,
    website: String,
    x_account: String,
    discord_server: String,
    administrator: Address,
    ballot_contract_zkwa: Vec<u8>,
    ballot_contract_abi: Vec<u8>,
    factory_address: Address,
) -> OrganizationState {
    assert_ne!(name, "", "Please name the organization.");
    assert_ne!(description, "", "Please describe the organization.");
    assert_ne!(
        administrator, ctx.sender,
        "Administrator cannot be the factory."
    );
    assert_ne!(ballot_contract_zkwa, vec![], "Ballot binary is missing.");
    assert_ne!(ballot_contract_abi, vec![], "Ballot abi is missing.");

    let mut members = SortedVecSet::new();
    members.insert(administrator);
    let mut administrators = SortedVecSet::new();
    administrators.insert(administrator);

    OrganizationState {
        owner: administrator,
        administrators,
        members,
        ballots: SortedVecSet::new(),
        name,
        description,
        profile_image,
        banner_image,
        website,
        x_account,
        discord_server,
        ballot_contract_zkwa,
        ballot_contract_abi,
        event_nonce: 0,                        // Initialize event nonce
        ballot_processes: SortedVecMap::new(), // Initialize empty ballot process tracking
        factory_address,
    }
}

/// Add an administrator to the organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the organization.
/// * `address` - the address of the new administrator.
///
/// # Returns
///
/// The updated organization state reflecting the new administrator.
///
#[action(shortname = 0x00)]
pub fn add_administrator(
    ctx: ContractContext,
    state: OrganizationState,
    address: Address,
) -> OrganizationState {
    assert_eq!(
        state.owner, ctx.sender,
        "Only the owner can add an administrator."
    );
    assert!(
        !state.administrators.contains(&address),
        "Already an administrator."
    );
    assert!(
        state.members.contains(&address),
        "Please add the address as a member first."
    );

    let mut administrators = state.administrators.clone();
    administrators.insert(address);

    OrganizationState {
        administrators,
        ..state
    }
}

/// Update organization metadata (multiple fields at once).
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the organization.
/// * `name` - the new name of the organization (optional).
/// * `description` - the new description of the organization (optional).
/// * `profile_image` - the new profile image of the organization (optional).
/// * `banner_image` - the new banner image of the organization (optional).
/// * `website` - the new website of the organization (optional).
/// * `x_account` - the new X account of the organization (optional).
/// * `discord_server` - the new Discord server of the organization (optional).
///
/// # Returns
///
/// The updated organization state reflecting the new metadata.
///
#[action(shortname = 0x08)]
pub fn update_metadata(
    ctx: ContractContext,
    state: OrganizationState,
    name: Option<String>,
    description: Option<String>,
    profile_image: Option<String>,
    banner_image: Option<String>,
    website: Option<String>,
    x_account: Option<String>,
    discord_server: Option<String>,
) -> OrganizationState {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only administrators can update organization metadata."
    );

    if let Some(ref name_val) = name {
        assert_ne!(name_val, "", "Organization name cannot be empty.");
    }

    if let Some(ref description_val) = description {
        assert_ne!(
            description_val, "",
            "Organization description cannot be empty."
        );
    }

    if let Some(ref profile_image_val) = profile_image {
        assert_ne!(profile_image_val, "", "Profile image URL cannot be empty.");
    }

    if let Some(ref banner_image_val) = banner_image {
        assert_ne!(banner_image_val, "", "Banner image URL cannot be empty.");
    }

    if let Some(ref website_val) = website {
        assert_ne!(website_val, "", "Website URL cannot be empty.");
    }

    if let Some(ref x_account_val) = x_account {
        assert_ne!(x_account_val, "", "X account cannot be empty.");
    }

    if let Some(ref discord_server_val) = discord_server {
        assert_ne!(discord_server_val, "", "Discord server cannot be empty.");
    }

    // Apply updates only for fields that were provided
    OrganizationState {
        name: name.unwrap_or(state.name),
        description: description.unwrap_or(state.description),
        profile_image: profile_image.unwrap_or(state.profile_image),
        banner_image: banner_image.unwrap_or(state.banner_image),
        website: website.unwrap_or(state.website),
        x_account: x_account.unwrap_or(state.x_account),
        discord_server: discord_server.unwrap_or(state.discord_server),
        ..state
    }
}

/// Remove an administrator from the organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the organization.
/// * `address` - the address of the administrator to remove.
///
/// # Returns
///
/// The updated organization state reflecting the removed administrator.
///
#[action(shortname = 0x01)]
pub fn remove_administrator(
    ctx: ContractContext,
    state: OrganizationState,
    address: Address,
) -> OrganizationState {
    assert_eq!(
        state.owner, ctx.sender,
        "Only the owner can remove an administrator."
    );
    assert!(
        state.administrators.contains(&address),
        "Could not remove non-administrator."
    );
    assert!(
        state.members.contains(&address),
        "Could not remove non-member."
    );
    assert!(state.owner != address, "Cannot remove the owner.");

    let mut administrators = state.administrators.clone();
    administrators.remove(&address);

    OrganizationState {
        administrators,
        ..state
    }
}

/// Adds a member to the organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the organization.
/// * `address` - the address of the new member.
///
/// # Returns
///
/// The updated organization state reflecting the new member.
///
#[action(shortname = 0x02)]
pub fn add_member(
    ctx: ContractContext,
    state: OrganizationState,
    address: Address,
) -> (OrganizationState, Vec<EventGroup>) {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can add a member."
    );
    assert!(!state.members.contains(&address), "Already a member.");

    let mut members = state.members.clone();
    members.insert(address);

    // Generate a process ID
    let process_id = generate_process_id(&ctx);

    // Increment event nonce
    let event_nonce = state.event_nonce + 1;

    // Create event for the factory
    let mut event_group = EventGroup::builder();
    event_group
        .call(state.factory_address, HANDLE_ORG_EVENT_SHORTNAME)
        .argument(OrganizationEvent::MembersAdded {
            members: vec![address],
            organization: ctx.contract_address,
            timestamp: ctx.block_time as u64,
            process_id: process_id.clone(),
            nonce: event_nonce,
        })
        .done();

    (
        OrganizationState {
            members,
            event_nonce,
            ..state
        },
        vec![event_group.build()],
    )
}

/// Adds multiple members to the organization at once.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the organization.
/// * `addresses` - the addresses of the new members.
///
/// # Returns
///
/// The updated organization state reflecting the new members.
///
#[action(shortname = 0x05)]
pub fn add_members(
    ctx: ContractContext,
    state: OrganizationState,
    addresses: Vec<Address>,
) -> (OrganizationState, Vec<EventGroup>) {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can add members."
    );

    let mut members = state.members.clone();
    let mut added_members = Vec::new();

    for address in &addresses {
        if !members.contains(address) {
            members.insert(*address);
            added_members.push(*address);
        }
    }

    if !added_members.is_empty() {
        // Generate a process ID
        let process_id = generate_process_id(&ctx);

        // Increment event nonce for security
        let event_nonce = state.event_nonce + 1;

        // Create event for the factory
        let mut event_group = EventGroup::builder();
        event_group
            .call(state.factory_address, HANDLE_ORG_EVENT_SHORTNAME)
            .argument(OrganizationEvent::MembersAdded {
                members: added_members,
                organization: ctx.contract_address,
                timestamp: ctx.block_time as u64,
                process_id: process_id.clone(),
                nonce: event_nonce,
            })
            .done();

        (
            OrganizationState {
                members,
                event_nonce,
                ..state
            },
            vec![event_group.build()],
        )
    } else {
        (state, vec![])
    }
}

/// Removes a member from the organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the organization.
/// * `address` - the address of the member to remove.
///
/// # Returns
///
/// The updated organization state reflecting the removed member.
///
#[action(shortname = 0x03)]
pub fn remove_member(
    ctx: ContractContext,
    state: OrganizationState,
    address: Address,
) -> (OrganizationState, Vec<EventGroup>) {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can remove a member."
    );
    assert!(
        state.members.contains(&address),
        "Could not remove non-member."
    );
    assert!(state.owner != address, "Cannot remove the owner.");

    let mut members = state.members.clone();
    members.remove(&address);

    // Generate a process ID
    let process_id = generate_process_id(&ctx);

    // Increment event nonce
    let event_nonce = state.event_nonce + 1;

    // Create event for the factory
    let mut event_group = EventGroup::builder();
    event_group
        .call(state.factory_address, HANDLE_ORG_EVENT_SHORTNAME)
        .argument(OrganizationEvent::MembersRemoved {
            members: vec![address],
            organization: ctx.contract_address,
            timestamp: ctx.block_time as u64,
            process_id: process_id.clone(),
            nonce: event_nonce,
        })
        .done();

    (
        OrganizationState {
            members,
            event_nonce,
            ..state
        },
        vec![event_group.build()],
    )
}

/// Adds a proposal to the organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the organization.
/// * `address` - the address of the new proposal.
///
/// # Returns
///
/// The updated organization state reflecting the new proposal.
#[action(shortname = 0x04)]
pub fn add_ballot(
    ctx: ContractContext,
    state: OrganizationState,
    address: Address,
) -> (OrganizationState, Vec<EventGroup>) {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can add a ballot."
    );
    assert!(!state.ballots.contains(&address), "Already a ballot.");

    let mut ballots = state.ballots.clone();
    ballots.insert(address);

    // No events are emitted here, as this is just an internal record update

    (OrganizationState { ballots, ..state }, vec![])
}

/// Deploys a new ballot contract.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the Organization.
/// * `ballot_init` - the initial data for the ballot.
///
/// # Returns
///
/// The updated Organization state reflecting the new ballot.
///
#[action(shortname = 0x07)]
fn deploy_ballot(
    ctx: ContractContext,
    state: OrganizationState,
    ballot_init: BallotInit,
) -> (OrganizationState, Vec<EventGroup>) {
    let ballot_contract_address = Address {
        address_type: AddressType::ZkContract,
        identifier: ctx.original_transaction.bytes[12..32].try_into().unwrap(),
    };
    let ballot_title = ballot_init.title.clone();

    // Generate a process ID for this ballot deployment
    let process_id = generate_process_id(&ctx);

    // Track this ballot process
    let mut ballot_processes = state.ballot_processes.clone();
    ballot_processes.insert(process_id.clone(), BallotProcessState::Created {});

    // Increment event nonce
    let event_nonce = state.event_nonce + 1;

    let mut event_group = EventGroup::builder();

    assert!(
        state.administrators.contains(&ballot_init.administrator),
        "Administrator must be one of the organization administrators."
    );

    // Convert members set to vec for ballot init
    // Using a "snapshot" approach - eligible voters are fixed at ballot creation time
    // This provides clarity about who can participate and prevents mid-vote manipulation
    let eligible_voters: Vec<Address> = state.members.iter().copied().collect();

    event_group
        .call(DEPLOY_ZK_CONTRACT_ADDRESS, DEPLOY_ZK_SHORTNAME)
        .argument(state.ballot_contract_zkwa.clone()) // contractJar
        .argument(create_ballot_init_data(
            // initialization
            ballot_init.options,
            ballot_init.title,
            ballot_init.description,
            ctx.contract_address,
            ballot_init.administrator,
            eligible_voters, // Pass eligible_voters
        ))
        .argument(state.ballot_contract_abi.clone()) // abi
        .argument(20000000i64) // requiredStakes
        .argument(Vec::<Vec<i32>>::new()) // allowedJurisdictions
        .argument(ZK_BINDER_ID) // uniqueId
        .done();

    // No event emission here, only in the callback for successful deployment

    event_group
        .with_callback(SHORTNAME_DEPLOY_BALLOT_CALLBACK)
        .with_cost(10000)
        .argument(ballot_contract_address)
        .argument(ballot_title)
        .argument(process_id)
        .done();

    (
        OrganizationState {
            ballot_processes,
            event_nonce,
            ..state
        },
        vec![event_group.build()],
    )
}

/// Callback for handling ballot deployment. If deployment was successful, adds the new
/// ballot to state tracking. If unsuccessful, no changes are made to state.
///
/// ### Parameters:
///
/// * `ctx`: [`ContractContext`], the context of the call.
/// * `callback_ctx`: [`CallbackContext`], the context of the callback.
/// * `state`: [`OrganizationState`], the state before the call.
///
/// ### Returns:
/// The new state of type [`OrganizationState`].
#[callback(shortname = 0x20)]
fn deploy_ballot_callback(
    ctx: ContractContext,
    callback_ctx: CallbackContext,
    state: OrganizationState,
    ballot_contract_address: Address,
    ballot_title: String,
    process_id: String,
) -> (OrganizationState, Vec<EventGroup>) {
    // Update ballot processes state
    let mut ballot_processes = state.ballot_processes.clone();

    // Increment event nonce regardless of outcome
    let event_nonce = state.event_nonce + 1;

    // Check if we already processed this callback (handles potential replays)
    if let Some(existing_state) = ballot_processes.get(&process_id) {
        match existing_state {
            BallotProcessState::Created {} => {} // Continue processing
            _ => {
                // This callback has already been processed, return current state
                return (state, vec![]);
            }
        }
    }

    if callback_ctx.success {
        // Mark process as deployed
        ballot_processes.insert(process_id.clone(), BallotProcessState::Deployed {});

        // Add ballot to tracked ballots
        let mut ballots = state.ballots.clone();
        ballots.insert(ballot_contract_address);

        // Create event groups
        let mut event_groups = Vec::new();

        // Emit BallotDeployed event first to our own contract for tracking
        let mut self_event_group = EventGroup::builder();
        self_event_group
            .call(ctx.contract_address, BALLOT_DEPLOYED_SHORTNAME)
            .argument(OrganizationEvent::BallotDeployed {
                organization: ctx.contract_address,
                ballot: ballot_contract_address,
                title: ballot_title.clone(),
                timestamp: ctx.block_time as u64,
                process_id: process_id.clone(),
            })
            .done();
        event_groups.push(self_event_group.build());

        // Also notify the Factory about the deployment
        let mut factory_event_group = EventGroup::builder();
        factory_event_group
            .call(state.factory_address, HANDLE_ORG_EVENT_SHORTNAME)
            .argument(OrganizationEvent::BallotDeployed {
                organization: ctx.contract_address,
                ballot: ballot_contract_address,
                title: ballot_title,
                timestamp: ctx.block_time as u64,
                process_id: process_id.clone(),
            })
            .done();
        event_groups.push(factory_event_group.build());

        (
            OrganizationState {
                ballots,
                ballot_processes,
                event_nonce,
                ..state
            },
            event_groups,
        )
    } else {
        // Mark process as failed/cancelled
        ballot_processes.insert(process_id.clone(), BallotProcessState::Cancelled {});

        // Use a generic error message since detailed error info isn't available in CallbackContext
        let failure_reason = "Deployment callback failed".to_string();

        // Create event groups
        let mut event_groups = Vec::new();

        // Emit failure event to self for tracking
        let mut self_event_group = EventGroup::builder();
        self_event_group
            .call(ctx.contract_address, BALLOT_DEPLOY_FAILED_SHORTNAME)
            .argument(OrganizationEvent::BallotDeployFailed {
                organization: ctx.contract_address,
                reason: failure_reason.clone(),
                timestamp: ctx.block_time as u64,
                process_id: process_id.clone(),
            })
            .done();
        event_groups.push(self_event_group.build());

        // Also notify the Factory about the failure
        let mut factory_event_group = EventGroup::builder();
        factory_event_group
            .call(state.factory_address, HANDLE_ORG_EVENT_SHORTNAME)
            .argument(OrganizationEvent::BallotDeployFailed {
                organization: ctx.contract_address,
                reason: failure_reason,
                timestamp: ctx.block_time as u64,
                process_id,
            })
            .done();
        event_groups.push(factory_event_group.build());

        (
            OrganizationState {
                ballot_processes,
                event_nonce,
                ..state
            },
            event_groups,
        )
    }
}

/// Create the initial data for a ballot.
///
/// # Arguments
///
/// * `options` - the options of the ballot.
/// * `title` - the title of the ballot.
/// * `description` - the description of the ballot.
/// * `organization` - the organization of the ballot.
///
/// # Returns
///
/// The initial data for a ballot.
fn create_ballot_init_data(
    options: Vec<String>,
    title: String,
    description: String,
    organization: Address,
    administrator: Address,
    eligible_voters: Vec<Address>,
) -> Vec<u8> {
    let mut bytes: Vec<u8> = vec![0xff, 0xff, 0xff, 0xff, 0x0f];
    WriteRPC::rpc_write_to(&options, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&title, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&description, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&organization, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&administrator, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&eligible_voters, &mut bytes).unwrap();
    bytes
}

/// Handles the BallotDeployed event
#[action(shortname = 0x40)]
fn handle_ballot_deployed_event(
    ctx: ContractContext,
    state: OrganizationState,
    event: OrganizationEvent,
) -> (OrganizationState, Vec<EventGroup>) {
    match event {
        OrganizationEvent::BallotDeployed {
            ballot, process_id, ..
        } => {
            let mut ballots = state.ballots.clone();
            ballots.insert(ballot);

            // Update the ballot process state
            let mut ballot_processes = state.ballot_processes.clone();
            ballot_processes.insert(process_id, BallotProcessState::Active {});

            (
                OrganizationState {
                    ballots,
                    ballot_processes,
                    ..state
                },
                vec![],
            )
        }
        _ => panic!("Unexpected event type"),
    }
}
