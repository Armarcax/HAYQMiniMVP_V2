const hre = require("hardhat");

async function main() {
    const [deployer, user] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy HAYQMiniMVP
    const Mini = await hre.ethers.getContractFactory("HAYQMiniMVP");
    const mini = await Mini.deploy();
    await mini.deployed();
    console.log("✅ MiniMVP deployed at:", mini.address);

    // Deploy MockRouter
    const Router = await hre.ethers.getContractFactory("MockRouter");
    const router = await Router.deploy();
    await router.deployed();
    console.log("✅ MockRouter deployed at:", router.address);

    // Deploy main HAYQ
    const HAYQ = await hre.ethers.getContractFactory("HAYQ");
    const hayq = await HAYQ.deploy(router.address, mini.address);
    await hayq.deployed();
    console.log("✅ HAYQ deployed at:", hayq.address);

    // Mint some Mini tokens for testing
    const mintAmount = hre.ethers.utils.parseEther("1000");
    await hayq.mintMiniTokens(user.address, mintAmount);
    console.log(`✅ Minted ${hre.ethers.utils.formatEther(mintAmount)} Mini tokens to`, user.address);

    // Send some ETH to user for testing swap
    const tx = await deployer.sendTransaction({
        to: user.address,
        value: hre.ethers.utils.parseEther("10")
    });
    await tx.wait();
    console.log("✅ Sent 10 ETH to", user.address);

    console.log("🎉 Deployment finished! You can now interact with HAYQ and MiniMVP locally.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
