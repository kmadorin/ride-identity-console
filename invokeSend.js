const wc = require('@waves/waves-crypto');
const { invokeScript } = require('@waves/waves-transactions');

const { broadcastAndWait, broadcast } = require('./api');
const {DISender, DIReciever, DIContract, DIOracle} = require('./accounts');

const invokeSend = (recieverEmail, amountToSend) => {

  const params = {
    dappAddress: '3N9osT1pAzi73RHHH29rnt4PuAUBZp79QYt',
    call: {
      function: 'sendWavesToEmail',
      args: [{
      	key: 'email',
        type: 'string',
        value: recieverEmail,
      }],
    },
    payment: [{
    	assetId: null,
    	amount: 100000000*amountToSend, // amount in Waves
    }],
    chainId: 84,
  }

const signedInvokeScriptTx = invokeScript(params, DISender);

// console.log(JSON.stringify(signedInvokeScriptTx));

 return broadcastAndWait(signedInvokeScriptTx, 1000 * 60 * 2)
}

module.exports = invokeSend