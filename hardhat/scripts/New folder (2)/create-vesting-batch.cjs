import 'dotenv/config';
import { ethers } from "hardhat";

async function main() {
    const VESTING_ADDR = process.env.VESTING_ADDR;
    const RECIPIENTS = process.env.RECIPIENTS.split(',');
    const VESTING_AMOUNT = process.env.VESTING_AMOUNT; // օրինակ 100
    const DECIMALS = parseInt(process.env.DECIMALS || '18');

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const signer = wallet.connect(provider);

    const vestingContract = await ethers.getContractAt("VestingVaultUpgradeable", VESTING_ADDR, signer);

    console.log("Owner of VestingVault:", await vestingContract.owner());

    for (const recipient of RECIPIENTS) {
        try {
            const amount = ethers.parseUnits(VESTING_AMOUNT, DECIMALS);
            console.log(`⏳ Creating vesting for ${recipient} of ${VESTING_AMOUNT} HAYQ...`);
            const tx = await vestingContract.createVesting(recipient, amount);
            await tx.wait();
            console.log(`✅ Vesting created for ${recipient}`);
        } catch (err) {
            console.log(`⚠️ Failed for ${recipient}: ${err.message}`);
        }
    }

    console.log("🎯 All vestings processed.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
