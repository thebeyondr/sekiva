#![doc = include_str!("../README.md")]
#![allow(unused_variables)]

#[macro_use]
extern crate pbc_contract_codegen;
extern crate pbc_contract_common;

use create_type_spec_derive::CreateTypeSpec;
use pbc_contract_common::address::Address;
use pbc_contract_common::context::{CallbackContext, ContractContext};
use pbc_contract_common::events::EventGroup;
use pbc_contract_common::sorted_vec_map::{SortedVecMap, SortedVecSet};
use pbc_traits::ReadWriteState;
use read_write_rpc_derive::ReadWriteRPC;
use read_write_state_derive::ReadWriteState;

mod contract_bytes;

#[derive(CreateTypeSpec, ReadWriteState, Clone)]
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
struct BallotInfo {
    organization: Address,
    title: String,
    status: BallotStatus,
    created_at: u64,
    administrator: Address,
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
    description: String,
    name: String,
    profile_image: String,
    banner_image: String,
}

#[state]
pub struct SekivaFactoryState {
    organizations: SortedVecSet<Address>,
    ballots: SortedVecMap<Address, BallotInfo>,
    user_organizations: SortedVecMap<Address, SortedVecSet<Address>>,
    user_ballots: SortedVecMap<Address, SortedVecSet<Address>>,
    deployed_contracts: SortedVecMap<Address, ContractType>,
}

/// Initialize a new Sekiva Factory.
///
/// # Arguments
///
/// * `_ctx` - the contract context containing information about the sender and the blockchain.
///
/// # Returns
///
/// The initial state of the Sekiva Factory.
///
#[init]
pub fn initialize(_ctx: ContractContext) -> SekivaFactoryState {
    SekivaFactoryState {
        organizations: SortedVecSet::new(),
        ballots: SortedVecMap::new(),
        user_organizations: SortedVecMap::new(),
        user_ballots: SortedVecMap::new(),
        deployed_contracts: SortedVecMap::new(),
    }
}

/// Create a new organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the Sekiva Factory.
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
    // Prepare deployment
    let mut event_group = EventGroup::builder();

    // Call system deploy contract
    event_group
        .call(DEPLOY_CONTRACT_ADDRESS, DEPLOY_SHORTNAME)
        .argument(contract_bytes::ORGANIZATION_WASM)
        .argument(contract_bytes::ORGANIZATION_ABI)
        .argument(create_init_data(
            name,
            description,
            profile_image,
            banner_image,
        ))
        .done();

    // Add callback to track newly deployed contract
    event_group
        .with_callback(SHORTNAME_DEPLOY_ORGANIZATION_CALLBACK)
        .with_cost(10000)
        .done();

    (state, vec![event_group.build()])
}

// Callback to handle deployment result
#[callback(shortname = 0x10)]
fn deploy_organization_callback(
    ctx: ContractContext,
    callback_ctx: CallbackContext,
    state: SekivaFactoryState,
) -> (SekivaFactoryState, Vec<EventGroup>) {
    if callback_ctx.success {
        let contract_address = extract_contract_address(&callback_ctx);

        let mut deployed_contracts = state.deployed_contracts.clone();
        deployed_contracts.insert(contract_address, ContractType::Organization {});

        let mut orgs = state.organizations.clone();
        orgs.insert(contract_address);

        return (
            SekivaFactoryState {
                organizations: orgs,
                deployed_contracts: deployed_contracts,
                ..state
            },
            vec![],
        );
    }

    (state, vec![])
}

fn extract_contract_address(callback_ctx: &CallbackContext) -> Address {
    let result = callback_ctx.results.get(0).unwrap();
    result.get_return_data::<Address>()
}
