// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VestingVaultUpgradeable is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    IERC20Upgradeable public token;
    address public HAYQ;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 released;
        uint64 start;
        uint64 duration;
    }

    mapping(address => VestingSchedule) public vestings;
    mapping(address => bool) public authorized;

    event VestingCreated(address indexed beneficiary, uint256 amount, uint64 start, uint64 duration);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event AuthorizedUpdated(address indexed account, bool status);

    function initialize(IERC20Upgradeable _token, address _hayq) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        require(address(_token) != address(0), "Invalid token");
        require(_hayq != address(0), "Invalid HAYQ address");
        token = _token;
        HAYQ = _hayq;
    }

    modifier onlyAuthorized() {
        require(msg.sender == HAYQ || msg.sender == owner() || authorized[msg.sender], "Not authorized");
        _;
    }

    function setAuthorized(address account, bool status) external onlyOwner {
        authorized[account] = status;
        emit AuthorizedUpdated(account, status);
    }

    function createVesting(address beneficiary, uint256 amount, uint64 start, uint64 duration) external onlyAuthorized {
        require(vestings[beneficiary].totalAmount == 0, "Already vested");
        require(duration > 0, "Duration must be > 0");

        vestings[beneficiary] = VestingSchedule(amount, 0, start, duration);
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance in Vault");

        emit VestingCreated(beneficiary, amount, start, duration);
    }

    function batchCreateVesting(
        address[] calldata beneficiaries,
        uint256[] calldata amounts,
        uint64 start,
        uint64 duration
    ) external onlyAuthorized {
        require(beneficiaries.length == amounts.length, "Array length mismatch");
        require(duration > 0, "Duration must be > 0");

        uint256 totalRequired = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            require(vestings[beneficiaries[i]].totalAmount == 0, "Already vested");
            vestings[beneficiaries[i]] = VestingSchedule(amounts[i], 0, start, duration);
            emit VestingCreated(beneficiaries[i], amounts[i], start, duration);
            totalRequired += amounts[i];
        }
        require(token.balanceOf(address(this)) >= totalRequired, "Insufficient Vault balance");
    }

    function release() external nonReentrant {
        VestingSchedule storage vesting = vestings[msg.sender];
        require(vesting.totalAmount > 0, "No vesting");

        uint256 vested = _vestedAmount(vesting);
        uint256 unreleased = vested - vesting.released;
        require(unreleased > 0, "Nothing to release");

        vesting.released += unreleased;
        require(token.transfer(msg.sender, unreleased), "Token transfer failed");

        emit TokensReleased(msg.sender, unreleased);
    }

    function _vestedAmount(VestingSchedule memory vesting) internal view returns (uint256) {
        if (block.timestamp < vesting.start) return 0;
        if (block.timestamp >= vesting.start + vesting.duration) return vesting.totalAmount;
        return (vesting.totalAmount * (block.timestamp - vesting.start)) / vesting.duration;
    }

    // ✅ Helper function for reading vesting info
    function getVestingInfo(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 released,
        uint256 start,
        uint256 duration,
        uint256 vested
    ) {
        VestingSchedule storage v = vestings[beneficiary];
        totalAmount = v.totalAmount;
        released = v.released;
        start = v.start;
        duration = v.duration;
        vested = _vestedAmount(v);
    }
}
