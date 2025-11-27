import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const HAYQ_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
const STAKER_PRIVATE_KEY = process.env.PRIVATE_KEY;
const AMOUNT = process.env.STAKE_AMOUNT || "100";

async function main() {
    const provider = hre.ethers.provider;
    const wallet = new hre.ethers.Wallet(STAKER_PRIVATE_KEY, provider);
    const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDRESS, wallet);

    console.log(`Staking ${AMOUNT} HAYQ...`);
    const tx = await hayq.stake(hre.ethers.parseUnits(AMOUNT, 18));
    await tx.wait();
    console.log(`✅ Staked amount: ${AMOUNT} HAYQ`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
