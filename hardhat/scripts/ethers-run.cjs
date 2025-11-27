// scripts/ethers-run.cjs
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Wallet:", deployer.address);

  const HAYQ = await ethers.getContractAt("HAYQMiniMVP", process.env.HAYQ_ADDRESS);
  const balance = await HAYQ.balanceOf(deployer.address);
  console.log("HAYQ Balance:", ethers.formatUnits(balance, 18));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
