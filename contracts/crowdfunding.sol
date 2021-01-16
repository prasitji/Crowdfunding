pragma solidity ^0.5.0;

contract crowdfunding {
    address[6] public investers;

    function Adopt(uint companyId) public returns (uint) {
        require(companyId >= 0 && companyId <=5);
        investers[companyId] = msg.sender;
        return companyId;
    }

    function getinvesters() public view returns (address[6] memory) {
        return investers;
    }
}