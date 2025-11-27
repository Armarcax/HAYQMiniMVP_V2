// scripts/approve-and-vesting-final.cjs
require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
    const HAYQ_CONTRACT_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
    const VESTING_ADDR = process.env.VESTING_ADDR;
    const VESTING_AMOUNT = process.env.VESTING_AMOUNT;
    const DECIMALS = Number(process.env.DECIMALS);
    const RECIPIENTS = process.env.RECIPIENTS.split(',');
    const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`💼 Wallet: ${wallet.address}`);

    const HAYQ_ABI = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function transfer(address to, uint256 amount) external returns (bool)"
    ];
    const VESTING_ABI = [
        "function createVesting(address beneficiary, uint256 amount, uint64 start, uint64 duration) external"
    ];

    const HAYQ = new ethers.Contract(HAYQ_CONTRACT_ADDRESS, HAYQ_ABI, wallet);
    const VestingVault = new ethers.Contract(VESTING_ADDR, VESTING_ABI, wallet);

    const amount = ethers.parseUnits(VESTING_AMOUNT, DECIMALS);
    const totalAmount = amount * BigInt(RECIPIENTS.length);

    console.log(`💰 Approving ${ethers.formatUnits(totalAmount, DECIMALS)} HAYQ to VestingVault...`);
    const approveTx = await HAYQ.approve(VESTING_ADDR, totalAmount);
    await approveTx.wait();
    console.log(`✅ Approved ${ethers.formatUnits(totalAmount, DECIMALS)} HAYQ`);

    for (const recipient of RECIPIENTS) {
        try {
            console.log(`⏳ Creating vesting for ${recipient} of ${VESTING_AMOUNT} HAYQ...`);
            const tx = await VestingVault.createVesting(
                recipient,
                amount,
                BigInt(process.env.VESTING_START),
                BigInt(process.env.VESTING_DURATION)
            );
            await tx.wait();
            console.log(`✅ Vesting created for ${recipient}`);
        } catch (err) {
            console.error(`⚠️ Failed for ${recipient}:`, err.reason || err.message);
        }
    }

    console.log("🎯 All vestings processed.");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
