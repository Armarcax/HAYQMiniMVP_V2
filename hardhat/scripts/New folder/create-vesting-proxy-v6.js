import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
  const RECIPIENT = "0x928677743439e4dA4108c4025694B2F3d3b2745c";

  const [signer] = await hre.ethers.getSigners();

  // Contract ստանում ենք առանց signer
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);

  // Contract–ը կապում ենք signer–ի հետ
  const hayqWithSigner = hayq.connect(signer);

  const ownerBalanceRaw = await hayqWithSigner.balanceOf(signer.address);
  const ownerBalance = Number(hre.ethers.formatUnits(ownerBalanceRaw, 18));
  console.log(`Owner balance: ${ownerBalance} HAYQ`);

  const amount = hre.ethers.parseUnits("1000", 18);

  if (hre.ethers.BigNumber.from(ownerBalanceRaw).lt(amount)) {
    console.log("Owner balance too low. Please mint HAYQ first.");
    process.exit(1);
  }

  const vestingVaultAddr = await hayqWithSigner.vestingVault();
  const vaultBalanceRaw = await hayqWithSigner.balanceOf(vestingVaultAddr);
  const vaultBalance = Number(hre.ethers.formatUnits(vaultBalanceRaw, 18));
  console.log(`VestingVault balance: ${vaultBalance} HAYQ`);

  if (vaultBalance < 1000) {
    console.log("Transferring 1000 HAYQ to VestingVault...");
    const tx = await hayqWithSigner.transfer(vestingVaultAddr, amount);
    await tx.wait();
    console.log("✅ Transfer to vault completed");
  }

  const start = Math.floor(Date.now() / 1000) + 60;
  const duration = 3600;

  console.log(`Creating vesting for ${RECIPIENT}...`);
  const tx2 = await hayqWithSigner.createTeamVesting(RECIPIENT, amount, start, duration);
  await tx2.wait();
  console.log("✅ Vesting created!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
