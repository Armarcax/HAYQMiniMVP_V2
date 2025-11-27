// scripts/test-multi-stake.cjs
const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const provider = hre.ethers.provider; // ✅ վերցնում ենք hardhat provider-ը
    const [wallet] = await hre.ethers.getSigners(); // ✅ վերցնում ենք deployer account-ը

    const HAYQ_ADDR = process.env.HAYQ_CONTRACT_ADDRESS;
    const recipients = process.env.RECIPIENTS.split(",");
    const stakeAmount = hre.ethers.parseEther(process.env.STAKE_AMOUNT || "10");

    console.log(`👑 Main wallet: ${wallet.address}`);
    console.log(`📜 Contract: ${HAYQ_ADDR}`);
    console.log(`👥 Recipients: ${recipients.join(", ")}`);
    console.log(`💎 Stake per wallet: ${hre.ethers.formatEther(stakeAmount)} HAYQ\n`);

    const HAYQ = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDR, wallet);

    const initialBalance = await HAYQ.balanceOf(wallet.address);
    console.log(`💰 Initial balance: ${ethers.utils.formatEther(initialBalance)} HAYQ\n`);

    const allowance = await HAYQ.allowance(wallet.address, HAYQ_ADDR);
    if (allowance.lt(stakeAmount.mul(recipients.length))) {
        const tx = await HAYQ.approve(HAYQ_ADDR, stakeAmount.mul(recipients.length));
        await tx.wait();
        console.log(`✅ Approved ${ethers.utils.formatEther(stakeAmount.mul(recipients.length))} HAYQ for staking.\n`);
    }

    for (const r of recipients) {
        try {
            console.log(`🔥 Staking for ${r} ...`);
            const txStake = await HAYQ.stake(stakeAmount);
            await txStake.wait();
            console.log(`✅ Staked ${ethers.utils.formatEther(stakeAmount)} HAYQ for ${r}\n`);
        } catch (err) {
            console.warn(`⚠️ Failed staking to ${r}: ${err.message}\n`);
        }
    }

    console.log("⏳ Waiting 10 seconds before unstake...");
    await new Promise((r) => setTimeout(r, 10000));

    for (const r of recipients) {
        try {
            console.log(`💧 Unstaking for ${r} ...`);
            const txUnstake = await HAYQ.unstake(stakeAmount);
            await txUnstake.wait();
            console.log(`✅ Unstaked ${ethers.utils.formatEther(stakeAmount)} HAYQ from ${r}\n`);
        } catch (err) {
            console.warn(`⚠️ Failed unstaking from ${r}: ${err.message}\n`);
        }
    }

    const finalBalance = await HAYQ.balanceOf(wallet.address);
    console.log(`\n📸 FINAL SNAPSHOT`);
    console.log(`💰 Final balance: ${ethers.utils.formatEther(finalBalance)} HAYQ`);
    console.log(`🧾 Total change: ${ethers.utils.formatEther(finalBalance.sub(initialBalance))} HAYQ`);
}

main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
