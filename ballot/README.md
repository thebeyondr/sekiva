# Zero Knowledge Ballot Contract

A privacy-preserving voting contract on Partisia Blockchain that enables confidential ballot-based voting with up to 5 options.

## Overview

This ballot contract allows organizations to conduct private voting where:
- Votes remain confidential
- Double-voting is prevented
- Final tallies are publicly verifiable
- No individual vote is revealed

## How It Works

The ballot contract follows these steps:

1. **Initialization** - Administrator creates the ballot with options, title, and description
2. **Activation** - Administrator activates voting period
3. **Voting** - Users cast secret votes using zero-knowledge proofs
4. **Tallying** - Administrator initiates the secure tallying process
5. **Results** - Vote counts are revealed while preserving individual vote privacy

## Key Features

- **Privacy Preserving** - All votes are processed using MPC (Multi-Party Computation)
- **Multiple Choice** - Support for up to 5 voting options
- **Double-Vote Prevention** - Uses nullifier hashes to prevent users from voting multiple times
- **Status Tracking** - Full ballot lifecycle management (Created, Active, Tallying, Completed, Cancelled)
- **Administrator Controls** - Designated administrator manages ballot lifecycle

## Technical Implementation

- Uses Partisia's ZK framework for private vote processing
- Implements proper state handling for the ZK computation flow
- Follows the MPC paradigm for secure multi-party computation
- Properly manages variable opening and state transitions

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
