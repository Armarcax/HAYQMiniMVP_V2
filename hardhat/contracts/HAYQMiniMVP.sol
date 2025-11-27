// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20SnapshotUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

interface IVestingVaultUpgradeable {
    function createVesting(address beneficiary, uint256 amount, uint64 start, uint64 duration) external;
}

interface IVestingVaultReadable {
    function totalVested(address user) external view returns (uint256);
    function released(address user) external view returns (uint256);
}

interface IHAYQMiniMVP {
    function mint(address to, uint256 amount) external;
}

interface IRouter {
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

interface IERC20AllowanceReadable {
    function allowance(address owner, address spender) external view returns (uint256);
}

contract HAYQMiniMVP is Initializable, ERC20Upgradeable, ERC20SnapshotUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using AddressUpgradeable for address;

    IRouter public router;
    IHAYQMiniMVP public miniMVP;
    mapping(address => uint256) public staked;

    address public vestingVault;
    IVestingVaultReadable public vestingVaultReadable;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Buyback(uint256 tokens, uint256 minOut);
    event TeamVestingCreated(address indexed beneficiary, uint256 amount, uint64 start, uint64 duration);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 initialSupply, address _router) public initializer {
        __ERC20_init("HAYQ Token", "HAYQ");
        __ERC20Snapshot_init();
        __Ownable_init();
        __ReentrancyGuard_init();

        if (_router != address(0)) {
            router = IRouter(_router);
        }
        miniMVP = IHAYQMiniMVP(address(0));
        vestingVault = address(0);
        vestingVaultReadable = IVestingVaultReadable(address(0));

        _mint(msg.sender, initialSupply * 1e18);
    }

    // --- Setters ---
    function setRouter(address _router) external onlyOwner {
        require(_router != address(0), "Invalid router");
        router = IRouter(_router);
    }

    function setMiniMVP(address _mini) external onlyOwner {
        miniMVP = IHAYQMiniMVP(_mini);
    }

    function setVestingVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid vault");
        vestingVault = _vault;
    }

    function setVestingVaultReadable(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid vault");
        vestingVaultReadable = IVestingVaultReadable(_vault);
    }

    // --- Team Vesting ---
    function createTeamVesting(
        address beneficiary,
        uint256 amount,
        uint64 start,
        uint64 duration
    ) external onlyOwner {
        require(vestingVault != address(0), "Vesting vault not set");
        require(beneficiary != address(0), "Invalid beneficiary");

        uint256 amountWithDecimals = amount * 1e18;
        require(balanceOf(msg.sender) >= amountWithDecimals, "Insufficient balance for vesting");

        _transfer(msg.sender, vestingVault, amountWithDecimals);
        IVestingVaultUpgradeable(vestingVault).createVesting(beneficiary, amountWithDecimals, start, duration);

        emit TeamVestingCreated(beneficiary, amountWithDecimals, start, duration);
    }

    // --- Snapshot ---
    function snapshot() external onlyOwner {
        _snapshot();
    }

    // --- Staking ---
    function stake(uint256 amount) external nonReentrant {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
        staked[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(staked[msg.sender] >= amount, "Not enough staked");
        staked[msg.sender] -= amount;
        _mint(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    // --- Buyback ---
    function buyback(uint256 tokenAmount, uint256 minOut) external onlyOwner nonReentrant {
        require(balanceOf(address(this)) >= tokenAmount, "Not enough tokens in contract");
        _burn(address(this), tokenAmount);
        emit Buyback(tokenAmount, minOut);
    }

    // --- Mint ---
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 1e18);
    }

    // --- Wallet inspection functions ---
    function stakedBalanceOf(address user) external view returns (uint256) {
        return staked[user];
    }

    function vestingTotal(address user) external view returns (uint256) {
        if (address(vestingVaultReadable) == address(0)) return 0;
        return vestingVaultReadable.totalVested(user);
    }

    function vestingReleased(address user) external view returns (uint256) {
        if (address(vestingVaultReadable) == address(0)) return 0;
        return vestingVaultReadable.released(user);
    }

    function allowanceToRouter(address user) external view returns (uint256) {
        if (address(router) == address(0)) return 0;
        return IERC20AllowanceReadable(address(this)).allowance(user, address(router));
    }

    // --- Overrides ---
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20SnapshotUpgradeable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    // --- Preserve storage gap ---
    uint256[50] private __gap;
}
