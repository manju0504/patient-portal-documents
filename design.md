# Patient Document Portal – Design Document

## 1. Tech Stack Choices

### Q1. Frontend framework and reason

**Chosen:** React (with Vite bundler)

**Why:**

- React is widely used in modern web development and is a common expectation for full-stack roles.
- Component-based structure makes it easy to separate concerns (UploadForm, DocumentList, etc.).
- Vite provides a fast development server with hot module replacement and a simple configuration.

---

### Q2. Backend framework and reason

**Chosen:** Node.js with Express

**Why:**

- Express is minimal, unopinionated, and ideal for building REST APIs quickly.
- Middleware ecosystem (e.g., Multer) makes file uploads straightforward.
- JavaScript is used on both frontend and backend, reducing context switching.
- Easy to run locally without heavy setup, which matches the assignment scope.

---

### Q3. Database choice and reason

**Chosen:** SQLite

**Why:**

- SQLite is file-based and requires no separate server process, which makes it ideal for a local assignment.
- Lightweight and easy to set up – the database file sits inside the backend folder.
- The assignment explicitly allows SQLite and expects a simple table like `documents` with fields `id, filename, filepath, filesize, created_at`. :contentReference[oaicite:1]{index=1}  

For a production or multi-user system, PostgreSQL or MySQL would be preferred, but SQLite is sufficient and appropriate for this context.

---

### Q4. Changes to support 1,000+ users

If the system needed to handle many users and more traffic, I would consider:

1. **Move from SQLite to PostgreSQL**
   - Better concurrency handling and performance for many parallel requests.
   - Easier to scale with indexes, optimized queries, and connection pooling.

2. **Separate storage for files**
   - Instead of local `uploads/` folder, use object storage like AWS S3 / GCP Cloud Storage / Azure Blob.
   - Store only file metadata and public/secure URLs in the database.

3. **Authentication and authorization**
   - Implement proper user accounts (e.g., JWT-based auth).
   - Each document record would be linked to a `user_id` so that users can only access their own documents.

4. **Containerization and deployment**
   - Dockerize the backend and frontend.
   - Use a reverse proxy/load balancer (Nginx) and deploy to a cloud provider.
   - Add environment-specific configuration (dev/stage/prod).

5. **Observability and robustness**
   - Structured logging, request tracing, and metrics.
   - Better error handling and rate limiting.
   - Regular backups for both database and file storage.

---

## 2. Architecture Overview

### 2.1 High-level flow

- **Frontend (React)**  
  Renders the UI, allows the user to upload PDFs, see the list of documents, and perform download/delete actions.

- **Backend (Node.js + Express)**  
  Exposes REST endpoints to upload, list, download, and delete documents. Uses Multer for file upload handling.

- **Database (SQLite)**  
  Stores metadata about each uploaded file in a `documents` table.

- **File storage (`uploads/` folder)**  
  Stores the actual PDF files on disk, inside the backend folder.

### 2.2 Simple architecture diagram (text)

```text
[ React Frontend (Vite) ]
          |
          |  HTTP (fetch)
          v
[ Node.js + Express Backend ]
          |
          |  SQL queries
          v
[ SQLite database: documents table ]

          |
          |  File system operations
          v
[ uploads/ folder (PDF files) ]
3. API Specification

All endpoints are served by the backend running at http://localhost:5000.

POST /documents/upload

Description: Upload a PDF file and store its metadata.

Method: POST

URL: /documents/upload

Content-Type: multipart/form-data

Form field: file (the PDF file)

Sample Request (curl):

curl -X POST http://localhost:5000/documents/upload \
  -F "file=@test.pdf"


Sample Success Response (201):

{
  "id": 1,
  "filename": "test.pdf",
  "filepath": "C:\\projects\\patient-portal-documents\\backend\\uploads\\1702141350000-test.pdf",
  "filesize": 102400,
  "created_at": "2025-12-09T15:30:00.000Z"
}


Error Responses:

400 Bad Request – no file uploaded or wrong type (non-PDF).

500 Internal Server Error – failed to save metadata or other server error.

GET /documents

Description: List all uploaded documents.

Method: GET

URL: /documents

Sample Request:

curl http://localhost:5000/documents


Sample Success Response (200):

[
  {
    "id": 2,
    "filename": "report.pdf",
    "filepath": "C:\\...\\uploads\\1702141390000-report.pdf",
    "filesize": 47400,
    "created_at": "2025-12-09T15:45:56.000Z"
  }
]


Documents are ordered by created_at descending (newest first).

GET /documents/:id

Description: Download a specific document by its ID.

Method: GET

URL: /documents/:id

Sample Request:

curl -O http://localhost:5000/documents/2


Success Response:

Returns the file as a binary download with the original filename.

Response headers include Content-Disposition: attachment; filename="<original_name>.pdf".

Error Responses:

404 Not Found – if the document does not exist in the database or file is missing on disk.

500 Internal Server Error – failure while reading or sending the file.

DELETE /documents/:id

Description: Delete a document and its metadata.

Method: DELETE

URL: /documents/:id

Sample Request:

curl -X DELETE http://localhost:5000/documents/2


Sample Success Response (200):

{
  "message": "Document deleted successfully."
}


Behavior:

Deletes the file from the uploads/ directory (if it exists).

Deletes the corresponding row from the documents table.

4. Data Flow Description (Q5)
4.1 File upload flow (from user click to storage)

The user selects a PDF file in the frontend and clicks “Upload PDF”.

The React frontend validates that the file is a PDF (by MIME type and extension).

The frontend sends a POST /documents/upload request using FormData, with the field name file.

The Express backend uses Multer to:

Accept the file.

Store it in the backend/uploads/ directory with a unique filename (timestamp-originalName.pdf).

After the file is saved on disk, the backend:

Extracts originalname, path, and size from req.file.

Generates an ISO timestamp for created_at.

Inserts a new row into the SQLite documents table:
(filename, filepath, filesize, created_at).

The backend fetches the inserted row (using the new id) and returns it as JSON.

The frontend receives the JSON document object and adds it to the list in the UI.

A success message is shown to the user (e.g., “Document uploaded successfully.”).

4.2 File download flow

The user clicks the Download button in the frontend for a specific document.

The frontend opens GET /documents/:id in a new browser tab using window.open(...).

The backend looks up the document row in the documents table by id.

If found, it checks that the file exists on disk at the stored filepath.

The backend uses res.download(absolutePath, filename) to send the file.

The browser:

Either downloads the PDF file.

Or opens it in the built-in PDF viewer, depending on browser settings.

5. Assumptions (Q6)

Single user context

The assignment states that we can assume one user and skip login. There is no authentication or authorization in this solution.

File type & size

Only PDF files are accepted (validated by MIME type and .pdf extension).

Practical recommended size is up to ~10 MB per upload. There is no strict size limit at the HTTP level, but extremely large files are not targeted here.

Local environment

The application is intended to run locally (frontend on localhost:5173, backend on localhost:5000).

There is no production deployment, SSL, or domain configuration.

Concurrency

SQLite and the current file-handling approach are sufficient for a single-user or low-concurrency environment.

Heavy concurrent uploads were not a primary design concern.

Error handling

The backend provides meaningful HTTP status codes and JSON error messages for common failure cases.

For simplicity, UI-level error displays are basic (alert-style banners).

File retention

When a document is deleted through the UI, both the database row and the file on disk are removed.

There is no soft delete or versioning in this implementation.