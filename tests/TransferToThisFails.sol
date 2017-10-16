pragma solidity 0.4.17;


contract TransferToThisFails {
    function () payable {
        throw;
    }
}
