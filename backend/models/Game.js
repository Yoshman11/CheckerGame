const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    board: { type: [[String]], default: Array(8).fill(Array(8).fill("")) },
    players: { type: [String], required: true },
    currentPlayer: { type: String, required: true },
    status: { type: String, default: 'ongoing' }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
