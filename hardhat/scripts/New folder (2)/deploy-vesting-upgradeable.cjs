require('dotenv').config();
const { ethers, upgrades } = require("hardhat");

async function main() {
    const tokenAddress = process.env.HAYQ_ADDRESS;
    const vestingVault = process.env.VESTING_VAULT;
    const beneficiary = process.env.VESTING_BENEFICIARY;
    const vestingAmount = process.env.VESTING_AMOUNT;
    const vestingStart = process.env.VESTING_START;
    const vestingDuration = process.env.VESTING_DURATION;

    if (!tokenAddress || !vestingVault || !beneficiary) {
        throw new Error("Խնդրում ենք ստուգել .env ֆայլը՝ HAYQ_ADDRESS, VESTING_VAULT, VESTING_BENEFICIARY փոփոխականները անհրաժեշտ են");
    }

    console.log("🚀 Upgrading VestingVaultUpgradeable proxy...");

    const VestingVault = await ethers.getContractFactory("VestingVaultUpgradeable");

    // Proxy upgrade
    const vesting = await upgrades.upgradeProxy(vestingVault, VestingVault);

    // Այստեղ չկարողացանք constructor parameters տալ, որովհետև արդեն deployed proxy է
    // Բայց եթե initialization պետք է անել նորով, կարող ենք անել `initialize` call
    // Օրինակ
    // await vesting.initialize(tokenAddress, beneficiary, vestingAmount, vestingStart, vestingDuration);

    console.log("✅ VestingVaultUpgradeable proxy upgraded at:", vestingVault); // արդեն proxy address–ն գիտենք .env–ից
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
