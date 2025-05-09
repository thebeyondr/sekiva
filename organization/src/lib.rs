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
    website: String,
    x_account: String,
    discord_server: String,
    ballots: SortedVecSet<Address>,
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
    website: String,
    x_account: String,
    discord_server: String,
) -> OrganizationState {
    assert_ne!(name, "", "Please name the organization.");
    assert_ne!(description, "", "Please describe the organization.");

    let mut members = SortedVecSet::new();
    members.insert(ctx.sender);
    let mut administrators = SortedVecSet::new();
    administrators.insert(ctx.sender);

    OrganizationState {
        owner: ctx.sender,
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
pub fn add_ballot(
    ctx: ContractContext,
    state: OrganizationState,
    address: Address,
) -> OrganizationState {
    assert!(
        state.administrators.contains(&ctx.sender),
        "Only admins can add a ballot."
    );
    assert!(!state.ballots.contains(&address), "Already a ballot.");

    let mut ballots = state.ballots.clone();
    ballots.insert(address);

    OrganizationState { ballots, ..state }
}
