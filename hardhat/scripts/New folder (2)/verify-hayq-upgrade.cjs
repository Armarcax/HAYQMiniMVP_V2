// scripts/verify-hayq-upgrade.cjs
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🔍 Verifying HAYQ upgrade integrity...");
    console.log("💼 Tester wallet:", deployer.address);

    const HAYQProxy = process.env.HAYQ_PROXY;
    if (!HAYQProxy) throw new Error("HAYQ_PROXY missing in .env");

    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQProxy);

    // 1. Ստուգենք, որ ֆունկցիաները գոյություն ունեն
    console.log("\n✅ Checking function existence...");
    if (typeof HAYQ.stakedBalanceOf !== "function") throw new Error("stakedBalanceOf missing");
    if (typeof HAYQ.stake !== "function") throw new Error("stake missing");
    if (typeof HAYQ.unstake !== "function") throw new Error("unstake missing");
    if (typeof HAYQ.buyback !== "function") throw new Error("buyback missing");
    console.log("✅ All functions exist");

    // 2. Ստուգենք նախկին staking տվյալները (եթե կան)
    console.log("\n📊 Checking existing staked balance...");
    const staked = await HAYQ.stakedBalanceOf(deployer.address);
    const balance = await HAYQ.balanceOf(deployer.address);
    console.log(`💰 Wallet HAYQ balance: ${ethers.formatUnits(balance, 18)}`);
    console.log(`🔒 Staked HAYQ: ${ethers.formatUnits(staked, 18)}`);

    // 3. Փորձարկենք stake (փոքր գումարով)
    if (balance > 0n) {
        const testAmount = ethers.parseUnits("0.1", 18); // 0.1 HAYQ
        if (balance >= testAmount) {
            console.log("\n🧪 Testing stake...");
            try {
                const tx = await HAYQ.stake(testAmount);
                await tx.wait();
                const newStaked = await HAYQ.stakedBalanceOf(deployer.address);
                const newBalance = await HAYQ.balanceOf(deployer.address);
                console.log(`✅ Staked successfully! New staked: ${ethers.formatUnits(newStaked, 18)}`);

                // 4. Անմիջապես unstake անենք
                console.log("🧪 Testing unstake...");
                const unstakeTx = await HAYQ.unstake(testAmount);
                await unstakeTx.wait();
                const finalStaked = await HAYQ.stakedBalanceOf(deployer.address);
                const finalBalance = await HAYQ.balanceOf(deployer.address);
                console.log(`✅ Unstaked successfully! Final staked: ${ethers.formatUnits(finalStaked, 18)}`);
            } catch (err) {
                console.log("⚠️ Stake/unstake test failed:", err.reason || err.message);
            }
        } else {
            console.log("⚠️ Not enough balance for stake test");
        }
    }

    // 5. Ստուգենք buyback (միայն եթե կոնտրակտն ունի բալանս)
    const contractBalance = await HAYQ.balanceOf(HAYQProxy);
    console.log(`\n🤖 Contract HAYQ balance: ${ethers.formatUnits(contractBalance, 18)}`);
    if (contractBalance > 0n) {
        const buybackAmount = ethers.parseUnits("0.01", 18);
        if (contractBalance >= buybackAmount) {
            console.log("🔥 Testing buyback (burn)...");
            try {
                const tx = await HAYQ.buyback(buybackAmount, 0);
                await tx.wait();
                const afterBalance = await HAYQ.balanceOf(HAYQProxy);
                console.log(`✅ Buyback succeeded! New contract balance: ${ethers.formatUnits(afterBalance, 18)}`);
            } catch (err) {
                console.log("⚠️ Buyback test failed (may require owner):", err.reason || err.message);
            }
        }
    }

    console.log("\n✅ Verification complete!");
}

main().catch(err => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
});