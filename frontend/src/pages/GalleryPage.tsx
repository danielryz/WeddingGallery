import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhotos } from '../api/photos';
import type { PhotoResponse } from '../types/photo';
import type { Page } from '../types/page';

function GalleryPage() {
    const navigate = useNavigate();
    const [activeType, setActiveType] = useState<'image' | 'video'>('image');  // Active tab: 'image' or 'video'
    const [page, setPage] = useState(0);
    const [photosPage, setPhotosPage] = useState<Page<PhotoResponse> | null>(null);

    useEffect(() => {
        // Fetch photos or videos from the API based on the active type and current page.
        getPhotos(page, 20, 'uploadTime', 'desc', activeType)
            .then(setPhotosPage)
            .catch(err => console.error('Failed to load gallery items:', err));
    }, [page, activeType]);

    // Handle switching tabs: reset to page 0 and set the chosen type.
    const handleTabClick = (type: 'image' | 'video') => {
        setActiveType(type);
        setPage(0);
    };

    // Utility regex to check if a filename is an image (for thumbnail display).
    const isImageFile = (fileName: string): boolean => {
        return /\.(jpe?g|png|gif|bmp|webp|heic)$/i.test(fileName);
    };

    return (
        <div className="px-4">  {/* Container with horizontal padding */}
            {/* Tab Buttons for "Photos" vs "Videos" */}
            <div className="flex justify-center space-x-4 my-4">
                <button
                    onClick={() => handleTabClick('image')}
                    className={`px-4 py-2 rounded ${activeType === 'image' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Photos
                </button>
                <button
                    onClick={() => handleTabClick('video')}
                    className={`px-4 py-2 rounded ${activeType === 'video' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Videos
                </button>
            </div>

            {/* Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {photosPage?.content.map((item) => {
                    // Construct the URL for the media file (assuming the backend serves files from a /photos/ path):
                    const fileUrl = `${import.meta.env.VITE_API_URL}/photos/${item.fileName}`;
                    const isImage = isImageFile(item.fileName);
                    return (
                        <div
                            key={item.id}
                            className="relative aspect-w-1 aspect-h-1 overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/photos/${item.id}`)}
                        >
                            {isImage ? (
                                /* Image thumbnail */
                                <img
                                    src={fileUrl}
                                    alt={item.description || 'Photo'}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                /* Video thumbnail: static placeholder with play icon */
                                <div className="bg-gray-800 w-full h-full flex items-center justify-center">
                                    <div className="bg-black bg-opacity-50 rounded-full p-2">
                                        {/* Play icon SVG */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-10 h-10 text-white"
                                        >
                                            <path d="M8 5v14l11-7z" />  {/* Play triangle shape */}
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center space-x-4 mt-4">
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                    disabled={photosPage?.first}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="text-sm">
          {photosPage ? photosPage.number + 1 : 0} / {photosPage?.totalPages ?? 0}
        </span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={photosPage?.last}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default GalleryPage;
