import React, { useState, useEffect } from 'react';
import { 
  FiImage, 
  FiVideo, 
  FiTrash2, 
  FiDownload, 
  FiEye,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MediaGallery = ({ 
  type = 'menu', // 'menu' hoặc 'category'
  itemId,
  purpose = null, // null để lấy tất cả, hoặc 'main', 'thumbnail', 'gallery'
  editable = false,
  className = ''
}) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Fetch media từ API
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const url = `/api/media/files/${type}/${itemId}${purpose ? `?purpose=${purpose}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setMedia(result.data || []);
      } else {
        console.error('Failed to fetch media:', result.error);
        setMedia([]);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchMedia();
    }
  }, [type, itemId, purpose]);

  // Xóa media
  const deleteMedia = async (filename) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media/files/${filename}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Xóa file thành công');
        setMedia(prev => prev.filter(item => !item.filename.includes(filename)));
      } else {
        toast.error(result.error || 'Lỗi khi xóa file');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Lỗi khi xóa file');
    }
  };

  // Download media
  const downloadMedia = (mediaItem) => {
    const link = document.createElement('a');
    link.href = mediaItem.url;
    link.download = mediaItem.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open lightbox
  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxIndex(-1);
  };

  // Navigate lightbox
  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < media.length) {
      setLightboxIndex(newIndex);
    }
  };

  // Get media type icon
  const getMediaIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return <FiImage className="w-4 h-4" />;
    }
    if (mimetype.startsWith('video/')) {
      return <FiVideo className="w-4 h-4" />;
    }
    return null;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className={`media-gallery ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải media...</span>
        </div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className={`media-gallery ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <FiImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Chưa có media nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`media-gallery ${className}`}>
      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((mediaItem, index) => (
          <div
            key={mediaItem.id || index}
            className="relative group bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Media Preview */}
            <div className="aspect-square relative">
              {mediaItem.mimetype.startsWith('image/') ? (
                <img
                  src={mediaItem.url}
                  alt={mediaItem.originalName}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openLightbox(index)}
                />
              ) : mediaItem.mimetype.startsWith('video/') ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center cursor-pointer relative">
                  <video
                    src={mediaItem.url}
                    className="w-full h-full object-cover"
                    onClick={() => openLightbox(index)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <FiPlay className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <FiImage className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openLightbox(index)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Xem"
                  >
                    <FiEye className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  <button
                    onClick={() => downloadMedia(mediaItem)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Tải xuống"
                  >
                    <FiDownload className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  {editable && (
                    <button
                      onClick={() => deleteMedia(mediaItem.filename)}
                      className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                      title="Xóa"
                    >
                      <FiTrash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Media Type Badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                {getMediaIcon(mediaItem.mimetype)}
                <span className="uppercase">
                  {mediaItem.mimetype.split('/')[0]}
                </span>
              </div>
            </div>

            {/* Media Info */}
            <div className="p-3">
              <p className="text-sm font-medium text-gray-700 truncate" title={mediaItem.originalName}>
                {mediaItem.originalName}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(mediaItem.size)}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {mediaItem.purpose}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-full max-h-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Navigation */}
            {media.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox(-1)}
                  disabled={lightboxIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => navigateLightbox(1)}
                  disabled={lightboxIndex === media.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Media Content */}
            <div className="flex items-center justify-center max-w-screen-lg max-h-screen-lg">
              {media[lightboxIndex].mimetype.startsWith('image/') ? (
                <img
                  src={media[lightboxIndex].url}
                  alt={media[lightboxIndex].originalName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : media[lightboxIndex].mimetype.startsWith('video/') ? (
                <video
                  src={media[lightboxIndex].url}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                />
              ) : null}
            </div>

            {/* Media Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded">
              <h3 className="font-medium">{media[lightboxIndex].originalName}</h3>
              <div className="flex items-center justify-between mt-2 text-sm opacity-75">
                <span>{formatFileSize(media[lightboxIndex].size)}</span>
                <span>{lightboxIndex + 1} / {media.length}</span>
              </div>
              {media[lightboxIndex].description && (
                <p className="mt-2 text-sm opacity-90">{media[lightboxIndex].description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
