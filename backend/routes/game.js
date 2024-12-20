const express = require('express');
const jwt = require('jsonwebtoken');
const Game = require('../models/Game');

const router = express.Router();

router.post('/create', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Unauthorized' });

    try {
        const { username } = jwt.verify(token, process.env.JWT_SECRET);
        const game = new Game({ players: [username], currentPlayer: username });
        await game.save();
        res.status(201).json(game);
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: 'Game not found' });
        res.json(game);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
