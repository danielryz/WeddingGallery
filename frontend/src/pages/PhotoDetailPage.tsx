import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPhoto } from '../api/photos'
import { getComments, addComment } from '../api/comments'
import {
  addReaction,
  deleteReaction,
  getReactionCounts,
} from '../api/reactions'
import type { PhotoResponse } from '../types/photo'
import type { CommentResponse } from '../types/comment'
import type { ReactionCountResponse, ReactionResponse } from '../types/reaction'

function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const photoId = id ? Number(id) : undefined

  const [photo, setPhoto] = useState<PhotoResponse>()
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [commentText, setCommentText] = useState('')
  const [reactions, setReactions] = useState<ReactionCountResponse[]>([])
  const [myReaction, setMyReaction] = useState<ReactionResponse>()

  useEffect(() => {
    if (!photoId) return
    getPhoto(photoId).then(setPhoto)
    getComments(photoId).then((p) => setComments(p.content))
    getReactionCounts(photoId).then(setReactions)
  }, [photoId])

  const handleAddComment = async () => {
    if (!photoId || !commentText.trim()) return
    const res = await addComment(photoId, { text: commentText })
    setComments((prev) => [...prev, res])
    setCommentText('')
  }

  const handleAddReaction = async (type: string) => {
    if (!photoId) return
    const res = await addReaction(photoId, { type })
    setMyReaction(res)
    getReactionCounts(photoId).then(setReactions)
  }

  const handleRemoveReaction = async () => {
    if (!myReaction) return
    await deleteReaction(myReaction.id)
    setMyReaction(undefined)
    if (photoId) {
      getReactionCounts(photoId).then(setReactions)
    }
  }

  if (!photo) return <div>Loading...</div>

  const rating = myReaction ? Number(myReaction.type) : 0

  return (
    <div>
      <img
        src={`/files/${photo.fileName}`}
        alt={photo.description ?? ''}
        style={{ maxWidth: '100%' }}
      />
      <p>{photo.description}</p>

      <div>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleAddReaction(String(n))}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              cursor: 'pointer',
            }}
          >
            {rating >= n ? '⭐' : '☆'}
          </button>
        ))}
        <button type="button" onClick={handleRemoveReaction} disabled={!myReaction}>
          Remove Rating
        </button>
      </div>

      <ul>
        {reactions.map((r) => (
          <li key={r.type}>
            {r.type}: {r.count}
          </li>
        ))}
      </ul>

      <div>
        <h3>Comments</h3>
        <ul>
          {comments.map((c) => (
            <li key={c.id}>
              <strong>{c.deviceName}: </strong>
              {c.text}
            </li>
          ))}
        </ul>
        <div>
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
          />
          <button type="button" onClick={handleAddComment}>
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhotoDetailPage
