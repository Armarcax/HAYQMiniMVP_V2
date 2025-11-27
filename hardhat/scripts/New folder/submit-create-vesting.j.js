// scripts/submit-create-vesting.js
import hre from "hardhat";

async function main() {
  const NEW_HAYQ_PROXY = "0xc0132DB1835b9C53347ab628185165A81cCb848F";
  const MULTISIG = "0xb6455830aD60bB16A4f833D4e83cEe1bB2B9DE75";

  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG);
  const iface = new hre.ethers.Interface([
    "function createTeamVesting(address,uint256,uint64,uint64)"
  ]);
  const data = iface.encodeFunctionData("createTeamVesting", [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    hre.ethers.parseUnits("1000", 18),
    Math.floor(Date.now() / 1000) + 60,
    3600
  ]);

  // Submit
  await multisig.submit(NEW_HAYQ_PROXY, 0, data);
  console.log("✅ Submitted createTeamVesting");

  // Confirm (txId = 1, քանի որ արդեն ունեք 1 գործողություն)
  await multisig.confirm(1);
  console.log("✅ Confirmed");

  // Execute
  await new Promise(r => setTimeout(r, 5000));
  await multisig.execute(1);
  console.log("✅ Vesting created via Multisig!");
}

main();