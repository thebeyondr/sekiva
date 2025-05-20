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

// https://browser.testnet.partisiablockchain.com/contracts/0197a0e238e924025bad144aa0c4913e46308f9a4d/deployContractWithBinderId
const DEPLOY_PUBLIC_CONTRACT_ADDRESS: Address = Address {
    address_type: AddressType::SystemContract,
    identifier: [
        0x97, 0xa0, 0xe2, 0x38, 0xe9, 0x24, 0x02, 0x5b, 0xad, 0x14, 0x4a, 0xa0, 0xc4, 0x91, 0x3e,
        0x46, 0x30, 0x8f, 0x9a, 0x4d,
    ],
};

const DEPLOY_SHORTNAME: Shortname = Shortname::from_u32(4);
const WASM_BINDER_ID: i32 = 9;
const ORGANIZATION_DEPLOYED_SHORTNAME: Shortname = Shortname::from_u32(0x45);

#[derive(CreateTypeSpec, ReadWriteState, Debug, PartialEq, Clone, Copy)]
#[repr(u8)]
enum OrganizationProcessState {
    #[discriminant(0)]
    Created {},
    #[discriminant(1)]
    Deployed {},
    #[discriminant(2)]
    Active {},
    #[discriminant(3)]
    Deleted {},
}

#[derive(CreateTypeSpec, ReadWriteState, Clone)]
enum ContractType {
    #[discriminant(0)]
    Ballot {},
    #[discriminant(1)]
    Organization {},
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
    #[discriminant(4)]
    OrganizationDeployed {
        factory: Address,
        organization: Address,
        timestamp: u64,
        process_id: String,
    },
}

#[state]
pub struct SekivaFactoryState {
    admin: Address,
    organizations: SortedVecSet<Address>,
    ballots: SortedVecSet<Address>,
    user_org_memberships: SortedVecMap<Address, SortedVecSet<Address>>,
    ballot_contract_zkwa: Vec<u8>,
    ballot_contract_abi: Vec<u8>,
    organization_contract_wasm: Vec<u8>,
    organization_contract_abi: Vec<u8>,
    event_nonce: u64,
    organization_processes: SortedVecMap<String, OrganizationProcessState>,
}

/// Generates a unique process ID using timestamp and transaction bytes
fn generate_process_id(ctx: &ContractContext) -> String {
    let bytes_hex = ctx.original_transaction.bytes[0..8]
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect::<String>();
    format!("{}-{}", ctx.block_time, bytes_hex)
}

/// Initial function to create the initial state.
///
/// ### Parameters:
///
/// * `ctx`: [`ContractContext`], initial context.
/// * `ballot_contract_zkwa`: [`Vec<u8>`], wasm bytes of a ballot contract.
/// * `ballot_contract_abi`: [`Vec<u8>`], abi bytes of a ballot contract.
/// * `organization_contract_wasm`: [`Vec<u8>`], wasm bytes of an organization contract.
/// * `organization_contract_abi`: [`Vec<u8>`], abi bytes of an organization contract.
///
/// ### Returns:
/// The initial state of type [`SekivaFactoryState`].
#[init]
pub fn initialize(
    ctx: ContractContext,
    ballot_contract_zkwa: Vec<u8>,
    ballot_contract_abi: Vec<u8>,
    organization_contract_wasm: Vec<u8>,
    organization_contract_abi: Vec<u8>,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    let state = SekivaFactoryState {
        admin: ctx.sender,
        organizations: SortedVecSet::new(),
        ballots: SortedVecSet::new(),
        user_org_memberships: SortedVecMap::new(),
        ballot_contract_zkwa,
        ballot_contract_abi,
        organization_contract_wasm,
        organization_contract_abi,
        event_nonce: 0,
        organization_processes: SortedVecMap::new(),
    };

    (state, vec![])
}

