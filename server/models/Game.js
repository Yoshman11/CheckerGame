import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting'
  },
  currentTurn: {
    type: String,
    enum: ['black', 'white'],
    default: 'black'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moves: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    from: {
      row: Number,
      col: Number
    },
    to: {
      row: Number,
      col: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  board: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

gameSchema.methods.checkGameEnd = function() {
  const board = JSON.parse(this.board);
  const blackPieces = board.pieces.filter(p => p.player === 'black');
  const whitePieces = board.pieces.filter(p => p.player === 'white');

  if (blackPieces.length === 0) {
    this.status = 'completed';
    this.winner = this.player2;
    return true;
  }
  if (whitePieces.length === 0) {
    this.status = 'completed';
    this.winner = this.player1;
    return true;
  }

  return false;
};

export default mongoose.model('Game', gameSchema);