// scripts/check-owner.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = hre.ethers.provider;
  const wallet = new hre.ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

  const proxy = process.env.HAYQ_CONTRACT_ADDRESS;
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", proxy);

  const contractOwner = await hayq.owner();
  console.log("Contract owner():", contractOwner);
  console.log("Using signer:", wallet.address);

  if (contractOwner.toLowerCase() === wallet.address.toLowerCase()) {
    console.log("✅ You are the owner — good to proceed.");
  } else {
    console.log("❌ Not owner. To proceed either use the real owner private key, or change contract ownership first.");
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
