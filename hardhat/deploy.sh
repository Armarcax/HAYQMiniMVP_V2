#!/bin/bash
# deploy.sh - Local Hardhat deployment for HAYQ + MiniMVP

NETWORK=${1:-localhost}  # default: localhost
echo "🌐 Deploying locally on $NETWORK ..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf artifacts cache

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile contracts
echo "🧩 Compiling contracts..."
npx hardhat compile

# Deploy contracts
echo "🚀 Deploying contracts..."

npx hardhat run --network $NETWORK <<'EOF'
const hre = require("hardhat");


EOF

echo "🎯 All done. Contracts deployed locally."
