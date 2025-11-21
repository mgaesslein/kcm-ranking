import express from 'express';
import {
  getAllTournaments,
  getTournamentById,
  createTournament,
  deleteTournament
} from '../controllers/tournaments.js';
import { requireApiKey } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Write limiter for tournament write operations - disabled in development
const writeLimiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next() // Skip rate limiting in development
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // 50 write operations per 15 minutes
      message: 'Too many write requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

// GET /api/tournaments - Get all tournaments (read-only, no auth needed)
router.get('/', getAllTournaments);

// GET /api/tournaments/:id - Get tournament by ID (read-only, no auth needed)
router.get('/:id', getTournamentById);

// POST /api/tournaments - Create new tournament (write, requires auth and rate limiting)
router.post('/', requireApiKey, writeLimiter, createTournament);

// DELETE /api/tournaments/:id - Delete tournament (write, requires auth and rate limiting)
router.delete('/:id', requireApiKey, writeLimiter, deleteTournament);

export default router;

