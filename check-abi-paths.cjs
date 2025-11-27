const fs = require("fs");
const path = require("path");

console.log("🔍 Current working directory:");
console.log(process.cwd());
console.log("------------");

const possiblePaths = [
    "src/abis/HAYQMiniMVP.json",
    "src/abi/HAYQMiniMVP.json",
    "abis/HAYQMiniMVP.json",
    "abi/HAYQMiniMVP.json",
    "hardhat/artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json",
    "../hardhat/artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json",
    "../../hardhat/artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json",
    "../../../hardhat/artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json",
];

console.log("🔎 Checking possible ABI locations...\n");

possiblePaths.forEach((p) => {
    const full = path.resolve(process.cwd(), p);
    if (fs.existsSync(full)) {
        console.log(`✅ FOUND: ${p}`);
    } else {
        console.log(`❌ NOT FOUND: ${p}`);
    }
});
