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

const DEPLOY_CONTRACT_ADDRESS: Address = Address {
    address_type: AddressType::SystemContract,
    identifier: [
        0x97, 0xa0, 0xe2, 0x38, 0xe9, 0x24, 0x02, 0x5b, 0xad, 0x14, 0x4a, 0xa0, 0xc4, 0x91, 0x3e,
        0x46, 0x30, 0x8f, 0x9a, 0x4d,
    ],
};

const DEPLOY_SHORTNAME: Shortname = Shortname::from_u32(4);
const BINDER_ID: i32 = 9;

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
struct BallotInfo {
    options: Vec<String>,
    title: String,
    description: String,
    organization: Address,
    administrator: Address,
    status: BallotStatus,
    created_at: u64,
}

#[derive(CreateTypeSpec, ReadWriteState, Clone)]
enum ContractType {
    #[discriminant(0)]
    Ballot {},
    #[discriminant(1)]
    Organization {},
}

#[derive(CreateTypeSpec, ReadWriteState, ReadWriteRPC, Clone)]
struct OrganizationInfo {
    name: String,
    description: String,
    profile_image: String,
    banner_image: String,
}

#[state]
pub struct SekivaFactoryState {
    admin: Address,
    organizations: SortedVecSet<Address>,
    ballots: SortedVecSet<Address>,
    user_org_memberships: SortedVecMap<Address, SortedVecSet<Address>>,
    organization_ballots: SortedVecMap<Address, SortedVecSet<Address>>,
    ballot_contract_zkwa: Vec<u8>,
    ballot_contract_abi: Vec<u8>,
    organization_contract_wasm: Vec<u8>,
    organization_contract_abi: Vec<u8>,
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
        organization_ballots: SortedVecMap::new(),
        ballot_contract_zkwa,
        ballot_contract_abi,
        organization_contract_wasm,
        organization_contract_abi,
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
) -> (SekivaFactoryState, Vec<EventGroup>) {
    let org_contract_address = Address {
        address_type: AddressType::PublicContract,
        identifier: ctx.original_transaction.bytes[12..32].try_into().unwrap(),
    };

    let mut event_group = EventGroup::builder();

    event_group
        .call(DEPLOY_CONTRACT_ADDRESS, DEPLOY_SHORTNAME)
        .argument(state.organization_contract_wasm.clone())
        .argument(state.organization_contract_abi.clone())
        .argument(create_org_init_data(
            name,
            description,
            profile_image,
            banner_image,
        ))
        .argument(BINDER_ID)
        .done();

    event_group
        .with_callback(SHORTNAME_DEPLOY_ORGANIZATION_CALLBACK)
        .with_cost(10000)
        .argument(org_contract_address)
        .done();

    (state, vec![event_group.build()])
}

/// Callback for handling organization deployment. If deployment was successful, adds the new
/// organization to state tracking. If unsuccessful, no changes are made to state.
///
/// ### Parameters:
///
/// * `ctx`: [`ContractContext`], the context of the call.
/// * `callback_ctx`: [`CallbackContext`], the context of the callback.
/// * `state`: [`SekivaFactoryState`], the state before the call.
///
/// ### Returns:
/// The new state of type [`SekivaFactoryState`].
#[callback(shortname = 0x10)]
fn deploy_organization_callback(
    ctx: ContractContext,
    callback_ctx: CallbackContext,
    state: SekivaFactoryState,
    org_contract_address: Address,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    if callback_ctx.success {
        let mut organizations = state.organizations.clone();
        organizations.insert(org_contract_address);

        let mut user_org_memberships = state.user_org_memberships.clone();
        let mut user_orgs = user_org_memberships
            .get(&ctx.sender)
            .cloned()
            .unwrap_or_default();
        user_orgs.insert(org_contract_address);
        user_org_memberships.insert(ctx.sender, user_orgs);

        let mut organization_ballots = state.organization_ballots.clone();
        organization_ballots.insert(org_contract_address, SortedVecSet::new());

        return (
            SekivaFactoryState {
                organizations,
                organization_ballots,
                user_org_memberships,
                ..state
            },
            vec![],
        );
    }

    (state, vec![])
}

