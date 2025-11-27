// scripts/confirm-and-execute.js
import hre from "hardhat";

async function main() {
  const MULTISIG = "0xb6455830aD60bB16A4f833D4e83cEe1bB2B9DE75";
  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG);

  await multisig.confirm(0); // txId = 0
  console.log("✅ Confirmed");

  await multisig.execute(0);
  console.log("✅ Executed: VestingVault is now set!");
}

main();