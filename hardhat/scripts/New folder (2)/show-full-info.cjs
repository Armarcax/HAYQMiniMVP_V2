// scripts/show-full-info.cjs
const hre = require("hardhat");
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
require("dotenv").config();

(async () => {
  try {
    const provider = new hre.ethers.JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    );

    const PROXY_ADDRESS = process.env.VESTING_VAULT;
    const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;

    console.log("🔍 Proxy address:", PROXY_ADDRESS);

    // Implementation address
    const implAddress = await getImplementationAddress(provider, PROXY_ADDRESS);
    console.log("✅ Implementation address:", implAddress);

    // Proxy Admin address (EIP-1967 slot)
    const adminSlot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

    // v6 շտկում՝ օգտագործելով provider.send
    const adminRaw = await provider.send("eth_getStorageAt", [PROXY_ADDRESS, adminSlot, "latest"]);
    const adminAddress = hre.ethers.getAddress("0x" + adminRaw.slice(-40));
    console.log("👑 Proxy Admin:", adminAddress);

    // Token address
    if (TOKEN_ADDRESS) console.log("💰 Token address:", TOKEN_ADDRESS);

    // Proxy bytecode length
    const code = await provider.getCode(PROXY_ADDRESS);
    console.log("📦 Proxy bytecode length:", code.length);

  } catch (err) {
    console.error("💥 Error:", err);
  }
})();
