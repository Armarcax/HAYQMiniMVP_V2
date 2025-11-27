// scripts/compareBytecode.mjs
import hre from "hardhat";
import fs from "fs";

const PROBE_IMPL = process.env.KNOWN_IMPL || "0xd60CE25b670Dc7CA810497A0Ff7f2C0140aBD5c9"; // կամ քո impl հասցեն
const CONTRACT_FQN = process.env.CONTRACT_FQN || "flat/VestingVaultUpgradeable_flat.sol:VestingVaultUpgradeable";

async function main() {
  if (!PROBE_IMPL) {
    console.error("Set KNOWN_IMPL env var to implementation address");
    process.exit(1);
  }
  console.log("Implementation on chain:", PROBE_IMPL);

  // on-chain bytecode
  const provider = hre.ethers.provider;
  const onChain = await provider.getCode(PROBE_IMPL);
  console.log("On-chain code length:", onChain.length);

  // compile local and get deployedBytecode from artifact
  await hre.run("compile");
  // artifact path resolution via FQN
  const [sourcePath, contractName] = CONTRACT_FQN.split(":");
  let artifact;
  try {
    artifact = await hre.artifacts.readArtifact(contractName);
  } catch (e) {
    console.error("Cannot read artifact by contract name:", contractName, "— ensure compilation produced it or provide correct CONTRACT_FQN");
    process.exit(1);
  }
  const compiled = artifact.deployedBytecode || artifact.bytecode;
  console.log("Compiled bytecode length:", compiled.length);

  // quick compare
  if (onChain === compiled) {
    console.log("✅ Exact match!");
    return;
  }
  console.log("❌ Not exact match. Show first/last differing segments:");

  // show head/tail diffs (hex strings)
  const headLen = 200;
  console.log("onChain head:", onChain.slice(0, headLen));
  console.log("compiled head:", compiled.slice(0, headLen));
  console.log("onChain tail:", onChain.slice(-headLen));
  console.log("compiled tail:", compiled.slice(-headLen));

  // try to detect metadata hash difference (last 43-65 bytes usually)
  console.log("\n— Checking for embedded metadata mismatch (common)...");

  function tailSnippet(hex) {
    // return last ~100 chars
    return hex.slice(-400);
  }
  console.log("onChain tail snippet:", tailSnippet(onChain));
  console.log("compiled tail snippet:", tailSnippet(compiled));

  // Write both to files for manual diff
  fs.writeFileSync("onchain_code.bin", onChain);
  fs.writeFileSync("compiled_code.bin", compiled);
  console.log("\nWrote onchain_code.bin and compiled_code.bin — run a binary diff or open in editor.");
}

main().catch((e) => { console.error(e); process.exit(1); });
