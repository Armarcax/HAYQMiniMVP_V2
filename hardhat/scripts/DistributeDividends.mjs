import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`💼 Wallet: ${deployer.address}`);

  const dividendTrackerAddress =
    process.env.DIVIDEND_TRACKER_ADDRESS ||
    "0x2837077b63f8C2681b1eb0D5a776E638BA028e58"; // Այստեղ ձեր Dividend Tracker-ի հասցեն

  const rewardTokenAddress =
    process.env.REWARD_TOKEN_ADDRESS ||
    "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83"; // Reward token-ի հասցեն

  const amountToDistribute = process.env.DIVIDEND_AMOUNT || "1000000000000000000"; // Ուղարկվող չափը (wei-ով)

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
  console.log(`🚀 Distributing ${ethers.formatUnits(amountToDistribute, 18)} tokens...`);

  // Առաջին հերթին պետք է approve անենք
  const approveTx = await RewardToken.connect(deployer).approve(dividendTrackerAddress, amountToDistribute);
  await approveTx.wait();
  console.log(`✅ Approved ${ethers.formatUnits(amountToDistribute, 18)} tokens for Dividend Tracker.`);

  // Վճարը բաժանում
  const tx = await DividendTracker.connect(deployer).distributeDividends(amountToDistribute);
  await tx.wait();
  console.log(`✅ Dividends distributed! TX hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
