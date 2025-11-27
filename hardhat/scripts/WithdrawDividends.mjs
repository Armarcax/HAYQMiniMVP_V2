import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`💼 Wallet: ${deployer.address}`);

  const dividendTrackerAddress =
    process.env.DIVIDEND_TRACKER_ADDRESS ||
    "0x2837077b63f8C2681b1eb0D5a776E638BA028e58";

  const rewardTokenAddress =
    process.env.REWARD_TOKEN_ADDRESS ||
    "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";

  const DividendTracker = await ethers.getContractAt(
    "Erc20DividendTrackerUpgradeable",
    dividendTrackerAddress
  );

  const RewardToken = await ethers.getContractAt(
    "IERC20Upgradeable",
    rewardTokenAddress
  );

  console.log(`🏦 Dividend Tracker contract: ${dividendTrackerAddress}`);
  console.log(`💰 Reward Token contract: ${rewardTokenAddress}`);

  // 1️⃣ Ստուգել withdrawable
  let withdrawable = await DividendTracker.withdrawableDividendOf(deployer.address);
  console.log(`💰 Withdrawable dividends: ${ethers.formatUnits(withdrawable, 18)} tokens`);

  // 2️⃣ Եթե ոչինչ չկա, ապա նոր distribution
  if (withdrawable === 0n) {
    const distributeAmount = ethers.parseUnits("1.0", 18); // 1 HAYQ
    console.log(`🚀 Distributing ${ethers.formatUnits(distributeAmount, 18)} tokens...`);

    const txApprove = await RewardToken.connect(deployer).approve(dividendTrackerAddress, distributeAmount);
    await txApprove.wait();
    console.log(`✅ Approved ${ethers.formatUnits(distributeAmount, 18)} tokens for Dividend Tracker.`);

    const txDistribute = await DividendTracker.connect(deployer).distributeDividends(distributeAmount);
    await txDistribute.wait();
    console.log(`✅ Dividends distributed!`);
    
    // վերահաշվել withdrawable
    withdrawable = await DividendTracker.withdrawableDividendOf(deployer.address);
  }

  // 3️⃣ Եթե withdrawable կա, դուրս ենք բերում
  if (withdrawable > 0n) {
    console.log(`⏳ Withdrawing ${ethers.formatUnits(withdrawable, 18)} tokens...`);
    const txWithdraw = await DividendTracker.connect(deployer).withdrawDividend();
    await txWithdraw.wait();
    console.log(`✅ Withdrawal complete!`);
  } else {
    console.log("🚫 No dividends available for withdrawal right now.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
