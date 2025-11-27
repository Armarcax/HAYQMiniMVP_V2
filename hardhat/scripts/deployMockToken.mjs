import pkg from "hardhat";
const { ethers, upgrades } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`🚀 Deploying with: ${deployer.address}`);

  const MockERC20 = await ethers.getContractFactory("MockERC20Upgradeable");
  const instance = await upgrades.deployProxy(
    MockERC20,
    ["MockToken", "MCK", ethers.parseUnits("1000000", 18)],
    { initializer: "initialize" }
  );
  
  await instance.waitForDeployment();
  console.log(`✅ MockERC20 deployed at: ${await instance.getAddress()}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
