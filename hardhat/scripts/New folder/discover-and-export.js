// scripts/discover-and-export.js
import hre from "hardhat";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const EIP1967_IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const EIP1967_ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e0e4f2a6b8b0c6f0a8f8d8e1a9e8f4a4b";

function storageToAddress(storage) {
  if (!storage || storage === "0x" || /^0x0+$/.test(storage)) return null;
  // storage is 32 bytes hex, take last 20 bytes
  const s = storage.replace(/^0x/, "");
  const addr = "0x" + s.slice(24);
  try {
    return hre.ethers.getAddress(addr);
  } catch (e) {
    return null;
  }
}

async function tryCall(contract, fn) {
  try {
    const res = await contract[fn]();
    return res;
  } catch (e) {
    return undefined;
  }
}

function parseContractsFromEnv() {
  // Accept either CONTRACT_LIST env like "HAYQ:0x...,VESTING:0x..." OR known env vars
  const list = {};
  const raw = process.env.CONTRACT_LIST || process.env.CONTRACTS;
  if (raw) {
    raw.split(",").map(x => x.trim()).forEach(pair => {
      if (!pair) return;
      const [name, addr] = pair.split(":").map(p => p && p.trim());
      if (name && addr) list[name] = addr;
    });
  }

  // common fallbacks - pick if present and not already provided
  const fallbacks = {
    HAYQ: process.env.HAYQ_ADDRESS || process.env.HAYQ_CONTRACT_ADDRESS,
    VESTING: process.env.VESTING_ADDR || process.env.VESTING_VAULT_ADDRESS || process.env.VESTING_VAULT,
    ETH_DIV: process.env.ETH_DIV_ADDR || process.env.ETH_DIVIDEND_ADDRESS,
    REWARD_TOKEN: process.env.REWARD_TOKEN_ADDRESS,
    MOCK_ROUTER: process.env.MOCK_ROUTER_ADDRESS,
    MULTISIG: process.env.MULTISIG_ADDR || process.env.MULTISIG_ADDRESS
  };

  for (const k of Object.keys(fallbacks)) {
    if (fallbacks[k] && !list[k]) list[k] = fallbacks[k];
  }

  return list;
}

async function main() {
  const network = hre.network.name;
  console.log(`\nDiscovering contracts on network: ${network}\n`);

  const provider = hre.ethers.provider;
  const signer = process.env.PRIVATE_KEY ? new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider) : null;
  if (signer) console.log("Using signer:", signer.address);
  else console.log("No PRIVATE_KEY found — owner checks will be skipped.\n");

  const found = {};
  const input = parseContractsFromEnv();

  if (Object.keys(input).length === 0) {
    console.log("No contract addresses provided via CONTRACT_LIST or known env vars.");
    console.log("Add CONTRACT_LIST=\"HAYQ:0x...,VESTING:0x...\" to .env or set HAYQ_ADDRESS, VESTING_ADDR, etc.");
    process.exit(1);
  }

  for (const [name, addr] of Object.entries(input)) {
    console.log(`---\nProcessing ${name} -> ${addr}`);
    const rec = { name, address: addr, isProxy: false, implementation: null, admin: null, owner: null, signerIsOwner: null, abiAvailable: false };
    try {
      // check EIP-1967 implementation slot
      const implRaw = await provider.getStorageAt(addr, EIP1967_IMPL_SLOT);
      const impl = storageToAddress(implRaw);
      if (impl) {
        rec.isProxy = true;
        rec.implementation = impl;
      }

      // admin slot
      const adminRaw = await provider.getStorageAt(addr, EIP1967_ADMIN_SLOT);
      const admin = storageToAddress(adminRaw);
      if (admin) rec.admin = admin;

      // try common fallback: OpenZeppelin Transparent Proxy uses same impl slot; some proxies have different patterns
      // try reading via ERC1967 "implementation()" or "getImplementation" from admin contract if possible
    } catch (e) {
      console.warn(`  (warning) reading proxy slots failed for ${addr}:`, e.message);
    }

    // If we have artifact for name, try to attach (for read calls)
    let contract = null;
    try {
      const artifact = await hre.ethers.getContractFactory(name);
      contract = artifact.attach(addr);
      rec.abiAvailable = true;
    } catch (e) {
      // artifact not found or cannot attach; try generic ERC20 ABI if name looks like token
      try {
        const erc20 = await hre.ethers.getContractFactory("MockERC20Upgradeable");
        contract = erc20.attach(addr);
        rec.abiAvailable = true;
      } catch (e2) {
        rec.abiAvailable = false;
      }
    }

    if (contract && rec.abiAvailable) {
      // Try to call some common read functions safely
      // 1) owner()
      const owner = await tryCall(contract, "owner");
      if (owner !== undefined) {
        rec.owner = owner;
        if (signer) rec.signerIsOwner = (owner.toLowerCase() === signer.address.toLowerCase());
        console.log(`  owner(): ${owner} ${rec.signerIsOwner ? "(signer IS owner)" : ""}`);
      } else {
        // maybe ownable not present; try admin() or getOwner
        const adminCall = await tryCall(contract, "admin");
        if (adminCall !== undefined) {
          rec.owner = adminCall;
          if (signer) rec.signerIsOwner = (adminCall.toLowerCase() === signer.address.toLowerCase());
          console.log(`  admin(): ${adminCall}`);
        } else {
          console.log("  owner/admin not available (contract might not expose owner())");
        }
      }

      // 2) if ERC20, try name(), symbol(), totalSupply()
      const nameCall = await tryCall(contract, "name");
      if (nameCall !== undefined) rec.tokenName = nameCall;
      const symbolCall = await tryCall(contract, "symbol");
      if (symbolCall !== undefined) rec.tokenSymbol = symbolCall;
      const totalSupply = await tryCall(contract, "totalSupply");
      if (totalSupply !== undefined) rec.totalSupply = totalSupply.toString();

      if (rec.tokenName) console.log(`  token: ${rec.tokenName} (${rec.tokenSymbol || "?"}) totalSupply: ${rec.totalSupply || "?"}`);
    } else {
      console.log("  No ABI available — skipping owner/name calls.");
    }

    found[name] = rec;
  }

  // Save to file
  const outPath = `./discovered-${network}.json`;
  fs.writeFileSync(outPath, JSON.stringify(found, null, 2));
  console.log(`\n✅ Discovery results saved: ${outPath}`);

  // Print .env-style lines
  console.log("\n--- COPY these into your .env ---");
  for (const [k, v] of Object.entries(found)) {
    console.log(`${k.toUpperCase()}=${v.address}`);
    // Also print impl/admin if present
    if (v.implementation) console.log(`${k.toUpperCase()}_IMPLEMENTATION=${v.implementation}`);
    if (v.admin) console.log(`${k.toUpperCase()}_ADMIN=${v.admin}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exitCode = 1;
});
