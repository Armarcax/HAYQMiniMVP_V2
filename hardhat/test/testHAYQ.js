const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // --- 1️⃣ Deploy Mocks ---
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const oracle = await MockOracle.deploy(1000); // initial price
  await oracle.deployed();

  const MockRouter = await ethers.getContractFactory("MockRouter");
  const router = await MockRouter.deploy();
  await router.deployed();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const hayqTokenMock = await MockERC20.deploy("HAYQ Token", "HAYQ", ethers.parseUnits("1000000", 18));
  await hayqTokenMock.deployed();

  // --- 2️⃣ Deploy VestingVault ---
  const VestingVault = await ethers.getContractFactory("VestingVault");
  const vestingVault = await VestingVault.deploy(hayqTokenMock.address);
  await vestingVault.deployed();

  // --- 3️⃣ Deploy DividendTracker (upgradeable) ---
  const DividendTracker = await ethers.getContractFactory("Erc20DividendTrackerUpgradeable");
  const dividendTracker = await upgrades.deployProxy(DividendTracker, [hayqTokenMock.address, ethers.constants.AddressZero], { initializer: "initialize" });
  await dividendTracker.waitForDeployment();

  // --- 4️⃣ Deploy HAYQ via UUPS proxy ---
  const HAYQ = await ethers.getContractFactory("HAYQ");
  const hayq = await upgrades.deployProxy(HAYQ, [ethers.constants.AddressZero, ethers.constants.AddressZero, ethers.constants.AddressZero, ethers.constants.AddressZero], { initializer: "initialize", kind: "uups" });
  await hayq.waitForDeployment();

  // --- 5️⃣ Wire modules ---
  await hayq.setRouter(router.address);
  await hayq.setOracle(oracle.address);
  await hayq.setVestingVault(vestingVault.address);
  await hayq.setDividendTracker(dividendTracker.target || dividendTracker.address);

  // --- 6️⃣ Set HAYQ token in VestingVault ---
  if (vestingVault.setToken) await vestingVault.setToken(hayq.target || hayq.address);
  if (vestingVault.setHAYQ) await vestingVault.setHAYQ(hayq.target || hayq.address);

  // --- 7️⃣ Set HAYQ token in DividendTracker ---
  if (dividendTracker.setHayqToken) await dividendTracker.setHayqToken(hayq.target || hayq.address);

  // --- 8️⃣ Mint tokens ---
  const mintAmount = ethers.parseUnits("1000", 18);
  await hayq.mint(user1.address, mintAmount);
  console.log("Minted 1000 HAYQ to user1");

  // --- 9️⃣ User1 stakes 200 HAYQ ---
  await hayq.connect(user1).approve(hayq.target || hayq.address, ethers.parseUnits("1000", 18));
  await hayq.connect(user1).stake(ethers.parseUnits("200", 18));
  console.log("User1 staked 200 HAYQ");

  // --- 🔟 User1 locks 100 HAYQ in VestingVault ---
  const now = Math.floor(Date.now() / 1000);
  await hayq.connect(user1).lockTokens(ethers.parseUnits("100", 18), now, 86400);
  console.log("User1 locked 100 HAYQ for 1 day");

  // --- 11️⃣ Distribute dividends ---
  await hayq.mint(deployer.address, ethers.parseUnits("1000", 18)); // owner needs some tokens
  await hayq.connect(deployer).approve(dividendTracker.target || dividendTracker.address, ethers.parseUnits("50", 18));
  await dividendTracker.connect(deployer).distributeDividends(ethers.parseUnits("50", 18));
  console.log("Distributed 50 HAYQ as dividends");

  // --- 12️⃣ User1 withdraws dividends ---
  await dividendTracker.connect(user1).withdrawDividend();
  console.log("User1 withdrew dividends");

  // --- 13️⃣ Get latest price ---
  const price = await hayq.getLatestPrice();
  console.log("Oracle latest price:", price.toString());
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
