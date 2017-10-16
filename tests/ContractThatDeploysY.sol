pragma solidity 0.4.17;

import "../Y.sol";


contract ContractThatDeploysY {
    Y public y = new Y(1, 100); // y is an address

    function () payable {
        throw;
    }
}
