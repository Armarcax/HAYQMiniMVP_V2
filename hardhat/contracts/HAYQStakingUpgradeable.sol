// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract HAYQStakingUpgradeable is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    IERC20Upgradeable public hayqToken;

    struct StakeInfo {
        uint256 amount;
        uint256 since;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public rewardRate; // օրինակ՝ 10 = տարեկան 10%

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    function initialize(address _token, uint256 _rewardRate) public initializer {
    __Ownable_init(); // առանց arguments
    __ReentrancyGuard_init();

    hayqToken = IERC20Upgradeable(_token);
    rewardRate = _rewardRate;
    }


    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        hayqToken.transferFrom(msg.sender, address(this), _amount);

        StakeInfo storage s = stakes[msg.sender];
        s.amount += _amount;
        s.since = block.timestamp;

        emit Staked(msg.sender, _amount);
    }

    function unstake() external nonReentrant {
        StakeInfo storage s = stakes[msg.sender];
        require(s.amount > 0, "Nothing to unstake");

        uint256 duration = block.timestamp - s.since;
        uint256 reward = (s.amount * rewardRate * duration) / (365 days * 100);

        uint256 total = s.amount + reward;
        hayqToken.transfer(msg.sender, total);

        emit Unstaked(msg.sender, s.amount, reward);

        delete stakes[msg.sender];
    }

    function getPendingReward(address user) external view returns (uint256) {
        StakeInfo memory s = stakes[user];
        if (s.amount == 0) return 0;

        uint256 duration = block.timestamp - s.since;
        uint256 reward = (s.amount * rewardRate * duration) / (365 days * 100);
        return reward;
    }
}
