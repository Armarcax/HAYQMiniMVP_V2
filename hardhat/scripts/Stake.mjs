import dotenv from "dotenv";
dotenv.config();

import { ethers } from "hardhat";

async function main() {
  const walletAddress = process.env.WALLET_ADDRESS || process.env.PRIVATE_KEY; // Օգտագործողի address
  const hayqAddress = process.env.HAYQ_ADDRESS; // HAYQ token address
  const stakingAddress = process.env.STAKING_ADDRESS; // Staking contract address
  const stakeAmount = process.env.STAKE_AMOUNT || "10"; // Մուտքագրելու գումարը

  if (!hayqAddress || !stakingAddress) {
    console.error("❌ HAYQ_ADDRESS և STAKING_ADDRESS պետք է սահմանված լինեն .env–ում");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("💼 Wallet:", deployer.address);
  console.log("💰 HAYQ token:", hayqAddress);
  console.log("🏦 Staking contract:", stakingAddress);

  // ERC20 contract instance
  const ERC20 = await ethers.getContractAt("IERC20Upgradeable", hayqAddress);
  // Staking contract instance
  const Staking = await ethers.getContractAt("HAYQStakingUpgradeable", stakingAddress);

  // Stake–ի համար պետք է նախ թոքենը տրված լինի
  const decimals = await ERC20.decimals();
  const amountToStake = ethers.utils.parseUnits(stakeAmount.toString(), decimals);

  // Approve
  const allowance = await ERC20.allowance(deployer.address, stakingAddress);
  if (allowance.lt(amountToStake)) {
    const approveTx = await ERC20.approve(stakingAddress, amountToStake);
    await approveTx.wait();
    console.log(`✅ Approved ${stakeAmount} HAYQ for staking`);
  }

  // Stake
  const stakeTx = await Staking.stake(amountToStake);
  const receipt = await stakeTx.wait();
  console.log(`🚀 Staked ${stakeAmount} HAYQ successfully! TX hash: ${receipt.transactionHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
