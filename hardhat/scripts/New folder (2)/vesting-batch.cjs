// scripts/vesting-batch.cjs
require("dotenv").config();
const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const {
        VESTING_VAULT,
        VESTING_BENEFICIARY,
        VESTING_AMOUNT,
        VESTING_START,
        VESTING_DURATION
    } = process.env;

    if (!VESTING_VAULT) throw new Error("VESTING_VAULT is not defined in .env");
    if (!VESTING_AMOUNT) throw new Error("VESTING_AMOUNT is not defined in .env");

    // VestingVaultUpgradeable contract ABI-ով կապը
    const VestingVault = await ethers.getContractFactory("VestingVaultUpgradeable");
    const vesting = await VestingVault.attach(VESTING_VAULT);

    console.log(`📦 Connected to VestingVaultUpgradeable at: ${VESTING_VAULT}`);

    // Ստացողների և չափերի զանգվածը
    const recipients = process.env.RECIPIENTS.split(",");
    const amount = ethers.utils.parseUnits(VESTING_AMOUNT, process.env.DECIMALS || 18);

    console.log("🚀 Sending vesting allocations...");

    for (let recipient of recipients) {
        recipient = recipient.trim();
        if (!ethers.utils.isAddress(recipient)) {
            console.warn(`⚠️ Invalid address skipped: ${recipient}`);
            continue;
        }

        console.log(`➡️ Allocating ${VESTING_AMOUNT} tokens to ${recipient}`);
        const tx = await vesting.createVesting(
            recipient,
            amount,
            Number(VESTING_START),
            Number(VESTING_DURATION)
        );
        await tx.wait();
        console.log(`✅ Vesting created for ${recipient}`);
    }

    console.log("🎉 All allocations done!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
