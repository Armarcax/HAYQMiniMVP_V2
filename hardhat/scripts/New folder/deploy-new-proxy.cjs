// deploy-new-proxy.cjs
require('dotenv').config();
const { ethers, upgrades } = require("hardhat");

async function main() {
    const HAYQ = await ethers.getContractFactory("HAYQMiniMVP");
    const initialSupply = 1000; // օրինակ
    const routerAddress = process.env.ROUTER_ADDRESS || "0x0000000000000000000000000000000000000000";

    console.log("📦 Deploying new proxy (HAYQMiniMVP)...");
    const proxy = await upgrades.deployProxy(HAYQ, [initialSupply, routerAddress], { initializer: "initialize" });

    await proxy.deployed();
    console.log("✅ Proxy deployed at:", proxy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
