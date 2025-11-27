// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract MultiSigTimelockUpgradeable is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    uint256 public constant MIN_DELAY = 0 seconds; // MVP-ի համար՝ 0
    uint256 public requiredConfirmations;

    address[] public owners;
    mapping(address => bool) public isOwner;

    struct Transaction {
        address target;
        uint256 value;
        bytes data;
        uint256 eta;
        uint256 confirmations;
        bool executed;
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;

    event Submit(uint256 indexed txId, address indexed target, uint256 value, bytes data, uint256 eta);
    event Confirm(address indexed owner, uint256 indexed txId);
    event Execute(uint256 indexed txId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address[] memory _owners, uint256 _required) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        require(_owners.length >= _required && _required > 0, "Invalid setup");

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Zero owner");
            require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredConfirmations = _required;
    }

    modifier onlyOwnerValid() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    function submit(address target, uint256 value, bytes memory data) external onlyOwnerValid {
        uint256 eta = block.timestamp + MIN_DELAY;
        transactions.push(Transaction({
            target: target,
            value: value,
            data: data,
            eta: eta,
            confirmations: 0,
            executed: false
        }));

        emit Submit(transactions.length - 1, target, value, data, eta);
    }

    function confirm(uint256 txId) external onlyOwnerValid {
        require(txId < transactions.length, "Tx does not exist");
        require(!confirmations[txId][msg.sender], "Already confirmed");

        confirmations[txId][msg.sender] = true;
        transactions[txId].confirmations += 1;

        emit Confirm(msg.sender, txId);
    }

    function execute(uint256 txId) external nonReentrant onlyOwnerValid {
        require(txId < transactions.length, "Tx does not exist");

        Transaction storage txn = transactions[txId];
        require(block.timestamp >= txn.eta, "Timelock not passed");
        require(!txn.executed, "Already executed");
        require(txn.confirmations >= requiredConfirmations, "Not enough confirmations");

        (bool success, ) = txn.target.call{value: txn.value}(txn.data);
        require(success, "Execution failed");

        txn.executed = true;
        emit Execute(txId);
    }

    receive() external payable {}
}
