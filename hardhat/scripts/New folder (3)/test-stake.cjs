const { ethers } = require("hardhat");

async function main() {
  const [walletA] = await ethers.getSigners();

  const HAYQ_ADDRESS = process.env.HAYQ_PROXY_ADDRESS;
  const abi = [
    "function balanceOf(address account) public view returns (uint256)"
  ];

  const HAYQ = new ethers.Contract(HAYQ_ADDRESS, abi, walletA);

  const balanceA = await HAYQ.balanceOf(walletA.address);

  if (balanceA === undefined) {
    console.log("⚠️ balanceOf returned undefined — check ABI or contract address");
    return;
  }

  try {
    console.log(`💰 Balance A: ${ethers.formatEther(balanceA)} HAYQ`);
  } catch (e) {
    console.log(`💰 Raw balance: ${balanceA.toString()} (maybe non-18 decimals)`);
  }
}

main().catch((err) => console.error("❌ Error:", err));
