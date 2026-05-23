// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GameLeaderboard
/// @notice Stores each player's latest score and a globally-sorted top-N leaderboard.
/// @dev Designed for the Neon Pop arcade game. Free-to-play: `submitScore` takes no
///      fee and accepts every submission. Each submission ALWAYS overwrites the
///      player's stored score and their leaderboard slot, so a lower score drops
///      their rank rather than being ignored.
///
///      v4: latest-score semantics. Earlier versions kept a player's best score;
///      now the newest submission always wins, even when it's lower.
contract GameLeaderboard {
    /// @dev Fixed cap on the global leaderboard size. Bounded so on-chain
    ///      sort/insert remains gas-stable.
    uint256 public constant LEADERBOARD_SIZE = 100;

    struct Entry {
        address player;
        uint256 score;
    }

    /// @notice Each player's most recently submitted score.
    mapping(address => uint256) public latestScore;

    /// @dev Top scores sorted in descending order. Length is bounded by LEADERBOARD_SIZE.
    Entry[] private _top;

    /// @notice Address allowed to withdraw accumulated fees / transfer ownership.
    address public owner;

    /// @notice Emitted on every successful score submission.
    /// @param improved True when the new score beat the player's previous stored score.
    event ScoreSubmitted(address indexed player, uint256 score, bool improved);

    /// @notice Emitted when a player enters or moves within the global leaderboard.
    /// @param rank The 0-indexed slot the player ended up at after the update.
    event LeaderboardUpdated(address indexed player, uint256 score, uint256 rank);

    /// @notice Emitted when the owner pulls accumulated fees out of the contract.
    event FeesWithdrawn(address indexed to, uint256 amount);

    /// @notice Emitted when ownership is transferred.
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error ScoreNotPositive();
    error NotOwner();
    error ZeroAddress();
    error WithdrawFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /// @notice Submit a score. Free to call and unlimited. The submission ALWAYS
    ///         overwrites the player's stored score and leaderboard position, even
    ///         when it's lower than a previous one — a worse run drops their rank.
    /// @param newScore The candidate score (must be > 0).
    function submitScore(uint256 newScore) external {
        if (newScore == 0) revert ScoreNotPositive();

        uint256 previous = latestScore[msg.sender];
        bool improved = newScore > previous;

        latestScore[msg.sender] = newScore;
        _updateLeaderboard(msg.sender, newScore);

        emit ScoreSubmitted(msg.sender, newScore, improved);
    }

    /// @notice Read the current top leaderboard. Length is between 0 and LEADERBOARD_SIZE.
    function getTopScores() external view returns (Entry[] memory) {
        return _top;
    }

    /// @notice Convenience getter for a single player's latest score.
    function getLatestScore(address player) external view returns (uint256) {
        return latestScore[player];
    }

    /// @notice Current number of populated leaderboard slots.
    function leaderboardLength() external view returns (uint256) {
        return _top.length;
    }

    // ------------------------------------------------------------------
    // Owner-only
    // ------------------------------------------------------------------

    /// @notice Drain the contract's full ETH balance to the current owner.
    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        (bool ok, ) = payable(owner).call{ value: amount }("");
        if (!ok) revert WithdrawFailed();
        emit FeesWithdrawn(owner, amount);
    }

    /// @notice Transfer ownership to a new address. Pass `address(0)` is rejected;
    ///         use a multisig / burn pattern off-chain if you want to renounce.
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address prev = owner;
        owner = newOwner;
        emit OwnershipTransferred(prev, newOwner);
    }

    // ------------------------------------------------------------------
    // Internals
    // ------------------------------------------------------------------

    /// @dev Insert-or-overwrite the player's leaderboard entry, then re-sort it.
    function _updateLeaderboard(address player, uint256 score) internal {
        uint256 len = _top.length;

        // 1. Player already holds a slot — overwrite the score and re-sort. Because
        //    the new score may be lower than the old one, the entry can sink as well
        //    as rise, so reposition in whichever direction is needed.
        for (uint256 i; i < len; ++i) {
            if (_top[i].player == player) {
                _top[i].score = score;
                uint256 finalIdx = _reposition(i);
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
        // Otherwise the score isn't top-N globally — no leaderboard mutation.
    }

    /// @dev Re-sort the entry at `idx` after its score changed in place: try to rise
    ///      first, and if it didn't move, try to sink. Returns its final index.
    function _reposition(uint256 idx) internal returns (uint256) {
        uint256 up = _bubbleUp(idx);
        if (up != idx) return up;
        return _bubbleDown(idx);
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

    /// @dev Bubble the entry at `idx` downwards while it ranks below its successor.
    /// @return The final resting index after sorting.
    function _bubbleDown(uint256 idx) internal returns (uint256) {
        uint256 len = _top.length;
        while (idx + 1 < len && _top[idx].score < _top[idx + 1].score) {
            Entry memory tmp = _top[idx + 1];
            _top[idx + 1] = _top[idx];
            _top[idx] = tmp;
            unchecked {
                ++idx;
            }
        }
        return idx;
    }
}
