import React, { useState, useRef } from 'react';
import { 
  FiUpload, 
  FiX, 
  FiImage, 
  FiVideo, 
  FiFile,
  FiCheck,
  FiAlertCircle,
  FiLoader
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MediaUploader = ({ 
  type = 'menu', // 'menu' hoặc 'category'
  itemId = null,
  purpose = 'main', // 'main', 'thumbnail', 'gallery'
  multiple = false,
  accept = 'image/*,video/*',
  maxSize = 100 * 1024 * 1024, // 100MB
  onUploadSuccess,
  onUploadError,
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Xử lý chọn files
  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        toast.error(`File ${file.name} quá lớn. Kích thước tối đa là ${maxSize / (1024 * 1024)}MB`);
        return false;
      }
      
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error(`File ${file.name} không được hỗ trợ. Chỉ chấp nhận ảnh và video.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        status: 'ready', // 'ready', 'uploading', 'success', 'error'
        progress: 0
      }));

      if (multiple) {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        setFiles(newFiles);
      }
    }
  };

  // Xử lý drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Xóa file
  const removeFile = (fileId) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return newFiles;
    });
  };

  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Vui lòng chọn file để upload');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (fileItem) => {
        const formData = new FormData();
        formData.append(multiple ? 'files' : 'file', fileItem.file);
        formData.append('type', type);
        formData.append('itemId', itemId || '');
        formData.append('purpose', purpose);
        formData.append('description', '');

        // Update file status
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        try {
          // Gọi API Gateway để upload file
          const response = await fetch('http://localhost:3000/api/media/upload', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();

          if (result.success) {
            // Update file status to success
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id 
                ? { ...f, status: 'success', progress: 100, uploadResult: result.data }
                : f
            ));

            if (onUploadSuccess) {
              onUploadSuccess(result.data);
            }

            return result.data;
          } else {
            throw new Error(result.error || 'Upload failed');
          }
        } catch (error) {
          // Update file status to error
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'error', progress: 0, error: error.message }
              : f
          ));

          if (onUploadError) {
            onUploadError(error);
          }

          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`Upload thành công ${successful} file${successful > 1 ? 's' : ''}`);
      }
      
      if (failed > 0) {
        toast.error(`Upload thất bại ${failed} file${failed > 1 ? 's' : ''}`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi upload files');
    } finally {
      setUploading(false);
    }
  };

  // Clear all files
  const clearFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <FiImage className="w-6 h-6" />;
    if (file.type.startsWith('video/')) return <FiVideo className="w-6 h-6" />;
    return <FiFile className="w-6 h-6" />;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <FiLoader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`media-uploader ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${files.length > 0 ? 'mb-4' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <FiUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {dragActive ? 'Thả files vào đây' : 'Chọn hoặc kéo thả files'}
        </p>
        <p className="text-sm text-gray-500">
          Hỗ trợ ảnh (JPG, PNG, GIF, WebP) và video (MP4, AVI, MOV, WMV, WebM)
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Kích thước tối đa: {maxSize / (1024 * 1024)}MB
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">
              Files đã chọn ({files.length})
            </h4>
            <button
              onClick={clearFiles}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Xóa tất cả
            </button>
          </div>

          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      {getFileIcon(fileItem.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {/* Progress Bar */}
                  {fileItem.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileItem.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {fileItem.status === 'error' && fileItem.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {fileItem.error}
                    </p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(fileItem.status)}
                  
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={fileItem.status === 'uploading'}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex space-x-3">
            <button
              onClick={uploadFiles}
              disabled={uploading || files.every(f => f.status === 'success')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <FiLoader className="w-4 h-4 animate-spin mr-2" />
                  Đang upload...
                </span>
              ) : (
                'Upload Files'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
