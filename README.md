# Y

Show your customers that your business gives back to society by donating part of each payment to something of the customer's choice. Y is free to use.

# Live demo
Visit a demo of Y at [http://y-demo.surge.sh/](http://y-demo.surge.sh/).

## How it works

    donee   payee
         \ /
          Y
          |
        payer

Y is a [smart contract](https://en.wikipedia.org/wiki/Smart_contract). The payee tells Y how much of each payment to donate. A payer then tells Y who the donee will be, and sends money to Y. Y sends some of that money to the donee, and the rest to the payee.

## Try it out (no money needed)

Let's see that:
1. the payee and donee account balances go up by how much you expect them to,
1. that only the payee is able to change the donation percent,
1. and that the payee can change the donation percent.

Please let me know if you want to go through this with me. I can help explain what's going on if it's not clear, and I will use those explanations to make this README better. Find me in [#y](https://agileventures.slack.com/messages/C7FFUHJCD/) on [Agile Ventures](https://www.agileventures.org)' Slack. I've learned Ethereum development by watching Jordan Leigh's [YouTube videos](https://www.youtube.com/watch?v=8jI1TuEaTro&list=PLV1JDFUtrXpGvu8QHL9b78WYNSJsYNZsb) and [Decypher](http://decypher.tv/series/ethereum-development), and asking questions in [Ethereum's Gitter](https://gitter.im/ethereum/home).

Okay, let's try Y out.

1. `git clone` this repository, `cd` into it and type `npm install` to download what it depends on.

1. Install a program that will run a miniature version of the Ethereum network on your computer, like [testrpc](https://github.com/ethereumjs/testrpc), and start it up.

    ```
    $ testrpc
    ```

1. First it's the payee's turn. They have to deploy Y.sol (the contract) to the blockchain, and set the initial donation %. The payee, and only the payee, sets the donation percent. The contract needs to store the payee's address so that it can accept calls to change the donation percent from the payee's address, and deny calls from any other address. When you deploy the contract, the account you deploy it from will be set as the payee on the contract. You can use deploy.js to do all of this.

    ```
    $ node deploy.js 0x... 1 100
    ```
    Change `0x...` for one of the addresses your test blockchain should give you. That will be the payee's address. `1 100` is 1%, `2 100` is 2% etc.. Ethereum can't yet represent decimals, so percentages must be represented as two integers: numerator and denominator.

    After a few seconds, you should see this:

    ```
    >
    ```
    Now your payers can use the contract. deploy.js uses the web3 library to deploy the contract to the blockchain, and gives you back a contract object that can be used to communicate with it. Type `contract` to see it.

1. Before you pay, check the balances of the payee's and donee's accounts, so you'll know what they are now. You'll be using `payeeAddress` and `doneeAddress` more than once, so it's worth defining them as constants.

    ```
    > const payeeAddress = 0x...;
    > const doneeAddress = 0x...;

    ```
    Now check their balances:
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

1. The contract stays in place on the blockchain, so another payer can come along and pay again. The donation percent can be changed by calling changeNumAndDenom, changeNum or changeDenom, depending on what needs to change. What happens if someone other than the payee tries to change the donation percent?

    ```
    > contract.methods.changeNumAndDenom(99, 100).send({from: payerAddress})
    ```

    Now try the payee:

    ```
    > contract.methods.changeNumAndDenom(2, 25).send({from: payeeAddress})
    ```

    And see that it has actually changed the num and denom on the contract:

    ```
    > contract.methods.num().call().then(console.log)
    > contract.methods.denom().call().then(console.log)
    ```

## Plan

1. Write tests for the contract, Y.sol.
1. Develop an interface to Y.sol (e.g. the user must not have to deal with numerators and denominators, just a percent).
1. Make this easy to install and use for a website that already accepts Ether as payment, like [Decypher](http://decypher.tv/series/ethereum-development).

## Beyond the immediate benefits to a business

In the marketplace, sellers are payees, and buyers are payers.

    donee       seller       donee       seller
         \     /                  \     /
       1% \   / 99%             2% \   / 98%
           \ /                      \ /
            Y                        Y
            |                        |
          buyer                    buyer

Which seller would you rather buy from? Donations are driven up by sellers competing for buyers, and just 0.7% donation on every payment is the same amount of money as tax raises now.

If you want to donate part of an online payment today, you can use an organisation like [Helpfreely](https://www.helpfreely.org/en/). These methods have two limitations:

1. The organisation, not the payer, decide who can and who can't be donated to.
1. Donating depends on the banking network, so fees are higher for donations to other countries.

Y depends on [Ethereum](http://ethereum.org), a global network where sending money internationally is no different to sending it in your own country: like the Internet, there is no built-in concept of nations. In Y, the payer alone decides who to donate to: if it has an Ethereum address, it can be donated to. A payer could donate to public services in their own and other countries, evening things out between nations, maybe even making the idea of borders unnecessary. Y's is meant for self-government.
