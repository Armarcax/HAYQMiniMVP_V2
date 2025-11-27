import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
  const VESTING_ADDR = "0x742FDc94fD2B690415eD33E4f23222E85e775b35";

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);

  // Վստահվելու vestingVault address set է
  const currentVault = await hayq.vestingVault();
  if (currentVault.toLowerCase() !== VESTING_ADDR.toLowerCase()) {
    const txVault = await hayq.setVestingVault(VESTING_ADDR);
    await txVault.wait();
    console.log("✅ VestingVault linked!");
  } else {
    console.log("VestingVault already set.");
  }

  const beneficiary = "0x928677743439e4dA4108c4025694B2F3d3b2745c";
  const amount = hre.ethers.parseUnits("1000", 18);
  const start = Math.floor(Date.now()/1000) + 60; // 1 րոպե հետո
  const duration = 3600; // 1 ժամ

  const tx = await hayq.createTeamVesting(beneficiary, amount, start, duration);
  await tx.wait();
  console.log("✅ Vesting created successfully!");
}

main();
