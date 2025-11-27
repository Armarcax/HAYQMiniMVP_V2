async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // --- Deploy MiniMVP ---
  const HAYQMiniMVP = await ethers.getContractFactory("HAYQMiniMVP");
  const mini = await HAYQMiniMVP.deploy();
  await mini.deployed();
  console.log("MiniMVP deployed to:", mini.address);

  // --- Deploy HAYQ ---
  const HAYQ = await ethers.getContractFactory("HAYQ");
  const hayq = await HAYQ.deploy();
  await hayq.deployed();
  console.log("HAYQ deployed to:", hayq.address);

  // --- Initialize HAYQ (upgradeable style) ---
  await hayq.initialize(mini.address, ethers.constants.AddressZero);
  console.log("HAYQ initialized with MiniMVP at:", mini.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
