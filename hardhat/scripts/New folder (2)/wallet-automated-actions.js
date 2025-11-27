import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`Using wallet: ${wallet.address}`);

    // HAYQ MiniMVP contract address & ABI (partial for demo)
    const HAYQ_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
    const HAYQ_ABI = [
        "function balanceOf(address) view returns (uint256)",
        "function stake(uint256)",
        "function unstake(uint256)",
        "function approve(address spender, uint256 amount)",
        "function staked(address) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function vestingVault() view returns (address)",
        "function owner() view returns (address)"
    ];

    const routerAddress = process.env.MOCK_ROUTER_ADDRESS;

    const hayq = new ethers.Contract(HAYQ_ADDRESS, HAYQ_ABI, wallet);

    const balance = await hayq.balanceOf(wallet.address);
    const staked = await hayq.staked(wallet.address);
    const allowance = await hayq.allowance(wallet.address, routerAddress);
    const vestingVault = await hayq.vestingVault();
    const owner = await hayq.owner();

    console.log(`HAYQ balance: ${ethers.formatUnits(balance, 18)}`);
    console.log(`Staked amount: ${ethers.formatUnits(staked, 18)}`);
    console.log(`Allowance to router: ${ethers.formatUnits(allowance, 18)}`);
    console.log(`VestingVault is set: ${vestingVault}`);
    console.log(`Contract owner: ${owner} | signer is owner? ${owner.toLowerCase() === wallet.address.toLowerCase() ? "✅ yes" : "❌ no"}`);

    // --- Example actions ---
    const stakeAmount = ethers.parseUnits("50", 18);
    const unstakeAmount = ethers.parseUnits("30", 18);
    const approveAmount = ethers.parseUnits("100", 18);

    try {
        console.log(`➡️ Staking 50 HAYQ...`);
        const txStake = await hayq.stake(stakeAmount);
        await txStake.wait();
        console.log(`✅ Stake tx mined: ${txStake.hash}`);
    } catch(e) {
        console.log(`❌ Stake failed: ${e.message}`);
    }

    try {
        console.log(`➡️ Unstaking 30 HAYQ...`);
        const txUnstake = await hayq.unstake(unstakeAmount);
        await txUnstake.wait();
        console.log(`✅ Unstake tx mined: ${txUnstake.hash}`);
    } catch(e) {
        console.log(`❌ Unstake failed: ${e.message}`);
    }

    try {
        console.log(`➡️ Approving 100 HAYQ to router ${routerAddress}...`);
        const txApprove = await hayq.approve(routerAddress, approveAmount);
        await txApprove.wait();
        console.log(`✅ Approve tx mined: ${txApprove.hash}`);
    } catch(e) {
        console.log(`❌ Approve failed: ${e.message}`);
    }

    console.log("--- Final snapshot ---");
    const newBalance = await hayq.balanceOf(wallet.address);
    const newStaked = await hayq.staked(wallet.address);
    const newAllowance = await hayq.allowance(wallet.address, routerAddress);
    console.log(`HAYQ balance: ${ethers.formatUnits(newBalance, 18)}`);
    console.log(`Staked: ${ethers.formatUnits(newStaked, 18)}`);
    console.log(`Allowance to router: ${ethers.formatUnits(newAllowance, 18)}`);
    console.log("----------------------");

    console.log("✅ Script finished.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
