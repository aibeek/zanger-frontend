import { useState, useEffect } from 'react'
import { lawyerApi } from '@/shared/api'
import s from './LawyerCommentsBlock.module.scss'
import { DateComponent } from '@/shared/ui-kit/DateComponent'

interface Comment {
    id: number
    content: string
    created_at: string
    lawyer: {
        id: number
        user: {
            name: string
        }
    }
}

interface LawyerCommentsBlockProps {
    orderId: number
}

export const LawyerCommentsBlock = ({ orderId }: LawyerCommentsBlockProps) => {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    const fetchComments = async () => {
        try {
            const res = await lawyerApi.getComments(orderId)
            const data = (res && (res.data || res)) as Comment[]
            setComments(data)
        } catch (e) {
            console.error('Failed to fetch comments', e)
        } finally {
            setFetching(false)
        }
    }

    useEffect(() => {
        if (orderId) {
            fetchComments()
        }
    }, [orderId])

    const handleSubmit = async () => {
        if (!newComment.trim()) return

        setLoading(true)
        try {
            await lawyerApi.createComment(orderId, newComment)
            setNewComment('')
            fetchComments()
        } catch (e) {
            console.error('Failed to create comment', e)
        } finally {
            setLoading(false)
        }
    }

    if (fetching && comments.length === 0) return <div className={s.container}>Загрузка комментариев...</div>

    return (
        <div className={s.container}>
            <h3 className={s.title}>Комментарии юриста / История обработки</h3>
            
            <div className={s.commentsList}>
                {comments.length === 0 ? (
                    <div className={s.emptyState}>
                        Нет комментариев. Будьте первым, кто оставит запись.
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className={s.commentItem}>
                            <div className={s.commentHeader}>
                                <span className={s.lawyerName}>{comment.lawyer?.user?.name || 'Юрист'}</span>
                                <span className={s.date}>
                                    <DateComponent date={comment.created_at} />
                                </span>
                            </div>
                            <div className={s.commentContent}>{comment.content}</div>
                        </div>
                    ))
                )}
            </div>

            <div className={s.inputArea}>
                <textarea
                    className={s.textarea}
                    placeholder="Напишите комментарий..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    disabled={loading}
                    rows={3}
                />
                <button 
                    className={s.addButton} 
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || loading}
                >
                    {loading ? (
                        'Отправка...'
                    ) : (
                        <>
                            <span>Добавить</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
