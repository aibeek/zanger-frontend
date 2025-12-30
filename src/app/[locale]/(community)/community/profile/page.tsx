'use client'

import { useState } from 'react'
import Image from 'next/image'
import s from './page.module.scss'
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    MoreHorizontal, 
    MapPin, 
    Pencil,
    Image as ImageIcon,
    Star,
    UserPlus,
    Link2,
    Archive,
    Trash2,
    MessageSquare
} from 'lucide-react'

// Mock data
const mockUser = {
    name: 'Айбек Нурланович',
    role: 'Адвокат',
    bio: 'Я юрист, который любит сложные кейсы и живые дискуссии. Если есть интересные вопросы — пишите, обсудим.',
    location: 'Усть-Каменогорск',
    avatar: '/assets/images/avatar-placeholder.jpg',
    followers: 78,
    following: 456,
    isOnline: true,
}

const mockPosts = [
    {
        id: 1,
        author: {
            name: 'Айбек Нурланович',
            avatar: '/assets/images/avatar-placeholder.jpg',
        },
        date: '12.12.2025',
        text: 'Недавно закрыли спор арендодателя и арендатора по задолженности. Вместо того чтобы идти в суд, провели три раунда переговоров и составили допсоглашение о реструктуризации долга. В итоге обе стороны сэкономили время, деньги и нервы. Если хотите — могу рассказать, как правильно строить переговоры, чтобы избежать суда.',
        images: 4,
        likes: 35,
        comments: 10,
        shares: 5,
    },
    {
        id: 2,
        author: {
            name: 'Айбек Нурланович',
            avatar: '/assets/images/avatar-placeholder.jpg',
        },
        date: '12.12.2025',
        text: 'Недавно закрыли спор арендодателя и арендатора по задолженности. Вместо того чтобы идти в суд, провели три раунда переговоров и составили допсоглашение о реструктуризации долга. В итоге обе стороны сэкономили время, деньги и нервы. Если хотите — могу рассказать, как правильно строить переговоры, чтобы избежать суда.',
        images: 4,
        likes: 35,
        comments: 10,
        shares: 5,
    },
]

const mockReviews = [
    {
        id: 1,
        name: 'Адильбек',
        avatar: '/assets/images/avatar-placeholder.jpg',
        date: '15 августа 2025',
        rating: 5,
        text: 'Дело выиграно благодаря опыту и вниманию к деталям. Настоящий профессионал! Спасибо Светлане!',
    },
    {
        id: 2,
        name: 'Карина',
        avatar: '/assets/images/avatar-placeholder.jpg',
        date: '15 августа 2025',
        rating: 5,
        text: 'Компетентный юрист, работает ответственно и на результат. Обращусь ещё раз при необходимо...',
    },
    {
        id: 3,
        name: 'Ирина',
        avatar: '/assets/images/avatar-placeholder.jpg',
        date: '15 августа 2025',
        rating: 4,
        text: 'Компетентный юрист, работает ответственно и на результат. Обращусь ещё раз при необходимо...',
    },
]

const mockSuggestedConnections = [
    { id: 1, name: 'Карим Каримов', mutualFriends: 1, avatar: '/assets/images/avatar-placeholder.jpg' },
    { id: 2, name: 'Серик Сериков', mutualFriends: 2, avatar: '/assets/images/avatar-placeholder.jpg' },
    { id: 3, name: 'Ольга Ашимова', mutualFriends: 7, avatar: '/assets/images/avatar-placeholder.jpg' },
]

const mockFavorites = [
    { id: 1, name: 'Карим Каримов', avatar: '/assets/images/avatar-placeholder.jpg' },
    { id: 2, name: 'Серик Сериков', avatar: '/assets/images/avatar-placeholder.jpg' },
    { id: 3, name: 'Ольга Ашимова', avatar: '/assets/images/avatar-placeholder.jpg' },
]

