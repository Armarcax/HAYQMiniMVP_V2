const fs = require("fs");
const path = require("path");

// ====== ՊԱՐԱՄԵՏՐՆԵՐ ======
const IMPLEMENTATION_ADDRESS = "0x56E6Dc2f7a33fEFf3C537aa32cb70D5a0809a136";
const PROXY_ADMIN_ADDRESS = "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d";

// Եթե init function-ը չունի parameters, թող մնա "0x"
const INIT_CALldata = "0x";

// ====== ԱՅՍՏԵՂ ՍՏՈՐԱԳՐՈՒՄ ======
const constructorArgs = [
  IMPLEMENTATION_ADDRESS,
  PROXY_ADMIN_ADDRESS,
  INIT_CALldata
];

const filePath = path.join(__dirname, "../artifacts/constructor_args.json");

fs.writeFileSync(filePath, JSON.stringify(constructorArgs, null, 2));

console.log(`✅ Constructor arguments saved to ${filePath}`);
