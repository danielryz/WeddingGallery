import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPhotos } from '../api/photos'
import type { PhotoResponse } from '../types/photo'
import type { Page } from '../types/page'

function GalleryPage() {
  const navigate = useNavigate()
  const [type, setType] = useState<'image' | 'video' | undefined>()
  const [page, setPage] = useState(0)
  const [photos, setPhotos] = useState<Page<PhotoResponse>>()

  useEffect(() => {
    getPhotos(page, 20, 'uploadTime', 'desc', type).then(setPhotos)
  }, [page, type])

  const handleFilter = (t: 'image' | 'video' | undefined) => {
    setPage(0)
    setType(t)
  }

  return (
    <div>
      <div>
        <button onClick={() => handleFilter('image')}>Photos</button>
        <button onClick={() => handleFilter('video')}>Videos</button>
        <button onClick={() => handleFilter(undefined)}>All</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {photos?.content.map((p) => (
          <img
            key={p.id}
            src={`/files/${p.fileName}`}
            alt={p.description ?? ''}
            style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => navigate(`/photos/${p.id}`)}
          />
        ))}
      </div>
      <div>
        <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={photos?.first}>Prev</button>
        <span>
          {photos ? photos.number + 1 : 0}/{photos?.totalPages ?? 0}
        </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={photos?.last}>Next</button>
      </div>
    </div>
  )
}

export default GalleryPage
