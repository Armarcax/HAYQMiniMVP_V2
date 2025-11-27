require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

async function main() {
    const hayqProxy = process.env.HAYQ_PROXY_ADDRESS;
    const vestingProxy = process.env.VESTING_VAULT;
    const hayqTokenAddr = process.env.HAYQ_ADDRESS;
    const recipients = process.env.RECIPIENTS.split(",");

    console.log("===== HAYQ TOKEN =====");
    console.log("Proxy address:", hayqProxy);
    try {
        const proxyAdmin = await upgrades.erc1967.getAdminAddress(hayqProxy);
        const proxyImpl = await upgrades.erc1967.getImplementationAddress(hayqProxy);
        console.log("Proxy admin address:", proxyAdmin);
        console.log("Implementation address:", proxyImpl);
    } catch (err) {
        console.log("Error fetching HAYQ proxy data:", err.message);
    }

    console.log("\n===== VESTING VAULT =====");
    console.log("Proxy address:", vestingProxy);
    try {
        const vestingImpl = await upgrades.erc1967.getImplementationAddress(vestingProxy);
        console.log("Implementation address:", vestingImpl);
    } catch (err) {
        console.log("Error fetching Vesting Vault proxy data:", err.message);
    }

    // Contract instances
    const hayqToken = await ethers.getContractAt("HAYQMiniMVP", hayqProxy);
    const vestingVaultReadable = await ethers.getContractAt("IVestingVaultReadable", vestingProxy);

    console.log("\n===== USER BALANCES =====");
    for (let user of recipients) {
        const staked = await hayqToken.stakedBalanceOf(user);
        const vestedTotal = await vestingVaultReadable.totalVested(user);
        const vestedReleased = await vestingVaultReadable.released(user);
        console.log(`User: ${user}`);
        console.log("  Staked:", staked.toString());
        console.log("  Vesting total:", vestedTotal.toString());
        console.log("  Vesting released:", vestedReleased.toString());
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
