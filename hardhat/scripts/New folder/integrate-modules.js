// scripts/integrate-modules.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a";
  
  // Փոխարինեք ձեր իրական հասցեներով
  const VESTING_ADDR = "0x43867856F8f684a0d04a32e73Af446809C5fb28B"; 
  const MULTISIG_ADDR = "0x574Fe725E79F2E26353917d63904FF3Ed2F534c3";

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);

  console.log("Setting VestingVault...");
  await hayq.setVestingVault(VESTING_ADDR);
  console.log("✅ VestingVault set");

  console.log("Transferring ownership to Multisig...");
  await hayq.transferOwnership(MULTISIG_ADDR);
  console.log("✅ Ownership transferred");
}

main();