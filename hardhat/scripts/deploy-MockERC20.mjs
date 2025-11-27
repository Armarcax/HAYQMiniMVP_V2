import pkg from "hardhat";
const { ethers, upgrades } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`💼 Deploying with wallet: ${deployer.address}`);

  const name = "MockToken";
  const symbol = "MOCK";
  const initialSupply = ethers.parseUnits("1000000", 18); // 1 million tokens

  const TokenFactory = await ethers.getContractFactory("MockERC20Upgradeable");

  console.log("🚀 Deploying upgradeable MockERC20...");
  const mockToken = await upgrades.deployProxy(
    TokenFactory,
    [name, symbol, initialSupply],
    { initializer: "initialize" }
  );

  await mockToken.waitForDeployment();
  const address = await mockToken.getAddress();
  console.log(`✅ MockERC20Upgradeable deployed at: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
