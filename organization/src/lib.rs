#![doc = include_str!("../README.md")]
#![allow(unused_variables)]

#[macro_use]
extern crate pbc_contract_codegen;
extern crate pbc_contract_common;

use pbc_contract_common::address::Address;
use pbc_contract_common::context::ContractContext;
use pbc_contract_common::sorted_vec_map::SortedVecSet;

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
}

// UI link example:
// https://propostr.xyz/0x1234567890123456789012345678901234567890/p/0x1234567890123456789012345678901234567890

/// Initialize a new organization.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `name` - the name of the organization.
/// * `description` - the description of the organization.
/// * `profile_image` - the profile image of the organization.
/// * `banner_image` - the banner image of the organization.
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
) -> OrganizationState {
    assert_ne!(name, "", "Please name the organization.");
    assert_ne!(description, "", "Please describe the organization.");
    assert_ne!(
        profile_image, "",
        "Please add a profile image for the organization."
    );
    assert_ne!(
        banner_image, "",
        "Please add a banner image for the organization."
    );

    let mut members = SortedVecSet::new();
    members.insert(ctx.sender);
    let mut administrators = SortedVecSet::new();
    administrators.insert(ctx.sender);

    OrganizationState {
        owner: ctx.sender,
        administrators,
        members,
        name,
        description,
        profile_image,
        banner_image,
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
) -> OrganizationState {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can add a member."
    );
    assert!(!state.members.contains(&address), "Already a member.");

    let mut members = state.members.clone();
    members.insert(address);

    OrganizationState { members, ..state }
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
) -> OrganizationState {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can add members."
    );

    let mut members = state.members.clone();

    for address in addresses {
        if !members.contains(&address) {
            members.insert(address);
        }
    }

    OrganizationState { members, ..state }
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
) -> OrganizationState {
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

    OrganizationState { members, ..state }
}

/// Removes multiple members from the organization at once.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the organization.
/// * `addresses` - the addresses of the members to remove.
///
/// # Returns
///
/// The updated organization state reflecting the removed members.
///
#[action(shortname = 0x06)]
pub fn remove_members(
    ctx: ContractContext,
    state: OrganizationState,
    addresses: Vec<Address>,
) -> OrganizationState {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can remove members."
    );

    // Filter out ineligible addresses with specific reasons
    let not_members: Vec<_> = addresses
        .iter()
        .filter(|addr| !state.members.contains(addr))
        .collect();

    if !not_members.is_empty() {
        panic!("Addresses {:?} are not members", not_members);
    }

    let owners: Vec<_> = addresses
        .iter()
        .filter(|addr| state.owner == **addr)
        .collect();

    if !owners.is_empty() {
        panic!("Cannot remove owner address");
    }

    let admins: Vec<_> = addresses
        .iter()
        .filter(|addr| state.administrators.contains(addr))
        .collect();

    if !admins.is_empty() {
        panic!(
            "Addresses {:?} are administrators and cannot be removed like this.",
            admins
        );
    }

    let mut members = state.members.clone();

    for address in addresses {
        members.remove(&address);
    }

    OrganizationState { members, ..state }
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
pub fn add_proposal(
    ctx: ContractContext,
    state: OrganizationState,
    address: Address,
) -> OrganizationState {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can add a proposal."
    );
    assert!(!state.ballots.contains(&address), "Already a proposal.");

    let mut ballots = state.ballots.clone();
    ballots.insert(address);

    OrganizationState { ballots, ..state }
}
