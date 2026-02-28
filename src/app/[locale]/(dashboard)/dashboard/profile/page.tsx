'use client'

import { useModal } from '@/shared/ui-kit'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'
import { useTranslations, useLocale } from 'next-intl'
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

// Profile menu icons
import consultationIcon from '@/app/assets/icons/consultation-price.svg'
import specializationIcon from '@/app/assets/icons/medal.svg'
import documentsIcon from '@/app/assets/icons/user-tabs/responses-and-orders.svg'
import subscriptionIcon from '@/app/assets/icons/rocket.svg'
import passwordIcon from '@/app/assets/icons/lock.svg'
import MapLocationIcon from '@/app/assets/icons/location-blue.svg'
import supportIcon from '@/app/assets/icons/support-phone.svg'
import paymentIcon from '@/app/assets/icons/payment-method.svg'
import avatarEditIcon from '@/app/assets/icons/avatar-edit.svg'
import aiConsultantIcon from '@/../public/assets/icons/ai.svg'




// Simple avatar component for client profile
const ClientProfileAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
    const [imageError, setImageError] = useState(false)
    const { open: openAvatar, close: closeAvatar, isOpen: isAvatarOpen } = useModal()
    const t = useTranslations('uploadAvatar')

    const handleImageError = () => {
        console.log('Image failed to load:', avatarUrl)
        setImageError(true)
    }

    const handleAvatarClick = () => {
        console.log('Avatar clicked - opening modal')
        openAvatar()
    }

    // Debug logging
    console.log('ClientProfileAvatar - avatarUrl:', avatarUrl)
    console.log('ClientProfileAvatar - imageError:', imageError)

    // Show the uploaded avatar when it exists and loaded successfully
    const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '' && !imageError
    const imageSrc = hasValidAvatar ? avatarUrl : avatar

    console.log('ClientProfileAvatar - imageSrc:', imageSrc)

    return (
        <>
            <div 
                onClick={handleAvatarClick}
                style={{ 
                    cursor: 'pointer', 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '16px',
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

    const handleAvatarClick = () => {
        console.log('Lawyer Avatar clicked - opening modal')
        openAvatar()
    }

    // Debug logging
    console.log('LawyerProfileAvatar - avatarUrl:', avatarUrl)
    console.log('LawyerProfileAvatar - imageError:', imageError)

    // Show the uploaded avatar when it exists and loaded successfully
    const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '' && !imageError
    const imageSrc = hasValidAvatar ? avatarUrl : avatar

    console.log('LawyerProfileAvatar - imageSrc:', imageSrc)

    return (
        <>
            <div 
                onClick={handleAvatarClick}
                style={{ 
                    cursor: 'pointer', 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}
            >
                <Image
                    src={imageSrc}
                    alt="Lawyer Avatar"
                    width={300}
                    height={300}
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
    const locale = useLocale()
    const role = Cookies.get('role')

    const { close, open, isOpen } = useModal()
    const [popupStatus, setPopupStatus] = useState<'success' | 'failed' | null>(null)
    const [popupMessage, setPopupMessage] = useState<string | null>(null)
    const [showLawyerInfoBanner, setShowLawyerInfoBanner] = useState<boolean>(true)
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

    // Avatar debug logging
    console.log('ProfilePage - personalData:', personalData)
    console.log('ProfilePage - avatarUrl:', avatarUrl)
    console.log('ProfilePage - role:', role)

    const [activeModal, setActiveModal] = useState<string | null>(null)

    const openModal = (modalType: string) => {
        console.log('Opening modal:', modalType)
        console.log('Current personalData:', personalData)
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
                    {showLawyerInfoBanner && (
                        <div className={s.infoBanner}>
                            <div className={s.bannerIcon}>ℹ️</div>
                            <div className={s.bannerContent}>
                                <h4 className={s.bannerTitle}>{t('profile.lawyer_info_banner.title')}</h4>
                                <p className={s.bannerDescription}>{t('profile.lawyer_info_banner.description')}</p>
                            </div>
                            <button
                                className={s.bannerCloseBtn}
                                onClick={() => setShowLawyerInfoBanner(false)}
                                aria-label={t('profile.lawyer_info_banner.hide')}
                            >
                                {t('profile.lawyer_info_banner.hide')}
                            </button>
                        </div>
                    )}

                    {/* Profile Header - 2:3 columns */}
                    <div className={s.profileHeader}>
                        {/* Left: Avatar + Rating */}
                        <div className={s.avatarSection}>
                            <div className={s.avatarWrapper}>
                                <LawyerProfileAvatar avatarUrl={avatarUrl} />
                            </div>
                            {/* Technical Support Section */}
                            <div className={s.techSupportBox}>
                                <h4 className={s.techSupportTitle}>{t('profile.tech_support.title')}</h4>
                                <p className={s.techSupportDescription}>
                                    {t('profile.tech_support.description')}
                                </p>
                                <a href="mailto:support@zanger-app.kz " className={s.techSupportEmail}>
                                    support@zanger-app.kz 
                                </a>
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
                            <Image src={consultationIcon} alt="" width={24} height={24} />
                            <span>{t('profile.menu_items.consultation_price')}</span>
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('specialization')}>
                            <Image src={specializationIcon} alt="" width={24} height={24} />
                            <span>{t('profile.menu_items.specialization')}</span>
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('documents')}>
                            <Image src={documentsIcon} alt="" width={24} height={24} />
                            <span>{t('profile.menu_items.documents')}</span>
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('subscription')}>
                            <Image src={subscriptionIcon} alt="" width={24} height={24} />
                            <span>{t('profile.menu_items.subscription')}</span>
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('password')}>
                            <Image src={passwordIcon} alt="" width={24} height={24} />
                            <span>{t('profile.menu_items.change_password')}</span>
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('cities')}>
                            <Image src={MapLocationIcon} alt="" width={24} height={24} />
                            <span>{t('profile.menu_items.servicing_cities')}</span>
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('support')}>
                            <Image src={supportIcon} alt="" width={24} height={24} />
                            <span>{t('profile.menu_items.support')}</span>
                        </button>
                        <button className={s.actionCard} onClick={() => openModal('payment')}>
                            <Image src={paymentIcon} alt="" width={24} height={24} />
                            <span>{t('profile.menu_items.payment_methods')}</span>
                        </button>
                    </div>

                </div>
                <RightWidgets />

                {/* Modal for profile sections - render inline content without nested modals */}
                <Modal isOpen={isOpen} onClose={closeModal} title={getModalTitle(activeModal) || ''} closeButton={true}>
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
                {/* Profile Header - 2:3 columns РґР»СЏ РєР»РёРµРЅС‚РѕРІ */}
                <div className={s.profileHeader}>
                    {/* Left: Avatar */}
                    <div className={s.clientAvatarSection}>
                        <div className={s.avatarWrapper}>
                            <ClientProfileAvatar avatarUrl={avatarUrl} />
                        </div>
                        {/* Technical Support Section */}
                        <div className={s.techSupportBox}>
                            <h4 className={s.techSupportTitle}>{t('profile.tech_support.title')}</h4>
                            <p className={s.techSupportDescription}>
                                {t('profile.tech_support.description')}
                            </p>
                            <a href="mailto:info@zanger-app.kz" className={s.techSupportEmail}>
                                info@zanger-app.kz
                            </a>
                        </div>
                    </div>

                    {/* Right: Personal Info */}
                    <div className={s.personalInfoSection}>
                        <ProfilePersonalData role={role} variant="clean" />
                    </div>
                </div>

                {/* Client Actions Panel - 2 РєРѕР»РѕРЅРєРё: СЃРјРµРЅР° РїР°СЂРѕР»СЏ СЃР»РµРІР°, РґРѕРєСѓРјРµРЅС‚С‹ СЃРїСЂР°РІР° */}
                <div className={s.clientActionPanel}>
                    {/* РЎРјРµРЅР° РїР°СЂРѕР»СЏ */}
                    <div className={`${s.clientActionCard} ${s.passwordSection}`}>
                        <h3>РЎРјРµРЅР° РїР°СЂРѕР»СЏ</h3>
                        <div className={s.passwordForm}>
                            <input 
                                type="password" 
                                placeholder="Р’РІРµРґРёС‚Рµ СЃС‚Р°СЂС‹Р№ РїР°СЂРѕР»СЊ" 
                                className={s.passwordInput}
                            />
                            <input 
                                type="password" 
                                placeholder="Р’РІРµРґРёС‚Рµ РЅРѕРІС‹Р№ РїР°СЂРѕР»СЊ" 
                                className={s.passwordInput}
                            />
                            <input 
                                type="password" 
                                placeholder="РџРѕРґС‚РІРµСЂРґРёС‚Рµ РїР°СЂРѕР»СЊ" 
                                className={s.passwordInput}
                            />
                            <div className={s.passwordRequirements}>
                                РњРёРЅРёРјР°Р»СЊРЅР°СЏ РґР»РёРЅР° РїР°СЂРѕР»СЏ - 8 СЃРёРјРІРѕР»РѕРІ.
                            </div>
                            <div className={s.passwordDescription}>
                                РџР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ СЃРѕСЃС‚РѕСЏС‚СЊ РёР· Р·Р°РіР»Р°РІРЅС‹С… Рё СЃС‚СЂРѕС‡РЅС‹С… Р±СѓРєРІ Р»Р°С‚РёРЅСЃРєРѕРіРѕ Р°Р»С„Р°РІРёС‚Р° (A-Z), С†РёС„СЂ (0-9) Рё СЃРїРµС†РёР°Р»СЊРЅС‹С… СЃРёРјРІРѕР»РѕРІ.
                            </div>
                            <div className={s.passwordButtons}>
                                <button className={s.primaryBtn}>РЎРјРµРЅРёС‚СЊ РїР°СЂРѕР»СЊ</button>
                                <button className={s.secondaryBtn}>РћС‚РјРµРЅР°</button>
                            </div>
                        </div>
                    </div>

                    {/* Р’Р°С€Рё РґРѕРєСѓРјРµРЅС‚С‹ */}
                    <div className={`${s.clientActionCard} ${s.documentsSection}`}>
                        <h3>Р’Р°С€Рё РґРѕРєСѓРјРµРЅС‚С‹</h3>
                        <div className={s.documentsList}>
                            <div className={s.documentItem}>
                                <div className={s.documentIcon}>
                                    <Image src={documentsIcon} alt="" width={24} height={24} />
                                </div>
                                <div className={s.documentName}>РџР°СЃРїРѕСЂС‚ (СЃРєР°РЅ РїРµСЂРІРѕР№ СЃС‚СЂР°РЅРёС†С‹).pdf</div>
                            </div>
                            <div className={s.documentItem}>
                                <div className={s.documentIcon}>
                                    <Image src={documentsIcon} alt="" width={24} height={24} />
                                </div>
                                <div className={s.documentName}>РЎРІРёРґРµС‚РµР»СЊСЃС‚РІРѕ Рѕ СЂРµРіРёСЃС‚СЂР°С†РёРё.pdf</div>
                            </div>
                            <div className={s.documentItem}>
                                <div className={s.documentIcon}>
                                    <Image src={documentsIcon} alt="" width={24} height={24} />
                                </div>
                                <div className={s.documentName}>Р¤РѕС‚Рѕ 3x4.jpg</div>
                            </div>
                        </div>
                        <button className={s.addDocumentBtn}>
                            Р”РѕР±Р°РІРёС‚СЊ РІР»РѕР¶РµРЅРёРµ
                        </button>
                    </div>
                </div>
            </div>
            <RightWidgets />
        </div>
    )
}

