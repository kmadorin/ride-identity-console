const wc = require('@waves/waves-crypto');

const getHash = (number) => {
	const hash = wc.base58encode(wc.sha256(Uint8Array.from(number.toString().split(""))));
	return {number, hash}
} 

module.exports = getHash;