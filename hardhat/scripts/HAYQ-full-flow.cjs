// test/HAYQ-full-flow.cjs
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("💼 Wallet:", deployer.address);

    const HAYQAddress = process.env.HAYQ_ADDRESS;
    const VaultAddress = process.env.VESTING_VAULT;
    const STAKE_AMOUNT = process.env.STAKE_AMOUNT || 10;

    if (!HAYQAddress || !VaultAddress) throw new Error("HAYQ_ADDRESS or VESTING_VAULT missing");

    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQAddress);
    const Vault = await ethers.getContractAt("VestingVaultUpgradeable", VaultAddress);

    // --- 1️⃣ Check HAYQ balance ---
    const balance = await HAYQ.balanceOf(deployer.address);
    console.log("HAYQ Balance:", ethers.formatUnits(balance, 18));

    // --- 2️⃣ Create vesting if not exists ---
    const beneficiaries = [
        "0x928677743439e4dA4108c4025694B2F3d3b2745c",
        "0xBF3cfF21BD17854334112d28853fe716Eb423536"
    ];

    const start = Math.floor(Date.now() / 1000);
    const vestAmount = ethers.parseUnits("100", 18);
    const duration = 3600; // 1 hour

    for (const b of beneficiaries) {
        const existing = await Vault.vestings(b);
        if (existing.totalAmount > 0n) {
            console.log(`⏭️ Already vested: ${b}`);
        } else {
            const tx = await Vault.createVesting(b, vestAmount, start, duration);
            await tx.wait();
            console.log(`✅ Vesting created for ${b}`);
        }
    }

    // --- 3️⃣ Stake ---
    const approveTx = await HAYQ.approve(VaultAddress, ethers.parseUnits(STAKE_AMOUNT.toString(), 18));
    await approveTx.wait();
    console.log(`✅ Approved ${STAKE_AMOUNT} HAYQ for staking`);

    const stakeTx = await Vault.stake(ethers.parseUnits(STAKE_AMOUNT.toString(), 18));
    await stakeTx.wait();
    console.log(`🚀 Staked ${STAKE_AMOUNT} HAYQ`);

    // --- 4️⃣ Unstake ---
    const unstakeTx = await Vault.unstake(ethers.parseUnits((STAKE_AMOUNT / 2).toString(), 18));
    await unstakeTx.wait();
    console.log(`↩️ Unstaked ${STAKE_AMOUNT / 2} HAYQ`);

    // --- 5️⃣ Claim rewards ---
    const claimTx = await Vault.claim();
    await claimTx.wait();
    console.log("💰 Rewards claimed");

    console.log("🎯 Full flow completed successfully!");
}

main().catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
});
