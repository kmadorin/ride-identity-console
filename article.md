# Делаем Digital Identity сервис на смарт-контрактах Waves. Часть 1. Консольное приложение на node.js.

Мы давно используем номер телефона или email для идентификации человека/организации. Например, для перевода денег в онлайн-банке можно указать только номер телефона вместо того, чтобы каждый раз спрашивать номер карты.

Давайте сделаем такую же возможность для перевода waves. Тем более, что с новой версией языка ride for dapps это стало сделать намного проще.

Нам потребуется:
1. Смарт-контрат который:
  а) хранит у себя пары email -> адрес аккаунта для этого email
  б) Позволяет вызывать у себя функцию для передачи waves на адрес, привязанный к email.
2. Механизм привязки email к адресу в блокчейне waves.

## 1. Создание смарт контракта 
Начнем с написания функции перевода денег.

Определение функции в ride4dapps выглядит так:

```
@Callable(i)
func sendWavesToEmail(email:String) = {

}
```

Параметры функции - это те параметры, которые передаются в поле call транзакции invokeScript, с помощью которой эта функция будет вызываться.

В переменной i будут содержаться все остальные параметры транзакции, такие как отправитель, размер платежа и т.д.

Теперь добавим к нашей функции код, отвечающий за перевод денег:

```
let addressForEmail = getString(this,email)
if (!isDefined(addressForEmail)) then {
    throw("the email is not binded to any Waves address")
} else {
    TransferSet([
        ScriptTransfer(Address(fromBase58String(extract(addressForEmail))), payment.amount, unit)
    ])
}
```

Сначала мы выясняем прошел ли пользователь, на чей email посылаются деньги, процедуру верификации. Т.е. есть ли в стейте контракта запись с ключом email. Если такой записи нет, то наша транзакция перевода отменяется, а пользователь получает соответствующее уведомление. Если же для email существует привязанный к нему адрес, то на него отправляется количество waves, равное тому, которое указано в поле payment транзакции. Извлечь его можно так:

```
let payment = match(i.payment) {
    case p : AttachedPayment => p
    case _ => throw("You haven't attached a payment")
}
```

Итоговый код нашей функции:

```
@Callable(i)
func sendWavesToEmail(email:String) = {
     let payment = match(i.payment) {
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
```

## 2. Механизм верификации email
Как обычно происходит проверка того, что email вам принадлежит? Вы вводите свой email на каком-либо сайте, после чего вас просят предоставить либо код подтверждения, отправленный на него, либо открыть ссылку из него. Давайте реализуем более простой вариант с кодом подтверждения. 

Алгоритм при этом будет таким:
1. Мы создадим оракула, который при каждом запросе на подтверждение email будет:
	а) Высылать код подтверждения на ваш email
  б) Писать на свой адрес этот email и хэш кода потверждения
2. Напишем функцию в нашем предыдущем контракте, которая по предьявлению кода подтверждения и email будет сверяться с оракулом и в случае успеха записывать в стейт контракт пару email -> адрес отправителя.

### 2.1. Создание оракула

Для создания оракула можно использовать [Data Oracle Tool](https://oracles.wavesexplorer.com/), релиз которого был недавно https://blog.wavesplatform.com/waves-platform-releases-data-oracle-tool-4105f12cdc57

У оракула при создании нужно указать два параметра типа string на входе: email
и verificationCodeHash

Записать данные в него можно отправив data-транзакцию с этими параметрами:

```
const params = {
	  data: [
    { key: 'alice@identity.com', value: 'someHash' },
  ],
}
```
	

### 2.2. Функция подтверждения email

Функция при вызове будет принимать два параметра и будет иметь доступ к полям транзакции через переменную `i`:

```
@Callable(i)
func verifyEmail(email: String, verificationCode: String) = {

}
```

Для того, чтобы получить доступ к данным из контракта оракула заведем для него переменную:

```
let DIOracle = Address(base58'3N8EsYrHom7mFUFMAmMLD7pM6gfVZCuaxVh')
```
Затем мы проверяем, запущена ли для данного email процедура верификации или нет.
Если нет - откатываем транзакцию и возвращаем пользователю сообщение об ошибке.
Если да - вычисляем хэш от кода на входе функции с хэшом, записанным в оракуле. Если они совпадают, то записываем пару email -> адрес отправителя транзакции в стейт контракта, если нет - возвращаем пользователю ошибку.

Код функции целиком:

```
@Callable(i)
func verifyEmail(email: String, verificationCode: String) = {
		let DIOracle = Address(base58'3N8EsYrHom7mFUFMAmMLD7pM6gfVZCuaxVh')
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
}
```

## 3. Отправка waves на email

Все, теперь мы можем проверить работу нашего решения в тестнете Waves.
Для этого я написал небольшие консольные приложения. 

Клонируем репозиторий и скачиваем зависимости:

```
git clone http://github.com/kmadorin/ride-identity-console.git
npm i
```

Сначала привяжем email получателя платежа к адресу waves. Для тестов в проекте есть файл accounts.js в котором можно указать сид фразы аккаунтов отправителя и получателя, а также контракта и оракула: DISender, DIReciever, DIContract, DIOracle:

Запуск smtp сервера для отправки email. В проекте исползуется Haraka:

```
sudo haraka c .
```
Как настроить haraka для отправки сообщений можно прочитать здесь:
https://haraka.github.io/manual/tutorials/SettingUpOutbound.html

Запуск процедуры подтверждения:

```
node verify 
```

Отправляем деньги деньги на email:

``` 
node sendToEmail
```

Как это все работает можно посмотреть в [скринкасте](https://asciinema.org/a/baAaQt47TUjTBLnOfoUxIHsD0):


Транзакции для контракта и оракула в Waves Explorer:

[Контракт dapp](https://wavesexplorer.com/testnet/address/3N9osT1pAzi73RHHH29rnt4PuAUBZp79QYt)

[Оракул](https://wavesexplorer.com/testnet/address/3N8EsYrHom7mFUFMAmMLD7pM6gfVZCuaxVh)
Название на oracles.wavesexplorer.com - SimpleDI

[Репозиторий с консольной версией](http://github.com/kmadorin/ride-identity-console)


P.S.
Скоро будет полноценный сервис для переводов по email/номеру телефона.
Следите за обновлениями. Задавайте вопросы в комментариях.

https://medium.com/@kirillmadorin/%D0%B4%D0%B5%D0%BB%D0%B0%D0%B5%D0%BC-digital-identity-%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81-%D0%BD%D0%B0-%D1%81%D0%BC%D0%B0%D1%80%D1%82-%D0%BA%D0%BE%D0%BD%D1%82%D1%80%D0%B0%D0%BA%D1%82%D0%B0%D1%85-waves-%D1%87%D0%B0%D1%81%D1%82%D1%8C-1-%D0%BA%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%BD%D0%B0-node-js-6e510078356d
