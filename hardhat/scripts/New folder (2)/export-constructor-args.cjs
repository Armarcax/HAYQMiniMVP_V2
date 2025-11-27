const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  console.log("🧩 Encoding constructor arguments...");

  const contractName = "HAYQMiniMVP";
  const factory = await hre.ethers.getContractFactory(contractName);

  // եթե կոնստրուկտոր չի սպասում պարամետրեր
  const inputs = factory.interface.deploy.inputs;
  if (inputs.length === 0) {
    console.log("ℹ️ Contract has no constructor parameters.");
    const output = {
      description: "No constructor arguments (empty ABI-encoded value)",
      encoded: "",
      constructorArgs: [],
      timestamp: new Date().toISOString(),
    };
    const filePath = path.resolve("artifacts/constructor_args.json");
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`✅ Saved empty constructor ABI to ${filePath}`);
    return;
  }

  // Եթե ունենար՝ այստեղ կգրեր պարամետրերը
  const constructorArgs = []; // լրացվում է եթե պետք լինի
  const encoded = hre.ethers.AbiCoder.defaultAbiCoder().encode(inputs, constructorArgs);

  const data = {
    description: "ABI-encoded constructor arguments for Etherscan verification",
    encoded,
    constructorArgs,
    timestamp: new Date().toISOString(),
  };

  const outputPath = path.resolve("artifacts/constructor_args.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✅ Constructor arguments encoded and saved to ${outputPath}`);
}

main().catch((err) => {
  console.error("🔥 Error encoding constructor args:", err);
  process.exit(1);
});
