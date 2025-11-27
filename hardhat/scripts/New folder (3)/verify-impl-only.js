// scripts/verify-impl-only.js
// CommonJS (use with `npx hardhat run scripts/verify-impl-only.js --network sepolia`)
const hre = require("hardhat");
require("dotenv").config();

const PROXY_ADDRESS = process.env.PROXY_ADDRESS || "0x45615F3D52262ba7F16d7E0182893492F1752baB";
// Optionally, override a known implementation address (useful for testing)
const KNOWN_IMPL = process.env.KNOWN_IMPL || "";
// If you flattened your contract, set CONTRACT_FLATTENED_PATH like "flat/MyFlat.sol:MyContract"
const CONTRACT_FQN = process.env.CONTRACT_FQN || "contracts/VestingVaultUpgradeable.sol:VestingVaultUpgradeable";
// If you compiled and want to pass constructor args for impl (most upgradeable impls use none)
const CONSTRUCTOR_ARGS = process.env.CONSTRUCTOR_ARGS ? JSON.parse(process.env.CONSTRUCTOR_ARGS) : [];

async function detectImplementation(proxyAddr) {
  const provider = hre.ethers.provider;

  // ERC1967 implementation slot (standard)
  const ERC1967_SLOT = "0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC";

  // Beacon pattern slot
  const BEACON_SLOT = "0xa3f0ad74e5423aebfd80e5a1dce2b7b9b6f1b2c5d5b8a1a5f6e1f0d5c1e9e7a";

  // Try ERC1967
  try {
    const storage = await provider.getStorageAt(proxyAddr, ERC1967_SLOT);
    const impl = "0x" + storage.slice(-40);
    if (impl && impl !== "0x0000000000000000000000000000000000000000") {
      return { impl, slot: ERC1967_SLOT, type: "erc1967" };
    }
  } catch (e) {
    // ignore and fallback
  }

  // Try beacon slot (common for beacon proxies)
  try {
    const storage2 = await provider.getStorageAt(proxyAddr, BEACON_SLOT);
    const beacon = "0x" + storage2.slice(-40);
    if (beacon && beacon !== "0x0000000000000000000000000000000000000000") {
      // We could try to read implementation from beacon contract (beacon -> implementation())
      try {
        const beaconContract = new hre.ethers.Contract(beacon, ["function implementation() view returns (address)"], provider);
        const implFromBeacon = await beaconContract.implementation();
        if (implFromBeacon && implFromBeacon !== hre.ethers.constants.AddressZero) {
          return { impl: implFromBeacon, slot: BEACON_SLOT, type: "beacon", beacon };
        }
      } catch (e) {
        return { impl: beacon, slot: BEACON_SLOT, type: "beacon-address" };
      }
    }
  } catch (e) {
    // ignore
  }

  // Last resort: try reading common OZ Transparent proxy admin slot as raw (not recommended but fallback)
  // Try to read implementation by enumerating last storage slots (less reliable)
  return { impl: null };
}

async function verifyImplementation(implAddress) {
  console.log("Running hardhat verify for implementation:", implAddress);
  try {
    await hre.run("verify:verify", {
      address: implAddress,
      constructorArguments: CONSTRUCTOR_ARGS,
      contract: CONTRACT_FQN, // use your flattened FQN or sourceFile:ContractName
    });
    console.log("✅ Implementation verified successfully:", implAddress);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    if (msg.includes("Already Verified") || msg.includes("Contract source code already verified")) {
      console.log("ℹ️ Implementation already verified on Etherscan:", implAddress);
    } else if (msg.includes("Unable to verify")) {
      console.error("❌ Verification failed — check flatten/solc/optimizer settings and contract FQN.");
      console.error(msg);
    } else {
      console.error("❌ Verification error:", msg);
    }
    throw err;
  }
}

async function main() {
  console.log("Proxy address:", PROXY_ADDRESS);
  if (KNOWN_IMPL) {
    console.log("KNOWN_IMPL provided, skipping detection. Using:", KNOWN_IMPL);
    await verifyImplementation(KNOWN_IMPL);
    return;
  }

  const detection = await detectImplementation(PROXY_ADDRESS);
  if (!detection.impl) {
    console.error("❌ Could not detect implementation address via standard slots.");
    console.error("  - Make sure the proxy is an ERC1967/Transparent/UUPS proxy.");
    console.error("  - If it's a custom proxy, set KNOWN_IMPL env var to implementation address.");
    process.exit(1);
  }

  console.log(`Detected implementation: ${detection.impl} (slot: ${detection.slot}, type: ${detection.type})`);
  // optional: double-check on-chain code is non-empty
  const code = await hre.ethers.provider.getCode(detection.impl);
  if (!code || code === "0x") {
    console.error("❌ Detected implementation has no bytecode on chain:", detection.impl);
    process.exit(1);
  }

  // Verify only implementation (do not try to verify proxy)
  await verifyImplementation(detection.impl);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Script failed:", err && err.message ? err.message : err);
    process.exit(1);
  });
