const { upgrades, ethers } = require("hardhat");

async function main() {
  const implAddress = await upgrades.erc1967.getImplementationAddress(
    "0x88B60b88B1F1667C13926d9F97E081069E3e65bD"
  );

  console.log("🧠 Implementation Address:", implAddress);

  await hre.run("verify:verify", {
    address: implAddress,
    constructorArguments: [],
  });

  console.log("✅ Verification complete on Etherscan!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
