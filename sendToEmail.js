const readlineSync = require('readline-sync');
const invokeSend = require('./invokeSend')

console.log('Welcome to the ride-identity service!');
const recipientEmail = readlineSync.question('Type the email of the person whom you want to send money to: \n');
const amountToSend = readlineSync.question(`How much waves do you want to send to ${recipientEmail}?\n`);
invokeSend(recipientEmail, amountToSend)
	.then(res => console.log(`\nYour waves have been successfully sent to the address binded to ${recipientEmail}.\nTransaction info:\nhttps://wavesexplorer.com/testnet/tx/${res}`))
	.catch(e => console.log('There was a problem during processing your request. The reason:\n'+e.response.data.message));