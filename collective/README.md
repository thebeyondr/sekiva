# Organization Contract

A smart contract for managing decentralized organizations on Partisia Blockchain.

## Features

### Organization Management

- Create organizations with:
  - Name and description
  - Profile and banner images
  - Social links (Website, X, Discord)
  - Owner and administrator roles
- Update organization metadata
- Track organization state and processes

### Member Management

- Add/remove members (administrator only)
- Add/remove administrators (owner only)
- Track member and administrator roles
- Batch member addition support

### Ballot Management

- Deploy new ballots with:
  - Title and description
  - Voting options
  - Duration
  - Administrator assignment
- Track ballot states (Created, Deployed, Active, Tallying, Completed, Cancelled)
- Process tracking with unique IDs

## Technical Details

### State Management

```rust
pub struct OrganizationState {
    owner: Address,                                    // Organization owner
    administrators: SortedVecSet<Address>,            // Admin addresses
    members: SortedVecSet<Address>,                   // Member addresses
    name: String,                                     // Organization name
    description: String,                              // Organization description
    profile_image: String,                            // Profile image URL
    banner_image: String,                             // Banner image URL
    website: String,                                  // Website URL
    x_account: String,                                // X account
    discord_server: String,                           // Discord server
    ballots: SortedVecSet<Address>,                   // Deployed ballots
    event_nonce: u64,                                 // Event replay protection
    ballot_processes: SortedVecMap<String, BallotProcessState>, // Ballot tracking
    factory_address: Address,                         // Factory that created this org
    // Contract binaries
    ballot_contract_zkwa: Vec<u8>,
    ballot_contract_abi: Vec<u8>,
}
```

### Process States

Ballots go through these states:
```rust
enum BallotProcessState {
    Created {},    // Initial deployment request
    Deployed {},   // Contract deployed
    Active {},     // Ready for voting
    Tallying {},   // Vote counting
    Completed {},  // Results final
    Cancelled {},  // Failed/removed
}
```

### Security Features

- Event nonce tracking prevents replay attacks
- Process state management ensures idempotent operations
- Role-based access control:
  - Only owner can manage administrators
  - Only administrators can manage members
  - Only administrators can deploy ballots
- Empty string validation for metadata
- Factory address validation
- Administrator must be different from factory
- Owner cannot be removed as member/administrator

### Contract Deployment

- Uses system contract `0x8bc1ccbb672b87710327713c97d43204905082cb` for ballot deployment
- ZK binder ID: 11
- Shortname for deployment: 2
- Ballot deployed event shortname: 0x40
- Ballot deploy failed event shortname: 0x43
- Organization event handler shortname: 0x11

### Event System

Events are processed through `handle_organization_event` with:
- Process ID generation using timestamp + tx bytes
- Event nonce incrementing
- State updates via callbacks
- Factory notification for cross-contract tracking
- Event types:
  ```rust
  enum OrganizationEvent {
      BallotDeployed { organization, ballot, title, timestamp, process_id },
      MembersAdded { members, organization, timestamp, process_id, nonce },
      MembersRemoved { members, organization, timestamp, process_id, nonce },
      BallotDeployFailed { organization, reason, timestamp, process_id }
  }
  ```

## Usage

### Creating an Organization

```rust
// Initialize a new organization
organization.initialize(
    name: "Org Name",                    // Required, non-empty
    description: "Org Description",      // Required, non-empty
    profile_image: "profile_url",        // Required, non-empty
    banner_image: "banner_url",         // Required, non-empty
    website: "org.com",                 // Required, non-empty
    x_account: "x.com/org",            // Required, non-empty
    discord_server: "discord.gg/org",   // Required, non-empty
    administrator: admin_address,       // Must be different from factory
    ballot_contract_zkwa: wasm_bytes,   // Required
    ballot_contract_abi: abi_bytes,     // Required
    factory_address: factory_addr       // Required
);
```

### Member Management

```rust
// Add members (administrator only)
organization.add_members(vec![member1, member2]);

// Remove member (administrator only)
organization.remove_member(member_address);

// Add administrator (owner only)
organization.add_administrator(admin_address);

// Remove administrator (owner only)
organization.remove_administrator(admin_address);
```

### Ballot Management

```rust
// Deploy a new ballot (administrator only)
organization.deploy_ballot(BallotInit {
    options: vec!["Option 1", "Option 2"],
    title: "Ballot Title",
    description: "Ballot Description",
    administrator: admin_address,      // Must be an org administrator
    duration_seconds: 604800          // 7 days
});
```

### Metadata Updates

```rust
// Update organization metadata (administrator only)
organization.update_metadata(
    name: Some("New Name"),
    description: Some("New Description"),
    profile_image: Some("new_profile_url"),
    banner_image: Some("new_banner_url"),
    website: Some("new_website.com"),
    x_account: Some("new_x_account"),
    discord_server: Some("new_discord_server")
);
```

## Integration Notes

- Organizations maintain a reference to their factory address
- All member changes are propagated to the factory
- Process IDs are generated using `{block_time}-{tx_bytes[0..8]}`
- Event nonces must be strictly increasing
- Ballot deployment requires valid contract binaries
- Member changes require administrator privileges
- Organization metadata updates require administrator privileges
- Administrator changes require owner privileges
- Owner cannot be removed as member/administrator
- Ballots can be accessed via: `https://prpstr.xyz/{org_address}/p/{ballot_address}`
