// scripts/wallet-full-inspect.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [caller] = await hre.ethers.getSigners();
  const walletAddress = caller.address;

  console.log(`🔎 Inspecting wallet: ${walletAddress}\n`);

  // Proxy addresses from .env
  const HAYQ = process.env.HAYQ_CONTRACT_ADDRESS;
  const VESTING = process.env.VESTING_ADDR;
  const ETH_DIV = process.env.ETH_DIV_ADDR;
  const MULTISIG = process.env.MULTISIG_ADDR;
  const REWARD = process.env.REWARD_TOKEN_ADDRESS;
  const MOCK_ROUTER = process.env.MOCK_ROUTER_ADDRESS;

  // Attach to HAYQ proxy
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ);

  // HAYQ balance
  const balance = await hayq.balanceOf(walletAddress);
  
  // Staked
  const staked = await hayq.staked(walletAddress);

  // Allowance to MockRouter
  const allowance = await hayq.allowance(walletAddress, MOCK_ROUTER);

  console.log(`HAYQ balance: ${hre.ethers.formatUnits(balance, 18)}`);
  console.log(`Staked amount: ${hre.ethers.formatUnits(staked, 18)}`);
  console.log(`Allowance to MockRouter: ${hre.ethers.formatUnits(allowance, 18)}`);

  // Vesting info (if applicable)
  if (VESTING !== "0x0") {
    const vestingVault = await hre.ethers.getContractAt("VestingVaultUpgradeable", VESTING);
    // You can extend this to read total/released vestings if function exists
    console.log("VestingVault is set:", VESTING);
  }

  // ETH Dividends info
  if (ETH_DIV !== "0x0") {
    const ethDiv = await hre.ethers.getContractAt("EthDividendTrackerUpgradeable", ETH_DIV);
    try {
      const withdrawable = await ethDiv.withdrawableDividendOf(walletAddress);
      console.log(`ETH Dividends withdrawable: ${hre.ethers.formatEther(withdrawable)}`);
    } catch {
      console.log("ETH Dividend function not available or wallet has no dividends");
    }
  }

  console.log("\n✅ Wallet inspection complete");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
