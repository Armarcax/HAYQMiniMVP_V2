// scripts/HAYQ-full-flow-mock.cjs
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("💼 Wallet:", deployer.address);

    const HAYQAddress = process.env.HAYQ_ADDRESS;
    const VaultAddress = process.env.VESTING_VAULT;

    if (!HAYQAddress || !VaultAddress) throw new Error("HAYQ_ADDRESS or VESTING_VAULT missing");

    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQAddress);
    const Vault = await ethers.getContractAt("VestingVaultUpgradeable", VaultAddress);

    const beneficiaries = [
        "0x928677743439e4dA4108c4025694B2F3d3b2745c",
        "0xBF3cfF21BD17854334112d28853fe716Eb423536",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    ];

    console.log("HAYQ Balance:", ethers.formatUnits(await HAYQ.balanceOf(deployer.address), 18));

    // --- Check and approve ---
    const approveAmount = ethers.parseUnits("10", 18);
    const txApprove = await HAYQ.approve(VaultAddress, approveAmount);
    await txApprove.wait();
    console.log(`✅ Approved ${ethers.formatUnits(approveAmount, 18)} HAYQ for vault`);

    for (const b of beneficiaries) {
        // --- Check vesting ---
        const existing = await Vault.vestings(b);
        if (existing.totalAmount > 0n) {
            console.log(`⏭️ Already vested: ${b}`);
        } else {
            const amount = ethers.parseUnits("100", 18);
            const start = Math.floor(Date.now() / 1000);
            const duration = 3600; // 1 hour for test
            const txVest = await Vault.createVesting(b, amount, start, duration);
            await txVest.wait();
            console.log(`🚀 Vesting created for ${b}`);
        }

        // --- Mock staking step ---
        console.log(`⚡ Mock staking ${b} (no real staking contract)`);

        // --- Claim vesting (simulate) ---
        try {
            const txClaim = await Vault.claim(b);
            await txClaim.wait();
            console.log(`✅ Claimed vesting for ${b}`);
        } catch (err) {
            console.log(`⚠️ Claim error for ${b}:`, err.reason || err.message);
        }
    }

    console.log("🎯 Full mock flow executed successfully!");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
