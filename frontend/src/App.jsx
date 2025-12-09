// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import UploadForm from './components/UploadForm';
import DocumentList from './components/DocumentList';
import {
  fetchDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from './api/documentsApi';

function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState('');
  const [globalMessage, setGlobalMessage] = useState('');
  const [globalMessageType, setGlobalMessageType] = useState('success');

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    setDocsError('');
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setDocsError(err.message || 'Failed to load documents.');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (file) => {
    setGlobalMessage('');
    try {
      const uploaded = await uploadDocument(file);
      setDocuments((prev) => [uploaded, ...prev]);
      setGlobalMessage('Document uploaded successfully.');
      setGlobalMessageType('success');
    } catch (err) {
      setGlobalMessage(err.message || 'Failed to upload document.');
      setGlobalMessageType('error');
      throw err;
    }
  };

  const handleDownload = (id) => {
    downloadDocument(id);
  };

  const handleDelete = async (id) => {
    setGlobalMessage('');
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setGlobalMessage('Document deleted successfully.');
      setGlobalMessageType('success');
    } catch (err) {
      console.error(err);
      setGlobalMessage(err.message || 'Failed to delete document.');
      setGlobalMessageType('error');
    }
  };

  const alertClass =
    globalMessageType === 'error'
      ? 'app-alert app-alert-error'
      : 'app-alert app-alert-success';

  return (
    <div className="app-container">
      <div className="app-card">
        <header className="app-header">
          <h1 className="app-title">Patient Document Portal</h1>
          <p className="app-subtitle">
            Upload, view, download, and delete your medical documents (PDFs).
          </p>
        </header>

        {globalMessage && <div className={alertClass}>{globalMessage}</div>}

        <UploadForm onUpload={handleUpload} />

        <DocumentList
          documents={documents}
          onDownload={handleDownload}
          onDelete={handleDelete}
          isLoading={isLoadingDocs}
          error={docsError}
        />
      </div>
    </div>
  );
}

export default App;
