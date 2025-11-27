// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract RegistryUpgradeable is Initializable, OwnableUpgradeable {
    // Module key → implementation address
    mapping(bytes32 => address) private modules;
    bytes32[] public moduleKeys;

    event ModuleRegistered(bytes32 indexed key, address indexed module);
    event ModuleUpdated(bytes32 indexed key, address indexed oldModule, address indexed newModule);

    function initialize() public initializer {
        __Ownable_init();
    }

    function registerModule(bytes32 key, address module) external onlyOwner {
        require(module != address(0), "Invalid module address");
        require(modules[key] == address(0), "Module already registered");
        modules[key] = module;
        moduleKeys.push(key);
        emit ModuleRegistered(key, module);
    }

    function updateModule(bytes32 key, address newModule) external onlyOwner {
        require(newModule != address(0), "Invalid module address");
        address oldModule = modules[key];
        require(oldModule != address(0), "Module not found");
        modules[key] = newModule;
        emit ModuleUpdated(key, oldModule, newModule);
    }

    function getModule(bytes32 key) external view returns (address) {
        return modules[key];
    }

    function getAllModules() external view returns (bytes32[] memory keys, address[] memory addrs) {
        keys = moduleKeys;
        addrs = new address[](moduleKeys.length);
        for (uint i = 0; i < moduleKeys.length; i++) {
            addrs[i] = modules[moduleKeys[i]];
        }
    }
}
