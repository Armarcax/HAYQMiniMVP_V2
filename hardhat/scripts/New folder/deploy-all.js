import hre from "hardhat";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const network = hre.network.name;
    console.log(`\nDeploying contracts to network: ${network}\n`);

    const addresses = {};

    // --- Deploy MockERC20 for rewards ---
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20Upgradeable");
    const rewardToken = await hre.upgrades.deployProxy(MockERC20, ["Reward Token", "RWD", hre.ethers.parseUnits("1000000", 18)], { initializer: 'initialize' });
    await rewardToken.deployed();
    console.log("✅ Reward Token deployed at:", rewardToken.address);
    addresses.REWARD_TOKEN_ADDRESS = rewardToken.address;

    // --- Deploy MockRouter ---
    const MockRouter = await hre.ethers.getContractFactory("MockRouter");
    const router = await MockRouter.deploy();
    await router.deployed();
    console.log("✅ MockRouter deployed at:", router.address);
    addresses.MOCK_ROUTER_ADDRESS = router.address;

    // --- Deploy HAYQMiniMVP ---
    const HAYQMiniMVP = await hre.ethers.getContractFactory("HAYQMiniMVP");
    const hayq = await hre.upgrades.deployProxy(HAYQMiniMVP, [hre.ethers.parseUnits("1000000", 18), router.address], { initializer: 'initialize' });
    await hayq.deployed();
    console.log("✅ HAYQMiniMVP deployed at:", hayq.address);
    addresses.HAYQ_ADDRESS = hayq.address;

    // --- Deploy VestingVault ---
    const VestingVault = await hre.ethers.getContractFactory("VestingVaultUpgradeable");
    const vestingVault = await hre.upgrades.deployProxy(VestingVault, [hayq.address, hayq.address], { initializer: 'initialize' });
    await vestingVault.deployed();
    console.log("✅ VestingVault deployed at:", vestingVault.address);
    addresses.VESTING_VAULT_ADDRESS = vestingVault.address;

    // --- Set vesting vault in HAYQMiniMVP ---
    const hayqWithSigner = await hre.ethers.getContractAt("HAYQMiniMVP", hayq.address);
    await hayqWithSigner.setVestingVault(vestingVault.address);
    console.log("✅ HAYQMiniMVP updated with vestingVault address");

    // --- Export addresses to JSON and .env ---
    fs.writeFileSync(`./deployed-addresses-${network}.json`, JSON.stringify(addresses, null, 2));
    console.log(`\n✅ Addresses exported to deployed-addresses-${network}.json`);

    // Optional: append/update .env file
    const envLines = Object.entries(addresses).map(([key, value]) => `${key}=${value}`).join("\n") + "\n";
    fs.appendFileSync('.env', envLines);
    console.log("✅ Addresses appended to .env\n");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
