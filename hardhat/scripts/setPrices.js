const { ethers } = require("hardhat");

async function main() {
  const proxyAddress = "0x4f562cc34dd3b4C61f691B643BA6aA24a788d689"; // MockOracleV2 proxy
  const MockOracleV2 = await ethers.getContractFactory("MockOracleV2");
  const oracle = MockOracleV2.attach(proxyAddress);

  const symbols = {
    "BTC/USD": 68000,
    "ETH/USD": 4200,
    "ADA/USD": 1.25,
    "SOL/USD": 98
  };

  for (const [symbol, price] of Object.entries(symbols)) {
    await oracle.setPrice(symbol, price);
    console.log(`✅ Updated ${symbol} to ${price}`);
  }

  for (const symbol of Object.keys(symbols)) {
    const value = await oracle.getPrice(symbol);
    console.log(`🔹 ${symbol} = ${value}`);
  }
}

main().catch(console.error);