/// Create a new organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the Sekiva Factory.
/// * `name` - the name of the organization.
/// * `description` - the description of the organization.
/// * `profile_image` - the profile image of the organization.
/// * `banner_image` - the banner image of the organization.
/// * `x_url` - the X URL of the organization.
/// * `discord_url` - the Discord URL of the organization.
/// * `website_url` - the website URL of the organization.
/// * `administrator` - the administrator of the organization.
///
/// # Returns
///
/// The updated Sekiva Factory state reflecting the new organization.
///
#[action(shortname = 0x01)]
fn deploy_organization(
    ctx: ContractContext,
    state: SekivaFactoryState,
    name: String,
    description: String,
    profile_image: String,
    banner_image: String,
    x_url: String,
    discord_url: String,
    website_url: String,
    administrator: Address,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    let org_contract_address = Address {
        address_type: AddressType::PublicContract,
        identifier: ctx.original_transaction.bytes[12..32].try_into().unwrap(),
    };

    // Generate a process ID for this deployment
    let process_id = generate_process_id(&ctx);

    // Track the process
    let mut organization_processes = state.organization_processes.clone();
    organization_processes.insert(process_id.clone(), OrganizationProcessState::Created {});

    // Increment event nonce
    let event_nonce = state.event_nonce + 1;

    let mut event_group = EventGroup::builder();

    event_group
        .call(DEPLOY_PUBLIC_CONTRACT_ADDRESS, DEPLOY_SHORTNAME)
        .argument(state.organization_contract_wasm.clone())
        .argument(state.organization_contract_abi.clone())
        .argument(create_org_init_data(
            name,
            description,
            profile_image,
            banner_image,
            x_url,
            discord_url,
            website_url,
            administrator,
            state.ballot_contract_zkwa.clone(),
            state.ballot_contract_abi.clone(),
            ctx.contract_address,
        ))
        .argument(WASM_BINDER_ID)
        .done();

    event_group
        .with_callback(SHORTNAME_DEPLOY_ORGANIZATION_CALLBACK)
        .with_cost(10000)
        .argument(org_contract_address)
        .argument(process_id)
        .done();

    (
        SekivaFactoryState {
            organization_processes,
            event_nonce,
            ..state
        },
        vec![event_group.build()],
    )
}

/// Callback for handling organization deployment. If deployment was successful, adds the new
/// organization to state tracking. If unsuccessful, no changes are made to state.
///
/// ### Parameters:
///
/// * `ctx`: [`ContractContext`], the context of the call.
/// * `callback_ctx`: [`CallbackContext`], the context of the callback.
/// * `state`: [`SekivaFactoryState`], the state before the call.
/// * `org_contract_address`: [`Address`], the address of the deployed organization.
/// * `process_id`: [`String`], the process ID of the deployment.
/// ### Returns:
/// The new state of type [`SekivaFactoryState`].
#[callback(shortname = 0x10)]
fn deploy_organization_callback(
    ctx: ContractContext,
    callback_ctx: CallbackContext,
    state: SekivaFactoryState,
    org_contract_address: Address,
    process_id: String,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    // Update the organization process state
    let mut organization_processes = state.organization_processes.clone();

    // Increment event nonce regardless of outcome
    let event_nonce = state.event_nonce + 1;

    // Check if we already processed this callback (handles potential replays)
    if let Some(existing_state) = organization_processes.get(&process_id) {
        match existing_state {
            OrganizationProcessState::Created {} => {} // Continue processing
            _ => {
                // This callback has already been processed, return current state with incremented nonce
                return (
                    SekivaFactoryState {
                        event_nonce,
                        ..state
                    },
                    vec![],
                );
            }
        }
    }

    if callback_ctx.success {
        // Mark as deployed
        organization_processes.insert(process_id.clone(), OrganizationProcessState::Deployed {});

        // Add to organizations
        let mut organizations = state.organizations.clone();
        organizations.insert(org_contract_address);

        // Add to user memberships
        let mut user_org_memberships = state.user_org_memberships.clone();
        let mut user_orgs = user_org_memberships
            .get(&ctx.sender)
            .cloned()
            .unwrap_or_default();
        user_orgs.insert(org_contract_address);
        user_org_memberships.insert(ctx.sender, user_orgs);

        // Emit organization deployed event
        let mut event_group = EventGroup::builder();
        event_group
            .call(ctx.contract_address, ORGANIZATION_DEPLOYED_SHORTNAME)
            .argument(OrganizationEvent::OrganizationDeployed {
                factory: ctx.contract_address,
                organization: org_contract_address,
                timestamp: ctx.block_time as u64,
                process_id,
            })
            .done();

        (
            SekivaFactoryState {
                organizations,
                user_org_memberships,
                organization_processes,
                event_nonce,
                ..state
            },
            vec![event_group.build()],
        )
    } else {
        // Mark as failed with appropriate error state
        organization_processes.insert(process_id.clone(), OrganizationProcessState::Deleted {});

        // Return updated state with incremented nonce, could emit failure event here
        (
            SekivaFactoryState {
                organization_processes,
                event_nonce,
                ..state
            },
            vec![], // No events for now
        )
    }
}

