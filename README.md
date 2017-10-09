# Y

Y is a way to make a payment and a donation at the same time. The pay_ee_ sets the percent of the transaction that is donated, and the pay_er_ chooses where the donation goes. It's a way for sellers to attract custom by proving that their business gives back to society. Hopefully, competition between sellers for that custom will increase the amount that is donated, and you only need 0.7% on every transaction to raise the same amount of money as tax does now.

You can do a limited version of this today with organisations like https://www.easyfundraising.org.uk/ and https://www.helpfreely.org/en/, but Y is the unlimited, scalable version: no middlemen taking a cut, no authority saying who can and can't receive donations.

The freedom of the payer to choose where the donation goes is important. Especially with a global network like Ethereum, they can choose to donate to things all around the world, even public services in other countries, as well as their own. This will help to even things out between countries, maybe even making the idea of countries unnecessary.

"Y" is the shape of the transaction: from payer to payee, with some split off to donee.

## How it works

Y is an Ethereum smart contract. On Ethereum, you send it Ether, and it sends a percent of that to the donee and the rest to the payee. The payee sets the percent, and the payer sets the donee when they send the Ether.

To try Y out on your machine (there's no money involved):

1. Clone this repository, go into it and `npm install`. This will install what this project depends on.

1. Install a local, simulated Ethereum blockchain runner like [testrpc](https://github.com/ethereumjs/testrpc) and start it up.

    ```
    $ testrpc
    ```

1. First it's the payee's turn. Deploy Y.sol to your test blockchain, setting the initial donation percentage at the same time. The account you deploy it from will be set as the payee on the contract. You can use deploy.js to do all of this.

    ```
    $ node deploy.js 0x... 1 100
    ```
     `0x...` is the payee's address (your test blockchain should give you a list of addresses you can choose one from). `1 100` is 1%, `2 100` is 2% etc..

1. Check the balances of the payee and donee accounts, so you'll know what they were before the transaction.

    ```
    > web3.eth.getBalance(payeeAddress).then(console.log)
    > web3.eth.getBalance(doneeAddress).then(console.log)
    ```

1. Now it's the payer's turn. Pay the payee, and donate to a donee, by calling payAndDonate from the payer's account with an amount of wei (1 Ether is 10^18 wei) and an address for the donee.

    ```
    > contract.methods.payAndDonate(doneeAddress).send({from: payerAddress, value: web3.utils.toWei(amountOfEther, "ether")})
    ```

1. See that the balances in the payee and donee accounts have gone up by the expected amounts.

    ```
    > web3.eth.getBalance(payeeAddress).then(console.log)
    > web3.eth.getBalance(doneeAddress).then(console.log)
    ```

1. The contract stays in place on the blockchain, so another payer can come along and use it too.

## Project goals

* Make this easy to install and use for a website that accepts Ether as payment, like [Decypher](http://decypher.tv/series/ethereum-development).
