import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const HAYQ_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
const STAKER_PRIVATE_KEY = process.env.PRIVATE_KEY;
const AMOUNT = process.env.UNSTAKE_AMOUNT || "50";

async function main() {
    const provider = hre.ethers.provider;
    const wallet = new hre.ethers.Wallet(STAKER_PRIVATE_KEY, provider);
    const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDRESS, wallet);

    console.log(`Unstaking ${AMOUNT} HAYQ...`);
    const tx = await hayq.unstake(hre.ethers.parseUnits(AMOUNT, 18));
    await tx.wait();

    const stakedAmount = await hayq.staked(wallet.address);
    const balance = await hayq.balanceOf(wallet.address);
    console.log(`Remaining staked: ${hre.ethers.formatUnits(stakedAmount, 18)} HAYQ`);
    console.log(`Balance after unstake: ${hre.ethers.formatUnits(balance, 18)} HAYQ`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
