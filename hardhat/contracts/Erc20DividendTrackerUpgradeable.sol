// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract Erc20DividendTrackerUpgradeable is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    IERC20MetadataUpgradeable public HAYQToken;
    IERC20Upgradeable public rewardToken;

    mapping(address => uint256) public withdrawnDividends;
    uint256 public totalDividendsDistributed;
    uint256 public magnifiedDividendPerShare;
    uint256 constant internal magnitude = 2**128;

    event DividendsDistributed(address indexed from, uint256 tokens);
    event DividendWithdrawn(address indexed to, uint256 tokens);

    function initialize(address _rewardToken, address _hayqToken) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        require(_rewardToken != address(0) && _hayqToken != address(0), "Invalid address");
        rewardToken = IERC20Upgradeable(_rewardToken);
        HAYQToken = IERC20MetadataUpgradeable(_hayqToken);
    }

    function distributeDividends(uint256 amount) external {
        require(amount > 0, "No tokens sent");
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 supply = HAYQToken.totalSupply();
        require(supply > 0, "No HAYQ minted");

        magnifiedDividendPerShare += (amount * magnitude) / supply;
        totalDividendsDistributed += amount;

        emit DividendsDistributed(msg.sender, amount);
    }

    function withdrawDividend() external nonReentrant {
        uint256 _withdrawableDividend = withdrawableDividendOf(msg.sender);
        require(_withdrawableDividend > 0, "No dividend");

        withdrawnDividends[msg.sender] += _withdrawableDividend;
        require(rewardToken.transfer(msg.sender, _withdrawableDividend), "Transfer failed");

        emit DividendWithdrawn(msg.sender, _withdrawableDividend);
    }

    function withdrawableDividendOf(address _owner) public view returns(uint256) {
        return accumulativeDividendOf(_owner) - withdrawnDividends[_owner];
    }

    function accumulativeDividendOf(address _owner) public view returns(uint256) {
        return (magnifiedDividendPerShare * HAYQToken.balanceOf(_owner)) / magnitude;
    }
}
