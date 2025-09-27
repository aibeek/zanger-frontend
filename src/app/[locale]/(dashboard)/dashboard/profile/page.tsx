'use client'

import { useModal } from '@/shared/ui-kit'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'
import { useTranslations } from 'next-intl'
import {
    ProfileChangePassword,
    ProfileDelete,
    ProfilePersonalData,
    ProfileChangeSpecialization,
    ProfileConsultationPrice,
    ProfileServicingCities,
    ProfileDocuments,
    ProfileSupport,
    ProfileAvatar,
    ProfileSubscription,
    ProfilePaymentMethod,
} from '@/entities/profile'
import { UploadAvatar } from '@/entities/profile/ui/ProfileAvatar/UploadAvatar'
import { Modal } from '@/shared/ui-kit'
import { RightWidgets } from '../components/RightWidgets'
import Cookies from 'js-cookie'
import s from './page.module.scss'
import { useLoginStore } from '@/features/auth/login'
import Image from 'next/image'
import avatar from '@/app/assets/icons/avatar-default.svg'




// Simple avatar component for client profile
const ClientProfileAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
    const [imageError, setImageError] = useState(false)
    const { open: openAvatar, close: closeAvatar, isOpen: isAvatarOpen } = useModal()
    const t = useTranslations('uploadAvatar')

    const handleImageError = () => {
        console.log('Image failed to load:', avatarUrl)
        setImageError(true)
    }

    // Добавляем логирование для отладки
    console.log('ClientProfileAvatar - avatarUrl:', avatarUrl)
    console.log('ClientProfileAvatar - imageError:', imageError)

    // Упрощаем логику - показываем реальное фото если оно есть и не было ошибки загрузки
    const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '' && !imageError
    const imageSrc = hasValidAvatar ? avatarUrl : avatar

    console.log('ClientProfileAvatar - imageSrc:', imageSrc)

    return (
        <>
            <div 
                onClick={openAvatar} 
                style={{ 
                    cursor: 'pointer', 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}
            >
                <Image
                    src={imageSrc}
                    alt="User Avatar"
                    width={200}
                    height={200}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                    }}
                    onError={handleImageError}
                    unoptimized={imageSrc === avatar}
                />
            </div>
            
            <Modal
                isOpen={isAvatarOpen}
                onClose={closeAvatar}
                closeButton={true}
                title={t('modalTitle')}>
                <UploadAvatar onClose={closeAvatar} currentAvatarUrl={avatarUrl} />
            </Modal>
        </>
    )
}

// Large avatar component for lawyer profile
const LawyerProfileAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
    const [imageError, setImageError] = useState(false)
    const { open: openAvatar, close: closeAvatar, isOpen: isAvatarOpen } = useModal()
    const t = useTranslations('uploadAvatar')

    const handleImageError = () => {
        console.log('Image failed to load:', avatarUrl)
        setImageError(true)
    }

    // Добавляем логирование для отладки
    console.log('LawyerProfileAvatar - avatarUrl:', avatarUrl)
    console.log('LawyerProfileAvatar - imageError:', imageError)

    // Упрощаем логику - показываем реальное фото если оно есть и не было ошибки загрузки
    const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '' && !imageError
    const imageSrc = hasValidAvatar ? avatarUrl : avatar

    console.log('LawyerProfileAvatar - imageSrc:', imageSrc)

    return (
        <>
            <div 
                onClick={openAvatar} 
                style={{ 
                    cursor: 'pointer', 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}
            >
                <Image
                    src={imageSrc}
                    alt="Lawyer Avatar"
                    width={200}
                    height={200}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                    }}
                    onError={handleImageError}
                    unoptimized={imageSrc === avatar}
                />
            </div>
            
            <Modal
                isOpen={isAvatarOpen}
                onClose={closeAvatar}
                closeButton={true}
                title={t('modalTitle')}>
                <UploadAvatar onClose={closeAvatar} currentAvatarUrl={avatarUrl} />
            </Modal>
        </>
    )
}

