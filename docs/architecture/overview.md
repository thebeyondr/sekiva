# Architecture Overview

Sekiva is a decentralized voting application built on Partisia Blockchain, using zero-knowledge proofs and multi-party computation for privacy-preserving voting.

## System Components

### Smart Contracts

1. **Factory Contract** (`sekiva/`)
   - Global registry for organizations
   - Organization deployment and tracking
   - Cross-contract event management
   - [Detailed Documentation](../../sekiva/README.md)

2. **Organization Contract** (`collective/`)
   - Organization membership management
   - Ballot deployment and coordination
   - Administrative controls
   - [Detailed Documentation](../../collective/README.md)

3. **Ballot Contract** (`ballot/`)
   - Privacy-preserving voting
   - Zero-knowledge vote processing
   - Ballot lifecycle management
   - [Detailed Documentation](../../ballot/README.md)

### Frontend Application

- Modern React application (`sekiva-frontend/`)
- TypeScript for type safety
- Tailwind CSS for styling
- Real-time updates
- Dark mode support
- Mobile-first design
- [Frontend Documentation](../../sekiva-frontend/README.md)

## Key Features

### Privacy & Security

- Zero-knowledge proofs for vote privacy
- Multi-party computation for vote tallying
- Double-vote prevention
- Organization-based access control
- Event-driven architecture with process tracking

### Organization Management

- Create and manage organizations
- Member and administrator roles
- Social links and metadata
- Ballot deployment and tracking

### Voting System

- Up to 5 voting options per ballot
- Configurable voting duration
- Automatic vote tallying
- Publicly verifiable results
- Individual vote privacy

## Technical Implementation

### Smart Contracts

- Written in Rust with Partisia's ZK framework
- Event-driven architecture for cross-contract communication
- Process tracking for reliable state management
- Standardized shortname scheme for operations

### Frontend

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Modern, responsive UI
- Real-time updates
- Dark mode support
- Mobile-first design

## Contract Interactions

See [Contract Interactions](contracts.md) for detailed information about how the contracts work together.

## Zero-Knowledge System

See [ZK System](zk-system.md) for details about the privacy-preserving voting mechanism. 