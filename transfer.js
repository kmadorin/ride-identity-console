const wc = require('@waves/waves-crypto');
const { transfer } = require('@waves/waves-transactions');

const { broadcastAndWait, broadcast } = require('./api');
const {DISender, DIReciever, DIContract, DIOracle, SimpleHashAcc, sender} = require('./accounts');


const signedTranserTx = transfer({ 
  amount: 10000000, // 0,1 Waves
  recipient: wc.address(DIReciever, 'T'),
}, DISender);

broadcastAndWait(signedTranserTx, 1000 * 60 * 2)
	.then(res => console.log(res))
	.catch(e => console.log(e));