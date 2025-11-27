import hre from "hardhat";

async function main() {
  // Ստանում ենք նոր owner-ի հասցեն .env-ից
  const newOwner = process.env.NEW_OWNER_ADDRESS;
  if (!newOwner) {
    throw new Error("❌ NEW_OWNER_ADDRESS not set in .env");
  }

  // Ստանում ենք proxy contract-ի հասցեն .env-ից
  const proxyAddress = process.env.HAYQ_CONTRACT_ADDRESS;
  if (!proxyAddress) {
    throw new Error("❌ HAYQ_CONTRACT_ADDRESS not set in .env");
  }

  // Ստանում ենք signer՝ հին owner-ի private key-ով
  const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, hre.ethers.provider);

  // Վերցնում ենք կոնտրակտը
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", proxyAddress, signer);

  console.log("Current owner:", await hayq.owner());
  console.log("Using signer:", signer.address);
  console.log("Transferring ownership to:", newOwner);

  // Կոչում ենք transferOwnership
  const tx = await hayq.transferOwnership(newOwner);
  await tx.wait();

  console.log("✅ Ownership transferred!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
