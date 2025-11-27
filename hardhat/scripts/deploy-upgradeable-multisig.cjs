const { ethers, upgrades } = require("hardhat");

async function main() {
  const MultiSig = await ethers.getContractFactory("MultiSigTimelockUpgradeable");

  const owners = [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    "0x538d6965C48BF85379328585bbA482E574b0Ed59"
  ];
  const required = 2;

  const multisig = await upgrades.deployProxy(
    MultiSig,
    [owners, required],
    { initializer: "initialize" }
  );

  await multisig.waitForDeployment();
  console.log("✅ MultiSigTimelockUpgradeable deployed to:", await multisig.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
