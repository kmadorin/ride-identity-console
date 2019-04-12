const getDIContractText = () => {
	const contract = `{-# STDLIB_VERSION 3 #-}
{-# CONTENT_TYPE DAPP #-}
{-# SCRIPT_TYPE ACCOUNT #-}

let DIOracle = Address(base58'3N8EsYrHom7mFUFMAmMLD7pM6gfVZCuaxVh')

@Callable(i)
func sendWavesToEmail(email:String) = {
     let payment = match(i.payment) { #even none or exact amount of the attached payment(InvokeScriptTransaction).
        case p : AttachedPayment => p
        case _ => throw("You haven't attached a payment")
    }
    let addressForEmail = getString(this,email)
    if (!isDefined(addressForEmail)) then {
        throw("the email is not binded to any Waves address")
    } else {
        TransferSet([
            ScriptTransfer(Address(fromBase58String(extract(addressForEmail))), payment.amount, unit)
        ])
    }
}

@Callable(i)
func verifyEmail(email: String, verificationCode: String) = {
    let verificationCodeHash = getString(DIOracle, email)
    if (!isDefined(verificationCodeHash)) then {
        throw("you need to start the verification process first")
    } else {
        if (extract(verificationCodeHash) == toBase58String(sha256(fromBase58String(verificationCode)))) then {
            let caller = toBase58String(i.caller.bytes)
            WriteSet([DataEntry(email, caller)])
        } else {
            throw("preimage is not for the hash in the contract")
        }
    }
}`;
	return contract;
}

module.exports = getDIContractText