import dotenv from "dotenv";
dotenv.config();

import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const stakingAddress = process.env.STAKING_ADDRESS;

  if (!stakingAddress) {
    console.error("❌ STAKING_ADDRESS պետք է սահմանված լինի .env–ում");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("💼 Wallet:", deployer.address);
  console.log("🏦 Staking contract:", stakingAddress);

  const Staking = await ethers.getContractAt("HAYQStakingUpgradeable", stakingAddress);

  const claimTx = await Staking.claimRewards();
  const receipt = await claimTx.wait();
  console.log(`🏆 Rewards claimed successfully! TX hash: ${receipt.transactionHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