export default function CommunityProfilePage() {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)

    const toggleMenu = (postId: number) => {
        setOpenMenuId(openMenuId === postId ? null : postId)
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star 
                key={i} 
                size={14} 
                fill={i < rating ? '#f59e0b' : 'none'}
                className={i < rating ? s.starFilled : s.starEmpty}
            />
        ))
    }

    return (
        <div className={s.profilePage}>
            {/* Main Column */}
            <div className={s.mainColumn}>
                {/* Profile Header */}
                <div className={s.profileHeader}>
                    <div className={s.coverPhoto}>
                        <div className={s.coverPlaceholder}>
                            <div className={s.coverPlaceholderIcon}>
                                <ImageIcon size={32} />
                            </div>
                        </div>
                        <button className={s.changeCoverBtn}>
                            <Pencil size={16} />
                            Изменить обложку
                        </button>
                    </div>
                    
                    <div className={s.profileInfo}>
                        <div className={s.avatarContainer}>
                            <div className={s.avatar} style={{ background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 48, color: '#64748b' }}>👤</span>
                            </div>
                            {mockUser.isOnline && <div className={s.onlineIndicator} />}
                        </div>
                        
                        <div className={s.userDetails}>
                            <div className={s.nameRow}>
                                <h1 className={s.userName}>{mockUser.name}</h1>
                            </div>
                            <div className={s.userRole}>{mockUser.role}</div>
                            <p className={s.userBio}>{mockUser.bio}</p>
                            <div className={s.userLocation}>
                                <MapPin size={16} />
                                {mockUser.location}
                            </div>
                            <a href="#" className={s.moreLink}>Подробнее</a>
                            
                            <div className={s.actionButtons}>
                                <button className={s.editProfileBtn}>
                                    Редактировать профиль
                                </button>
                                <button className={s.activityBtn}>
                                    Моя активность
                                </button>
                            </div>
                        </div>
                        
                        <div className={s.statsSection}>
                            <div className={s.statItem}>
                                <span className={s.statValue}>{mockUser.followers}</span>
                                <span className={s.statLabel}>Подписчики</span>
                            </div>
                            <div className={s.statItem}>
                                <span className={s.statValue}>{mockUser.following}</span>
                                <span className={s.statLabel}>Подписки</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Post */}
                <div className={s.createPost}>
                    <div className={s.createPostContent}>
                        <span className={s.createPostPlus}>+</span>
                        <span className={s.createPostText}>Создать пост</span>
                    </div>
                </div>

                {/* Posts */}
                {mockPosts.map((post) => (
                    <div key={post.id} className={s.postCard}>
                        <div className={s.postHeader}>
                            <div className={s.postAuthor}>
                                <div className={s.postAvatar} style={{ background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%' }}>
                                    <span style={{ fontSize: 20, color: '#64748b' }}>👤</span>
                                </div>
                                <div className={s.postAuthorInfo}>
                                    <span className={s.postAuthorName}>{post.author.name}</span>
                                </div>
                            </div>
                            
                            <div className={s.postMenuDropdown}>
                                <button 
                                    className={s.postMenu}
                                    onClick={() => toggleMenu(post.id)}
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                                
                                {openMenuId === post.id && (
                                    <div className={s.dropdownMenu}>
                                        <button className={s.dropdownItem}>
                                            <Link2 size={16} />
                                            Скопировать ссылку
                                        </button>
                                        <button className={s.dropdownItem}>
                                            <Archive size={16} />
                                            Архивировать
                                        </button>
                                        <button className={`${s.dropdownItem} ${s.deleteItem}`}>
                                            <Trash2 size={16} />
                                            Удалить
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className={s.postContent}>
                            <p className={s.postText}>{post.text}</p>
                            
                            <div className={s.postImages}>
                                {Array.from({ length: post.images }).map((_, i) => (
                                    <div key={i} className={s.postImagePlaceholder}>
                                        <ImageIcon size={32} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className={s.postActions}>
                            <button className={s.postAction}>
                                <Heart size={18} />
                                <span className={s.postActionCount}>{post.likes}</span>
                            </button>
                            <button className={s.postAction}>
                                <MessageCircle size={18} />
                                <span className={s.postActionCount}>{post.comments}</span>
                            </button>
                            <button className={s.postAction}>
                                <Share2 size={18} />
                                <span className={s.postActionCount}>{post.shares}</span>
                            </button>
                            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>
                                {post.date}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Side Column */}
            <div className={s.sideColumn}>
                {/* Reviews Block */}
                <div className={s.sideBlock}>
                    <h3 className={s.sideBlockTitle}>Отзывы</h3>
                    
                    {mockReviews.map((review) => (
                        <div key={review.id} className={s.reviewItem}>
                            <div className={s.reviewAvatar} style={{ background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}>
                                <span style={{ fontSize: 16, color: '#64748b' }}>👤</span>
                            </div>
                            <div className={s.reviewContent}>
                                <div className={s.reviewHeader}>
                                    <span className={s.reviewName}>{review.name}</span>
                                    <div className={s.reviewStars}>
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                                <div className={s.reviewDate}>{review.date}</div>
                                <p className={s.reviewText}>{review.text}</p>
                            </div>
                        </div>
                    ))}
                    
                    <button className={s.viewAllBtn}>Смотреть все</button>
                </div>

                {/* Suggested Connections Block */}
                <div className={s.sideBlock}>
                    <h3 className={s.sideBlockTitle}>Возможно ваши знакомые</h3>
                    
                    {mockSuggestedConnections.map((connection) => (
                        <div key={connection.id} className={s.connectionItem}>
                            <div className={s.connectionAvatar} style={{ background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}>
                                <span style={{ fontSize: 16, color: '#64748b' }}>👤</span>
                            </div>
                            <div className={s.connectionInfo}>
                                <span className={s.connectionName}>{connection.name}</span>
                                <span className={s.connectionMutual}>{connection.mutualFriends} общий друг</span>
                            </div>
                            <button className={s.connectionAddBtn}>
                                <UserPlus size={16} />
                            </button>
                        </div>
                    ))}
                    
                    <button className={s.viewAllBtn}>Смотреть всех</button>
                </div>

                {/* Favorites Block */}
                <div className={s.sideBlock}>
                    <h3 className={s.sideBlockTitle}>Избранные</h3>
                    
                    {mockFavorites.map((favorite) => (
                        <div key={favorite.id} className={s.favoriteItem}>
                            <div className={s.favoriteAvatar} style={{ background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}>
                                <span style={{ fontSize: 16, color: '#64748b' }}>👤</span>
                            </div>
                            <span className={s.favoriteName}>{favorite.name}</span>
                            <button className={s.favoriteAction}>
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    ))}
                    
                    <button className={s.viewAllBtn}>Смотреть всех</button>
                </div>
            </div>
        </div>
    )
}
