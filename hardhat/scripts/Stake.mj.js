import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    // Wallet & signer
    const [deployer] = await ethers.getSigners();
    console.log("💼 Wallet:", deployer.address);

    // Config from .env
    const HAYQ_ADDRESS = process.env.HAYQ_ADDRESS;
    const STAKING_ADDRESS = process.env.STAKING_ADDRESS;

    if (!HAYQ_ADDRESS || !STAKING_ADDRESS) {
        throw new Error("Please set HAYQ_ADDRESS and STAKING_ADDRESS in .env");
    }

    // Amount to stake (1,000 HAYQ assuming 18 decimals)
    const amount = ethers.utils.parseEther("1000");

    // Get contract instances
    const HAYQ = await ethers.getContractAt("IERC20Upgradeable", HAYQ_ADDRESS);
    const staking = await ethers.getContractAt("HAYQStakingUpgradeable", STAKING_ADDRESS);

    // Approve staking contract
    console.log("🚀 Approving staking contract to spend HAYQ...");
    const approveTx = await HAYQ.approve(STAKING_ADDRESS, amount);
    await approveTx.wait();
    console.log("✅ Approved!");

    // Stake
    console.log(`🚀 Staking ${amount.toString()} HAYQ...`);
    const stakeTx = await staking.stake(amount);
    await stakeTx.wait();
    console.log("✅ Staked!");

    // Check staked balance
    const stakedBalance = await staking.balanceOf(deployer.address);
    console.log("💰 Staked balance:", ethers.utils.formatEther(stakedBalance), "HAYQ");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
