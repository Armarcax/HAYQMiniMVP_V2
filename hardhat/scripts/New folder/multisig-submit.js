// scripts/multisig-submit.js
import hre from "hardhat";

async function main() {
  const MULTISIG_ADDR = "0x...";
  const HAYQ_PROXY = "0xD116...";

  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG_ADDR);
  const data = hre.ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [deployer.address, hre.ethers.parseUnits("1000", 18)]);
  const target = HAYQ_PROXY;

  await multisig.submit(target, 0, data);
  console.log("✅ Transaction submitted to Multisig");
}

main();