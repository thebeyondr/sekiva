# Environment Setup

This guide assumes you have basic knowledge of Rust and blockchain development. For detailed Partisia Blockchain setup instructions, see the [official Partisia docs](https://partisia-blockchain.gitbook.io/docs/developers/getting-started/setting-up-your-environment).

## Prerequisites

- Rust toolchain (latest stable)
- Partisia Blockchain development environment
- Node.js 18+ and Bun package manager

## Quick Setup

1. Install Rust:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. Install Partisia CLI:

   ```bash
   cargo install cargo-partisia-contract
   ```

3. Install Node.js and Bun:

   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   ```

## Verification

Verify your setup:

```bash
# Check Rust
rustc --version
cargo --version

# Check Partisia CLI
cargo pbc --version

# Check Node.js and Bun
node --version
bun --version
```

## Next Steps

- [Account Setup](account-setup.md) - Create and fund your Partisia account
- [Quick Start](quick-start.md) - Get started with Sekiva development
