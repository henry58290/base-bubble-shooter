// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { GameLeaderboard } from "../src/GameLeaderboard.sol";

/// @notice Deploys GameLeaderboard. Reads DEPLOYER_PRIVATE_KEY from the environment.
/// @dev Usage:
///        forge script script/Deploy.s.sol:Deploy \
///            --rpc-url base \
///            --broadcast \
///            --verify
contract Deploy is Script {
    function run() external returns (GameLeaderboard board) {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(pk);
        board = new GameLeaderboard();
        vm.stopBroadcast();

        console2.log("GameLeaderboard deployed at:", address(board));
        console2.log("Set NEXT_PUBLIC_LEADERBOARD_ADDRESS to the address above.");
    }
}
