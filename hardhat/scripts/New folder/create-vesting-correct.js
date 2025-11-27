// scripts/create-vesting-correct.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xc0132DB1835b9C53347ab628185165A81cCb848F";
  const MULTISIG = "0xb6455830aD60bB16A4f833D4e83cEe1bB2B9DE75";

  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG);
  const iface = new hre.ethers.Interface([
    "function createTeamVesting(address,uint256,uint64,uint64)"
  ]);

  // ՈՒՇԱԴՐՈՒԹՅՈՒՆ. Ամսաթիվը պետք է լինի ապագայում (1 րոպե հետո)
  const start = Math.floor(Date.now() / 1000) + 60;
  const duration = 3600; // 1 ժամ

  const data = iface.encodeFunctionData("createTeamVesting", [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    hre.ethers.parseUnits("1000", 18),
    start,
    duration
  ]);

  // Submit
  const tx = await multisig.submit(HAYQ_PROXY, 0, data);
  await tx.wait();
  console.log("✅ Submitted createTeamVesting");

  // Confirm
  const tx2 = await multisig.confirm(0);
  await tx2.wait();
  console.log("✅ Confirmed");

  // Execute
  await new Promise(r => setTimeout(r, 5000));
  const tx3 = await multisig.execute(0);
  await tx3.wait();
  console.log("✅ Vesting created!");
}

main();