// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GameLeaderboard
/// @notice Stores per-player high scores and a globally-sorted top-N leaderboard.
/// @dev Designed for the Neon Pop arcade game. Optimised for the common case where
///      most submissions either don't beat the player's previous high score (revert
///      cheaply) or only need to update an existing leaderboard slot.
contract GameLeaderboard {
    /// @dev Fixed cap on the global leaderboard size. Bounded so on-chain
    ///      sort/insert remains gas-stable. 20 keeps `getTopScores()` cheap to read.
    uint256 public constant LEADERBOARD_SIZE = 20;

    struct Entry {
        address player;
        uint256 score;
    }

    /// @notice Highest score every player has submitted.
    mapping(address => uint256) public highScore;

    /// @dev Top scores sorted in descending order. Length is bounded by LEADERBOARD_SIZE.
    Entry[] private _top;

    /// @notice Emitted on every successful score submission.
    event ScoreSubmitted(address indexed player, uint256 score, bool newHighScore);

    /// @notice Emitted when a player enters or moves within the global leaderboard.
    /// @param rank The 0-indexed slot the player ended up at after the update.
    event LeaderboardUpdated(address indexed player, uint256 score, uint256 rank);

    error ScoreNotPositive();
    error ScoreNotImproved(uint256 previous, uint256 attempted);

    /// @notice Submit a new score. Reverts unless it strictly beats the player's previous high.
    /// @param newScore The candidate score (must be > 0 and > caller's stored high).
    function submitScore(uint256 newScore) external {
        if (newScore == 0) revert ScoreNotPositive();

        uint256 previous = highScore[msg.sender];
        if (newScore <= previous) revert ScoreNotImproved(previous, newScore);

        highScore[msg.sender] = newScore;
        _updateLeaderboard(msg.sender, newScore);

        emit ScoreSubmitted(msg.sender, newScore, true);
    }

    /// @notice Read the current top leaderboard. Length is between 0 and LEADERBOARD_SIZE.
    function getTopScores() external view returns (Entry[] memory) {
        return _top;
    }

    /// @notice Convenience getter for a single player's high score.
    function getHighScore(address player) external view returns (uint256) {
        return highScore[player];
    }

    /// @notice Current number of populated leaderboard slots.
    function leaderboardLength() external view returns (uint256) {
        return _top.length;
    }

    // ------------------------------------------------------------------
    // Internals
    // ------------------------------------------------------------------

    /// @dev Insert-or-update the player's leaderboard entry, then bubble it up.
    function _updateLeaderboard(address player, uint256 score) internal {
        uint256 len = _top.length;

        // 1. If the player already holds a slot, update in place and bubble up.
        for (uint256 i; i < len; ++i) {
            if (_top[i].player == player) {
                _top[i].score = score;
                uint256 finalIdx = _bubbleUp(i);
                emit LeaderboardUpdated(player, score, finalIdx);
                return;
            }
        }

        // 2. Player is not on the board yet.
        if (len < LEADERBOARD_SIZE) {
            // Free slot available — append and sort up.
            _top.push(Entry({ player: player, score: score }));
            uint256 finalIdx = _bubbleUp(len);
            emit LeaderboardUpdated(player, score, finalIdx);
            return;
        }

        // 3. Board is full. Replace the lowest entry only if the new score beats it.
        uint256 lastIdx = LEADERBOARD_SIZE - 1;
        if (score > _top[lastIdx].score) {
            _top[lastIdx] = Entry({ player: player, score: score });
            uint256 finalIdx = _bubbleUp(lastIdx);
            emit LeaderboardUpdated(player, score, finalIdx);
        }
        // Otherwise the score isn't top-20 globally — no leaderboard mutation.
    }

    /// @dev Bubble the entry at `idx` upwards while it outranks its predecessor.
    /// @return The final resting index after sorting.
    function _bubbleUp(uint256 idx) internal returns (uint256) {
        while (idx > 0 && _top[idx].score > _top[idx - 1].score) {
            Entry memory tmp = _top[idx - 1];
            _top[idx - 1] = _top[idx];
            _top[idx] = tmp;
            unchecked {
                --idx;
            }
        }
        return idx;
    }
}
