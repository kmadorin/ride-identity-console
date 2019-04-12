const { setScript } = require('waves-transactions');
const { address } = require('waves-crypto');
const { broadcastAndWait } = require("./api");
const getDIContractText = require('./contracts/DIContract');
const compile = require('./compile');
const { DIContract } = require('./accounts');

const compiledContract = compile(getDIContractText());
console.log(compiledContract);
// const tx = setScript({ script: compiledContract, fee: 1400000, chainId: "T" }, DIContract);
// broadcastAndWait(tx).then(res => console.log(res)).catch(e => console.log(e));


// becomeSmart(alice, becomeSmartContract(address(kyc), CNFYAssetId));