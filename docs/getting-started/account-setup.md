# Account Setup

This guide covers creating and funding a Partisia Blockchain account for development and deployment.

## Creating an Account

1. Generate a new account:

   ```bash
   cargo pbc account create
   ```

   This creates a file named `[public-address].pk`

2. (Optional) Rename for convenience:

   ```bash
   mv [public-address].pk Account-A.pk
   ```

## Account Structure

- `Account-A.pk` - Private key file
- Public address format: `[40-char hex]`
- Example: `00ccb2dd9d08a91f1815c0945762597f48bc5323c6`

## Funding Your Account

### Testnet

1. Visit [Partisia Testnet Faucet](https://browser.testnet.partisiablockchain.com/faucet)
2. Enter your public address
3. Request test tokens

### Mainnet

1. Purchase PBC tokens from supported exchanges
2. Transfer to your public address

## Account Management

### View Balance

```bash
cargo pbc account balance <PUBLIC_ADDRESS>
```

### List Accounts

```bash
cargo pbc account list
```

## Security Notes

- Keep private key files secure
- Never commit `.pk` files to version control
- Use different accounts for development and production
- Backup private keys securely

## Next Steps

- [Quick Start](quick-start.md) - Begin development
- [Deploy Factory](../deployment/factory.md) - Deploy your first contract
