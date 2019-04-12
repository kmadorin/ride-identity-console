const wc = require('@waves/waves-crypto');
const { data, transfer } = require('@waves/waves-transactions');

const { broadcastAndWait, broadcast } = require('./api');
const { DIOracle } = require('./accounts');
const {getVerificationData, getVerificationCodeHash} = require('./verification');

const startVerification = (email, oracle) => {
	const { verificationCode, verificationCodeHash } = getVerificationData(email);
	const params = {
	  data: [
	    { key: email, value: verificationCodeHash },
	  ],
	}

	const signedDataTx = data(params, oracle);
	
	return {
		oraclePromise: broadcastAndWait(signedDataTx, 1000 * 60 * 2),
		verificationCode
	}
}

module.exports = {startVerification}
