// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer config: store files in "uploads/" and allow ONLY PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Make filename unique: timestamp-originalname
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only PDFs based on mimetype and extension
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * POST /documents/upload
 * Upload a PDF file
 */
app.post('/documents/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file type.' });
    }

    const filename = req.file.originalname;
    const filepath = req.file.path; // stored path on server
    const filesize = req.file.size; // bytes
    const createdAt = new Date().toISOString();

    const sql = `
      INSERT INTO documents (filename, filepath, filesize, created_at)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [filename, filepath, filesize, createdAt], function (err) {
      if (err) {
        console.error('Error inserting document:', err.message);
        return res.status(500).json({ message: 'Failed to save document metadata.' });
      }

      // this.lastID gives the id of the inserted row
      const insertedId = this.lastID;

      db.get('SELECT * FROM documents WHERE id = ?', [insertedId], (err, row) => {
        if (err) {
          console.error('Error fetching inserted document:', err.message);
          return res.status(500).json({ message: 'Failed to retrieve inserted document.' });
        }

        return res.status(201).json(row);
      });
    });
  } catch (error) {
    console.error('Unexpected error in /documents/upload:', error);
    res.status(500).json({ message: 'Unexpected server error.' });
  }
});

/**
 * GET /documents
 * List all uploaded documents
 */
app.get('/documents', (req, res) => {
  const sql = 'SELECT * FROM documents ORDER BY datetime(created_at) DESC';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching documents:', err.message);
      return res.status(500).json({ message: 'Failed to fetch documents.' });
    }

    res.json(rows);
  });
});

/**
 * GET /documents/:id
 * Download a specific file
 */
app.get('/documents/:id', (req, res) => {
  const documentId = req.params.id;

  db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, row) => {
    if (err) {
      console.error('Error fetching document:', err.message);
      return res.status(500).json({ message: 'Failed to fetch document.' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const absolutePath = path.resolve(row.filepath);

    // Check if file exists
    fs.access(absolutePath, fs.constants.F_OK, (fsErr) => {
      if (fsErr) {
        console.error('File not found on disk:', absolutePath);
        return res.status(404).json({ message: 'File not found on disk.' });
      }

      // Send file as download
      res.download(absolutePath, row.filename, (downloadErr) => {
        if (downloadErr) {
          console.error('Error sending file:', downloadErr);
        }
      });
    });
  });
});

/**
 * DELETE /documents/:id
 * Delete a document (record + file)
 */
app.delete('/documents/:id', (req, res) => {
  const documentId = req.params.id;

  db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, row) => {
    if (err) {
      console.error('Error fetching document for delete:', err.message);
      return res.status(500).json({ message: 'Failed to fetch document.' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const absolutePath = path.resolve(row.filepath);

    // Delete the file from disk first
    fs.unlink(absolutePath, (fsErr) => {
      if (fsErr) {
        console.error('Error deleting file from disk:', fsErr.message);
        // Even if the file is missing, we can still delete the DB record
      }

      // Now delete DB record
      db.run('DELETE FROM documents WHERE id = ?', [documentId], function (dbErr) {
        if (dbErr) {
          console.error('Error deleting document from DB:', dbErr.message);
          return res.status(500).json({ message: 'Failed to delete document from database.' });
        }

        return res.json({ message: 'Document deleted successfully.' });
      });
    });
  });
});

// Global error handler (for unexpected errors)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
