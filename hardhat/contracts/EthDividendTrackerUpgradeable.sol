// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract EthDividendTrackerUpgradeable is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    IERC20MetadataUpgradeable public HAYQToken;

    mapping(address => uint256) public withdrawnDividends;
    uint256 public totalDividendsDistributed;
    uint256 public magnifiedDividendPerShare;
    uint256 constant internal magnitude = 2**128;

    event DividendsDistributed(address indexed from, uint256 weiAmount);
    event DividendWithdrawn(address indexed to, uint256 weiAmount);

    function initialize(address _hayqToken) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        require(_hayqToken != address(0), "Invalid token address");
        HAYQToken = IERC20MetadataUpgradeable(_hayqToken);
    }

    receive() external payable {
        distributeDividends();
    }

    function distributeDividends() public payable {
        require(msg.value > 0, "No ETH sent");
        uint256 supply = HAYQToken.totalSupply();
        require(supply > 0, "No tokens minted");

        magnifiedDividendPerShare += (msg.value * magnitude) / supply;
        totalDividendsDistributed += msg.value;

        emit DividendsDistributed(msg.sender, msg.value);
    }

    function withdrawDividend() external nonReentrant {
        uint256 _withdrawableDividend = withdrawableDividendOf(msg.sender);
        require(_withdrawableDividend > 0, "No dividend");

        withdrawnDividends[msg.sender] += _withdrawableDividend;
        payable(msg.sender).transfer(_withdrawableDividend);

        emit DividendWithdrawn(msg.sender, _withdrawableDividend);
    }

    function withdrawableDividendOf(address _owner) public view returns(uint256) {
        return accumulativeDividendOf(_owner) - withdrawnDividends[_owner];
    }

    function accumulativeDividendOf(address _owner) public view returns(uint256) {
        return (magnifiedDividendPerShare * HAYQToken.balanceOf(_owner)) / magnitude;
    }
}
