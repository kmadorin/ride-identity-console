const wc = require('@waves/waves-crypto');
const { invokeScript } = require('@waves/waves-transactions');

const { broadcastAndWait, broadcast } = require('./api');
const {DISender, DIReciever, DIContract, DIOracle} = require('./accounts');

const invokeVerify = (email, account, code) => {

  const binaryCode = wc.base58encode(Uint8Array.from(code.toString().split("")));

  const params = {
    dappAddress: '3N9osT1pAzi73RHHH29rnt4PuAUBZp79QYt',
    call: {
      function: 'verifyEmail',
      args: [{
      	key: 'email',
        type: 'string',
        value: email,
      }, {
      	key: 'verificationCode',
      	type: 'string',
      	value: binaryCode
      }],
    },
    chainId: 84
  }

  const signedInvokeScriptTx = invokeScript(params, account);
  return JSON.stringify(signedInvokeScriptTx);
  // return broadcastAndWait(signedInvokeScriptTx, 1000 * 60 * 2)

}
// invokeVerify('bob@identity.com', DIReciever, '732677')
module.exports = invokeVerify