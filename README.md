# Sekiva - Privacy-Preserving Voting DApp

A decentralized application for conducting private, verifiable voting on Partisia Blockchain. Built with zero-knowledge proofs and multi-party computation (MPC) to ensure vote privacy while maintaining verifiability.

## Overview

Sekiva enables organizations to conduct confidential ballot-based voting where:

- Individual votes remain private
- Double-voting is prevented
- Final tallies are publicly verifiable
- No individual vote is revealed
- Organizations can manage their own voting processes

## Architecture

The system consists of three main smart contracts and a modern frontend:

1. **Factory Contract** (`sekiva/`)
   - Global registry for organizations
   - Organization deployment and tracking
   - Cross-contract event management
   - [Detailed Documentation](sekiva/README.md)

2. **Organization Contract** (`collective/`)
   - Organization membership management
   - Ballot deployment and coordination
   - Administrative controls
   - [Detailed Documentation](collective/README.md)

3. **Ballot Contract** (`ballot/`)
   - Privacy-preserving voting
   - Zero-knowledge vote processing
   - Ballot lifecycle management
   - [Detailed Documentation](ballot/README.md)

4. **Frontend Application** (`sekiva-frontend/`)
   - Modern React application
   - TypeScript for type safety
   - Tailwind CSS for styling
   - [Frontend Documentation](sekiva-frontend/README.md)

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

## Development

### Prerequisites

- Rust toolchain
- Partisia Blockchain development environment
- Node.js 18+ and Bun package manager

### Setup

1. Clone the repository
2. Install contract dependencies:

   ```bash
   # Install Rust dependencies
   cargo build
   ```

3. Install frontend dependencies:

   ```bash
   cd sekiva-frontend
   bun install
   ```

4. Start the development server:

   ```bash
   # In sekiva-frontend directory
   bun run dev
   ```


## Contract Shortname Scheme

The contracts use a systematic shortname numbering scheme:

```
0x00-0x1F: Actions (Regular contract actions)
0x20-0x3F: Callbacks (Contract callbacks)
0x40-0x5F: Events (Contract events)
0x60-0x7F: ZK Operations (Zero-knowledge computations)
```

See [Contract Shortname Scheme](docs/shortname-scheme.md) for details.

## Security

- Zero-knowledge proofs ensure vote privacy
- MPC for secure vote tallying
- Event nonces prevent replay attacks
- Process tracking ensures reliable state management
- Organization-based access control
- Administrator validation

## Limitations

- Limited to 5 voting options per ballot
- No time-based automatic state transitions
- No vote delegation mechanism
- No complex vote weighting

## Future Improvements

- Time-based automatic state transitions
- Voter receipts and verification
- Organization metadata enhancements
- Vote delegation system
- Advanced vote weighting
- Mobile application
- API for third-party integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Partisia Blockchain Documentation](https://partisiablockchain.gitlab.io/documentation/)
- [ZK Smart Contracts Guide](https://partisiablockchain.gitlab.io/documentation/smart-contracts/zk-smart-contracts/zk-smart-contracts.html)
- [ZK Rust Language](https://partisiablockchain.gitlab.io/documentation/smart-contracts/zk-smart-contracts/zk-rust-language-zkrust.html)
- [Partisia Community Discord](https://partisiablockchain.gitlab.io/documentation/get-support-from-pbc-community.html)

## 🛠 How to Deploy a Sekiva

### 1. Build the Contracts

```bash
cargo pbc build --release
````

This will output the compiled artifacts to:

```bash

target/wasm32-unknown-unknown/release/
```

For each package in the workspace, you'll see:

`<name>.pbc`

`<name>.abi`

`<name>.wasm`

(If ZK): `<name>.zkwa`, `<name>.zkbc`, `<name>.jar`

---

### 2. (Optional) Create an Account

If you don’t already have an account, create one:

```bash
cargo pbc account create
```

This will generate a file named like:

```bash
[public-address].pk
```

You can rename it to something simpler (e.g. `Account-A.pk`). We’ll refer to it as:

```bash
<PK-FILE>
```

---

### 3. Deploy the Factory

Use the following command to deploy the Sekiva contracts:

```bash
cargo pbc transaction deploy \
  --gas 10000000 \
  --privatekey <PK-FILE> \
  <SEKIVA-PBC> <BALLOT_ZKWA> <BALLOT_ABI> <COLLECTIVE_WASM> <COLLECTIVE_ABI>
```

Each argument after `<PK-FILE>` must be formatted as:

```bash
file:target/wasm32-unknown-unknown/release/<PACKAGE>.<EXT>
```

---

### 🧪 Example

```bash
cargo pbc transaction deploy \
  --gas 10000000 \
  --privatekey Account-A.pk \
  target/wasm32-unknown-unknown/release/sekiva.pbc \
  'file:target/wasm32-unknown-unknown/release/ballot.zkwa' \
  'file:target/wasm32-unknown-unknown/release/ballot.abi' \
  'file:target/wasm32-unknown-unknown/release/collective.wasm' \
  'file:target/wasm32-unknown-unknown/release/collective.abi'
```

### ✅ Deployment Success

If the deployment succeeds, you will see output like this:

```text
Deployed contract successfully.
Contract deployed at: <CONTRACT_ADDRESS>
View it in browser here: https://browser.testnet.partisiablockchain.com/contracts/<CONTRACT_ADDRESS>
```

### 📝 Deploy notes

- Ensure you've built all packages before deploying.

- If a contract uses ZK, ensure its `.zkwa`, `.zkbc`, and `.jar` are present.

- You can script the file collection by globbing `target/wasm32-unknown-unknown/release/`.
