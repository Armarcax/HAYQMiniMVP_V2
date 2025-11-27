// scripts/registerModules.cjs
const { ethers } = require("hardhat");

const registryAddress = "0xe0E4126c92De0C69bc69FEd3BeeE5072528E8661"; // փոխիր քո հասցեով

const modules = {
  HAYQ_TOKEN: ["0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83", true],
  VESTING_VAULT: ["0x45615F3D52262ba7F16d7E0182893492F1752baB", true],
  STAKING: ["0x054f0CD967656df38853b61E3804Ba4fa7783bA8", true],
  DIVIDEND_TRACKER: ["0x2837077b63f8C2681b1eb0D5a776E638BA028e58", true],
  MOCK_ORACLE: ["0x4f562cc34dd3b4C61f691B643BA6aA24a788d689", true],
  MULTISIG: ["0x88B60b88B1F1667C13926d9F97E081069E3e65bD", true],
  MOCK_ROUTER: ["0x7Bb6CB46524b47205124C9AAD86eE5ccBCE73c6c", false],
  MOCK_ERC20: ["0x2136D92B222650821676eA17078D420dcCe00a3C", false],
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Using deployer: ${deployer.address}`);

  const registry = await ethers.getContractAt("RegistryUpgradeable", registryAddress);

  for (const [name, [address, upgradable]] of Object.entries(modules)) {
    const key = ethers.id(name);
    const existing = await registry.getModule(key);
    if (existing === ethers.ZeroAddress) {
      const tx = await registry.registerModule(key, address);
      await tx.wait();
      console.log(`✅ Registered ${name} (${upgradable ? "Upgradeable" : "Static"})`);
    } else {
      console.log(`ℹ️ ${name} already registered at ${existing}`);
    }
  }

  console.log("\n🔍 Registry synchronized successfully.");
}

main().catch(console.error);
