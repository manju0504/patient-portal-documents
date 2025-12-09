# Patient Document Portal – Design Document

## 1. Tech Stack Choices

### Q1. Frontend framework and reason  
**Chosen:** React (with Vite)

**Reasons:**
- React is an industry-standard frontend library widely used in full-stack roles.
- Component-based architecture simplifies UI separation (UploadForm, DocumentList).
- Vite provides fast builds, instant HMR, and a simpler setup compared to CRA.
- Perfect for lightweight local development, as required by the assignment.

---

### Q2. Backend framework and reason  
**Chosen:** Node.js with Express

**Reasons:**
- Express is minimalistic and perfect for building REST APIs quickly.
- Large middleware ecosystem (e.g., Multer for file uploads).
- Easy JSON handling and simple routing structure.
- Consistent language (JavaScript) on both backend and frontend reduces context switching.

---

### Q3. Database choice and reason  
**Chosen:** SQLite

**Reasons:**
- Zero-configuration, serverless database ideal for local single-user applications.
- Very lightweight and fits the assignment requirement perfectly.
- Stores data as a simple `.sqlite` file inside the backend folder.
- Ideal for low traffic, low concurrency scenarios.
- Assignment specifically permits SQLite and requires a simple table with:
  - **id, filename, filepath, filesize, created_at**

In production, this would be upgraded to PostgreSQL/MySQL for concurrency and scaling.

---

### Q4. What to change for scaling to 1,000+ users

If the system needed to support many users:

1. **Move from SQLite → PostgreSQL**
   - PostgreSQL handles concurrency, indexing, transactions, connection pooling.

2. **Use cloud storage for files**
   - AWS S3 / GCP Cloud Storage / Azure Blob instead of local `uploads/`.

3. **Add authentication and user authorization**
   - JWT or OAuth.
   - Each document linked to a `user_id`.

4. **Introduce containerization and deployment**
   - Dockerize frontend and backend.
   - Use Nginx as reverse proxy.
   - Deploy on AWS/GCP/Azure.

5. **Enhance reliability**
   - Logging, monitoring, tracing.
   - Rate limiting, error boundary handling.
   - Regular backups for database & file storage.

---

## 2. Architecture Overview

### 2.1 High-level flow

- **Frontend (React + Vite)**  
  Handles UI, selecting files, uploading PDFs, listing, downloading, deleting.

- **Backend (Node.js + Express)**  
  Handles REST endpoints, file uploads using Multer, DB operations.

- **SQLite Database**  
  Stores metadata of each document:
  - id  
  - filename  
  - filepath  
  - filesize  
  - created_at

- **Local File Storage**
  - PDF files stored inside `backend/uploads/`.

---

### 2.2 Architecture Diagram (text)

```
[ React Frontend (Vite) ]
          |
          |  (HTTP via fetch)
          v
[ Node.js + Express Backend ]
          |
          |  (SQL queries)
          v
[ SQLite Database ]

          |
          | (File system I/O)
          v
[ uploads/ Folder (PDF Files) ]
```

---

## 3. API Specification

Base URL: `http://localhost:5000`

---

### **1) POST /documents/upload**

Uploads a PDF and stores its metadata.

- **Method:** POST  
- **Content-Type:** multipart/form-data  
- **Form field:** `file`

**Sample Request:**
```bash
curl -X POST http://localhost:5000/documents/upload \
  -F "file=@test.pdf"
```

**Success Response (201):**
```json
{
  "id": 1,
  "filename": "test.pdf",
  "filepath": "backend/uploads/1702141350000-test.pdf",
  "filesize": 102400,
  "created_at": "2025-12-09T15:30:00.000Z"
}
```

**Error Responses:**
- 400 — No file / wrong file type  
- 500 — File save or DB insertion error  

---

### **2) GET /documents**

Returns all uploaded documents.

**Sample Request:**
```bash
curl http://localhost:5000/documents
```

**Sample Response:**
```json
[
  {
    "id": 2,
    "filename": "report.pdf",
    "filepath": "backend/uploads/1702141390000-report.pdf",
    "filesize": 47400,
    "created_at": "2025-12-09T15:45:56.000Z"
  }
]
```

Documents are sorted by newest first.

---

### **3) GET /documents/:id**

Downloads a file by its ID.

**Sample Request:**
```bash
curl -O http://localhost:5000/documents/1
```

**Errors:**
- 404 — entry not found or file missing  
- 500 — I/O error  

---

### **4) DELETE /documents/:id**

Deletes file + DB record.

**Sample Request:**
```bash
curl -X DELETE http://localhost:5000/documents/1
```

**Success Response:**
```json
{ "message": "Document deleted successfully." }
```

---

## 4. Data Flow Description

### 4.1 Upload Flow

1. User selects a PDF and clicks “Upload PDF”.
2. React checks MIME type → must be PDF.
3. Frontend sends:
   - `POST /documents/upload`
   - with `FormData` containing the file.
4. Multer:
   - Accepts the file.
   - Stores it inside `backend/uploads/` with a unique filename.
5. Express extracts metadata from `req.file`.
6. SQLite inserts metadata row.
7. Backend returns the inserted row as JSON.
8. React updates the UI table and shows a success message.

---

### 4.2 Download Flow

1. User clicks “Download”.
2. `window.open()` triggers:
   - `GET /documents/:id`
3. Backend finds metadata in DB.
4. Backend checks if file exists.
5. Backend sends file using `res.download`.
6. Browser shows or downloads the PDF.

---

## 5. Assumptions

- Single user (no authentication required).
- Only PDF files allowed.
- Recommended file size < 10 MB.
- Local environment only:
  - Backend: `localhost:5000`
  - Frontend: `localhost:5173`
- SQLite chosen for simplicity; not optimized for high concurrency.
- No versioning or soft delete; delete removes file + DB row.
- Error UI is intentionally simple.

