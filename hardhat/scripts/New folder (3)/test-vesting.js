// scripts/test-vesting.js
import hre from "hardhat";

async function main() {
  const NEW_HAYQ_PROXY = "0xc0132DB1835b9C53347ab628185165A81cCb848F";
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", NEW_HAYQ_PROXY);

  await hayq.createTeamVesting(
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    hre.ethers.parseUnits("1000", 18),
    Math.floor(Date.now() / 1000) + 60,
    3600
  );
  console.log("✅ Vesting created!");
}

main();