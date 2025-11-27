// scripts/create-vesting-proxy-test.js
import hre from "hardhat";

async function main() {
  // Proxy հասցեն
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";

  // Vesting receiver
  const RECIPIENT = "0x928677743439e4dA4108c4025694B2F3d3b2745c";

  // Ստանալ signer
  const [signer] = await hre.ethers.getSigners();

  // Proxy Contract instance
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY, signer);

  // Ստուգել owner balance
  const ownerBalanceRaw = await hayq.balanceOf(signer.address);
  const ownerBalance = hre.ethers.formatUnits(ownerBalanceRaw, 18);
  console.log(`Owner balance: ${ownerBalance} HAYQ`);

  // Amount vesting (adjust as needed)
  const amount = hre.ethers.parseUnits("1000", 18);

  if (hre.ethers.BigNumber.from(ownerBalanceRaw).lt(amount)) {
    console.log("Owner balance too low. Minting to owner...");
    // Եթե mint ֆունկցիա կա, կանչեք այստեղ
    const mintTx = await hayq.mint(signer.address, amount);
    await mintTx.wait();
    console.log("✅ Minted HAYQ to owner");
  }

  // Ստեղծել vesting
  const start = Math.floor(Date.now() / 1000) + 60; // 1 րոպեից
  const duration = 3600; // 1 ժամ

  console.log(`Creating vesting for ${RECIPIENT}...`);
  const tx = await hayq.createTeamVesting(RECIPIENT, amount, start, duration);
  await tx.wait();
  console.log("✅ Vesting created!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
