# API Reference

## Contract Interfaces

### Factory Contract

```rust
// Core Functions
fn deploy_organization(
    name: String,
    description: String,
    profile_image: String,
    banner_image: String,
    x_url: String,
    discord_url: String,
    website_url: String,
    administrator: Address
) -> Address

// View Functions
fn get_organization(address: Address) -> Organization
fn get_organizations() -> Vec<Address>
fn get_organization_count() -> u64

// Events
event OrganizationDeployed {
    address: Address,
    name: String,
    administrator: Address
}
```

### Organization Contract

```rust
// Core Functions
fn deploy_ballot(
    options: Vec<String>,
    title: String,
    description: String,
    administrator: Address,
    duration: u64
) -> Address

fn add_member(address: Address)
fn remove_member(address: Address)
fn set_administrator(address: Address)

// View Functions
fn get_ballots() -> Vec<Address>
fn get_members() -> Vec<Address>
fn get_administrator() -> Address
fn get_metadata() -> OrganizationMetadata

// Events
event BallotDeployed {
    address: Address,
    title: String,
    administrator: Address
}

event MemberAdded {
    address: Address
}

event MemberRemoved {
    address: Address
}
```

### Ballot Contract

```rust
// Core Functions
fn cast_vote(option_index: u8, proof: ZkProof)
fn finalize()
fn cancel()

// View Functions
fn get_results() -> Vec<u64>
fn get_metadata() -> BallotMetadata
fn get_status() -> BallotStatus
fn has_voted(address: Address) -> bool

// Events
event VoteCast {
    voter: Address,
    option_index: u8
}

event BallotFinalized {
    results: Vec<u64>
}

event BallotCancelled {
    reason: String
}
```

## Frontend API

### Contract Hooks

```typescript
// Factory Contract
useFactoryContract(address: string) => {
  deployOrganization: (params: DeployOrgParams) => Promise<Address>
  getOrganizations: () => Promise<Address[]>
  getOrganization: (address: Address) => Promise<Organization>
}

// Organization Contract
useOrganizationContract(address: string) => {
  deployBallot: (params: DeployBallotParams) => Promise<Address>
  addMember: (address: Address) => Promise<void>
  removeMember: (address: Address) => Promise<void>
  getBallots: () => Promise<Address[]>
  getMembers: () => Promise<Address[]>
}

// Ballot Contract
useBallotContract(address: string) => {
  castVote: (optionIndex: number, proof: ZkProof) => Promise<void>
  finalize: () => Promise<void>
  getResults: () => Promise<number[]>
  getStatus: () => Promise<BallotStatus>
}
```

## Types

```typescript
interface Organization {
  name: string
  description: string
  profileImage: string
  bannerImage: string
  xUrl: string
  discordUrl: string
  websiteUrl: string
  administrator: Address
  memberCount: number
  ballotCount: number
}

interface BallotMetadata {
  title: string
  description: string
  options: string[]
  administrator: Address
  startTime: number
  endTime: number
  status: BallotStatus
}

enum BallotStatus {
  Active = "ACTIVE"
  Finalized = "FINALIZED"
  Cancelled = "CANCELLED"
}

type Address = string
type ZkProof = string // Base64 encoded proof
```

## Error Codes

```
0x01: InsufficientBalance
0x02: InvalidAddress
0x03: Unauthorized
0x04: InvalidState
0x05: InvalidProof
0x06: DuplicateVote
0x07: BallotClosed
0x08: InvalidOption
```

## Next Steps

- [Contract Interactions](../architecture/contracts.md)
- [ZK System](../architecture/zk-system.md)
- [Deployment Guide](../deployment/factory.md) 