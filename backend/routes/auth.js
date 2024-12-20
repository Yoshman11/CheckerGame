const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const users = []; // Mock users

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users.push({ username, password });
    res.status(201).json({ message: 'User registered' });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

module.exports = router;
