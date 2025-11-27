#!/usr/bin/env bash
# Run the Hardhat check-all-proxies script on Sepolia
set -e

# Պետք է լինել project root (/hardhat)
cd "$(dirname "$0")/.." || exit 1

echo "Running check-all-proxies.cjs on network: sepolia"
npx hardhat run scripts/check-all-proxies.cjs --network sepolia
