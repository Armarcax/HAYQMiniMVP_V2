// scripts/getImplementation.mjs
import pkg from "hardhat";
const { ethers, upgrades } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const proxyAddress =
    process.env.MOCK_ERC20_PROXY ||
    "0x2136D92B222650821676eA17078D420dcCe00a3C";

  console.log(`🏦 Proxy contract: ${proxyAddress}`);

  // OpenZeppelin Hardhat Upgrades plugin օգտագործելով
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log(`💡 Implementation contract address: ${implAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
