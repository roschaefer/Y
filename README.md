# Y

    donee   payee
         \ /
          Y
          |
        payer

Y is a way to make a donation every time a payment is made. The payer sends money to Y, then Y sends some of that money to the donee, and the rest to the payee. The payee decides how much of the payment to donate, and the payer decides who the donee will be.

In the marketplace, sellers are payees, and buyers are payers.

    donee       seller       donee       seller
         \     /                  \     /
       1% \   / 99%             2% \   / 98%
           \ /                      \ /
            Y                        Y
            |                        |
          buyer                    buyer

Which seller would you rather buy from? Donations are driven up by sellers competing for buyers, and just 0.7% donation on every payment is the same amount of money as tax raises now.

There are versions of this idea already, like [Helpfreely](https://www.helpfreely.org/en/). However, they decide who is and who isn't a donee, and donating internationally depends on the old banking network (read: fees). Y depends on [Ethereum](http://ethereum.org), a global network where you can send money internationally just the same as domestically: like the Internet, there is no built-in concept of national borders. In Y, the payer alone decides who to donate to: if it has an Ethereum address, it can be donated to. A payer could donate to public services in their own country and in other countries, evening things out between nations, maybe even making the idea of borders unnecessary. Y's intended purpose is for self-government.

## Try it out (no money needed)

Y is a smart contract: you send it Ether and the donee's address, it sends a percent of that Ether to the donee and the rest to the payee. Let's see that the payee and donee account balances to go up in proportion, and that only the payee is able to change the donation percent.

1. `git clone` this repository, `cd` into it and type `npm install` to download what it depends on.

1. Install a program that will run a miniature version of the Ethereum network on your computer, like [testrpc](https://github.com/ethereumjs/testrpc), and start it up.

    ```
    $ testrpc
    ```

1. First it's the payee's turn. They have to deploy Y.sol (the contract) to the blockchain, and set the initial donation %. When you deploy the contract, the account you deploy it from will be set as the payee on the contract. You can use deploy.js to do all of this.

    ```
    $ node deploy.js 0x... 1 100
    ```
    `0x...` is the payee's address (your test blockchain should give you a list of addresses you can choose one from). `1 100` is 1%, `2 100` is 2% etc.. Ethereum can't yet represent decimals, so percentages must be represented as two integers: numerator and denominator.

    You should see this:

    ```
    >
    ```
    Now your payers can use the contract. deploy.js uses the web3 library to deploy the contract to the blockchain, and gives you back a contract object that can be used to communicate with it. Type `contract` to see it.

1. Before you pay, check the balances of the payee's and donee's accounts, so you'll know what they are now.

    ```
    > web3.eth.getBalance(payeeAddress).then(console.log)
    > web3.eth.getBalance(doneeAddress).then(console.log)
    ```
    (This is web3 version 1.)

1. Now it's time to pay. Call the contract's payAndDonate method from the payer's account, with an amount of Ether and the donee's address.

    ```
    > contract.methods.payAndDonate(doneeAddress).send({from: payerAddress, value: web3.utils.toWei(amountOfEther, "ether")})
    ```
    (toWei converts to wei, the smallest denomination of Ether. 1 Ether is 10^18 wei.)

1. Now you've paid and made a donation. See that the balances in the payee and donee accounts have gone up how you expect them to.

    ```
    > web3.eth.getBalance(payeeAddress).then(console.log)
    > web3.eth.getBalance(doneeAddress).then(console.log)
    ```

1. The contract stays in place on the blockchain, so another payer can come along and pay again. The payee can change the donation percent by calling changeNumAndDenom, changeNum or changeDenom, depending on what needs to change.

    ```
    > contract.methods.changeNumAndDenom(2, 25).send({from: payee})
    ```

## Project goals

* Make this easy to install and use for a website that already accepts Ether as payment, like [Decypher](http://decypher.tv/series/ethereum-development).
