// scripts/wallet-automated-actions-final.cjs
import { ethers } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("👤 Wallet address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 ETH Balance:", ethers.formatEther(balance), "ETH\n");

  // === 📦 CONTRACT ADDRESSES (լրացրու քոները) ===
  const STAKING_ADDRESS = "0x...";      // StakingVaultUpgradeable
  const BUYBACK_ADDRESS = "0x...";      // BuybackUpgradeable
  const VESTING_ADDRESS = "0x...";      // VestingVaultUpgradeable
  const TOKEN_ADDRESS = "0x...";        // HAYQ Token

  // === 📜 ABI-ները (կարող ես import անել JSON-ներից, բայց հիմա դնում եմ inline հիմնական ֆունկցիաներով) ===
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function decimals() view returns (uint8)"
  ];

  const STAKING_ABI = [
    "function getUserStake(address) view returns (uint256 amount, uint256 rewards)",
    "function stake(uint256 amount) external",
    "function unstake(uint256 amount) external",
    "function claimRewards() external"
  ];

  const BUYBACK_ABI = [
    "function buyback(uint256 amount) external",
    "function availableFunds() view returns (uint256)"
  ];

  const VESTING_ABI = [
    "function getVestingInfo(address user) view returns (uint256 total, uint256 released, uint256 claimable)",
    "function claim() external"
  ];

  // === Connect contracts ===
  const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
  const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, wallet);
  const buyback = new ethers.Contract(BUYBACK_ADDRESS, BUYBACK_ABI, wallet);
  const vesting = new ethers.Contract(VESTING_ADDRESS, VESTING_ABI, wallet);

  // === TOKEN INFO ===
  const decimals = await token.decimals();
  const tokenBalance = await token.balanceOf(wallet.address);
  console.log("🔹 Token balance:", Number(tokenBalance) / 10 ** decimals);

  // === STAKING INFO ===
  const stakeInfo = await staking.getUserStake(wallet.address);
  console.log("\n📊 Staking Info:");
  console.log("  - Staked:", Number(stakeInfo.amount) / 10 ** decimals);
  console.log("  - Rewards:", Number(stakeInfo.rewards) / 10 ** decimals);

  // === VESTING INFO ===
  const vestingInfo = await vesting.getVestingInfo(wallet.address);
  console.log("\n🪙 Vesting Info:");
  console.log("  - Total:", Number(vestingInfo.total) / 10 ** decimals);
  console.log("  - Released:", Number(vestingInfo.released) / 10 ** decimals);
  console.log("  - Claimable:", Number(vestingInfo.claimable) / 10 ** decimals);

  // === BUYBACK INFO ===
  const availableBuyback = await buyback.availableFunds();
  console.log("\n🔥 Buyback Pool:");
  console.log("  - Available:", Number(availableBuyback) / 10 ** decimals);

  // === SAMPLE ACTIONS ===
  // Uncomment if you want to trigger any real tx (dangerous if not testnet!)
  /*
  console.log("\n🚀 Performing test stake of 1 token...");
  const tx = await staking.stake(ethers.parseUnits("1", decimals));
  await tx.wait();
  console.log("✅ Staked successfully!");
  */
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
