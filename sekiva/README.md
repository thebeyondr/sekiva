# Sekiva Factory

A factory smart contract for deploying and managing organizations on Partisia Blockchain.

## Features

### Organization Management

- Deploy new organization contracts with:
  - Name and description
  - Profile and banner images
  - Social links (X, Discord, Website)
  - Administrator assignment
- Track organization deployment states (Created, Deployed, Active, Deleted)
- Process tracking with unique IDs
- Event-based state management

### User Management

- Track user memberships across organizations
- Member addition and removal events
- Organization membership queries

### Event System

The contract emits and handles various events:

- OrganizationDeployed
- MembersAdded
- MembersRemoved

## Technical Details

### State Management

```rust
pub struct SekivaFactoryState {
    admin: Address,                                    // Factory admin
    organizations: SortedVecSet<Address>,             // All deployed orgs
    user_org_memberships: SortedVecMap<Address, SortedVecSet<Address>>, // User -> Orgs mapping
    organization_processes: SortedVecMap<String, OrganizationProcessState>, // Deployment tracking
    event_nonce: u64,                                 // Event replay protection
    // Contract binaries
    organization_contract_wasm: Vec<u8>,
    organization_contract_abi: Vec<u8>,
}
```

### Process States

Organizations go through these states:

```rust
enum OrganizationProcessState {
    Created {},   // Initial deployment request
    Deployed {},  // Contract deployed
    Active {},    // Ready for use
    Deleted {},   // Failed/removed
}
```

### Security Features

- Event nonce tracking prevents replay attacks
- Process state management ensures idempotent operations
- Callback-based deployment verification
- Administrator-controlled operations
- Factory address validation in organization contracts

### Contract Deployment

- Uses system contract `0x97a0e238e924025bad144aa0c4913e46308f9a4d` for deployment
- WASM binder ID: 9
- Shortname for deployment: 4
- Organization deployed event shortname: 0x45

### Event Handling

Events are processed through `handle_organization_event` (shortname: 0x11) with:

- Process ID generation using timestamp + tx bytes
- Event nonce incrementing
- State updates via callbacks
- Factory notification for cross-contract tracking

## Usage

### Creating an Organization

```rust
// Deploy a new organization
factory.deploy_organization(OrganizationInit {
    name: "Org Name",
    description: "Org Description",
    profile_image: "profile_url",
    banner_image: "banner_url",
    x_url: "x.com/org",
    discord_url: "discord.gg/org",
    website_url: "org.com",
    administrator: admin_address
});
```

### Event Handling

```rust
// Handle organization events
factory.handle_organization_event(OrganizationEvent::MembersAdded {
    members: vec![member1, member2],
    organization: org_address,
    timestamp: current_time,
    process_id: "unique_id",
    nonce: event_nonce
});
```

### Querying

- Get user's organizations through `user_org_memberships`
- Get organization deployment status through `organization_processes`
- Track event history through `event_nonce`

## Integration Notes

- Organizations maintain a reference to their factory address
- All member changes are propagated to the factory
- Process IDs are generated using `{block_time}-{tx_bytes[0..8]}`
- Event nonces must be strictly increasing
- Organization contracts validate factory address on initialization
