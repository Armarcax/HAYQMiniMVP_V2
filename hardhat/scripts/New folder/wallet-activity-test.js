// scripts/wallet-activity-test.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = hre.ethers.provider;
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("🔎 Testing wallet activity for:", wallet.address);

  // --- Contracts ---
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", process.env.HAYQ_CONTRACT_ADDRESS, wallet);
  const staking = hayq; // assuming staking functions are in HAYQMiniMVP
  const ethDiv = await hre.ethers.getContractAt("EthDividendTrackerUpgradeable", process.env.ETH_DIV_ADDR, wallet);
  const vestingVault = await hre.ethers.getContractAt("VestingVaultUpgradeable", process.env.VESTING_ADDR, wallet);

  // --- Inspect initial state ---
  const balance = Number(hre.ethers.formatUnits(await hayq.balanceOf(wallet.address), 18));
  const staked = Number(hre.ethers.formatUnits(await hayq.stakedBalanceOf(wallet.address), 18));
  const allowance = Number(hre.ethers.formatUnits(await hayq.allowance(wallet.address, process.env.MOCK_ROUTER_ADDRESS), 18));
  const div = Number(hre.ethers.formatUnits(await ethDiv.withdrawableDividendOf(wallet.address), 18));
  const vesting = await vestingVault.vestings(wallet.address);
  const vestTotal = Number(hre.ethers.formatUnits(vesting.totalAmount, 18));
  const vestReleased = Number(hre.ethers.formatUnits(vesting.released, 18));

  console.log("\n--- Initial Wallet State ---");
  console.log("HAYQ balance:", balance);
  console.log("Staked amount:", staked);
  console.log("Allowance to MockRouter:", allowance);
  console.log("ETH Dividends withdrawable:", div);
  console.log("Vesting total:", vestTotal, ", released:", vestReleased);

  // --- Try to withdraw dividend (should be 0 or fail) ---
  try {
    const tx = await ethDiv.withdrawDividend();
    await tx.wait();
    console.log("\n💸 Dividend withdraw attempted");
  } catch (err) {
    console.log("\n❌ Dividend withdraw failed (expected if none available)");
  }

  // --- Try unstake 10 HAYQ ---
  if (staked > 0) {
    try {
      const tx = await staking.unstake(hre.ethers.parseUnits("10", 18));
      await tx.wait();
      console.log("🔄 Unstaked 10 HAYQ");
    } catch (err) {
      console.log("❌ Unstake failed:", err.reason || err.message);
    }
  }

  // --- Try staking 10 HAYQ ---
  try {
    const tx = await staking.stake(hre.ethers.parseUnits("10", 18));
    await tx.wait();
    console.log("🔄 Staked 10 HAYQ");
  } catch (err) {
    console.log("❌ Stake failed:", err.reason || err.message);
  }

  // --- Try releasing vesting (if any) ---
  try {
    const tx = await vestingVault.release();
    await tx.wait();
    console.log("🎁 Vesting release attempted");
  } catch (err) {
    console.log("❌ Vesting release failed (expected if nothing vested)");
  }

  // --- Inspect final state ---
  const balance2 = Number(hre.ethers.formatUnits(await hayq.balanceOf(wallet.address), 18));
  const staked2 = Number(hre.ethers.formatUnits(await hayq.stakedBalanceOf(wallet.address), 18));
  const div2 = Number(hre.ethers.formatUnits(await ethDiv.withdrawableDividendOf(wallet.address), 18));
  const vest2 = await vestingVault.vestings(wallet.address);
  const vestTotal2 = Number(hre.ethers.formatUnits(vest2.totalAmount, 18));
  const vestReleased2 = Number(hre.ethers.formatUnits(vest2.released, 18));

  console.log("\n--- Final Wallet State ---");
  console.log("HAYQ balance:", balance2);
  console.log("Staked amount:", staked2);
  console.log("ETH Dividends withdrawable:", div2);
  console.log("Vesting total:", vestTotal2, ", released:", vestReleased2);

  console.log("\n✅ Wallet activity test complete");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
