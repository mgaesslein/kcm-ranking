export function requireApiKey(req, res, next) {
  // Skip authentication for GET requests (read-only)
  if (req.method === 'GET') {
    return next();
  }

  // Require API key for write operations
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid API key required for this operation'
    });
  }

  next();
}

