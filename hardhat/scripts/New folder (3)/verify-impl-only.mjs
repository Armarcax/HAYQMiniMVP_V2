// scripts/verify-impl-only.mjs
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const PROXY_ADDRESS = process.env.PROXY_ADDRESS || "0x45615F3D52262ba7F16d7E0182893492F1752baB";
const KNOWN_IMPL = process.env.KNOWN_IMPL || "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d";
const CONTRACT_FQN = process.env.CONTRACT_FQN || "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP";
const CONSTRUCTOR_ARGS = process.env.CONSTRUCTOR_ARGS ? JSON.parse(process.env.CONSTRUCTOR_ARGS) : [];

async function detectImplementation(proxyAddr) {
  const provider = hre.ethers.provider;
  const ERC1967_SLOT = "0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC";

  try {
    const storage = await provider.getStorageAt(proxyAddr, ERC1967_SLOT);
    const impl = "0x" + storage.slice(-40);
    if (impl && impl !== "0x0000000000000000000000000000000000000000") {
      return { impl, slot: ERC1967_SLOT, type: "erc1967" };
    }
  } catch {}

  return { impl: null };
}

async function verifyImplementation(implAddress) {
  console.log("Running hardhat verify for implementation:", implAddress);
  try {
    await hre.run("verify:verify", {
      address: implAddress,
      constructorArguments: CONSTRUCTOR_ARGS,
      contract: CONTRACT_FQN,
    });
    console.log("✅ Implementation verified successfully:", implAddress);
  } catch (err) {
    const msg = err?.message || String(err);
    if (msg.includes("Already Verified")) {
      console.log("ℹ️ Implementation already verified:", implAddress);
    } else {
      console.error("❌ Verification error:", msg);
      throw err;
    }
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
    process.exit(1);
  }

  console.log(`Detected implementation: ${detection.impl} (slot: ${detection.slot})`);
  const code = await hre.ethers.provider.getCode(detection.impl);
  if (!code || code === "0x") {
    console.error("❌ Detected implementation has no bytecode on chain:", detection.impl);
    process.exit(1);
  }

  await verifyImplementation(detection.impl);
}

main().catch((err) => {
  console.error("Script failed:", err?.message || err);
  process.exit(1);
});
