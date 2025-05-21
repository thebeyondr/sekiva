# Quick Start

Get started with Sekiva development in minutes.

## Clone and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/sekiva.git
   cd sekiva
   ```

2. Install dependencies:

   ```bash
   # Install Rust dependencies
   cargo build

   # Install frontend dependencies
   cd sekiva-frontend
   bun install
   ```

## Development Workflow

### Smart Contracts

1. Build contracts:

   ```bash
   cargo pbc build
   ```

2. Run tests:

   ```bash
   cargo test
   ```

3. Generate TypeScript bindings:

   ```bash
   # Generate Factory contract bindings
   cargo pbc abi codegen --ts \
     target/wasm32-unknown-unknown/release/sekiva.abi \
     sekiva-frontend/src/contracts/SekivaFactoryGenerated.ts \
     --deserialize-rpc

   # Generate Organization contract bindings
   cargo pbc abi codegen --ts \
     target/wasm32-unknown-unknown/release/collective.abi \
     sekiva-frontend/src/contracts/CollectiveGenerated.ts \
     --deserialize-rpc

   # Generate Ballot contract bindings
   cargo pbc abi codegen --ts \
     target/wasm32-unknown-unknown/release/ballot.abi \
     sekiva-frontend/src/contracts/BallotGenerated.ts \
     --deserialize-rpc
   ```

### Frontend

1. Start development server:

   ```bash
   cd sekiva-frontend
   bun run dev
   ```

2. Access at `http://localhost:5173`

## First Deployment

1. [Create an account](account-setup.md)
2. [Deploy the factory contract](../deployment/factory.md)
3. Update frontend configuration:

   ```typescript
   // sekiva-frontend/src/config.ts
   export const FACTORY_ADDRESS = '<YOUR_FACTORY_ADDRESS>';
   ```

## Common Tasks

### Create Organization

```bash
cargo pbc transaction action <SEKIVA_CONTRACT_ADDRESS> deploy_organization \
  <ORG_NAME> \
  <ORG_DESCRIPTION> \
  <ORG_PROFILE_IMAGE> \
  <ORG_BANNER_IMAGE> \
  <X_URL> \
  <DISCORD_URL> \
  <WEBSITE_URL> \
  <ORG_ADMINISTRATOR> \
  --abi <SEKIVA_ABI> \
  --gas 10000000 \
  --privatekey <PRIVATE_KEY_FILE>
```

### Create Ballot

```bash
cargo pbc transaction action <ORG_CONTRACT_ADDRESS> deploy_ballot \
  [ <UP_TO_5_OPTIONS_SEPARATED_BY_A_SPACE> ] \
  <BALLOT_TITLE> \
  <BALLOT_DESC> \
  <ADMIN> \
  <DURATION_IN_SECONDS> \
  --abi <ORG_PBC> \
  --gas 10000000 \
  --privatekey <PRIVATE_KEY_FILE>
```

Example:
```bash
cargo pbc transaction action 02a51cbe067086205f82c48b4714d3781070c4cdd5 deploy_ballot \
  [ YES NO ] \
  'Does this work?' \
  "Let's see..." \
  '00ccb2dd9d08a91f1815c0945762597f48bc5323c6' \
  300 \
  --abi target/wasm32-unknown-unknown/release/collective.pbc \
  --gas 10000000 \
  --privatekey 006e0dd6c0dfa4b012e0b3ac085b1105754879503a.pk
```

## Next Steps

- [Architecture Overview](../architecture/overview.md)
- [Contract Deployment](../deployment/factory.md)
- [Development Guide](../development/contributing.md)
