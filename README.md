# Patient Document Portal

A simple full-stack application for uploading and managing patient medical documents (PDFs).

Users can:
- Upload a PDF file  
- View all uploaded documents  
- Download any document  
- Delete a document when no longer needed  

This project fulfills the Full Stack Developer Intern assignment.  
It includes a React frontend, Node.js/Express backend, SQLite database, and local PDF storage.

---

## 1. Project Structure

```
patient-portal-documents/
├── backend/
│   ├── server.js              # Express backend & API routes
│   ├── db.js                  # SQLite initialization
│   ├── package.json
│   ├── uploads/               # PDF files (runtime only)
│   └── database.sqlite        # Created automatically
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
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
├── design.md                  # Design answers (all 6 questions)
└── README.md                  # This file
```

---

## 2. Tech Stack

**Frontend:** React (Vite), Fetch API  
**Backend:** Node.js, Express, Multer  
**Database:** SQLite  
**Runtime:** Node.js LTS  

---

## 3. Prerequisites

Install:
- Node.js & npm  
- SQLite (optional for manual DB inspection)  
- Windows/macOS/Linux (tested on Windows 10/11)

---

## 4. Running the Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at:
```
http://localhost:5000
```

Health check:
```bash
curl http://localhost:5000/health
```

Expected:
```json
{"status":"ok"}
```

Backend automatically:
- Creates `database.sqlite`
- Ensures `uploads/` folder exists
- Creates `documents` table if missing

---

## 5. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:
```
http://localhost:5173/
```

You should now see the **Patient Document Portal UI**.

---

## 6. Usage

1. Open the frontend.
2. Click **Choose File** → Select a PDF.
3. Click **Upload PDF**.
4. PDF will appear in the documents table.
5. Click **Download** to open/save the file.
6. Click **Delete** to permanently remove it.

---

## 7. Example API Calls

### Upload
```bash
curl -X POST http://localhost:5000/documents/upload \
  -F "file=@test.pdf"
```

### List
```bash
curl http://localhost:5000/documents
```

### Download
```bash
curl -O http://localhost:5000/documents/1
```

### Delete
```bash
curl -X DELETE http://localhost:5000/documents/1
```

---

## 8. Notes & Limitations

- Only PDF files allowed.
- Local single-user system (no authentication).
- Files stored in `backend/uploads/`.
- For production: move file storage to cloud and upgrade DB to PostgreSQL.

---

## 9. Possible Improvements

- Add authentication & multi-user support  
- Add document categories  
- Add pagination & search  
- Add unit tests with Jest/Supertest  
- Deploy backend & frontend to cloud  
