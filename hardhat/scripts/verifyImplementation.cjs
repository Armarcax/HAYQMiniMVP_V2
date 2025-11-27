// CommonJS, աշխատում է hardhat + type: "module" projecten զուգընթաց
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const implAddress = "0x538d6965C48BF85379328585bbA482E574b0Ed59";

  // Fully qualified contract name — ճիշտ տիրապետման համար փոփոխիր եթե պետք է
  const contractFQN = "contracts/MockOracleV2.sol:MockOracleV2";

  console.log("🔎 Verifying implementation contract on Etherscan...");
  console.log("Network:", hre.network.name);
  console.log("Implementation address:", implAddress);
  console.log("Contract FQN:", contractFQN);

  try {
    // Սովորաբար սա է պահանջվում՝ սկիզբը ուղարկելու համար
    await hre.run("verify:verify", {
      address: implAddress,
      contract: contractFQN,
      // constructorArguments: [], // եթե կոնստրուկտորն ունի պարամետրեր — անուրկայացրեք դրանք այստեղ
    });
    console.log("✅ Implementation verified successfully!");
  } catch (err) {
    // Խաղաղ, պարզ error output
    console.error("❌ Verification failed:");
    if (err.message) console.error(err.message);
    else console.error(err);
    process.exitCode = 1;
  }
}

main();
