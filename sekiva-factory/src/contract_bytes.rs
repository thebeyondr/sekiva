pub const ORGANIZATION_WASM: [u8; 82378] =
    *include_bytes!("../../target/wasm32-unknown-unknown/release/organization.wasm");
pub const ORGANIZATION_ABI: [u8; 512] =
    *include_bytes!("../../target/wasm32-unknown-unknown/release/organization.abi");

pub const BALLOT_WASM: &[u8; 91859] =
    include_bytes!("../../target/wasm32-unknown-unknown/release/ballot.wasm");
pub const BALLOT_ABI: &[u8; 641] =
    include_bytes!("../../target/wasm32-unknown-unknown/release/ballot.abi");
