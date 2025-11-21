# Step-by-Step Security Implementation

This guide provides a minimal security setup to make the API production-ready.

## Step 1: Add API Key Authentication

### Install dependencies
```bash
npm install express-rate-limit
```

### Create middleware for API key authentication

Create `backend/src/middleware/auth.js`:
```javascript
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
```

### Update `backend/src/index.js`:
```javascript
import { requireApiKey } from './middleware/auth.js';
import rateLimit from 'express-rate-limit';

// ... existing code ...

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 write operations per 15 minutes
  message: 'Too many write requests, please try again later.',
});

// Apply rate limiting
app.use('/api/', apiLimiter);

// Apply authentication and stricter rate limiting to write operations
app.use(`${API_PREFIX}/tournaments`, requireApiKey, writeLimiter);
app.use(`${API_PREFIX}/aliases`, requireApiKey, writeLimiter);

// ... rest of code ...
```

### Update `backend/env.example`:
```env
# API Security
API_KEYS=your-secret-api-key-1,your-secret-api-key-2
```

## Step 2: Fix CORS Configuration

### Update CORS in `backend/src/index.js`:
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) {
      // In production, be more strict
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Origin required in production'));
      }
      return callback(null, true);
    }
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      process.env.CORS_ORIGIN || 'http://localhost:5173'
    ];
    
    // Restrict chrome-extension origins to specific extension IDs
    if (origin.startsWith('chrome-extension://')) {
      if (process.env.NODE_ENV === 'development') {
        // Allow all extensions in development
        return callback(null, true);
      }
      
      // In production, only allow specific extension IDs
      const extensionId = origin.replace('chrome-extension://', '').split('/')[0];
      const allowedExtensionIds = process.env.ALLOWED_EXTENSION_IDS?.split(',') || [];
      
      if (allowedExtensionIds.includes(extensionId)) {
        return callback(null, true);
      }
      
      return callback(new Error('Extension not allowed by CORS'));
    }
    
    // Check allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};
```

### Update `backend/env.example`:
```env
# CORS Configuration
CORS_ORIGIN=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
ALLOWED_EXTENSION_IDS=your-extension-id-here
```

## Step 3: Add Request Logging

### Install dependencies
```bash
npm install morgan
```

### Update `backend/src/index.js`:
```javascript
import morgan from 'morgan';

// ... existing imports ...

// Logging (only in production, or use a logger like winston)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}
```

## Step 4: Improve Error Handling

### Update error handler in `backend/src/index.js`:
```javascript
// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }) // Only in development
  });
});
```

## Step 5: Update Browser Extension

### Update `browser-extension/popup.js` to include API key:
```javascript
async function pushToBackend(tournamentData) {
  const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey']);
  
  if (!apiUrl) {
    showError('Please configure API URL in settings');
    return;
  }
  
  if (!apiKey) {
    showError('Please configure API key in settings');
    return;
  }
  
  try {
    const response = await fetch(`${apiUrl}/api/tournaments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(tournamentData)
    });
    
    // ... rest of code ...
  }
}
```

### Update `browser-extension/options.html` to include API key input field

## Step 6: Production Environment Variables

Create `.env.production` (DO NOT commit this file):
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:strong-password@db-host:5432/kcm_ranking?schema=public

# API Security
API_KEYS=generate-strong-random-key-1,generate-strong-random-key-2

# CORS
CORS_ORIGIN=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
ALLOWED_EXTENSION_IDS=your-chrome-extension-id

# API
API_PREFIX=/api
```

## Step 7: Generate Strong API Keys

Use a secure method to generate API keys:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

## Testing

1. Test API key authentication:
```bash
# Should fail (no API key)
curl -X POST http://localhost:3001/api/tournaments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# Should succeed (with API key)
curl -X POST http://localhost:3001/api/tournaments \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"name":"Test"}'
```

2. Test rate limiting by making many requests quickly

3. Test CORS with different origins

## Next Steps

After implementing these basics:
1. Set up HTTPS with a reverse proxy (nginx)
2. Add monitoring and alerting
3. Implement request logging to a secure log aggregation service
4. Regular security audits
5. Keep dependencies updated (`npm audit`)

