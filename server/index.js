import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/checkers');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

const loadRoutes = async () => {
  try {
    const authRoutes = (await import('./routes/auth.js')).default;
    const gamesRoutes = (await import('./routes/games.js')).default;
    const usersRoutes = (await import('./routes/users.js')).default;

    app.use('/api/auth', authRoutes);
    app.use('/api/games', gamesRoutes);
    app.use('/api/users', usersRoutes);
  } catch (error) {
    console.error('Error loading routes:', error);
  }
};

loadRoutes();

if (process.env.NODE_ENV === 'production') {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('game.join', (gameId) => {
    socket.join(gameId);
    console.log(`User ${socket.id} joined game ${gameId}`);
  });

  socket.on('game.move', (data) => {
    io.to(data.gameId).emit('game.move', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});