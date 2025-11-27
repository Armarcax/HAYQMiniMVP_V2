const path = require("path");
const dotenv = require("dotenv");
const { ethers, upgrades } = require("hardhat");

// 1️⃣ Load .env (update path if needed)
const ENV_PATH = path.join(__dirname, "../.env");
const result = dotenv.config({ path: ENV_PATH });
if (result.error) {
  console.error("⚠️ Could not load .env file:", ENV_PATH);
  process.exit(1);
}

// 2️⃣ Read env variables
const {
  PROXY,                 // Optional: existing HAYQ proxy to upgrade
  REWARD_TOKEN_NAME,
  REWARD_TOKEN_SYMBOL,
  REWARD_TOKEN_SUPPLY,
  USER1,
  USER2
} = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // --- 1️⃣ Deploy Mocks ---
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const oracle = await MockOracle.deploy(1000); // initial price
  await oracle.deployed();

  const MockRouter = await ethers.getContractFactory("MockRouter");
  const router = await MockRouter.deploy();
  await router.deployed();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const rewardToken = await upgrades.deployProxy(
    MockERC20,
    [
      REWARD_TOKEN_NAME || "Reward Token",
      REWARD_TOKEN_SYMBOL || "RWD",
      ethers.parseUnits(REWARD_TOKEN_SUPPLY || "1000000", 18)
    ],
    { initializer: "initialize" }
  );
  await rewardToken.waitForDeployment();
  console.log("Reward token deployed:", rewardToken.target || rewardToken.address);

  // --- 2️⃣ Deploy VestingVault ---
  const VestingVault = await ethers.getContractFactory("VestingVault");
  const vestingVault = await VestingVault.deploy(rewardToken.target || rewardToken.address);
  await vestingVault.deployed();

  // --- 3️⃣ Deploy DividendTracker (Upgradeable) ---
  const DividendTracker = await ethers.getContractFactory("Erc20DividendTrackerUpgradeable");
  const dividendTracker = await upgrades.deployProxy(DividendTracker, [rewardToken.target || rewardToken.address, ethers.constants.AddressZero], { initializer: "initialize" });
  await dividendTracker.waitForDeployment();

  // --- 4️⃣ Deploy HAYQ (UUPS Proxy or upgrade if PROXY set) ---
  const HAYQ = await ethers.getContractFactory("HAYQ");
  let hayq;
  if (PROXY) {
    console.log("Upgrading existing proxy:", PROXY);
    hayq = await upgrades.upgradeProxy(PROXY, HAYQ);
  } else {
    hayq = await upgrades.deployProxy(HAYQ, [ethers.constants.AddressZero, ethers.constants.AddressZero, ethers.constants.AddressZero, ethers.constants.AddressZero], { initializer: "initialize", kind: "uups" });
  }
  await hayq.waitForDeployment();
  console.log("HAYQ deployed at:", hayq.target || hayq.address);

  // --- 5️⃣ Wire modules ---
  await hayq.setRouter(router.address);
  await hayq.setOracle(oracle.address);
  await hayq.setVestingVault(vestingVault.address);
  await hayq.setDividendTracker(dividendTracker.target || dividendTracker.address);

  // --- 6️⃣ Fix VestingVault HAYQ token ---
  if (vestingVault.setToken) await vestingVault.setToken(hayq.target || hayq.address);
  if (vestingVault.setHAYQ) await vestingVault.setHAYQ(hayq.target || hayq.address);

  // --- 7️⃣ Fix DividendTracker HAYQ token ---
  if (dividendTracker.setHayqToken) await dividendTracker.setHayqToken(hayq.target || hayq.address);

  // --- 8️⃣ Mint HAYQ tokens to test accounts ---
  const user1Address = USER1 || deployer.address;
  const user2Address = USER2 || deployer.address;

  await hayq.mint(user1Address, ethers.parseUnits("1000", 18));
  await hayq.mint(user2Address, ethers.parseUnits("500", 18));
  console.log(`Minted HAYQ: 1000 to ${user1Address}, 500 to ${user2Address}`);

  // --- 9️⃣ User1 stakes 200 HAYQ ---
  await hayq.connect(deployer).approve(hayq.target || hayq.address, ethers.parseUnits("1000", 18));
  await hayq.stake(ethers.parseUnits("200", 18));
  console.log("Deployer staked 200 HAYQ");

  // --- 🔟 Lock 100 HAYQ in VestingVault ---
  const now = Math.floor(Date.now() / 1000);
  await hayq.lockTokens(ethers.parseUnits("100", 18), now, 86400);
  console.log("Locked 100 HAYQ in vesting vault for 1 day");

  // --- 11️⃣ Distribute dividends ---
  await rewardToken.mint(deployer.address, ethers.parseUnits("10000", 18));
  await rewardToken.approve(dividendTracker.target || dividendTracker.address, ethers.parseUnits("50", 18));
  await dividendTracker.distributeDividends(ethers.parseUnits("50", 18));
  console.log("Distributed 50 reward tokens as dividends");

  // --- 12️⃣ Withdraw dividends ---
  await dividendTracker.withdrawDividend();
  console.log("Deployer withdrew dividends");

  // --- 13️⃣ Oracle price ---
  const price = await hayq.getLatestPrice();
  console.log("Oracle latest price:", price.toString());

  console.log("✅ All flows executed successfully!");
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
