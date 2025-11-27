// scripts/create-team-vestings-force.cjs
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("💼 Using wallet:", deployer.address);

    const HAYQProxy = process.env.HAYQ_PROXY;
    const vaultAddress = process.env.VESTING_VAULT;

    if (!HAYQProxy || !vaultAddress) {
        throw new Error("Set HAYQ_PROXY and VESTING_VAULT in .env");
    }

    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQProxy);
    const Vault = await ethers.getContractAt("VestingVaultUpgradeable", vaultAddress);

    const currentVault = await HAYQ.vestingVault();
    if (currentVault.toLowerCase() !== vaultAddress.toLowerCase()) {
        console.log("⚠️ Setting vesting vault...");
        await (await HAYQ.setVestingVault(vaultAddress)).wait();
    }

    const vestings = [
        { beneficiary: "0x928677743439e4dA4108c4025694B2F3d3b2745c", amount: 100 },
        { beneficiary: "0xBF3cfF21BD17854334112d28853fe716Eb423536", amount: 100 },
    ];

    const now = Math.floor(Date.now() / 1000);
    const DURATION_30D = 30 * 24 * 3600;

    for (const v of vestings) {
        try {
            const existing = await Vault.vestings(v.beneficiary);
            if (existing.totalAmount > 0) {
                console.log(`🔁 Resetting vesting for ${v.beneficiary}...`);
                // ⚠️ ԱՅՍ ՖՈՒՆԿՑԻԱՆ ՊԵՏՔ Է ԱՎԵԼԱՑՆԵԼ ԿՈՆՏՐԱԿՏՈՒՄ
                const resetTx = await Vault.resetVesting(v.beneficiary);
                await resetTx.wait();
                console.log(`🗑️ Vesting reset for ${v.beneficiary}`);
            }

            console.log(`⏳ Creating new vesting for ${v.beneficiary}...`);
            const tx = await HAYQ.createTeamVesting(v.beneficiary, v.amount, now, DURATION_30D);
            await tx.wait();
            console.log(`✅ New vesting created for ${v.beneficiary}`);
        } catch (err) {
            console.log(`⚠️ Failed for ${v.beneficiary}:`, err.reason || err.message);
        }
    }

    console.log("🎯 All vestings recreated!");
}

main().catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
});