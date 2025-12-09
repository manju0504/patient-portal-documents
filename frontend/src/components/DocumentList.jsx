// frontend/src/components/DocumentList.jsx

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString();
}

function DocumentList({ documents, onDownload, onDelete, isLoading, error }) {
  if (isLoading) {
    return <p>Loading documents...</p>;
  }

  if (error) {
    return <p style={{ color: '#b91c1c' }}>{error}</p>;
  }

  if (!documents.length) {
    return (
      <p className="documents-empty">
        No documents uploaded yet. Upload your first PDF using the form above.
      </p>
    );
  }

  return (
    <div>
      <div className="documents-title">Uploaded Documents</div>
      <div className="documents-wrapper">
        <table className="documents-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Filename</th>
              <th>Size (KB)</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.id}</td>
                <td>{doc.filename}</td>
                <td>{(doc.filesize / 1024).toFixed(1)}</td>
                <td>{formatDate(doc.created_at)}</td>
                <td>
                  <button
                    className="btn btn-success"
                    style={{ marginRight: '8px' }}
                    onClick={() => onDownload(doc.id)}
                  >
                    Download
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Are you sure you want to delete "${doc.filename}"?`
                      );
                      if (confirmed) {
                        onDelete(doc.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DocumentList;
