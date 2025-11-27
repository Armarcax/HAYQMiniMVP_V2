// scripts/authorize.js
const hre = require("hardhat");
const { ethers, upgrades } = hre;

async function main() {
  // Proxy contract address
  const proxyAddress = "0x7B7B1bb59224FE394680cbB1435db1f3A14a6F3F";

  // Ունենալու դեպքում հասցեներ, որոնք պետք է authorize անենք
  const addressesToAuthorize = [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c"
    // ավելացրու այլ հասցեներ, եթե կան
  ];

  console.log("🚀 Fetching proxy contract...");

  // Ստանալ proxy instance (TransparentUpgradeableProxy)
  const proxyAbi = [
    "function admin() view returns (address)"
  ];
  const proxy = new ethers.Contract(proxyAddress, proxyAbi, ethers.provider);

  // Քայլը՝ ստանալ implementation address (եթե ERC1967 compliant է)
  let implAddress = null;
  try {
    implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("🧩 Implementation address:", implAddress);
  } catch (err) {
    console.warn("⚠️ Cannot fetch implementation via upgrades. Fallback to proxy address.");
    implAddress = proxyAddress; // fallback՝ ուղղակի proxy
  }

  // Ստանալ vesting contract instance
  const vesting = await ethers.getContractAt("VestingVaultUpgradeable", implAddress);

  // Authorize բոլոր հասցեներին
  for (const addr of addressesToAuthorize) {
    console.log(`🔑 Authorizing: ${addr}`);
    const tx = await vesting.setAuthorized(addr, true);
    await tx.wait();
    console.log(`✅ Authorized: ${addr}`);
  }

  console.log("🎉 All addresses authorized!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
