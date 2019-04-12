const readlineSync = require('readline-sync');
const {startVerification} = require('./oracle');
const invokeVerify = require('./invokeVerify');
const getHash = require('./getHash');
const sendVerificationCode = require('./sendVerificationCode');
const {DISender, DIReciever, DIContract, DIOracle, SimpleHashAcc, sender} = require('./accounts');

const accounts = {
	alice: DISender,
	bob: DIReciever,
};


console.log('Welcome to the ride-identity service!');
const recieverEmail = readlineSync.question('Type your email to recieve the verification code: \n');

const recieverAccount = readlineSync.question('Provide the name of the wallet you want to bind to this email: \n');
const verificationObject = startVerification(recieverEmail, DIOracle);
verificationObject.oraclePromise
	.then(res => {
		return sendVerificationCode(recieverEmail, verificationObject.verificationCode)	
	}).then(res => {
		console.log('\nThank you. Your verification code was sent to the provided email:.\n');
		const code = readlineSync.question('Type your verification code to recieve payments to your email later:\n')
		return invokeVerify(recieverEmail, accounts[recieverAccount], code);
	})
	.then(res => {
		console.log('You have completed your verification. You can recieve payments to your email address now');
		return true
	}).catch(e => console.log('There was a problem during processing your request. The reason:\n' + e));
