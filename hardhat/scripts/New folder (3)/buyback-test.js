import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const HAYQ_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
const STAKER_PRIVATE_KEY = process.env.PRIVATE_KEY;

const TOKEN_AMOUNT = "100";
const MIN_OUT = "0"; // Թեստում չենք հաշվում swap–ի իրական արժեքը

async function main() {
    const provider = hre.ethers.provider;
    const wallet = new hre.ethers.Wallet(STAKER_PRIVATE_KEY, provider);
    const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDRESS, wallet);

    const contractBalance = await hayq.balanceOf(hayq.address);
    console.log(`Contract HAYQ balance before transfer: ${hre.ethers.formatUnits(contractBalance, 18)}`);

    console.log(`Transferring ${TOKEN_AMOUNT} HAYQ to contract for buyback...`);
    const txTransfer = await hayq.transfer(hayq.address, hre.ethers.parseUnits(TOKEN_AMOUNT, 18));
    await txTransfer.wait();
    console.log("✅ Transfer completed");

    console.log(`Executing buyback: swapping 10 HAYQ for WETH...`);
    const txBuyback = await hayq.buyback(hre.ethers.parseUnits("10", 18), MIN_OUT);
    await txBuyback.wait();
    console.log("✅ Buyback completed!");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
