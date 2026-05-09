// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { GameLeaderboard } from "../src/GameLeaderboard.sol";

contract GameLeaderboardTest is Test {
    GameLeaderboard internal board;

    function setUp() public {
        board = new GameLeaderboard();
    }

    // -- submitScore --------------------------------------------------------

    function test_RecordsHighScore() public {
        address alice = makeAddr("alice");
        vm.prank(alice);
        board.submitScore(100);
        assertEq(board.getHighScore(alice), 100);
    }

    function test_RejectsZeroScore() public {
        address alice = makeAddr("alice");
        vm.prank(alice);
        vm.expectRevert(GameLeaderboard.ScoreNotPositive.selector);
        board.submitScore(0);
    }

    function test_RejectsLowerOrEqualScore() public {
        address alice = makeAddr("alice");

        vm.prank(alice);
        board.submitScore(100);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(GameLeaderboard.ScoreNotImproved.selector, 100, 50)
        );
        board.submitScore(50);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(GameLeaderboard.ScoreNotImproved.selector, 100, 100)
        );
        board.submitScore(100);
    }

    function test_AcceptsHigherScore() public {
        address alice = makeAddr("alice");
        vm.prank(alice);
        board.submitScore(100);

        vm.prank(alice);
        board.submitScore(150);
        assertEq(board.getHighScore(alice), 150);
    }

    // -- leaderboard ordering ----------------------------------------------

    function test_SortsDescending() public {
        _submit("alice", 50);
        _submit("bob", 100);
        _submit("carol", 75);

        GameLeaderboard.Entry[] memory top = board.getTopScores();
        assertEq(top.length, 3);
        assertEq(top[0].score, 100);
        assertEq(top[1].score, 75);
        assertEq(top[2].score, 50);
    }

    function test_PlayerImprovesRanking() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        vm.prank(alice);
        board.submitScore(50);
        vm.prank(bob);
        board.submitScore(100);

        // Alice climbs above Bob.
        vm.prank(alice);
        board.submitScore(200);

        GameLeaderboard.Entry[] memory top = board.getTopScores();
        assertEq(top[0].player, alice);
        assertEq(top[0].score, 200);
        assertEq(top[1].player, bob);
        assertEq(top[1].score, 100);
        // No duplicate Alice entry.
        assertEq(top.length, 2);
    }

    function test_CapsAtTwenty() public {
        // Submit 25 distinct players with strictly increasing scores.
        for (uint256 i; i < 25; ++i) {
            address player = address(uint160(0x1000 + i));
            vm.prank(player);
            board.submitScore((i + 1) * 10);
        }

        assertEq(board.leaderboardLength(), 20);

        GameLeaderboard.Entry[] memory top = board.getTopScores();
        // Top score is the latest (largest) one: 25 * 10 = 250.
        assertEq(top[0].score, 250);
        // Entries 1..5 should be evicted; lowest remaining is 6 * 10 = 60.
        assertEq(top[19].score, 60);

        // Confirm sorted ordering across the whole array.
        for (uint256 i = 1; i < top.length; ++i) {
            assertGe(top[i - 1].score, top[i].score);
        }
    }

    function test_LowerScoreFromNewPlayerDoesNotEvict() public {
        // Fill the board with strong scores.
        for (uint256 i; i < 20; ++i) {
            address player = address(uint160(0x2000 + i));
            vm.prank(player);
            board.submitScore(1000 + i);
        }

        address newcomer = makeAddr("newcomer");
        vm.prank(newcomer);
        board.submitScore(10); // well below the lowest current score

        // Newcomer's high score is recorded, but the leaderboard is unchanged.
        assertEq(board.getHighScore(newcomer), 10);
        assertEq(board.leaderboardLength(), 20);

        GameLeaderboard.Entry[] memory top = board.getTopScores();
        for (uint256 i; i < top.length; ++i) {
            assertTrue(top[i].player != newcomer);
        }
    }

    // -- helpers ------------------------------------------------------------

    function _submit(string memory label, uint256 score) internal {
        address player = makeAddr(label);
        vm.prank(player);
        board.submitScore(score);
    }
}
