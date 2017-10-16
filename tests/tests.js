// node tests.js

// All tests pass if all true, else a test has failed.
// There are 12 console.logs (roughly equals tests).

// NOTE globals are for repl only, so can be changed back to consts if the repl is taken out (make a separate script for playing with the contract interactively).

// TODO show that each test also fails with a broken implementation (Y_fails_tests.sol) (mutation testing)

// TODO show that if money leaves the payer it has to go to the payee and donee. E.g. it cannot get stuck in the contract.
// ensure that payable functions have this property
// ensure that payer is always sending to this contract

const Web3 = require("web3");
global.web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
const fs = require("fs");
const solc = require("solc");
const BigNumber = require("bignumber.js");

// const y = require("./Y").Y(web3, process.argv[2]);

const runTests = async filepath => {
  const accounts = await web3.eth.getAccounts();
  const payer = accounts[1],
    payee = accounts[0],
    donee = accounts[9];

  const compiled = solc.compile(fs.readFileSync(filepath, "utf8"));
  const abi = compiled.contracts[":Y"].interface;
  const bytecode = compiled.contracts[":Y"].bytecode;

  global.contract = await new web3.eth.Contract(JSON.parse(abi))
    .deploy({
      data: bytecode,
      arguments: [1, 100]
    })
    .send({
      from: payee,
      gas: 1500000 // copied from https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id11
    });

  // donee receives donation, payee receives payment minus donation

  // payee: x, donee: y -> payee: x + (p - (p * d)), donee: y + (p * d), where p > 0, 0 < d < 100% (p is payment, d is donation percent)

  // p = 100, d = 1%

  const payment = 100;

  await (async () => {
    const numAndDenom = await Promise.all([
      contract.methods.num().call(),
      contract.methods.denom().call()
    ]);
    const donation = new BigNumber(numAndDenom[0]) // contract.methods.num().call() is returning a string, not a BigNumber (web3 v0 returned a BigNumber). Is that right?
      .dividedBy(numAndDenom[1])
      .times(payment);
    const balancesBefore = await Promise.all([
      web3.eth.getBalance(payee),
      web3.eth.getBalance(donee)
    ]);
    const payeeBalanceBefore = new BigNumber(balancesBefore[0]);
    const doneeBalanceBefore = new BigNumber(balancesBefore[1]);

    await contract.methods
      .payAndDonate(donee)
      .send({ from: payer, value: payment });

    const balancesAfter = await Promise.all([
      web3.eth.getBalance(payee),
      web3.eth.getBalance(donee)
    ]);
    const payeeBalanceAfter = new BigNumber(balancesAfter[0]);
    const doneeBalanceAfter = new BigNumber(balancesAfter[1]);

    console.log(
      payeeBalanceAfter.equals(
        payeeBalanceBefore.plus(payment).minus(donation)
      ) && doneeBalanceAfter.equals(doneeBalanceBefore.plus(donation))
    );
  })();

  // Non-payees can't change num or denom

  // num

  await (async () => {
    const numBefore = await contract.methods.num().call();
    try {
      await contract.methods.changeNum(99).send({ from: payer });
      // console.error("Should have thrown.");
    } catch (err) {
      // console.log(true); // FIXME if it's the expected error
    }

    const numAfter = await contract.methods.num().call();

    console.log(new BigNumber(numBefore).equals(numAfter)); // This is logging true even when calling broken Y. That's because changeNum in broken Y does nothing, so even calling it successfully won't change num, therefore num before and after will be equal.

    // The application cares that num doesn't change if the wrong person calls to change it, not about the error. But it won't fail
  })();

  // NOTE Subsequent tests will only be accurate if previous ones don't fail, so if tests are broken, fix the first broken one first.

  // denom

  await (async () => {
    const denomBefore = await contract.methods.denom().call();
    try {
      await contract.methods.changeDenom(1).send({ from: payer });
      // console.error("Should have thrown.");
    } catch (err) {
      // console.log(true); // if it's the expected error
    }

    const denomAfter = await contract.methods.denom().call();

    console.log(new BigNumber(denomBefore).equals(denomAfter));
  })();

  // num and denom

  await (async () => {
    const numAndDenomBefore = await Promise.all([
      contract.methods.num().call(),
      contract.methods.denom().call()
    ]);
    const numBefore = numAndDenomBefore[0],
      denomBefore = numAndDenomBefore[1];

    try {
      await contract.methods.changeNumAndDenom(999, 1000).send({ from: payer });
      // console.error("Should have thrown.");
    } catch (err) {
      // console.log(true); // if it's the expected error
    }

    const numAndDenomAfter = await Promise.all([
      contract.methods.num().call(),
      contract.methods.denom().call()
    ]);

    const numAfter = numAndDenomAfter[0],
      denomAfter = numAndDenomAfter[1];

    console.log(
      new BigNumber(numBefore).equals(numAfter) &&
        new BigNumber(denomBefore).equals(denomAfter)
    );
  })();

  // Payee can change num and denom.

  await (async () => {
    const compiled = solc.compile(
      fs.readFileSync("./Y_cant_change_percent.sol", "utf8")
    );
    const abi = compiled.contracts[":Y"].interface;
    const bytecode = compiled.contracts[":Y"].bytecode;

    const contract = await new web3.eth.Contract(JSON.parse(abi))
      .deploy({
        data: bytecode,
        arguments: [1, 100]
      })
      .send({
        from: payee,
        gas: 1500000 // copied from https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id11
      });

    await (async numBefore => {
      // 2/5 is 40%
      const changeNumTo = "5";

      if (changeNumTo !== numBefore) {
        await contract.methods.changeNum(changeNumTo).send({ from: payee });

        const numAfter = await contract.methods.num().call();

        // This test is true when it should be false. That's because it was calling the contract that had num = _num in it, so the num was changed. It needs to call a contract without that (Y_cant_change_percent.sol). Best to run these three tests in their own context, where contract is Y_cant_change_percent.sol.

        console.log(new BigNumber(numAfter).equals(changeNumTo));
      } else {
        console.error("changeNumTo === numBefore");
      }
    })("100"); // pass num read from contract

    // denom (3/100 -> 3/5)

    await (async denomBefore => {
      // 3/5 is 60%
      const changeDenomTo = "5";

      if (changeDenomTo !== denomBefore) {
        await contract.methods.changeDenom(changeDenomTo).send({ from: payee });

        const denomAfter = await contract.methods.denom().call();

        console.log(new BigNumber(denomAfter).equals(changeDenomTo));
      } else {
        console.error("changeDenomTo === denomBefore");
      }
    })("100"); // pass denom read from contract

    // num and denom (3/5 to 2/25)

    await (async (numBefore, denomBefore) => {
      // 2/25 is 8%
      const changeNumTo = "2";
      const changeDenomTo = "25";

      if (changeNumTo !== numBefore) {
        if (changeDenomTo !== denomBefore) {
          await contract.methods
            .changeNumAndDenom(changeNumTo, changeDenomTo)
            .send({ from: payee });

          const numAndDenomAfter = await Promise.all([
            contract.methods.num().call(),
            contract.methods.denom().call()
          ]);

          const numAfter = numAndDenomAfter[0],
            denomAfter = numAndDenomAfter[1];

          console.log(
            new BigNumber(numAfter).equals(changeNumTo) &&
              new BigNumber(denomAfter).equals(changeDenomTo)
          );
        } else {
          console.error("changeDenomTo === denomBefore");
        }
      } else {
        console.error("changeNumTo === numBefore");
      }
    })("1", "100"); // pass num and denom read from contract
  })();

  // num (1/100 -> 3/100)

  // if payAndDonate fails to transfer to either donee or payee, neither should get Ether

  // donee.transfer() fails

  await (async () => {
    // deploy TransferToThisFails
    const compiled = solc.compile(
      fs.readFileSync("./TransferToThisFails.sol", "utf8")
    );
    const abi = compiled.contracts[":TransferToThisFails"].interface;
    const bytecode = compiled.contracts[":TransferToThisFails"].bytecode;

    const failer = await new web3.eth.Contract(JSON.parse(abi))
      .deploy({
        data: bytecode
      })
      .send({
        from: donee,
        gas: 1500000 // copied from https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id11
      });

    const balancesBefore = await Promise.all([
      web3.eth.getBalance(payee),
      web3.eth.getBalance(donee)
    ]);
    const payeeBalanceBefore = new BigNumber(balancesBefore[0]);
    const doneeBalanceBefore = new BigNumber(balancesBefore[1]);

    try {
      await contract.methods.payAndDonate(failer.options.address).send({
        from: payer,
        value: payment
      });
      console.error("Should have thrown.");
    } catch (err) {
      console.log(true); // if it's the expected error
    }

    const balancesAfter = await Promise.all([
      web3.eth.getBalance(payee),
      web3.eth.getBalance(donee)
    ]);
    const payeeBalanceAfter = new BigNumber(balancesAfter[0]);
    const doneeBalanceAfter = new BigNumber(balancesAfter[1]);

    // expect payee and donee balances haven't changed

    console.log(
      payeeBalanceAfter.equals(payeeBalanceBefore) &&
        doneeBalanceAfter.equals(doneeBalanceBefore)
    );
  })();

  // TODO payee.transfer() fails. It's not possible for a normal account to fail, assuming sending contract has enough ether (https://gitter.im/ethereum/solidity?at=59dfa10fe44c43700a259964), so payee will have to be a contract to test this.

  await (async () => {
    // deploy ContractThatDeploysY

    const compiled = solc.compile({
      sources: {
        "Y.sol": fs.readFileSync("../Y.sol", "utf8"),
        "ContractThatDeploysY.sol": fs.readFileSync(
          "./ContractThatDeploysY.sol",
          "utf8"
        )
      }
    });

    const deployer_abi =
      compiled.contracts["ContractThatDeploysY.sol:ContractThatDeploysY"]
        .interface;
    const bytecode =
      compiled.contracts["ContractThatDeploysY.sol:ContractThatDeploysY"]
        .bytecode;

    const yDeployer = await new web3.eth.Contract(JSON.parse(deployer_abi))
      .deploy({
        data: bytecode
      })
      .send({
        from: payee,
        gas: 1500000 // copied from https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id11
      });

    // get address of deployed Y from yDeployer

    const deployedYAddress = await yDeployer.methods.y().call();

    const y = await new web3.eth.Contract(JSON.parse(abi), deployedYAddress); // NOTE Y abi, hopefully

    const balancesBefore = await Promise.all([
      web3.eth.getBalance(payee),
      web3.eth.getBalance(donee)
    ]);
    const payeeBalanceBefore = new BigNumber(balancesBefore[0]);
    const doneeBalanceBefore = new BigNumber(balancesBefore[1]);

    // TODO write a function that returns a promise of a contract, to avoid naming conflicts (abi and deployed_abi) when two contracts are in the same scope, like here.

    try {
      await y.methods.payAndDonate(donee).send({
        from: payer,
        value: payment
      });
      console.error("Should have thrown.");
    } catch (err) {
      console.log(true); // if it's the expected error
    }

    const balancesAfter = await Promise.all([
      web3.eth.getBalance(payee),
      web3.eth.getBalance(donee)
    ]);
    const payeeBalanceAfter = new BigNumber(balancesAfter[0]);
    const doneeBalanceAfter = new BigNumber(balancesAfter[1]);

    console.log(
      payeeBalanceAfter.equals(payeeBalanceBefore) &&
        doneeBalanceAfter.equals(doneeBalanceBefore)
    );
  })();
};

