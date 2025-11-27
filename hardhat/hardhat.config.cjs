require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

function getPrivateKey() {
  const key = process.env.PRIVATE_KEY;
  if (!key) {
    console.warn(
      "\x1b[33m%s\x1b[0m",
      "⚠️ Warning: PRIVATE_KEY not set in .env! Scripts may fail."
    );
    return [];
  }
  return [key.startsWith("0x") ? key : `0x${key}`];
}

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.22",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.29",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: { chainId: 1337 },
    localhost: { url: "http://127.0.0.1:8545" },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: getPrivateKey(),
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
    ],
  },
  sourcify: { enabled: false },
};
