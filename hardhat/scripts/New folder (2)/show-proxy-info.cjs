// scripts/show-proxy-info.cjs
const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

(async () => {
  try {
    // Այս հասցեն փոխիր ձեր Proxy contract հասցեով
    const proxyAddress = process.env.PROXY_ADDRESS || "0x45615F3D52262ba7F16d7E0182893492F1752baB";
    
    console.log("🔍 Proxy address:", proxyAddress);

    // Implementation հասցե ստանալու համար
    const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("✅ Implementation address:", implAddress);

    // Proxy Admin հասցե ստանալու համար
    const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
    console.log("👑 Proxy Admin:", adminAddress);

    // Proxy-ի bytecode ստուգելու համար
    const code = await ethers.provider.getCode(proxyAddress);
    console.log("📦 Proxy bytecode length:", code.length);

  } catch (err) {
    console.error("💥 Error:", err);
  }
})();
