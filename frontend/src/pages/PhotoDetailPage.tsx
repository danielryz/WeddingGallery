import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPhoto } from '../api/photos'
import type { PhotoResponse } from '../types/photo'

function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [photo, setPhoto] = useState<PhotoResponse>()

  useEffect(() => {
    if (id) {
      getPhoto(Number(id)).then(setPhoto)
    }
  }, [id])

  if (!photo) return <div>Loading...</div>

  return (
    <div>
      <img
        src={`/files/${photo.fileName}`}
        alt={photo.description ?? ''}
        style={{ maxWidth: '100%' }}
      />
      <p>{photo.description}</p>
    </div>
  )
}

export default PhotoDetailPage
