// scripts/wallet-automated-actions-full.js
import pkg from "hardhat";
const { ethers, upgrades } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    // 🧩 Provider և Wallet ստեղծում
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`💼 Using wallet: ${wallet.address}`);

    // 📦 Contract հասցեներ
    const HAYQ_ADDR = process.env.HAYQ_CONTRACT_ADDRESS;
    const ROUTER_ADDR = process.env.MOCK_ROUTER_ADDRESS;

    // 📜 Contract instance
    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDR, wallet);

    // --- STEP 1: Wallet inspection ---
    const balance = await HAYQ.balanceOf(wallet.address);
    const staked = await HAYQ.staked(wallet.address);
    const allowance = await HAYQ.allowance(wallet.address, ROUTER_ADDR);
    const vestingVault = await HAYQ.vestingVault();
    const owner = await HAYQ.owner();
    const isOwner = owner.toLowerCase() === wallet.address.toLowerCase();

    console.log(`💰 HAYQ balance: ${ethers.formatEther(balance)}`);
    console.log(`📊 Staked amount: ${ethers.formatEther(staked)}`);
    console.log(`🔐 Allowance to router: ${ethers.formatEther(allowance)}`);
    console.log(`🏦 VestingVault: ${vestingVault}`);
    console.log(`👑 Contract owner: ${owner} | Is signer owner? ${isOwner ? "✅ Yes" : "❌ No"}`);

    // --- STEP 2: Stake ---
    const stakeAmount = ethers.parseEther("50");
    if (balance >= stakeAmount) {
        const txStake = await HAYQ.stake(stakeAmount);
        await txStake.wait();
        console.log(`✅ Staked ${ethers.formatEther(stakeAmount)} HAYQ`);
    }

    // --- STEP 3: Unstake ---
    const unstakeAmount = ethers.parseEther("30");
    if (staked >= unstakeAmount) {
        const txUnstake = await HAYQ.unstake(unstakeAmount);
        await txUnstake.wait();
        console.log(`✅ Unstaked ${ethers.formatEther(unstakeAmount)} HAYQ`);
    }

    // --- STEP 4: Approve router ---
    const approveAmount = ethers.parseEther("100");
    if (allowance < approveAmount) {
        const txApprove = await HAYQ.approve(ROUTER_ADDR, approveAmount);
        await txApprove.wait();
        console.log(`✅ Approved ${ethers.formatEther(approveAmount)} HAYQ to router`);
    }

    // --- STEP 5: Create team vesting (only owner) ---
    if (isOwner && vestingVault !== ethers.ZeroAddress) {
        const vestAmount = 100; // tokens (not wei)
        const start = Math.floor(Date.now() / 1000);
        const duration = 3600; // 1 hour
        try {
            const txVesting = await HAYQ.createTeamVesting(wallet.address, vestAmount, start, duration);
            await txVesting.wait();
            console.log(`✅ Team vesting created for ${vestAmount} HAYQ`);
        } catch (err) {
            console.warn("⚠️ Vesting creation failed:", err.message);
        }
    }

    // --- STEP 6: Buyback (only owner) ---
    if (isOwner) {
        const contractBalance = await HAYQ.balanceOf(HAYQ_ADDR);
        if (contractBalance > 0n) {
            try {
                const txBuyback = await HAYQ.buyback(contractBalance, 0);
                await txBuyback.wait();
                console.log(`✅ Buyback executed: ${ethers.formatEther(contractBalance)} HAYQ`);
            } catch (err) {
                console.warn("⚠️ Buyback failed:", err.message);
            }
        }
    }

    // --- STEP 7: Mint (only owner) ---
    if (isOwner) {
        const mintAmount = 50;
        const txMint = await HAYQ.mint(wallet.address, mintAmount);
        await txMint.wait();
        console.log(`✅ Minted ${mintAmount} HAYQ to wallet`);
    }

    // --- FINAL SNAPSHOT ---
    const finalBalance = await HAYQ.balanceOf(wallet.address);
    const finalStaked = await HAYQ.staked(wallet.address);
    const finalAllowance = await HAYQ.allowance(wallet.address, ROUTER_ADDR);
    console.log("\n📸 --- FINAL SNAPSHOT ---");
    console.log(`💰 Balance: ${ethers.formatEther(finalBalance)}`);
    console.log(`📊 Staked: ${ethers.formatEther(finalStaked)}`);
    console.log(`🔐 Allowance: ${ethers.formatEther(finalAllowance)}`);
    console.log("------------------------");
}

main().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
});
