// scripts/wallet-automated-actions-final.cjs
require("dotenv").config();
const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`💼 Using wallet: ${wallet.address}`);

    const HAYQ_ADDR = process.env.HAYQ_CONTRACT_ADDRESS;
    const ROUTER_ADDR = process.env.MOCK_ROUTER_ADDRESS;
    const VESTING_ADDR = process.env.VESTING_ADDR;

    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDR, wallet);

    // --- Initial wallet state ---
    let balance = await HAYQ.balanceOf(wallet.address);
    let staked = await HAYQ.staked(wallet.address);
    let allowance = await HAYQ.allowance(wallet.address, ROUTER_ADDR);
    const owner = await HAYQ.owner();
    const isOwner = owner.toLowerCase() === wallet.address.toLowerCase();

    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)}`);
    console.log(`📊 Staked: ${ethers.utils.formatEther(staked)}`);
    console.log(`🔐 Allowance to router: ${ethers.utils.formatEther(allowance)}`);
    console.log(`👑 Owner: ${owner} | Is signer owner? ${isOwner ? "✅ Yes" : "❌ No"}`);

    // --- Step 1: Stake ---
    const stakeAmount = ethers.utils.parseUnits(process.env.STAKE_AMOUNT, process.env.DECIMALS);
    if (balance.gte(stakeAmount)) {
        const txStake = await HAYQ.stake(stakeAmount);
        await txStake.wait();
        console.log(`✅ Staked ${ethers.utils.formatEther(stakeAmount)} HAYQ`);
    }

    // --- Step 2: Unstake ---
    const unstakeAmount = ethers.utils.parseUnits(process.env.UNSTAKE_AMOUNT, process.env.DECIMALS);
    if (staked.gte(unstakeAmount)) {
        const txUnstake = await HAYQ.unstake(unstakeAmount);
        await txUnstake.wait();
        console.log(`✅ Unstaked ${ethers.utils.formatEther(unstakeAmount)} HAYQ`);
    }

    // --- Step 3: Approve router if needed ---
    const approveAmount = ethers.utils.parseUnits(process.env.APPROVE_AMOUNT, process.env.DECIMALS);
    if (allowance.lt(approveAmount)) {
        const txApprove = await HAYQ.approve(ROUTER_ADDR, approveAmount);
        await txApprove.wait();
        console.log(`✅ Approved ${ethers.utils.formatEther(approveAmount)} HAYQ to router`);
    }

    // --- Step 4: Approve vesting contract if needed ---
    const vestingAllowance = await HAYQ.allowance(wallet.address, VESTING_ADDR);
    const vestAmount = ethers.utils.parseUnits(process.env.VESTING_AMOUNT, process.env.DECIMALS);
    if (vestingAllowance.lt(vestAmount)) {
        const txVApprove = await HAYQ.approve(VESTING_ADDR, vestAmount);
        await txVApprove.wait();
        console.log(`✅ Approved ${ethers.utils.formatEther(vestAmount)} HAYQ to VestingVault`);
    }

    // --- Step 5: Create vesting ---
    if (isOwner) {
        try {
            const txVesting = await HAYQ.createTeamVesting(
                process.env.VESTING_BENEFICIARY,
                vestAmount,
                parseInt(process.env.VESTING_START),
                parseInt(process.env.VESTING_DURATION)
            );
            await txVesting.wait();
            console.log(`✅ Vesting created: ${ethers.utils.formatEther(vestAmount)} HAYQ`);
        } catch (err) {
            console.warn("⚠️ Vesting creation failed:", err.message);
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
                console.warn("⚠️ Buyback failed:", err.message);
            }
        }
    }

    // --- Step 7: Mint ---
    if (isOwner) {
        const mintAmount = ethers.utils.parseUnits("50", process.env.DECIMALS);
        const txMint = await HAYQ.mint(wallet.address, mintAmount);
        await txMint.wait();
        console.log(`✅ Minted ${ethers.utils.formatEther(mintAmount)} HAYQ to wallet`);
    }

    // --- Final snapshot ---
    balance = await HAYQ.balanceOf(wallet.address);
    staked = await HAYQ.staked(wallet.address);
    allowance = await HAYQ.allowance(wallet.address, ROUTER_ADDR);

    console.log("\n📸 --- FINAL SNAPSHOT ---");
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)}`);
    console.log(`📊 Staked: ${ethers.utils.formatEther(staked)}`);
    console.log(`🔐 Allowance: ${ethers.utils.formatEther(allowance)}`);
    console.log("------------------------");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
