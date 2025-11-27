// scripts/generate-constructor-args.cjs
const fs = require("fs");
const path = require("path");

// Ստեղծիր կոնկրետ implementation / proxyAdmin հասցեները
const implementationAddress = "0x56E6Dc2f7a33fEFf3C537aa32cb70D5a0809a136";
const proxyAdminAddress = "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d";
const initData = "0x"; // Եթե contract-ը ունի initializer, այստեղ կարող ես փոխանցել

const constructorArgs = [
  implementationAddress,
  proxyAdminAddress,
  initData
];

// Ստեղծում ենք Node.js module-ը, որը հնարավոր է import անել verification-ի համար
const fileContent = `module.exports = ${JSON.stringify(constructorArgs, null, 2)};\n`;

const outputPath = path.join(__dirname, "../artifacts/constructor_args.cjs");

fs.writeFileSync(outputPath, fileContent);

console.log(`✅ Constructor arguments module created at: ${outputPath}`);
console.log(constructorArgs);
