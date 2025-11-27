// scripts/create-vesting-batch-smart.cjs
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    // 1️⃣ Wallet + contracts
    const [deployer] = await ethers.getSigners();
    console.log("💼 Using wallet:", deployer.address);

    const HAYQAddress = process.env.HAYQ_ADDRESS;
    const vaultAddress = process.env.VESTING_VAULT;

    if (!HAYQAddress || !vaultAddress) {
        throw new Error("🚨 HAYQ_ADDRESS or VESTING_VAULT not set in .env");
    }

    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQAddress);
    const Vault = await ethers.getContractAt("VestingVaultUpgradeable", vaultAddress);

    console.log("🎯 HAYQ contract:", HAYQAddress);
    console.log("🎯 VestingVault:", vaultAddress);

    // 2️⃣ Vesting data
    const vestings = [
        {
            beneficiary: "0x928677743439e4dA4108c4025694B2F3d3b2745c",
            amount: 100,
            start: Math.floor(Date.now() / 1000),
            duration: 30 * 24 * 3600
        },
        {
            beneficiary: "0xBF3cfF21BD17854334112d28853fe716Eb423536",
            amount: 100,
            start: Math.floor(Date.now() / 1000),
            duration: 60 * 24 * 3600
        },
        // 👉 այստեղ կարող ես ավելացնել ավելի շատ beneficiary-ներ
    ];

    // 3️⃣ Ստուգենք Vault-ի բալանսը
    let totalRequired = vestings.reduce((acc, v) => acc + v.amount, 0);
    const vaultBalance = await HAYQ.balanceOf(vaultAddress);
    const vaultBalanceNum = parseFloat(ethers.formatUnits(vaultBalance, 18));
    console.log("Vault HAYQ balance:", vaultBalanceNum);

    if (vaultBalanceNum < totalRequired) {
        throw new Error(`🚨 Vault does not have enough HAYQ (needs ${totalRequired}, has ${vaultBalanceNum})`);
    }

    // 4️⃣ Կատարում ենք vesting-ները հերթով՝ խելացի ուշացումներով
    for (const v of vestings) {
        try {
            const amountWithDecimals = ethers.parseUnits(v.amount.toString(), 18);
            console.log(`\n⏳ Creating vesting for ${v.beneficiary} (${v.amount} HAYQ)...`);

            const tx = await Vault.createVesting(v.beneficiary, amountWithDecimals, v.start, v.duration);
            console.log(`🚀 Sent tx: ${tx.hash}`);

            await tx.wait();
            console.log(`✅ Vesting confirmed for ${v.beneficiary}`);

        } catch (err) {
            console.error(`⚠️ Failed for ${v.beneficiary}:`, err.reason || err.message);
        }

        // 5️⃣ Փոքր դադար՝ RPC spam-ից խուսափելու համար
        await new Promise(res => setTimeout(res, 4000));
    }

    console.log("\n🎯 All vestings processed successfully!");
}

main().catch(err => {
    console.error("💥 Script failed:", err);
    process.exit(1);
});
