const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { run } = hre;

async function main() {
  const PROXY_ADDRESS = process.env.VESTING_VAULT; // Proxy contract
  const IMPLEMENTATION_ADDRESS = process.env.VESTING_IMPL; // Implementation contract
  const FLAT_FILE_PATH = path.join(__dirname, "../flat/HAYQMiniMVP_flat.sol");
  const CONTRACT_NAME = "HAYQMiniMVP"; // Contract name inside flat file

  // 1️⃣ Ստուգում ենք, որ flat ֆայլը կա
  if (!fs.existsSync(FLAT_FILE_PATH)) {
    console.error(`❌ Flat file not found: ${FLAT_FILE_PATH}`);
    process.exit(1);
  }
  console.log(`📄 Flat file found: ${FLAT_FILE_PATH}`);

  // 2️⃣ Վերիֆիկացնում ենք Implementation-ն, force
  console.log(`🔍 Verifying implementation: ${IMPLEMENTATION_ADDRESS}`);
  try {
    await run("verify:verify", {
      address: IMPLEMENTATION_ADDRESS,
      contract: `flat/HAYQMiniMVP_flat.sol:${CONTRACT_NAME}`,
      constructorArguments: [],
      force: true,
    });
    console.log(`✅ Implementation verified successfully!`);
  } catch (err) {
    console.warn(`⚠️ Implementation verification warning: ${err.message}`);
  }

  // 3️⃣ Վերիֆիկացնում և link-ում ենք Proxy-ն
  console.log(`🔗 Verifying and linking proxy: ${PROXY_ADDRESS}`);
  try {
    const proxy = await run("verify:verify", {
      address: PROXY_ADDRESS,
      constructorArguments: [IMPLEMENTATION_ADDRESS, process.env.PROXY_ADMIN || "0x0000000000000000000000000000000000000000", "0x"], // TransparentUpgradeableProxy constructor
    });
    console.log(`✅ Proxy verified and linked!`);
  } catch (err) {
    console.warn(`⚠️ Proxy verification warning: ${err.message}`);
  }

  // 4️⃣ ProxyAdmin վերիֆիկացիա (եթե ուզում ես)
  if (process.env.PROXY_ADMIN) {
    console.log(`👑 Verifying ProxyAdmin: ${process.env.PROXY_ADMIN}`);
    try {
      await run("verify:verify", {
        address: process.env.PROXY_ADMIN,
      });
      console.log(`✅ ProxyAdmin verified!`);
    } catch (err) {
      console.warn(`⚠️ ProxyAdmin verification warning: ${err.message}`);
    }
  }

  console.log("🎉 Verification process finished!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