/// Create a new ballot.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the Sekiva Factory.
/// * `title` - the title of the ballot.
/// * `description` - the description of the ballot.
/// * `profile_image` - the profile image of the ballot.
/// * `banner_image` - the banner image of the ballot.
///
/// # Returns
///
/// The updated Sekiva Factory state reflecting the new ballot.
///
#[action(shortname = 0x02)]
fn deploy_ballot(
    ctx: ContractContext,
    state: SekivaFactoryState,
    title: String,
    description: String,
    options: Vec<String>,
    organization: Address,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    let ballot_contract_address = Address {
        address_type: AddressType::PublicContract,
        identifier: ctx.original_transaction.bytes[12..32].try_into().unwrap(),
    };
    let mut event_group = EventGroup::builder();

    event_group
        .call(DEPLOY_CONTRACT_ADDRESS, DEPLOY_SHORTNAME)
        .argument(state.ballot_contract_zkwa.clone())
        .argument(state.ballot_contract_abi.clone())
        .argument(create_ballot_init_data(
            title,
            description,
            options,
            organization,
            ctx.sender,
        ))
        .argument(BINDER_ID)
        .done();

    event_group
        .with_callback(SHORTNAME_DEPLOY_BALLOT_CALLBACK)
        .with_cost(10000)
        .argument(ballot_contract_address)
        .argument(organization)
        .done();

    (state, vec![event_group.build()])
}

/// Callback for handling ballot deployment. If deployment was successful, adds the new
/// ballot to state tracking. If unsuccessful, no changes are made to state.
///
/// ### Parameters:
///
/// * `ctx`: [`ContractContext`], the context of the call.
/// * `callback_ctx`: [`CallbackContext`], the context of the callback.
/// * `state`: [`SekivaFactoryState`], the state before the call.
///
/// ### Returns:
/// The new state of type [`SekivaFactoryState`].
#[callback(shortname = 0x20)]
fn deploy_ballot_callback(
    ctx: ContractContext,
    callback_ctx: CallbackContext,
    state: SekivaFactoryState,
    ballot_contract_address: Address,
    organization: Address,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    if callback_ctx.success {
        let mut ballots = state.ballots.clone();
        ballots.insert(ballot_contract_address);

        let mut organization_ballots = state.organization_ballots.clone();
        let mut organization_ballot_set = organization_ballots
            .get(&organization)
            .cloned()
            .unwrap_or_default();
        organization_ballot_set.insert(ballot_contract_address);
        organization_ballots.insert(organization, organization_ballot_set);

        return (
            SekivaFactoryState {
                ballots,
                organization_ballots,
                ..state
            },
            vec![],
        );
    }

    (state, vec![])
}

/// Create the initial data for an organization.
///
/// # Arguments
///
/// * `name` - the name of the organization.
/// * `description` - the description of the organization.
/// * `profile_image` - the profile image of the organization.
/// * `banner_image` - the banner image of the organization.
///
/// # Returns
///
/// The initial data for an organization.
fn create_org_init_data(
    name: String,
    description: String,
    profile_image: String,
    banner_image: String,
) -> Vec<u8> {
    let mut bytes: Vec<u8> = vec![0xff, 0xff, 0xff, 0xff, 0x0f];
    WriteRPC::rpc_write_to(&name, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&description, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&profile_image, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&banner_image, &mut bytes).unwrap();
    bytes
}

/// Create the initial data for a ballot.
///
/// # Arguments
///
/// * `title` - the title of the ballot.
/// * `description` - the description of the ballot.
/// * `options` - the options of the ballot.
/// * `organization` - the organization of the ballot.
/// * `administrator` - the administrator of the ballot.
///
/// # Returns
///
/// The initial data for a ballot.
fn create_ballot_init_data(
    title: String,
    description: String,
    options: Vec<String>,
    organization: Address,
    administrator: Address,
) -> Vec<u8> {
    let mut bytes: Vec<u8> = vec![0xff, 0xff, 0xff, 0xff, 0x0f];
    WriteRPC::rpc_write_to(&options, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&title, &mut bytes).unwrap();
    WriteRPC::rpc_write_to(&description, &mut bytes).unwrap();
    bytes
}
