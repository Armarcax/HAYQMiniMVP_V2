// scripts/submit-vesting-setup.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a";
  const MULTISIG = "0xb6455830aD60bB16A4f833D4e83cEe1bB2B9DE75";
  const VESTING_ADDR = "0xd17d1423DFd6c49932fFB8B5ebb61035BdCC48c6"; // Ձեր VestingVault հասցեն

  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG);
  
  const iface = new hre.ethers.Interface(["function setVestingVault(address)"]);
  const data = iface.encodeFunctionData("setVestingVault", [VESTING_ADDR]);

  await multisig.submit(HAYQ_PROXY, 0, data);
  console.log("✅ setVestingVault submitted to Multisig");
}

main();