require("dotenv").config();
const hre = require("hardhat");       // Full Hardhat object
const ethers = hre.ethers;             // Ethers.js, ճիշտ հղումով
const upgrades = hre.upgrades;         // Proxy upgrades helpers

// Կոնֆիգուրացիա
const PROXY_ADDRESS = "0x45615F3D52262ba7F16d7E0182893492F1752baB"; // Proxy contract
const STAKE_AMOUNT = ethers.utils.parseUnits("10", 18); // 10 token stake
const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY; // .env-ում պահած key

async function main() {
  // Ունենք signer
  const provider = ethers.getDefaultProvider("sepolia");
  const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

  console.log("Signer address:", wallet.address);

  // Կցվում ենք proxy contract-ին
  const Contract = await ethers.getContractAt("HAYQMiniMVP", PROXY_ADDRESS, wallet);

  // 1. Stake
  console.log(`Staking ${ethers.utils.formatUnits(STAKE_AMOUNT, 18)} tokens...`);
  const txStake = await Contract.stake(STAKE_AMOUNT);
  await txStake.wait();
  console.log("Staked successfully!");

  // 2. Unstake
  console.log("Unstaking tokens...");
  const txUnstake = await Contract.unstake(STAKE_AMOUNT);
  await txUnstake.wait();
  console.log("Unstaked successfully!");

  // 3. Buyback
  console.log("Performing buyback...");
  const txBuyback = await Contract.buyback(STAKE_AMOUNT);
  await txBuyback.wait();
  console.log("Buyback done!");

  // 4. Vesting claim
  console.log("Claiming vested tokens...");
  const txVesting = await Contract.claimVested();
  await txVesting.wait();
  console.log("Vested tokens claimed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
