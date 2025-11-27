import { ethers, upgrades } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // --- 1. Deploy Dividend Trackers ---
    const Erc20Tracker = await ethers.getContractFactory("Erc20DividendTrackerUpgradeable");
    const erc20Tracker = await upgrades.deployProxy(Erc20Tracker, [/* rewardToken */ deployer.address, /* hayqToken */ deployer.address], { initializer: "initialize" });
    await erc20Tracker.deployed();
    console.log("ERC20 Dividend Tracker deployed at:", erc20Tracker.address);

    const EthTracker = await ethers.getContractFactory("EthDividendTrackerUpgradeable");
    const ethTracker = await upgrades.deployProxy(EthTracker, [deployer.address], { initializer: "initialize" });
    await ethTracker.deployed();
    console.log("ETH Dividend Tracker deployed at:", ethTracker.address);

    // --- 2. Deploy HAYQ ---
    const HAYQ = await ethers.getContractFactory("HAYQ");
    const hayq = await upgrades.deployProxy(HAYQ, [ethers.constants.AddressZero, ethers.constants.AddressZero], { initializer: "initialize" });
    await hayq.deployed();
    console.log("HAYQ deployed at:", hayq.address);

    // --- 3. Connect dividend trackers to HAYQ ---
    await hayq.setDividendTrackerERC20(erc20Tracker.address);
    await hayq.setDividendTrackerETH(ethTracker.address);
    console.log("Connected dividend trackers to HAYQ.");

    // --- 4. Copy ABIs for frontend ---
    const abisDir = path.join(__dirname, "..", "frontend", "src", "abis");
    if (!fs.existsSync(abisDir)) fs.mkdirSync(abisDir, { recursive: true });

    const contracts = [
        { name: "HAYQ", contract: hayq },
        { name: "Erc20DividendTrackerUpgradeable", contract: erc20Tracker },
        { name: "EthDividendTrackerUpgradeable", contract: ethTracker }
    ];

    for (const c of contracts) {
        const artifact = await ethers.getContractFactory(c.name);
        const artifactJson = await artifact.deployTransaction.wait();
        const abiPath = path.join(abisDir, `${c.name}.json`);
        fs.writeFileSync(abiPath, JSON.stringify(artifact.interface.format(ethers.FormatTypes.json), null, 2));
        console.log("ABI written for:", c.name);
    }

    console.log("All contracts deployed and ABIs copied successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
