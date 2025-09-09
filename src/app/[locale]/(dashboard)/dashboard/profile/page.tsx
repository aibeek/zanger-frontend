'use client'

import { useModal } from '@/shared/ui-kit'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'
import { PopupStates } from '@/entities/profile/ui/ProfileSubscription/SubscriptionPopupStates'
import { useTranslations } from 'next-intl'
import {
    ProfileChangePassword,
    ProfileDelete,
    ProfilePersonalData,
    ProfileChangeSpecialization,
    ProfileConsultationPrice,
    ProfileSubscription,
    ProfileServicingCities,
    ProfileDocuments,
    ProfileSupport,
    ProfilePaymentMethod,
} from '@/entities/profile'
import { Modal } from '@/shared/ui-kit'
import { RightWidgets } from '../components/RightWidgets'
import Cookies from 'js-cookie'
import s from './page.module.scss'

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

    return (
        <>
            <div className={s.profileContent}>
                {/* Profile Settings */}
                <div className={s.profileSettings}>
                    <ProfilePersonalData role={role} />
                    <ProfileChangePassword />
                    {lawyer && (
                        <>
                            <ProfileDocuments />
                            <ProfileConsultationPrice />
                            <ProfileChangeSpecialization />
                            <ProfileSubscription />
                            <ProfilePaymentMethod />
                            <ProfileServicingCities />
                        </>
                    )}
                    <ProfileSupport />
                    <ProfileDelete />
                </div>

                {/* Right Widgets */}
                <RightWidgets />
            </div>

            <Modal
                className={s.modal}
                isOpen={isOpen}
                onClose={() => {
                    close()
                    setPopupStatus(null)
                    setPopupMessage(null)
                }}
                closeButton>
                {popupStatus && popupMessage && (
                    <PopupStates
                        status={popupStatus}
                        message={popupMessage}
                    />
                )}
            </Modal>
        </>
    )
}
