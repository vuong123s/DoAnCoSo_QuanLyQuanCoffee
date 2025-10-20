import React, { useEffect, useRef } from 'react';
import { FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

const VideoModal = ({ isOpen, onClose, videoUrl, areaName }) => {
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Direct video file or other embed URLs
    return url;
  };

  const embedUrl = getVideoEmbedUrl(videoUrl);
  const isDirectVideo = videoUrl && (
    videoUrl.endsWith('.mp4') || 
    videoUrl.endsWith('.webm') || 
    videoUrl.endsWith('.ogg') ||
    videoUrl.includes('blob:')
  );

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-colors"
          title="Đóng (ESC)"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Video Content */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
          {embedUrl ? (
            isDirectVideo ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full"
                controls
                autoPlay
                preload="metadata"
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/ogg" />
                Trình duyệt của bạn không hỗ trợ video HTML5.
              </video>
            ) : (
              <iframe
                ref={videoRef}
                src={embedUrl}
                className="absolute inset-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Video giới thiệu ${areaName}`}
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <FiX className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Không thể tải video</p>
                <p className="text-sm opacity-75 mt-2">URL video không hợp lệ hoặc không được hỗ trợ</p>
              </div>
            </div>
          )}
        </div>

        {/* Video title overlay */}
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold drop-shadow-lg">
            {areaName}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
