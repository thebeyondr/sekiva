# Deploying the Factory Contract

The factory contract is the entry point for the Sekiva system. It manages organization registration and deployment.

## Prerequisites

- [Environment Setup](../getting-started/environment.md) completed
- [Account Setup](../getting-started/account-setup.md) completed
- Built contracts (see [Building Contracts](#building-contracts))

## Building Contracts

```bash
cargo pbc build --release
```

This outputs compiled artifacts to `target/wasm32-unknown-unknown/release/`:

- `<name>.pbc`
- `<name>.abi`
- `<name>.wasm`
- For ZK contracts: `<name>.zkwa`, `<name>.zkbc`, `<name>.jar`

## Deployment Methods

### Method 1: CLI Deployment

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

### Method 2: Browser Deployment

1. Visit [Partisia Browser](https://browser.testnet.partisiablockchain.com/contracts/deploy)
2. Upload `<FACTORY_ABI>` and `<FACTORY_WASM>`
3. Upload initialization files through revealed upload buttons
4. Connect funded wallet
5. Click "DEPLOY"

## Verification

Successful deployment outputs:

```text
Deployed contract successfully.
Contract deployed at: <CONTRACT_ADDRESS>
View it in browser here: https://browser.testnet.partisiablockchain.com/contracts/<CONTRACT_ADDRESS>
```

## Next Steps

- Update `sekiva-frontend` configuration with new factory address
- [Deploy an Organization](organization.md)
- [Deploy a Ballot](ballot.md)

## Notes

- Ensure all packages are built before deploying
- For ZK contracts, verify `.zkwa`, `.zkbc`, and `.jar` files are present
- You can script file collection using glob patterns in `target/wasm32-unknown-unknown/release/`
