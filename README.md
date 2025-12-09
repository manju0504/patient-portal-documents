# Patient Document Portal

A simple full-stack web application for uploading and managing patient medical documents (PDFs).

Users can:

- Upload a PDF file.
- View all uploaded documents.
- Download any document.
- Delete a document when it is no longer needed.

This project implements the requirements of the “Full Stack Developer Intern” assignment: a local app with a React frontend, Node.js/Express backend, files stored in an `uploads/` folder, and metadata stored in a SQLite database. :contentReference[oaicite:2]{index=2}  

---

## 1. Project Structure

```text
patient-portal-documents/
├── backend/
│   ├── server.js        # Express app, routes and file handling
│   ├── db.js            # SQLite connection and table creation
│   ├── uploads/         # Uploaded PDF files (created at runtime)
│   ├── package.json
│   └── database.sqlite  # SQLite database file (created automatically)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   └── documentsApi.js
│       └── components/
│           ├── UploadForm.jsx
│           └── DocumentList.jsx
│
├── design.md            # Design document (architecture, APIs, assumptions)
└── README.md            # This file
2. Tech Stack

Frontend: React (Vite), Fetch API

Backend: Node.js, Express, Multer

Database: SQLite (sqlite3 Node driver)

Runtime: Node.js (LTS)

3. Prerequisites

Node.js and npm installed

SQLite installed (for optional manual inspection of the database)

OS: tested on Windows 10/11

4. Running the Backend

Open a terminal and navigate to the backend folder:

cd backend


Install dependencies (if not already installed):

npm install


Start the backend in development mode:

npm run dev


The server runs on:

http://localhost:5000

Health check:

curl http://localhost:5000/health


Expected response:

{"status":"ok"}


When the server starts for the first time, it automatically:

creates database.sqlite in the backend folder

creates the documents table if it does not exist

ensures the uploads/ directory exists

5. Running the Frontend

In a new terminal, navigate to the frontend folder:

cd frontend


Install dependencies (if not already installed):

npm install


Start the development server:

npm run dev


Open the URL shown in the terminal, typically:

http://localhost:5173/

You should see the Patient Document Portal UI.

6. Usage

Open the frontend URL in your browser.

Click “Choose File” and select a PDF from your system.

Click “Upload PDF”.

If successful:

A green message appears (“Document uploaded successfully.”).

The document appears in the Uploaded Documents table.

Use “Download” to download/open the PDF.

Use “Delete” to remove a document from both the database and disk.

7. Example API Calls (curl)

Assuming the backend is running on http://localhost:5000.

7.1 Upload a PDF
curl -X POST http://localhost:5000/documents/upload \
  -F "file=@test.pdf"

7.2 List all documents
curl http://localhost:5000/documents

7.3 Download a document by ID
curl -O http://localhost:5000/documents/1

7.4 Delete a document by ID
curl -X DELETE http://localhost:5000/documents/1

8. Notes and Limitations

Only PDF files are allowed.

The application assumes a single user (no authentication).

Files are stored locally in the backend/uploads/ folder.

For real multi-user/production usage, a cloud file store and a more robust database (e.g., PostgreSQL) would be recommended.

9. Possible Improvements

If this were to be extended beyond the assignment, some ideas are:

Add authentication and per-user document ownership.

Add document tags or types (Prescription, Lab Report, Referral, etc.).

Move file storage to cloud object storage.

Add pagination and search for large document sets.

Add tests (unit/integration) for the backend endpoints.