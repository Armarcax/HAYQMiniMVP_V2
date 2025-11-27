const { ethers } = require("hardhat");

async function main() {
  const [funder] = await ethers.getSigners();
  const to = "0x928677743439e4dA4108c4025694B2F3d3b2745c";

  console.log("Sending from:", funder.address, "to:", to);

  // Ստուգել հաշվեհամարի հաշվեհամարը
  const balance = await ethers.provider.getBalance(funder.address);
  console.log("Funder balance:", ethers.formatEther(balance), "ETH");

  const amount = ethers.parseEther("0.01"); // ⚠️ Ուղարկեք փոքր գումար (10 ETH շատ է լոկալ ցանցում)

  if (balance < amount) {
    throw new Error("Not enough ETH in funder account!");
  }

  const tx = await funder.sendTransaction({
    to,
    value: amount,
  });

  await tx.wait();
  console.log("✅ Sent", ethers.formatEther(amount), "ETH to", to);
}

main().catch((err) => {
  console.error("Transaction failed:", err);
  process.exit(1);
});