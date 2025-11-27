// scripts/verifyAllProxies.mjs
import pkg from "hardhat";
const { ethers, upgrades, run } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`💼 Deployer wallet: ${deployer.address}`);

  // Ահա բոլոր կոնտրակտները ու proxy-ների հասցեներն այստեղ
  const contracts = [
    {
      name: "Erc20DividendTrackerUpgradeable",
      proxy: process.env.DIVIDEND_TRACKER_PROXY || "0x2837077b63f8C2681b1eb0D5a776E638BA028e58"
    },
    {
      name: "MockERC20Upgradeable",
      proxy: process.env.MOCK_ERC20_PROXY || "0x2136D92B222650821676eA17078D420dcCe00a3C"
    },
    {
      name: "MockOracleUpgradeable",
      proxy: process.env.MOCK_ERC20_PROXY || "0x37774e305b298aaA32f5bE84052C5B36F21f5a68"
    },
    {
      name: "MockRouterUpgradeable",
      proxy: process.env.MOCK_ERC20_PROXY || "0x7Bb6CB46524b47205124C9AAD86eE5ccBCE73c6c"
    },
    {
      name: "MultiSigTimelockUpgradeable",
      proxy: process.env.MOCK_ERC20_PROXY || "0xa1Bbf04d7ED7a64eE4E4324259AB31E01bEAf0BA"
    },// Այստեղ ավելացրու մնացած proxy կոնտրակտները
  ];

  for (const c of contracts) {
    console.log(`\n🏦 Proxy contract: ${c.proxy}`);
    let implAddress;

    try {
      implAddress = await upgrades.erc1967.getImplementationAddress(c.proxy);
      console.log(`💡 Implementation contract address: ${implAddress}`);
    } catch (e) {
      console.warn("⚠️ Չհաջողվեց գտնել implementation: ", e.message);
      continue;
    }

    // Վերիֆիկացնում ենք implementation
    console.log(`🔹 Verifying implementation contract...`);
    try {
      await run("verify:verify", {
        address: implAddress,
        constructorArguments: []
      });
      console.log(`✅ Implementation verified!`);
    } catch (err) {
      console.warn("⚠️ Implementation verification error: ", err.message);
    }

    // Վերիֆիկացնում ենք proxy
    console.log(`🔹 Verifying proxy contract...`);
    try {
      await run("verify:verify", {
        address: c.proxy,
        constructorArguments: [],
      });
      console.log(`✅ Proxy verified!`);
    } catch (err) {
      console.warn("⚠️ Proxy verification error: ", err.message);
    }
  }

  // Վերիֆիկացնում ենք ProxyAdmin
  const proxyAdminAddress = await upgrades.admin.getInstance();
  console.log(`🔧 ProxyAdmin contract: ${proxyAdminAddress.address}`);
  try {
    await run("verify:verify", {
      address: proxyAdminAddress.address,
      constructorArguments: [],
    });
    console.log(`✅ ProxyAdmin verified!`);
  } catch (err) {
    console.warn("⚠️ ProxyAdmin verification error: ", err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