/// Create the initial data for an organization.
///
/// # Arguments
///
/// * `name` - the name of the organization.
/// * `description` - the description of the organization.
/// * `profile_image` - the profile image of the organization.
/// * `banner_image` - the banner image of the organization.
/// * `x_url` - the X URL of the organization.
/// * `discord_url` - the Discord URL of the organization.
/// * `website_url` - the website URL of the organization.
/// * `administrator` - the administrator of the organization.
/// * `ballot_contract_zkwa` - the binary of the ballot contract.
/// * `ballot_contract_abi` - the ABI of the ballot contract.
/// * `factory_address` - the address of the factory.
///
/// # Returns
///
/// The initial data for an organization.
fn create_org_init_data(
    name: String,
    description: String,
    profile_image: String,
    banner_image: String,
    x_url: String,
    discord_url: String,
    website_url: String,
    administrator: Address,
    ballot_contract_zkwa: Vec<u8>,
    ballot_contract_abi: Vec<u8>,
    factory_address: Address,
) -> Vec<u8> {
    let mut bytes: Vec<u8> = vec![0xff, 0xff, 0xff, 0xff, 0x0f];
    WriteRPC::rpc_write_to(&name, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&description, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&profile_image, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&banner_image, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&x_url, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&discord_url, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&website_url, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&administrator, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&ballot_contract_zkwa, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&ballot_contract_abi, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&factory_address, &mut bytes).unwrap();
    bytes
}

#[action(shortname = 0x11)]
fn handle_organization_event(
    ctx: ContractContext,
    state: SekivaFactoryState,
    event: OrganizationEvent,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    // Extract process_id from event
    let process_id = match &event {
        OrganizationEvent::MembersAdded { process_id, .. } => process_id.clone(),
        OrganizationEvent::MembersRemoved { process_id, .. } => process_id.clone(),
        OrganizationEvent::BallotDeployed { process_id, .. } => process_id.clone(),
        OrganizationEvent::BallotDeployFailed { process_id, .. } => process_id.clone(),
        OrganizationEvent::OrganizationDeployed { process_id, .. } => process_id.clone(),
    };

    // Track the process - could add process tracking map in state if needed

    // Increment event nonce for security
    let event_nonce = state.event_nonce + 1;

    match event {
        OrganizationEvent::BallotDeployed {
            organization,
            ballot,
            process_id,
            ..
        } => {
            // Update organization's ballot tracking
            let mut ballots = state.ballots.clone();
            ballots.insert(ballot);

            // Update organization process state if needed
            let mut organization_processes = state.organization_processes.clone();
            if let Some(OrganizationProcessState::Deployed {}) =
                organization_processes.get(&process_id)
            {
                organization_processes.insert(process_id, OrganizationProcessState::Active {});
            }

            (
                SekivaFactoryState {
                    ballots,
                    organization_processes,
                    event_nonce,
                    ..state
                },
                vec![],
            )
        }
        OrganizationEvent::MembersAdded {
            members,
            organization,
            ..
        } => {
            // Update user's organization memberships
            let mut user_org_memberships = state.user_org_memberships.clone();

            for member in members {
                let mut user_orgs = user_org_memberships
                    .get(&member)
                    .cloned()
                    .unwrap_or_default();
                user_orgs.insert(organization);
                user_org_memberships.insert(member, user_orgs);
            }

            (
                SekivaFactoryState {
                    user_org_memberships,
                    event_nonce,
                    ..state
                },
                vec![],
            )
        }
        OrganizationEvent::MembersRemoved {
            members,
            organization,
            ..
        } => {
            // Update user's organization memberships
            let mut user_org_memberships = state.user_org_memberships.clone();

            for member in members {
                if let Some(mut user_orgs) = user_org_memberships.get(&member).cloned() {
                    user_orgs.remove(&organization);
                    user_org_memberships.insert(member, user_orgs);
                }
            }

            (
                SekivaFactoryState {
                    user_org_memberships,
                    event_nonce,
                    ..state
                },
                vec![],
            )
        }
        OrganizationEvent::OrganizationDeployed {
            organization,
            process_id,
            ..
        } => {
            // Update organization process state to active
            let mut organization_processes = state.organization_processes.clone();
            organization_processes.insert(process_id, OrganizationProcessState::Active {});

            (
                SekivaFactoryState {
                    organization_processes,
                    event_nonce,
                    ..state
                },
                vec![],
            )
        }
        _ => (
            SekivaFactoryState {
                event_nonce,
                ..state
            },
            vec![],
        ),
    }
}

/// Handles the OrganizationDeployed event
#[action(shortname = 0x45)]
fn handle_organization_deployed_event(
    ctx: ContractContext,
    state: SekivaFactoryState,
    event: OrganizationEvent,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    match event {
        OrganizationEvent::OrganizationDeployed {
            organization,
            process_id,
            ..
        } => {
            // Update organization process state to active
            let mut organization_processes = state.organization_processes.clone();
            organization_processes.insert(process_id, OrganizationProcessState::Active {});

            (
                SekivaFactoryState {
                    organization_processes,
                    ..state
                },
                vec![],
            )
        }
        _ => (state, vec![]),
    }
}
