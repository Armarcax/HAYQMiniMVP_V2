const { ethers } = require("hardhat");

const proxyAddress = "0x4f562cc34dd3b4C61f691B643BA6aA24a788d689";

// 50+ սիմվոլների օրինակ
const pricesToSet = {
  "BTC/USD": 68000,
  "ETH/USD": 4200,
  "SOL/USD": 24,
  "ADA/USD": 1.25,
  "XRP/USD": 0.95,
  "DOGE/USD": 0.074,
  "DOT/USD": 18.5,
  "LTC/USD": 150.6,
  "LINK/USD": 7.32,
  "UNI/USD": 6.41,
  "BCH/USD": 240,
  "EOS/USD": 1.1,
  "TRX/USD": 0.065,
  "AVAX/USD": 85.5,
  "ATOM/USD": 24.8,
  "MATIC/USD": 1.15,
  "NEAR/USD": 7.8,
  "FTM/USD": 0.65,
  "AAVE/USD": 65.3,
  "ALGO/USD": 0.33,
  "VET/USD": 0.025,
  "XLM/USD": 0.12,
  "FIL/USD": 5.6,
  "ICP/USD": 35.2,
  "THETA/USD": 1.05,
  "GRT/USD": 0.44,
  "EGLD/USD": 45.7,
  "KSM/USD": 150,
  "DASH/USD": 58.3,
  "ZEC/USD": 55.1,
  "SNX/USD": 6.8,
  "CRV/USD": 2.12,
  "SUSHI/USD": 3.25,
  "BAT/USD": 0.85,
  "MKR/USD": 2700,
  "COMP/USD": 120,
  "YFI/USD": 14000,
  "1INCH/USD": 1.75,
  "ENJ/USD": 0.95,
  "CHZ/USD": 0.15,
  "KNC/USD": 1.05,
  "REN/USD": 0.52,
  "ZRX/USD": 0.60,
  "LRC/USD": 0.38,
  "OMG/USD": 1.15,
  "CEL/USD": 1.10,
  "QTUM/USD": 4.2,
  "ONT/USD": 0.95,
  "IOST/USD": 0.024,
};


const DECIMALS = 8; // Solidity contract-ի decimal precision

async function main() {
  const MockOracleV2 = await ethers.getContractFactory("MockOracleV2");
  const oracle = MockOracleV2.attach(proxyAddress);

  // Initialize proxy եթե դեռ չի արել
  try {
    await oracle.initialize();
    console.log("✅ Proxy initialized successfully!");
  } catch (err) {
    if (err.message.includes("initialized")) {
      console.log("ℹ️ Proxy already initialized, skip.");
    } else {
      throw err;
    }
  }

  // Batch update
  const symbols = Object.keys(pricesToSet);
  const chunkSize = 50; // batch per 50 symbols
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const batch = symbols.slice(i, i + chunkSize);
    console.log(`🚀 Updating batch ${i / chunkSize + 1} with ${batch.length} symbols...`);
    for (const symbol of batch) {
      let value = pricesToSet[symbol];
      // Փոխանցում ենք `BigInt`՝ Solidity-compatible
      const bigValue = ethers.parseUnits(value.toString(), DECIMALS);
      const tx = await oracle.setPrice(symbol, bigValue);
      await tx.wait();
      console.log(`✅ Updated ${symbol} to ${value}`);
    }
  }

  // Ստուգում
  for (const symbol of symbols) {
    const price = await oracle.getPrice(symbol);
    console.log(`🔹 ${symbol} = ${ethers.formatUnits(price, DECIMALS)}`);
  }
}

main().catch(console.error);
