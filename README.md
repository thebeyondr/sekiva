# Sekiva - Privacy-Preserving Voting DApp

A decentralized application for conducting private, verifiable voting on Partisia Blockchain. Built with zero-knowledge proofs and multi-party computation (MPC) to ensure vote privacy while maintaining verifiability.

## Quick Links

- [Getting Started](docs/getting-started/environment.md)
- [Architecture](docs/architecture/overview.md)
- [API Reference](docs/reference/api.md)
- [Contributing](docs/development/contributing.md)

## Documentation

### Getting Started

- [Environment Setup](docs/getting-started/environment.md)
- [Account Setup](docs/getting-started/account-setup.md)
- [Quick Start](docs/getting-started/quick-start.md)

### Deployment

- [Factory Contract](docs/deployment/factory.md)
- [Organization Contract](docs/deployment/organization.md)
- [Ballot Contract](docs/deployment/ballot.md)

### Architecture

- [System Overview](docs/architecture/overview.md)
- [Contract Interactions](docs/architecture/contracts.md)
- [ZK System](docs/architecture/zk-system.md)

### Development

- [Contributing Guide](docs/development/contributing.md)
- [Code Style](docs/development/code-style.md)
- [Testing](docs/development/testing.md)

### Reference

- [API Reference](docs/reference/api.md)
- [Contract Shortnames](docs/reference/shortnames.md)
- [Events](docs/reference/events.md)

### Contract Documentation

- [Factory Contract](sekiva/README.md)
- [Organization Contract](collective/README.md)
- [Ballot Contract](ballot/README.md)
- [Frontend Application](sekiva-frontend/README.md)

## Example Commands

### Deploy Factory Contract

```bash
cargo pbc transaction deploy \
  --gas 10000000 \
  --privatekey <PK-FILE> \
  target/wasm32-unknown-unknown/release/sekiva.pbc \
  'file:target/wasm32-unknown-unknown/release/ballot.zkwa' \
  'file:target/wasm32-unknown-unknown/release/ballot.abi' \
  'file:target/wasm32-unknown-unknown/release/collective.wasm' \
  'file:target/wasm32-unknown-unknown/release/collective.abi'
```

### Deploy Organization

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

### Deploy Ballot

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
```

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

If you don't already have an account, create one:

```bash
cargo pbc account create
```

This will generate a file named like:

```bash
[public-address].pk
```

You can rename it to something simpler (e.g. `Account-A.pk`). We'll refer to it as:

```bash
<PK-FILE>
```

---

### 3. Deploy the Factory

#### Option 1

Use the following command to deploy the Sekiva factory contract:

```bash
cargo pbc transaction deploy \
  --gas 10000000 \
  --privatekey <PK-FILE> \
  target/wasm32-unknown-unknown/release/sekiva.pbc \
  'file:target/wasm32-unknown-unknown/release/ballot.zkwa' \
  'file:target/wasm32-unknown-unknown/release/ballot.abi' \
  'file:target/wasm32-unknown-unknown/release/collective.wasm' \
  'file:target/wasm32-unknown-unknown/release/collective.abi'
```

#### Option 2

Go to <https://browser.testnet.partisiablockchain.com/contracts/deploy> in your browser

and add the `<FACTORY_ABI>` and `<FACTORY_WASM>` files on the left. Then add the other initialization files through the revealed upload buttons, connect a funded wallet and click "DEPLOY"

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

You can update the FACTORY_ADDRESS in sekiva-frontend `useFactoryContract` to your newly deployed address to make the frontend functions work. Front end requires a deployed factory contract as well as the generated files if you make any changes.

### 📝 Deploy notes

- Ensure you've built all packages before deploying.

- If a contract uses ZK, ensure its `.zkwa`, `.zkbc`, and `.jar` are present.

- You can script the file collection by globbing `target/wasm32-unknown-unknown/release/`.

## Deploying a collective

Requires the deployment of sekiva (factory contract). once deployed the contract address will become `<SEKIVA_CONTRACT_ADDRESS>`

```bash
cargo pbc transaction action <SEKIVA_CONTRACT_ADDRESS> deploy_organization <ORG_NAME> <ORG_DESCRIPTION> <ORG_PROFILE_IMAGE> <ORG_BANNER_IMAGE> <X_URL> <DISCORD_URL> <WEBSITE_URL> <ORG_ADMINISTRATOR> --abi <SEKIVA_ABI> --gas 10000000 --privatekey <PRIVATE_KEY_FILE>
```

## Deploying a ballot

Requires the deployment of organzization contract. once deployed the transaction will come back as

Transaction successfully sent: <https://browser.testnet.partisiablockchain.com/transactions/d8ad20e9ced6ac5a520734e7a51cbe067086205f82c48b4714d3781070c4cdd5>

you can get the contract address by looking for the deployed contract address in the UI

```bash
cargo pbc transaction action <ORG_CONTRACT_ADDRESS> deploy_ballot [ <UP_TO_5_OPTIONS_SEPARATED_BY_A_SPACE> ] <BALLOT_TITLE> <BALLOT_DESC> <ADMIN> <DURATION_IN_SECONDS> --abi <ORG_PBC> --gas 10000000 --privatekey <PRIVATE_KEY_FILE>
```

Example

```bash
cargo pbc transaction action 02a51cbe067086205f82c48b4714d3781070c4cdd5 deploy_ballot [ YES NO ] 'Does this work?' "Let's see..." '00ccb2dd9d08a91f1815c0945762597f48bc5323c6' 300 --abi target/wasm32-unknown-unknown/release/collective.pbc --gas 10000000 --privatekey 006e0dd6c0dfa4b012e0b3ac085b1105754879503a.pk
```
