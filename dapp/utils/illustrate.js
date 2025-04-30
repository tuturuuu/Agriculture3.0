const fs = require('fs');

// Load ABI from file
const abiPath = `./artifacts/contracts/AgriTradeMain.sol/AgriTradeMain.json`;
const abiGen = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
const abi = abiGen.abi

// Helper to format inputs
const formatParams = (params) =>
  params.map((p) => `${p.type} ${p.name || '_'}`).join(', ');

// Loop through ABI items
abi.forEach((item) => {
  switch (item.type) {
    case 'function':
      const inputs = formatParams(item.inputs);
      const outputs = item.outputs?.map((o) => o.type).join(', ') || 'void';
      const state = item.stateMutability;
      console.log(`🛠  ${item.name}(${inputs}) → ${outputs} | ${state}`);
      break;

    case 'event':
      const params = formatParams(item.inputs);
      console.log(`📣 event ${item.name}(${params})`);
      break;

    case 'constructor':
      const ctorInputs = formatParams(item.inputs);
      console.log(`🚀 constructor(${ctorInputs}) | ${item.stateMutability}`);
      break;

    case 'fallback':
      console.log(`⚠️ fallback() | ${item.stateMutability}`);
      break;

    case 'receive':
      console.log(`💰 receive() | ${item.stateMutability}`);
      break;
  }
});
