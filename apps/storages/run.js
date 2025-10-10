import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 7621;
const catsFolder = path.join(__dirname, 'cats');

// Ensure the 'cats' folder exists
if (!fs.existsSync(catsFolder)) {
  fs.mkdirSync(catsFolder, { recursive: true });
}

// Determine Content-Type based on extension
const getContentType = (ext) => {
  switch (ext.toLowerCase()) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
};

// Create HTTP server
const server = http.createServer((req, res) => {

  // Add CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET / => forbidden
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(403);
    res.end('Forbidden');

  // GET /cats/:filename => serve image file
  } else if (req.method === 'GET' && req.url.startsWith('/cats/')) {
    const fileName = path.basename(req.url);
    const filePath = path.join(catsFolder, fileName);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Image not found');
        return;
      }

      const ext = path.extname(fileName);
      const contentType = getContentType(ext);

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });

  // POST / => upload image
  } else if (req.method === 'POST' && req.url === '/') {
    const contentType = req.headers['content-type'] || '';
    const match = contentType.match(/boundary=(.+)$/);

    if (!match) {
      res.writeHead(400);
      res.end('Invalid multipart/form-data request');
      return;
    }

    const boundary = `--${match[1]}`;
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const parts = buffer.toString('binary').split(boundary);

      for (let part of parts) {
        if (part.includes('Content-Disposition') && part.includes('filename=')) {
          const filenameMatch = part.match(/filename="(.+?)"/);
          if (!filenameMatch) continue;

          const filename = filenameMatch[1];
          const fileDataSplit = part.split('\r\n\r\n');
          if (fileDataSplit.length < 2) continue;

          let fileContent = fileDataSplit[1];
          fileContent = fileContent.replace(/\r\n$/, '');
          const fileBuffer = Buffer.from(fileContent, 'binary');

          try {
            fs.writeFileSync(path.join(catsFolder, filename), fileBuffer);
          } catch (err) {
            res.writeHead(500);
            res.end('Failed to save file');
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'File uploaded successfully',
            filename,
            url: `http://localhost:${PORT}/cats/${filename}`
          }));
          return;
        }
      }

      res.writeHead(400);
      res.end('No file uploaded');
    });

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Storage server running at http://localhost:${PORT}`);
});
