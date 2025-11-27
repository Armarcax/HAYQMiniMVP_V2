// scripts/wallet-automated-actions-updated.js
import pkg from "hardhat";
const { ethers, upgrades } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`💼 Using wallet: ${wallet.address}`);

    // Contract addresses
    const HAYQ_ADDR = process.env.HAYQ_CONTRACT_ADDRESS;
    const ROUTER_ADDR = process.env.MOCK_ROUTER_ADDRESS;
    const VESTING_VAULT_ADDR = process.env.VESTING_VAULT_ADDRESS;

    // Contract instances
    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDR, wallet);
    const Vault = await ethers.getContractAt("VestingVaultUpgradeable", VESTING_VAULT_ADDR, wallet);

    // --- Step 1: Wallet inspection ---
    const balance = await HAYQ.balanceOf(wallet.address);
    const staked = await HAYQ.staked(wallet.address);
    const allowance = await HAYQ.allowance(wallet.address, ROUTER_ADDR);
    const owner = await HAYQ.owner();
    const isOwner = owner.toLowerCase() === wallet.address.toLowerCase();

    console.log(`💰 HAYQ balance: ${ethers.utils.formatEther(balance)}`);
    console.log(`📊 Staked amount: ${ethers.utils.formatEther(staked)}`);
    console.log(`🔐 Allowance to router: ${ethers.utils.formatEther(allowance)}`);
    console.log(`👑 Contract owner: ${owner} | Is signer owner? ${isOwner ? "✅ Yes" : "❌ No"}`);

    // --- Step 2: Staking ---
    const stakeAmount = ethers.utils.parseEther("50");
    if (balance.gte(stakeAmount)) {
        const txStake = await HAYQ.stake(stakeAmount);
        await txStake.wait();
        console.log(`✅ Staked ${ethers.utils.formatEther(stakeAmount)} HAYQ`);
    }

    // --- Step 3: Unstaking ---
    const unstakeAmount = ethers.utils.parseEther("30");
    if (staked.gte(unstakeAmount)) {
        const txUnstake = await HAYQ.unstake(unstakeAmount);
        await txUnstake.wait();
        console.log(`✅ Unstaked ${ethers.utils.formatEther(unstakeAmount)} HAYQ`);
    }

    // --- Step 4: Approve router ---
    const approveAmount = ethers.utils.parseEther("100");
    if (allowance.lt(approveAmount)) {
        const txApprove = await HAYQ.approve(ROUTER_ADDR, approveAmount);
        await txApprove.wait();
        console.log(`✅ Approved ${ethers.utils.formatEther(approveAmount)} HAYQ to router`);
    }

    // --- Step 5: Create team vesting ---
    if (isOwner) {
        const vestAmount = ethers.utils.parseEther("100");
        const start = Math.floor(Date.now() / 1000);
        const duration = 3600; // 1 hour

        try {
            // Step A: Transfer HAYQ to Vault
            const txTransfer = await HAYQ.transfer(VESTING_VAULT_ADDR, vestAmount);
            await txTransfer.wait();
            console.log(`➡️ Transferred ${ethers.utils.formatEther(vestAmount)} HAYQ to Vault`);

            // Step B: Create vesting in Vault
            const txVesting = await Vault.createVesting(wallet.address, vestAmount, start, duration);
            await txVesting.wait();
            console.log(`✅ Team vesting created in Vault: ${ethers.utils.formatEther(vestAmount)} HAYQ`);
        } catch (err) {
            console.warn("⚠️ Vesting creation failed", err.message);
        }
    }

    // --- Step 6: Buyback ---
    if (isOwner) {
        const contractBalance = await HAYQ.balanceOf(HAYQ_ADDR);
        if (contractBalance.gt(0)) {
            try {
                const txBuyback = await HAYQ.buyback(contractBalance, 0);
                await txBuyback.wait();
                console.log(`✅ Buyback executed: ${ethers.utils.formatEther(contractBalance)} HAYQ`);
            } catch (err) {
                console.warn("⚠️ Buyback failed", err.message);
            }
        }
    }

    // --- Step 7: Mint ---
    if (isOwner) {
        const mintAmount = ethers.utils.parseEther("50");
        const txMint = await HAYQ.mint(wallet.address, mintAmount);
        await txMint.wait();
        console.log(`✅ Minted ${ethers.utils.formatEther(mintAmount)} HAYQ to wallet`);
    }

    // --- Final snapshot ---
    const finalBalance = await HAYQ.balanceOf(wallet.address);
    const finalStaked = await HAYQ.staked(wallet.address);
    const finalAllowance = await HAYQ.allowance(wallet.address, ROUTER_ADDR);
    console.log("\n📸 --- FINAL SNAPSHOT ---");
    console.log(`💰 Balance: ${ethers.utils.formatEther(finalBalance)}`);
    console.log(`📊 Staked: ${ethers.utils.formatEther(finalStaked)}`);
    console.log(`🔐 Allowance: ${ethers.utils.formatEther(finalAllowance)}`);
    console.log("------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
