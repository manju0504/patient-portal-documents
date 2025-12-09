// frontend/src/components/UploadForm.jsx
import { useState } from 'react';

function UploadForm({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setSelectedFile(null);
      setError('Only PDF files are allowed.');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a PDF file.');
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(selectedFile);
      setSelectedFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="upload-card" onSubmit={handleSubmit}>
      <div className="upload-title">Upload a Medical Document</div>
      <div className="upload-subtitle">
        Supported format: <strong>PDF</strong> only. Max ~10 MB recommended.
      </div>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {selectedFile && (
        <div className="upload-file-info">
          <strong>Selected:</strong> {selectedFile.name} (
          {(selectedFile.size / 1024).toFixed(1)} KB)
        </div>
      )}

      {error && <div className="upload-error">{error}</div>}

      <div className="upload-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading…' : 'Upload PDF'}
        </button>
      </div>

      <p className="text-muted">
        Once uploaded, your document will appear in the list below. You can
        download or delete it anytime.
      </p>
    </form>
  );
}

export default UploadForm;
