// scripts/wallet-automated-actions-final.cjs
const hre = require("hardhat");
require("dotenv").config();

async function main() {
    // --- Wallet & provider ---
    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, hre.ethers.provider);
    console.log(`👤 Wallet: ${wallet.address}`);

    // --- Contracts ---
    const HAYQ_ADDR = process.env.HAYQ_ADDRESS || process.env.HAYQ_CONTRACT_ADDRESS;
    const ROUTER_ADDR = process.env.MOCK_ROUTER_ADDRESS;
    const VESTING_VAULT = process.env.VESTING_VAULT;

    const HAYQ = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDR, wallet);

    // --- Step 1: Wallet inspection ---
    const balance = await HAYQ.balanceOf(wallet.address);
    const staked = await HAYQ.staked(wallet.address);
    const allowance = await HAYQ.allowance(wallet.address, ROUTER_ADDR);
    const vestingVault = await HAYQ.vestingVault();
    const owner = await HAYQ.owner();
    const isOwner = owner.toLowerCase() === wallet.address.toLowerCase();

    console.log("💰 Balance:", hre.ethers.utils.formatEther(balance));
    console.log("📊 Staked:", hre.ethers.utils.formatEther(staked));
    console.log("🔐 Allowance:", hre.ethers.utils.formatEther(allowance));
    console.log("🏦 VestingVault:", vestingVault);
    console.log("👑 Owner:", owner, "| Is signer owner?", isOwner ? "✅ Yes" : "❌ No");

    // --- Step 2: Stake ---
    const stakeAmount = hre.ethers.utils.parseEther(process.env.STAKE_AMOUNT || "50");
    if (balance.gte(stakeAmount)) {
        const txStake = await HAYQ.stake(stakeAmount);
        await txStake.wait();
        console.log(`✅ Staked ${hre.ethers.utils.formatEther(stakeAmount)} HAYQ`);
    }

    // --- Step 3: Unstake ---
    const unstakeAmount = hre.ethers.utils.parseEther(process.env.UNSTAKE_AMOUNT || "30");
    if (staked.gte(unstakeAmount)) {
        const txUnstake = await HAYQ.unstake(unstakeAmount);
        await txUnstake.wait();
        console.log(`✅ Unstaked ${hre.ethers.utils.formatEther(unstakeAmount)} HAYQ`);
    }

    // --- Step 4: Approve router ---
    const approveAmount = hre.ethers.utils.parseEther(process.env.APPROVE_AMOUNT || "100");
    if (allowance.lt(approveAmount)) {
        const txApprove = await HAYQ.approve(ROUTER_ADDR, approveAmount);
        await txApprove.wait();
        console.log(`✅ Approved ${hre.ethers.utils.formatEther(approveAmount)} HAYQ to router`);
    }

    // --- Step 5: Team vesting (owner only) ---
    if (isOwner && vestingVault !== hre.ethers.constants.AddressZero) {
        const vestAmount = hre.ethers.utils.parseEther(process.env.VESTING_AMOUNT || "100");
        const start = parseInt(process.env.VESTING_START || `${Math.floor(Date.now()/1000)}`);
        const duration = parseInt(process.env.VESTING_DURATION || "3600");
        try {
            const txVesting = await HAYQ.createTeamVesting(wallet.address, vestAmount, start, duration);
            await txVesting.wait();
            console.log(`✅ Team vesting created: ${hre.ethers.utils.formatEther(vestAmount)} HAYQ`);
        } catch (err) {
            console.warn("⚠️ Vesting creation failed:", err.message);
        }
    }

    // --- Step 6: Buyback (owner only) ---
    if (isOwner) {
        const contractBalance = await HAYQ.balanceOf(HAYQ_ADDR);
        if (contractBalance.gt(0)) {
            try {
                const txBuyback = await HAYQ.buyback(contractBalance, 0);
                await txBuyback.wait();
                console.log(`✅ Buyback executed: ${hre.ethers.utils.formatEther(contractBalance)} HAYQ`);
            } catch (err) {
                console.warn("⚠️ Buyback failed:", err.message);
            }
        }
    }

    // --- Step 7: Mint (owner only) ---
    if (isOwner) {
        const mintAmount = hre.ethers.utils.parseEther("50");
        const txMint = await HAYQ.mint(wallet.address, mintAmount);
        await txMint.wait();
        console.log(`✅ Minted ${hre.ethers.utils.formatEther(mintAmount)} HAYQ to wallet`);
    }

    // --- Final snapshot ---
    const finalBalance = await HAYQ.balanceOf(wallet.address);
    const finalStaked = await HAYQ.staked(wallet.address);
    const finalAllowance = await HAYQ.allowance(wallet.address, ROUTER_ADDR);

    console.log("\n📸 --- FINAL SNAPSHOT ---");
    console.log("💰 Balance:", hre.ethers.utils.formatEther(finalBalance));
    console.log("📊 Staked:", hre.ethers.utils.formatEther(finalStaked));
    console.log("🔐 Allowance:", hre.ethers.utils.formatEther(finalAllowance));
    console.log("------------------------");
}

main().catch(err => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});
