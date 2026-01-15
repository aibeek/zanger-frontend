'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { Button, Modal } from '@/shared/ui-kit'
import s from './ModulesBar.module.scss'
import monitor from '@/app/assets/icons/monitor.webp'
import docIcon from '@/app/assets/icons/document.svg'
import MyApplicationsIcon from '@/app/assets/icons/dashboard-icons/my-applications.svg'
import chatIcon from '@/app/assets/icons/dashboard-icons/chat.svg'
import aiIcon from '@/../public/assets/icons/ai.png'
import moduleIcon from '@/app/assets/icons/moduleIcon.svg'
import communityIcon from '@/app/assets/icons/people.svg'
import crmIcon from '@/app/assets/icons/phone.svg'
import seminarIcon from '@/app/assets/icons/document.svg'
import verifyIcon from '@/app/assets/icons/sheet-alert.svg'
import { Search } from 'lucide-react'

export const ModulesBar = () => {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const languageMatch = pathname.match(/^\/([a-z]{2})/)
  const language = languageMatch ? languageMatch[1] : 'ru'

  const userRole = Cookies.get('role')
  const isClient = userRole === 'client'

  const allSections = [
    t('dashboard.footer.sections.applications'),
    t('dashboard.footer.sections.digitalSignature'),
    t('dashboard.footer.sections.aiConsultant'),
    t('dashboard.footer.sections.videoConference'),
    'Сообщество',
    'CRM',
    'Семинары',
    t('dashboard.footer.sections.database'),
  ]

  const sections = isClient 
    ? [
        t('dashboard.footer.sections.applications'),
        t('dashboard.footer.sections.digitalSignature'),
        t('dashboard.footer.sections.aiConsultant'),
        t('dashboard.footer.sections.videoConference'),
      ]
    : allSections

  const digitalSignatureLabel = t('dashboard.footer.sections.digitalSignature')
  const applicationsLabel = t('dashboard.footer.sections.applications')
  const videoConferenceLabel = t('dashboard.footer.sections.videoConference')
  const aiConsultantLabel = t('dashboard.footer.sections.aiConsultant')
  const databaseLabel = t('dashboard.footer.sections.database')

  const handleSectionClick = (label: string) => {
    if (label === digitalSignatureLabel) {
      router.push(`/${language}/ecp/statuses`)
      return
    }
    if (label === applicationsLabel) {
      router.push(`/${language}/dashboard/applications`)
      return
    }
    if (label === aiConsultantLabel) {
      router.push(`/${language}/dashboard/ai-consultant`)
      return
    }
    if (label === videoConferenceLabel) {
      router.push(`/${language}/dashboard/video-conference`)
      return
    }
    setIsModalOpen(true)
  }

  return (
    <div className={s.sections}>
      {sections.map((section, index) => {
        const isPilot = section === videoConferenceLabel
        const isDigital = section === digitalSignatureLabel
        const isApplications = section === applicationsLabel
        const isAi = section === aiConsultantLabel
        const isDatabase = section === databaseLabel
        const isCommunity = section === 'Сообщество'
        const isCRM = section === 'CRM'
        const isSeminars = section === 'Семинары'
        const label = section === databaseLabel ? 'Проверка\nконтрагента' : section
        return (
          <button
            key={index}
            className={`${s.section} ${(isDigital || isApplications || isAi || isPilot) ? s.sectionEdo : ''}`}
            onClick={() => handleSectionClick(section)}
          >
            <span className={s.label} style={isDatabase ? { fontSize: '14px', whiteSpace: 'pre-line' } : undefined}>
              {isDigital && (
                <span className={s.docIcon} aria-hidden>
                  <Image src={docIcon} alt="doc" width={26} height={26} />
                </span>
              )}
              {isPilot && (
                <span className={s.docIcon} aria-hidden>
                  <Image src="/assets/icons/vks.svg" alt="vks" width={26} height={26} />
                </span>
              )}
              {isApplications && (
                <span className={s.docIcon} aria-hidden>
                  <Image src={MyApplicationsIcon} alt="applications" width={26} height={26} />
                </span>
              )}
              {isAi && (
                <span className={s.docIcon} aria-hidden>
                  <Image src={aiIcon} alt="ai" width={26} height={26} />
                </span>
              )}
              {(isCommunity || isCRM || isSeminars || isDatabase) && (
                <span className={s.docIcon} aria-hidden>
                  {isDatabase ? (
                    <Search size={24} color="#fff" />
                  ) : (
                    <Image src={
                      isCommunity ? communityIcon :
                      isCRM ? crmIcon :
                      isSeminars ? seminarIcon :
                      moduleIcon
                    } alt="icon" width={26} height={26} />
                  )}
                </span>
              )}
              {label}
              {/* Пилот метка убрана для ИИ-консультанта */}
            </span>
          </button>
        )
      })}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="">
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Image src={monitor} alt="В разработке" width={200} height={150} style={{ margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Модули в разработке</h3>
          <Button variant="primary" onClick={() => setIsModalOpen(false)} style={{ minWidth: 150 }}>
            Понятно
          </Button>
        </div>
      </Modal>
    </div>
  )
}
