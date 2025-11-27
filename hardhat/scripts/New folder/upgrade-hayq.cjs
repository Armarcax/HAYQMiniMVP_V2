import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  const newImpl = process.env.IMPLEMENTATION_ADDRESS;
  const newOwner = process.env.NEW_OWNER_ADDRESS;

  if (!proxyAddress || !newImpl) {
    throw new Error("Missing PROXY_ADDRESS or IMPLEMENTATION_ADDRESS in .env");
  }

  console.log("🚀 Upgrading HAYQ MiniMVP Proxy...");
  
  const HayqFactory = await ethers.getContractFactory("HAYQMiniMVP");
  
  const upgraded = await upgrades.upgradeProxy(proxyAddress, HayqFactory, {
    call: { fn: 'initialize', args: [0, ethers.constants.AddressZero] } // ոչ թե առաջին անգամ initialize
  });

  console.log("✅ Upgrade tx sent. Address:", upgraded.address);

  // Owner transfer if needed
  const currentOwner = await upgraded.owner();
  if (currentOwner.toLowerCase() !== newOwner.toLowerCase()) {
    console.log(`🔑 Transferring ownership from ${currentOwner} to ${newOwner}...`);
    const tx = await upgraded.transferOwnership(newOwner);
    await tx.wait();
    console.log("✅ Ownership transferred.");
  }

  console.log("🎯 Upgrade script completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
