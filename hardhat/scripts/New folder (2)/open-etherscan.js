import open from "open";

// Տեղացրիր քո հասցեները
const PROXY_ADDRESS = "0x45615F3D52262ba7F16d7E0182893492baB";
const IMPLEMENTATION_ADDRESS = "0x56E6Dc2f7a33fEFf3C537aa32cb70D5a0809a136";
const PROXYADMIN_ADDRESS = "0x06880e4f9CE818317E67a1c786c554e7dC55ab";

// Etherscan URLs
const network = "sepolia";
const baseUrl = `https://${network}.etherscan.io/address/`;

console.log("Opening Etherscan links for your contracts...");

await open(`${baseUrl}${IMPLEMENTATION_ADDRESS}#code`);
console.log(`Implementation contract open at: ${IMPLEMENTATION_ADDRESS}`);

await open(`${baseUrl}${PROXY_ADDRESS}`);
console.log(`Proxy contract open at: ${PROXY_ADDRESS}`);

await open(`${baseUrl}${PROXYADMIN_ADDRESS}#code`);
console.log(`ProxyAdmin contract open at: ${PROXYADMIN_ADDRESS}`);
