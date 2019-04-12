# Email Identity service on Waves platform 

Installation: 
```
	git clone https://github.com/kmadorin/ride-identity-console.git
	npm i
```


Verify your email:
```
	node verify
```
Change the smtp server to yours before starting verification in `sendVerificationCode.js` file

Send waves to the account binded to email:
```
	node sendToEmail
```

Contract for the dapp: contracts/DIContract.js

Web version coming soon.