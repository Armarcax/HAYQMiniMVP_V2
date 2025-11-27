#!/bin/bash
# ------------------------------------------------------------------
# Transfer HAYQ contract ownership to my Metamask wallet

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

if [ -z "$NEW_OWNER_ADDRESS" ]; then
  echo "❌ NEW_OWNER_ADDRESS not set in .env"
  exit 1
fi

if [ -z "$HAYQ_CONTRACT_ADDRESS" ]; then
  echo "❌ HAYQ_CONTRACT_ADDRESS not set in .env"
  exit 1
fi

echo "🚀 Sending transferOwnership tx to $NEW_OWNER_ADDRESS on contract $HAYQ_CONTRACT_ADDRESS..."

# Run Hardhat script that actually calls transferOwnership
npx hardhat run scripts/transfer-ownership-to-me.js --network sepolia
x
