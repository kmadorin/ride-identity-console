const wc = require('@waves/waves-crypto');

const generateVerificationCode = () => {
	return Math.floor(Math.random()*999999+1);
}

const getVerificationCodeHash = (code) => {
	return wc.base58encode(wc.sha256(Uint8Array.from(code.toString().split(""))))
}

const getVerificationData = (email) => {
	const verificationCode = generateVerificationCode();
	const verificationCodeHash = getVerificationCodeHash(verificationCode);
	return { verificationCode, verificationCodeHash }
}

module.exports = {getVerificationData, getVerificationCodeHash}