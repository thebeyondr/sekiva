# Zero Knowledge Ballot Contract

A privacy-preserving voting contract on Partisia Blockchain that enables confidential ballot-based voting with up to 5 options.

## Features

### Ballot Management

- Create ballots with:
  - Title and description
  - Up to 5 voting options
  - Configurable duration (max 30 days)
  - Administrator assignment
  - Eligible voter list
- Track ballot states:
  - Active (voting period)
  - Tallying (vote counting)
  - Completed (results final)
  - Cancelled (aborted)
- Process tracking with unique IDs
- Event-based state management

### Voting System

- Privacy-preserving votes using zero-knowledge proofs
- Double-vote prevention via address tracking
- Automatic vote tallying
- Publicly verifiable results
- Individual vote privacy guaranteed

### Member Management

- Track eligible voters
- Sync with organization membership
- Manual voter list updates
- Event-based member updates

## Technical Details

### State Management

```rust
struct BallotState {
    organization: Address,                    // Parent organization
    administrator: Address,                   // Ballot administrator
    title: String,                           // Ballot title
    description: String,                     // Ballot description
    options: Vec<String>,                    // Voting options (max 5)
    start_time: u64,                         // Voting start time
    end_time: u64,                           // Voting end time
    status: Option<BallotStatus>,            // Current ballot status
    tally: Option<Tally>,                    // Vote results
    eligible_voters: Vec<Address>,           // Can vote
    already_voted: Vec<Address>,             // Have voted
    process_state: BallotProcessState,       // Process tracking
    process_id: String,                      // Unique process ID
    event_processes: SortedVecMap<String, ProcessState> // Event tracking
}
```

### Process States

```rust
enum BallotProcessState {
    Active {},     // Voting period
    Tallying {},   // Vote counting
    Completed {},  // Results final
    Cancelled {}   // Aborted
}

enum ProcessState {
    Received {},   // Event received
    Complete {},   // Processing complete
    Ignored {}     // Event ignored
}
```

### Security Features

- Zero-knowledge vote processing
- Double-vote prevention
- Administrator-only controls
- Organization validation
- Process state tracking
- Event nonce validation
- Duration limits (max 30 days)
- Option limits (2-5 options)
- Administrator != organization validation

### Event System

Events are processed through `handle_org_event` (shortname: 0x30) with:
- Process ID generation using timestamp + tx bytes
- State updates via callbacks
- Event types:
  ```rust
  enum BallotEvent {
      MembersUpdated { added, removed, timestamp, process_id },
      VoteCast { voter, timestamp, process_id },
      TallyStarted { timestamp, process_id },
      TallyCompleted { timestamp, process_id },
      StatusChanged { status, timestamp, process_id }
  }
  ```

## Usage

### Creating a Ballot

```rust
// Initialize a new ballot
ballot.initialize(
    options: vec!["Option 1", "Option 2"],  // 2-5 options required
    title: "Ballot Title",                  // Required
    description: "Description",             // Required
    organization: org_address,              // Required
    administrator: admin_address,           // Must be different from org
    eligible_voters: vec![voter1, voter2],  // Initial voters
    duration_seconds: 604800                // Max 30 days
);
```

### Voting

```rust
// Cast a vote (ZK computation)
ballot.cast_vote(
    // Vote is processed through ZK computation
    // Returns ZkInputDef for vote processing
);

// Vote is automatically tallied in ZK computation
// Results are revealed through tally_compute_complete
```

### Ballot Management

```rust
// Start tallying (administrator only)
ballot.compute_tally();

// Cancel ballot (administrator only)
ballot.cancel_ballot();

// Sync voters (administrator or organization only)
ballot.sync_voters(new_eligible_voters);
```

## Integration Notes

- Ballots maintain a reference to their organization
- All member changes are propagated from organization
- Process IDs are generated using `{block_time}-{tx_bytes[0..8]}`
- Votes are processed through ZK computation
- Results are automatically tallied and revealed
- Ballot status changes are tracked through events
- Voter eligibility is managed through organization events
- Manual voter sync available for ZK contract limitations

## Technical Implementation

- Uses Partisia's ZK framework for private vote processing
- Implements proper state handling for ZK computation flow
- Follows MPC paradigm for secure multi-party computation
- Properly manages variable opening and state transitions
- Uses `SecretVarType::Vote` for vote data
- Uses `SecretVarType::TallyResult` for results
- Implements proper ZK computation lifecycle:
  1. Vote casting (0x60)
  2. Vote input (0x61)
  3. Tally computation (0x01)
  4. Tally completion (0x62)
  5. Result opening

## For Developers

When implementing or extending this contract:

- Secret vote data is stored with `SecretVarType::Vote` type
- Votes are tallied in the ZK computation function `tally_votes()`
- Results are properly deserialized through the `read_variable` function
- State lifecycle changes must be handled carefully to maintain ballot integrity

## Limitations

- Limited to 5 voting options
- No time-based automatic state transitions
- No vote delegation mechanism
- Does not include complex vote weighting

## Future Improvements

- Implement time-based automatic state transitions
- Add voter receipts and verification
- Add organization metadata
