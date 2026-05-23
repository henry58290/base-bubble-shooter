// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { GameLeaderboard } from "../src/GameLeaderboard.sol";

contract GameLeaderboardTest is Test {
    GameLeaderboard internal board;

    address internal deployer = address(this);

    function setUp() public {
        board = new GameLeaderboard();
    }

    // -- submitScore --------------------------------------------------------

    function test_RecordsLatestScore() public {
        address alice = makeAddr("alice");
        vm.prank(alice);
        board.submitScore(100);
        assertEq(board.getLatestScore(alice), 100);
    }

    function test_RejectsZeroScore() public {
        address alice = makeAddr("alice");
        vm.prank(alice);
        vm.expectRevert(GameLeaderboard.ScoreNotPositive.selector);
        board.submitScore(0);
    }

    function test_NoFeeRequired() public {
        // Free-to-play: the call must succeed without sending any ETH.
        address alice = makeAddr("alice");
        vm.prank(alice);
        board.submitScore(100);
        assertEq(board.getLatestScore(alice), 100);
        assertEq(address(board).balance, 0);
    }

    function test_LatestScoreOverwritesLower() public {
        address alice = makeAddr("alice");

        vm.prank(alice);
        board.submitScore(100);
        assertEq(board.getLatestScore(alice), 100);

        // A lower submission overwrites the stored score (latest always wins).
        vm.prank(alice);
        board.submitScore(50);
        assertEq(board.getLatestScore(alice), 50);

        // An equal submission is likewise stored.
        vm.prank(alice);
        board.submitScore(50);
        assertEq(board.getLatestScore(alice), 50);
    }

    function test_LatestScoreOverwritesHigher() public {
        address alice = makeAddr("alice");

        vm.prank(alice);
        board.submitScore(100);

        vm.prank(alice);
        board.submitScore(150);
        assertEq(board.getLatestScore(alice), 150);
    }

    function test_UnlimitedSubmissions() public {
        address alice = makeAddr("alice");
        for (uint256 i; i < 10; ++i) {
            vm.prank(alice);
            board.submitScore(42); // same score over and over, all accepted
        }
        assertEq(board.getLatestScore(alice), 42);
    }

    // -- ownership / withdraw ----------------------------------------------

    function test_DeployerIsOwner() public view {
        assertEq(board.owner(), deployer);
    }

    function test_NonOwnerCannotWithdraw() public {
        address mallory = makeAddr("mallory");
        vm.prank(mallory);
        vm.expectRevert(GameLeaderboard.NotOwner.selector);
        board.withdrawFees();
    }

    function test_TransferOwnership() public {
        address newOwner = makeAddr("newOwner");
        board.transferOwnership(newOwner);
        assertEq(board.owner(), newOwner);

        // Old owner can no longer withdraw.
        vm.expectRevert(GameLeaderboard.NotOwner.selector);
        board.withdrawFees();
    }

    function test_TransferOwnershipRejectsZero() public {
        vm.expectRevert(GameLeaderboard.ZeroAddress.selector);
        board.transferOwnership(address(0));
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

        // Alice climbs above Bob with a higher latest score.
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

    function test_LowerResubmitDropsRank() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address carol = makeAddr("carol");

        vm.prank(alice);
        board.submitScore(300);
        vm.prank(bob);
        board.submitScore(200);
        vm.prank(carol);
        board.submitScore(100);
        // Board: [alice 300, bob 200, carol 100]

        // Alice's next run is weaker — she should sink below bob but stay above carol.
        vm.prank(alice);
        board.submitScore(150);

        GameLeaderboard.Entry[] memory top = board.getTopScores();
        assertEq(top.length, 3);
        assertEq(top[0].player, bob);
        assertEq(top[0].score, 200);
        assertEq(top[1].player, alice);
        assertEq(top[1].score, 150);
        assertEq(top[2].player, carol);
        assertEq(top[2].score, 100);
    }

    function test_LowerResubmitSinksToBottom() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address carol = makeAddr("carol");

        vm.prank(alice);
        board.submitScore(300);
        vm.prank(bob);
        board.submitScore(200);
        vm.prank(carol);
        board.submitScore(100);

        // Alice drops below everyone — she should fall to the last slot.
        vm.prank(alice);
        board.submitScore(50);

        GameLeaderboard.Entry[] memory top = board.getTopScores();
        assertEq(top.length, 3);
        assertEq(top[0].player, bob);
        assertEq(top[1].player, carol);
        assertEq(top[2].player, alice);
        assertEq(top[2].score, 50);
        // Sorted invariant holds.
        for (uint256 i = 1; i < top.length; ++i) {
            assertGe(top[i - 1].score, top[i].score);
        }
    }

    function test_CapsAtHundred() public {
        // Submit 105 distinct players with strictly increasing scores.
        for (uint256 i; i < 105; ++i) {
            address player = address(uint160(0x1000 + i));
            vm.prank(player);
            board.submitScore((i + 1) * 10);
        }

        assertEq(board.leaderboardLength(), 100);

        GameLeaderboard.Entry[] memory top = board.getTopScores();
        // Top score is the latest (largest) one: 105 * 10 = 1050.
        assertEq(top[0].score, 1050);
        // Entries 1..5 should be evicted; lowest remaining is 6 * 10 = 60.
        assertEq(top[99].score, 60);

        // Confirm sorted ordering across the whole array.
        for (uint256 i = 1; i < top.length; ++i) {
            assertGe(top[i - 1].score, top[i].score);
        }
    }

    function test_LowerScoreFromNewPlayerDoesNotEvict() public {
        // Fill the board with strong scores.
        for (uint256 i; i < 100; ++i) {
            address player = address(uint160(0x2000 + i));
            vm.prank(player);
            board.submitScore(1000 + i);
        }

        address newcomer = makeAddr("newcomer");
        vm.prank(newcomer);
        board.submitScore(10); // well below the lowest current score

        // Newcomer's latest score is recorded, but the leaderboard is unchanged.
        assertEq(board.getLatestScore(newcomer), 10);
        assertEq(board.leaderboardLength(), 100);

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

    // Required so this test contract can receive ETH on withdraw.
    receive() external payable {}
}
