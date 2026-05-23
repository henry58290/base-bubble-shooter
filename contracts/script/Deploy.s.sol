// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { GameLeaderboard } from "../src/GameLeaderboard.sol";

/// @notice Deploys GameLeaderboard. The signer is supplied by the forge CLI
///         (e.g. an encrypted keystore via --account, or --ledger), so no raw
///         private key is read from the environment.
/// @dev Usage (encrypted keystore):
///        forge script script/Deploy.s.sol:Deploy \
///            --rpc-url base \
///            --account <keystore-name> \
///            --sender <deployer-address> \
///            --broadcast \
///            --verify
contract Deploy is Script {
    function run() external returns (GameLeaderboard board) {
        vm.startBroadcast();
        board = new GameLeaderboard();
        vm.stopBroadcast();

        console2.log("GameLeaderboard deployed at:", address(board));
        console2.log("Set NEXT_PUBLIC_LEADERBOARD_ADDRESS to the address above.");
    }
}
