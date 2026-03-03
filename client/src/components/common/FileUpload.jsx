import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image } from 'lucide-react';
import clsx from 'clsx';

export default function FileUpload({ onFileSelect, accept, maxSize = 10 * 1024 * 1024, className }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName('');
    onFileSelect(null);
  };

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400',
        className
      )}
    >
      <input {...getInputProps()} />
      {fileName ? (
        <div className="flex items-center justify-center gap-3">
          {preview ? (
            <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded" />
          ) : (
            <FileText className="h-10 w-10 text-gray-400" />
          )}
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{fileName}</p>
            <button onClick={clear} className="text-xs text-red-600 hover:text-red-800 mt-1 flex items-center gap-1">
              <X className="h-3 w-3" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {isDragActive ? (
            <Image className="h-10 w-10 text-indigo-500" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400" />
          )}
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Drop file here...' : 'Drag & drop a file, or click to browse'}
          </p>
          <p className="text-xs text-gray-400">Max size: {Math.round(maxSize / 1024 / 1024)}MB</p>
        </div>
      )}
    </div>
  );
}
