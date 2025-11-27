const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🔹 Deploying contracts with account:", deployer.address);

    // 1. Deploy HAYQMiniMVP
    const MiniMVP = await hre.ethers.getContractFactory("HAYQMiniMVP");
    const miniMVP = await MiniMVP.deploy();
    await miniMVP.deployed();
    console.log("✅ MiniMVP deployed at:", miniMVP.address);

    // 2. Deploy MockRouter
    const MockRouter = await hre.ethers.getContractFactory("MockRouter");
    const router = await MockRouter.deploy();
    await router.deployed();
    console.log("✅ MockRouter deployed at:", router.address);

    // 3. Deploy HAYQ main contract
    const HAYQ = await hre.ethers.getContractFactory("HAYQ");
    const hayq = await HAYQ.deploy(router.address, miniMVP.address);
    await hayq.deployed();
    console.log("✅ HAYQ deployed at:", hayq.address);

    console.log("\n🎉 Deployment completed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