export default function ProfilePage() {
    const t = useTranslations()
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const role = Cookies.get('role')

    const { close, open, isOpen } = useModal()
    const [popupStatus, setPopupStatus] = useState<'success' | 'failed' | null>(null)
    const [popupMessage, setPopupMessage] = useState<string | null>(null)
    
    useEffect(() => {
        const checkParams = async () => {
            let status: 'success' | 'failed' | null = null
            let message: string | null = null

            const sub = searchParams.get('subscription')
            if (sub === 'success' || sub === 'failed') {
                status = sub
                message = t(sub === 'success' ? 'subscriptionSuccess' : 'subscriptionFailed')
            } else {
                const card = searchParams.get('card-init')
                if (card === 'success' || card === 'failed') {
                    status = card
                    message = t(card === 'success' ? 'cardInitSuccess' : 'cardInitFailed')
                }
            }

            if (!status) return

            setPopupStatus(status)
            setPopupMessage(message)
            open()
            await refreshUser()

            const newParams = new URLSearchParams(searchParams.toString())
            newParams.delete('subscription')
            newParams.delete('card-init')
            router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
        }

        checkParams()
    }, [searchParams, pathname, open, router, t])

    const lawyer = role === 'lawyer'
    const personalData = useLoginStore((state) => state.personalData)
    const avatarUrl = personalData?.icon ?? ''

    // Логирование для отладки аватара
    console.log('ProfilePage - personalData:', personalData)
    console.log('ProfilePage - avatarUrl:', avatarUrl)
    console.log('ProfilePage - role:', role)

    const [activeModal, setActiveModal] = useState<string | null>(null)

    const openModal = (modalType: string) => {
        setActiveModal(modalType)
        open()
    }

    const closeModal = () => {
        setActiveModal(null)
        close()
    }

    const getModalTitle = (modalType: string | null) => {
        switch (modalType) {
            case 'consultation': return t('profile.consultation_price.title')
            case 'specialization': return t('profile.change_specialization.title')
            case 'documents': return t('profile.documents.title')
            case 'subscription': return t('profile.subscription.title')
            case 'password': return t('profile.change_password.title')
            case 'cities': return t('profile.servicing_cities.title')
            case 'support': return t('profile.support.title')
            case 'payment': return t('profile.payment_method.title')
            default: return ''
        }
    }

    if (lawyer) {
        return (
            <div className={s.profileContent}>
                <div className={s.profileSettings}>
                    {/* Profile Header - 2:3 columns */}
                    <div className={s.profileHeader}>
                        {/* Left: Avatar + Rating */}
                        <div className={s.avatarSection}>
                            <div className={s.avatarWrapper}>
                                <LawyerProfileAvatar avatarUrl={avatarUrl} />
                            </div>
                            <div className={s.ratingBlock}>
                                <div className={s.stars}>
                                    <span>★ ★ ★ ★ ★</span>
                                    <span className={s.rating}>4,9</span>
                                </div>
                                <button className={`btn btn-primary ${s.reviewsBtn}`}>Отзывы</button>
                            </div>
                        </div>

                        {/* Right: Personal Info */}
                        <div className={s.personalInfoSection}>
                            <ProfilePersonalData role={role} variant="clean" />
                        </div>
                    </div>

                    {/* Action Panel - 4x2 Grid */}
                    <div className={s.actionPanel}>
                        <button className={s.actionCard} onClick={() => openModal('consultation')}>
                            Стоимость консультации
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('specialization')}>
                            Ваша специализация
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('documents')}>
                            Документы
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('subscription')}>
                            Ваша подписка
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('password')}>
                            Смена пароля
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('cities')}>
                            Обслуживаемая локация
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('support')}>
                            Служба поддержки
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('payment')}>
                            Способы оплаты
                        </button>
                    </div>

                </div>
                <RightWidgets />

                {/* Modal for profile sections - render inline content without nested modals */}
                <Modal isOpen={isOpen} onClose={closeModal} title={getModalTitle(activeModal) || ''}>
                    <div className={s.modalContent}>
                        {activeModal === 'consultation' && <ProfileConsultationPrice />}
                        {activeModal === 'specialization' && <ProfileChangeSpecialization />}
                        {activeModal === 'documents' && <ProfileDocuments />}
                        {activeModal === 'subscription' && <ProfileSubscription />}
                        {activeModal === 'password' && <ProfileChangePassword />}
                        {activeModal === 'cities' && <ProfileServicingCities />}
                        {activeModal === 'support' && <ProfileSupport />}
                        {activeModal === 'payment' && <ProfilePaymentMethod />}
                    </div>
                </Modal>
            </div>
        )
    }

    // Default (client)
    return (
        <div className={s.profileContent}>
            <div className={s.profileSettings}>
                {/* Profile Header - 2:3 columns для клиентов */}
                <div className={s.profileHeader}>
                    {/* Left: Avatar */}
                    <div className={s.clientAvatarSection}>
                        <div className={s.avatarWrapper}>
                            <ClientProfileAvatar avatarUrl={avatarUrl} />
                        </div>
                    </div>

                    {/* Right: Personal Info */}
                    <div className={s.personalInfoSection}>
                        <ProfilePersonalData role={role} variant="clean" />
                    </div>
                </div>

                {/* Client Actions Panel - 2 колонки: смена пароля слева, документы справа */}
                <div className={s.clientActionPanel}>
                    {/* Смена пароля */}
                    <div className={`${s.clientActionCard} ${s.passwordSection}`}>
                        <h3>Смена пароля</h3>
                        <div className={s.passwordForm}>
                            <input 
                                type="password" 
                                placeholder="Введите старый пароль" 
                                className={s.passwordInput}
                            />
                            <input 
                                type="password" 
                                placeholder="Введите новый пароль" 
                                className={s.passwordInput}
                            />
                            <input 
                                type="password" 
                                placeholder="Подтвердите пароль" 
                                className={s.passwordInput}
                            />
                            <div className={s.passwordRequirements}>
                                Минимальная длина пароля - 8 символов.
                            </div>
                            <div className={s.passwordDescription}>
                                Пароль должен состоять из заглавных и строчных букв латинского алфавита (A-Z), цифр (0-9) и специальных символов.
                            </div>
                            <div className={s.passwordButtons}>
                                <button className={s.primaryBtn}>Сменить пароль</button>
                                <button className={s.secondaryBtn}>Отмена</button>
                            </div>
                        </div>
                    </div>

                    {/* Ваши документы */}
                    <div className={`${s.clientActionCard} ${s.documentsSection}`}>
                        <h3>Ваши документы</h3>
                        <div className={s.documentsList}>
                            <div className={s.documentItem}>
                                <div className={s.documentIcon}>�</div>
                                <div className={s.documentName}>Паспорт (скан первой страницы).pdf</div>
                            </div>
                            <div className={s.documentItem}>
                                <div className={s.documentIcon}>�</div>
                                <div className={s.documentName}>Свидетельство о регистрации.pdf</div>
                            </div>
                            <div className={s.documentItem}>
                                <div className={s.documentIcon}>🖼️</div>
                                <div className={s.documentName}>Фото 3x4.jpg</div>
                            </div>
                        </div>
                        <button className={s.addDocumentBtn}>
                            Добавить вложение
                        </button>
                    </div>
                </div>
            </div>
            <RightWidgets />
        </div>
    )
}
