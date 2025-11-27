// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MockOracleV2 is Initializable, OwnableUpgradeable {
    mapping(string => int256) private prices;
    event PriceUpdated(string indexed symbol, int256 oldPrice, int256 newPrice);

    function initialize() public initializer {
        __Ownable_init();
    }

    function setPrice(string memory symbol, int256 _price) external onlyOwner {
        int256 oldPrice = prices[symbol];
        prices[symbol] = _price;
        emit PriceUpdated(symbol, oldPrice, _price);
    }

    function getPrice(string memory symbol) external view returns (int256) {
        return prices[symbol];
    }

    // ✅ Նոր ֆունկցիա՝ ցույց տալու համար որ upgrade եղավ
    function version() external pure returns (string memory) {
        return "V2";
    }
}
