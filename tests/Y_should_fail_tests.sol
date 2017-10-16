pragma solidity 0.4.17;


contract Y {
    address public payee;
    uint public num; // donation proportion numerator
    uint public denom; // donation proportion denominator

    // * num and denom are valid if num is more than 0 and less than denom, and denom is less than or equal to Solidity's maximum uint.

    /// Only use Y function if _num and _denom are valid*.
    function Y(uint _num, uint _denom) {}

    /// Only use payAndDonate if num is more than 0 and less than denom, msg.value multiplied by num will be less than or equal to Solidity's maximum uint, and donation will not be 0 (e.g. 1 / 2 is 0, as 0.5 is not a uint). Donation may not be exactly donation percent multiplied by msg.value (e.g. 7.9% of 100 will be 7, as 7.9 is not a uint).
    function payAndDonate(address donee) payable {}

    /// Only use changeNumAndDenom if msg.sender is the payee, and _num and _denom are valid*.
    function changeNumAndDenom(uint _num, uint _denom) {
        num = _num;
        denom = _denom;
    }

    /// For e.g. 4% (1/25) to 8% (2/25). Use as per changeNumAndDenom.
    function changeNum(uint _num) {
        num = _num;
    }

    /// For e.g. 1% (1/100) to 2% (1/50). Use as per changeNumAndDenom.
    function changeDenom(uint _denom) {
        denom = _denom;
    }
}
