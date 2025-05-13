#!/bin/bash
set -e

NET="testnet"
PK="./Account-A.pk"
GAS=10000000
WASM="target/wasm32-unknown-unknown/release/ballot.zkwa"
ABI="target/wasm32-unknown-unknown/release/ballot.abi"
ORG_ADDR="02804866c0e0e17504742424a2ed3dc24a5c680fe5"
OPTIONS='[ YES NO ]'
TITLE="Does this work?"
DESC="Let's see..."

# Deploy ballot
ADDR=$(cargo pbc transaction deploy --net="$NET" "$WASM" $OPTIONS "$TITLE" "$DESC" "$ORG_ADDR" --abi="$ABI" --pk "$PK" --gas="$GAS" --address)
echo "Ballot deployed at: $ADDR"
echo "View it in browser: https://browser.testnet.partisiablockchain.com/contracts/$ADDR"
