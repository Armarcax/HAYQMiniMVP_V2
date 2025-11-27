import dotenv from "dotenv";
dotenv.config();

import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const hayqAddress = process.env.HAYQ_ADDRESS;
  const stakingAddress = process.env.STAKING_ADDRESS;
  const unstakeAmount = process.env.UNSTAKE_AMOUNT || "10";

  if (!hayqAddress || !stakingAddress) {
    console.error("❌ HAYQ_ADDRESS և STAKING_ADDRESS պետք է սահմանված լինեն .env–ում");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("💼 Wallet:", deployer.address);
  console.log("🏦 Staking contract:", stakingAddress);

  const Staking = await ethers.getContractAt("HAYQStakingUpgradeable", stakingAddress);

  const ERC20 = await ethers.getContractAt("IERC20Upgradeable", hayqAddress);
  const decimals = await ERC20.decimals();
  const amountToUnstake = ethers.utils.parseUnits(unstakeAmount.toString(), decimals);

  const unstakeTx = await Staking.unstake(amountToUnstake);
  const receipt = await unstakeTx.wait();
  console.log(`🚀 Unstaked ${unstakeAmount} HAYQ successfully! TX hash: ${receipt.transactionHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