(async () => {
  await (async () => {
    await runTests("./Y_should_fail_tests.sol");
    console.log("end of false tests");
    await runTests("../Y.sol"); // The problem now is that Y.sol doesn't run because the tests have the failing contracts defined as contract in their context. Each failing contract should have a list of tests associated with it. An important principle is not to invoke tests manually (e.g. by typing the test's name, or even trying to use IIFEs), in case a test is defined but not called. In other words, defining the test in the right place should be enough to run it.
  })();

  await (async () => {
    const accounts = await web3.eth.getAccounts();
    const payer = accounts[1],
      payee = accounts[0],
      donee = accounts[9];

    console.log(
      "end of old tests",
      [
        {
          name: "Y_cant_change_percent.sol",
          tests: [async () => {}, async () => {}]
        },
        { name: "Y_should_fail_tests.sol", tests: [async () => {}] }
      ].map(async contract => {
        const compiled = solc.compile(
          fs.readFileSync("./" + contract.name, "utf8")
        );
        const abi = compiled.contracts[":Y"].interface;
        const bytecode = compiled.contracts[":Y"].bytecode;
        const contractForTest = await new web3.eth.Contract(JSON.parse(abi))
          .deploy({
            data: bytecode,
            arguments: [1, 100]
          })
          .send({
            from: payee,
            gas: 1500000 // copied from https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id11
          });

        return contract.tests.map(async test => await test(contractForTest));
      })
    );
  })();
})();
// then run all tests against Y.
// require("repl").start();

// p = 1, d = 50%: Tests like this have to be caught by Y.js until Solidity can handle them. If it fails here (which it will while Solidity can't represent decimals, e.g. 0.5), then test that Y.js can handle this (call to Y.js's tests).

// p = 100, d = 7.9%
// p = 2^256 - 1, d = 8% (num: 2, denom: 25)

// p > 0
