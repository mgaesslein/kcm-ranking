import express from 'express';
import {
  getAllAliases,
  getAliasById,
  createAlias,
  updateAlias,
  deleteAlias,
  normalizeName
} from '../controllers/aliases.js';
import { requireApiKey } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Write limiter for alias write operations - disabled in development
const writeLimiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next() // Skip rate limiting in development
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // 50 write operations per 15 minutes
      message: 'Too many write requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

// GET /api/aliases - Get all aliases (read-only, no auth needed)
router.get('/', getAllAliases);

// GET /api/aliases/normalize/:name - Normalize a player name (read-only, no auth needed)
router.get('/normalize/:name', normalizeName);

// GET /api/aliases/:id - Get alias by ID (read-only, no auth needed)
router.get('/:id', getAliasById);

// POST /api/aliases - Create new alias (write, requires auth and rate limiting)
router.post('/', requireApiKey, writeLimiter, createAlias);

// PUT /api/aliases/:id - Update alias (write, requires auth and rate limiting)
router.put('/:id', requireApiKey, writeLimiter, updateAlias);

// DELETE /api/aliases/:id - Delete alias (write, requires auth and rate limiting)
router.delete('/:id', requireApiKey, writeLimiter, deleteAlias);

export default router;

