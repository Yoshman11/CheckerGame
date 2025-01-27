import express from 'express';
import { auth } from '../middleware/auth.js';
import Game from '../models/Game.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const initialBoard = {
      pieces: [
        { id: 'b1', player: 'black', type: 'regular', position: { row: 0, col: 1 } },
        { id: 'b2', player: 'black', type: 'regular', position: { row: 0, col: 3 } },
        { id: 'b3', player: 'black', type: 'regular', position: { row: 0, col: 5 } },
        { id: 'b4', player: 'black', type: 'regular', position: { row: 0, col: 7 } },
        { id: 'b5', player: 'black', type: 'regular', position: { row: 1, col: 0 } },
        { id: 'b6', player: 'black', type: 'regular', position: { row: 1, col: 2 } },
        { id: 'b7', player: 'black', type: 'regular', position: { row: 1, col: 4 } },
        { id: 'b8', player: 'black', type: 'regular', position: { row: 1, col: 6 } },
        { id: 'b9', player: 'black', type: 'regular', position: { row: 2, col: 1 } },
        { id: 'b10', player: 'black', type: 'regular', position: { row: 2, col: 3 } },
        { id: 'b11', player: 'black', type: 'regular', position: { row: 2, col: 5 } },
        { id: 'b12', player: 'black', type: 'regular', position: { row: 2, col: 7 } },
        { id: 'w1', player: 'white', type: 'regular', position: { row: 5, col: 0 } },
        { id: 'w2', player: 'white', type: 'regular', position: { row: 5, col: 2 } },
        { id: 'w3', player: 'white', type: 'regular', position: { row: 5, col: 4 } },
        { id: 'w4', player: 'white', type: 'regular', position: { row: 5, col: 6 } },
        { id: 'w5', player: 'white', type: 'regular', position: { row: 6, col: 1 } },
        { id: 'w6', player: 'white', type: 'regular', position: { row: 6, col: 3 } },
        { id: 'w7', player: 'white', type: 'regular', position: { row: 6, col: 5 } },
        { id: 'w8', player: 'white', type: 'regular', position: { row: 6, col: 7 } },
        { id: 'w9', player: 'white', type: 'regular', position: { row: 7, col: 0 } },
        { id: 'w10', player: 'white', type: 'regular', position: { row: 7, col: 2 } },
        { id: 'w11', player: 'white', type: 'regular', position: { row: 7, col: 4 } },
        { id: 'w12', player: 'white', type: 'regular', position: { row: 7, col: 6 } }
      ]
    };

    const game = new Game({
      player1: req.userId,
      status: 'active',
      board: JSON.stringify(initialBoard)
    });
    
    await game.save();
    res.status(201).json({ ...game.toObject(), board: initialBoard });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('player1 player2 winner');
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ ...game.toObject(), board: JSON.parse(game.board) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/moves', auth, async (req, res) => {
  try {
    const { from, to } = req.body;
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }

    const board = JSON.parse(game.board);
    const piece = board.pieces.find(p => 
      p.position.row === from.row && p.position.col === from.col
    );

    if (!piece) {
      return res.status(400).json({ error: 'No piece at source position' });
    }

    const rowDir = Math.sign(to.row - from.row);
    const colDir = Math.sign(to.col - from.col);
    const distance = Math.abs(to.row - from.row);

    if (Math.abs(to.row - from.row) !== Math.abs(to.col - from.col)) {
      return res.status(400).json({ error: 'Invalid diagonal movement' });
    }

    if (piece.type === 'regular' && distance > 2) {
      return res.status(400).json({ error: 'Invalid move distance for regular piece' });
    }

    let checkRow = from.row;
    let checkCol = from.col;
    let enemyFound = false;
    let capturedPieceIndex = -1;

    for (let i = 1; i <= distance; i++) {
      checkRow += rowDir;
      checkCol += colDir;
      
      const pieceAtPosition = board.pieces.findIndex(p =>
        p.position.row === checkRow && p.position.col === checkCol
      );
      
      if (pieceAtPosition !== -1) {
        if (piece.type === 'king') {
          if (board.pieces[pieceAtPosition].player === piece.player) {
            return res.status(400).json({ error: 'Path blocked by own piece' });
          }
          if (enemyFound) {
            return res.status(400).json({ error: 'Multiple pieces in path' });
          }
          enemyFound = true;
          capturedPieceIndex = pieceAtPosition;
        } else {
          if (i === 1 && board.pieces[pieceAtPosition].player !== piece.player) {
            capturedPieceIndex = pieceAtPosition;
          } else {
            return res.status(400).json({ error: 'Invalid capture move' });
          }
        }
      }
    }

    if (piece.type === 'king' && !enemyFound && distance > 1) {
      piece.position = to;
    } else {
      if (capturedPieceIndex !== -1) {
        board.pieces.splice(capturedPieceIndex, 1);
      } else if (distance > 1) {
        return res.status(400).json({ error: 'No piece to capture' });
      }
      piece.position = to;
    }

    if (piece.type === 'regular') {
      if ((piece.player === 'black' && to.row === 7) ||
          (piece.player === 'white' && to.row === 0)) {
        piece.type = 'king';
      }
    }

    game.board = JSON.stringify(board);
    
    if (game.checkGameEnd()) {
      const winner = await User.findById(game.winner);
      const loser = await User.findById(
        game.winner.equals(game.player1) ? game.player2 : game.player1
      );

      if (winner) {
        winner.stats.wins += 1;
        await winner.save();
      }
      if (loser) {
        loser.stats.losses += 1;
        await loser.save();
      }
    }

    await game.save();
    res.json({ ...game.toObject(), board });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;