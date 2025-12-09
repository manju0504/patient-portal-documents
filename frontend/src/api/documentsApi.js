// frontend/src/api/documentsApi.js

const API_BASE_URL = 'http://localhost:5000';

/**
 * Fetch list of all documents
 */
export async function fetchDocuments() {
  const res = await fetch(`${API_BASE_URL}/documents`);
  if (!res.ok) {
    throw new Error('Failed to fetch documents');
  }
  return res.json();
}

/**
 * Upload a PDF file
 * field name MUST be "file" to match backend: upload.single('file')
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = 'Failed to upload document';
    try {
      const body = await res.json();
      if (body.message) errorMessage = body.message;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Download a document in new tab
 */
export function downloadDocument(id) {
  const url = `${API_BASE_URL}/documents/${id}`;
  window.open(url, '_blank');
}

/**
 * Delete a document by id
 */
export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    let errorMessage = 'Failed to delete document';
    try {
      const body = await res.json();
      if (body.message) errorMessage = body.message;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  return res.json();
}
