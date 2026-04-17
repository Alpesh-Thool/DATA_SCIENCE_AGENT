/**
 * FileUpload — drag-and-drop file upload component with visual feedback.
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import useSessionStore from '../stores/sessionStore';
import { uploadFile } from '../services/api';

export default function FileUpload() {
  const { isUploading, uploadError, fileName, setUploading, setUploadResult, setUploadError } =
    useSessionStore();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      setUploading(true);
      try {
        const result = await uploadFile(file);
        setUploadResult(result);
      } catch (err) {
        setUploadError(err.message || 'Upload failed');
      }
    },
    [setUploading, setUploadResult, setUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="file-upload-wrapper">
      <div
        {...getRootProps()}
        className={`file-upload-dropzone ${isDragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''} ${fileName ? 'uploaded' : ''}`}
        id="file-upload-dropzone"
      >
        <input {...getInputProps()} id="file-upload-input" />

        {isUploading ? (
          <div className="upload-state">
            <div className="upload-spinner" />
            <p className="upload-text">Analyzing your data...</p>
          </div>
        ) : fileName ? (
          <div className="upload-state uploaded">
            <CheckCircle2 size={40} className="upload-icon success" />
            <p className="upload-text">{fileName}</p>
            <p className="upload-hint">Drop a new file to replace</p>
          </div>
        ) : (
          <div className="upload-state">
            {isDragActive ? (
              <>
                <FileSpreadsheet size={48} className="upload-icon active" />
                <p className="upload-text">Drop it here!</p>
              </>
            ) : (
              <>
                <Upload size={48} className="upload-icon" />
                <p className="upload-text">
                  Drag & drop your CSV or Excel file
                </p>
                <p className="upload-hint">or click to browse</p>
                <div className="upload-formats">
                  <span className="format-badge">.csv</span>
                  <span className="format-badge">.xlsx</span>
                  <span className="format-badge">.xls</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {uploadError && (
        <div className="upload-error" id="upload-error">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
