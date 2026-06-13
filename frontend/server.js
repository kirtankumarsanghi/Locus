import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    port: PORT,
    distPath: path.join(__dirname, 'dist'),
    time: new Date().toISOString()
  });
});

// Debug endpoint to check if files exist
app.get('/debug', (req, res) => {
  try {
    const distPath = path.join(__dirname, 'dist');
    const indexPath = path.join(distPath, 'index.html');
    const indexExists = require('fs').existsSync(indexPath);
    
    res.json({
      distPath,
      indexPath,
      indexExists,
      __dirname,
      cwd: process.cwd(),
      env: {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from dist directory with proper MIME types
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    // Set correct MIME types for JavaScript modules
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
  }
}));

// Handle SPA routing - return index.html ONLY for non-asset routes
app.get('*', (req, res) => {
  // Don't intercept asset requests
  if (req.path.startsWith('/assets/') || 
      req.path.endsWith('.js') || 
      req.path.endsWith('.css') || 
      req.path.endsWith('.json') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.jpg') ||
      req.path.endsWith('.ico') ||
      req.path.endsWith('.svg')) {
    return res.status(404).send('Not found');
  }
  
  // Send index.html for all other routes (SPA routing)
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`Health check available at: http://0.0.0.0:${PORT}/health`);
  console.log(`Debug info available at: http://0.0.0.0:${PORT}/debug`);
});
