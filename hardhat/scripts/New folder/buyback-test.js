// scripts/buyback-test.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83");
  const contractAddress = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";

  // 1. Ստուգել պայմանագրի բալանսը
  const contractBalance = await hayq.balanceOf(contractAddress);
  console.log("Contract HAYQ balance before transfer:", hre.ethers.formatUnits(contractBalance, 18));

  // 2. Եթե պայմանագրի մեջ քիչ է, փոխանցել
  if (contractBalance < hre.ethers.parseUnits("10", 18)) {
    console.log("Transferring 100 HAYQ to contract for buyback...");
    const tx = await hayq.transfer(contractAddress, hre.ethers.parseUnits("100", 18));
    await tx.wait();
    console.log("✅ Transfer completed");
  }

  // 3. Կատարել buyback
  const tokenAmount = hre.ethers.parseUnits("10", 18); // 10 HAYQ
  const minOut = 0;

  console.log("Executing buyback: swapping 10 HAYQ for WETH...");
  const tx2 = await hayq.buyback(tokenAmount, minOut);
  await tx2.wait();

  console.log("✅ Buyback completed!");
}

main();