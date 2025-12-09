'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Image from 'next/image'
import { Button, Modal } from '@/shared/ui-kit'
import s from './ModulesBar.module.scss'
import monitor from '@/app/assets/icons/monitor.webp'
import Strelka from '@/app/assets/icons/strelka.svg'
import docIcon from '@/app/assets/icons/document.svg'
import MyApplicationsIcon from '@/app/assets/icons/dashboard-icons/my-applications.svg'
import chatIcon from '@/app/assets/icons/dashboard-icons/chat.svg'

export const ModulesBar = () => {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const languageMatch = pathname.match(/^\/([a-z]{2})/)
  const language = languageMatch ? languageMatch[1] : 'ru'

  const sections = [
    t('dashboard.footer.sections.applications'),
    t('dashboard.footer.sections.digitalSignature'),
    t('dashboard.footer.sections.videoConference'),
    t('dashboard.footer.sections.aiConsultant'),
    'Сообщество',
    'CRM',
    'Семинары',
    t('dashboard.footer.sections.database'),
  ]

  const digitalSignatureLabel = t('dashboard.footer.sections.digitalSignature')
  const applicationsLabel = t('dashboard.footer.sections.applications')
  const videoConferenceLabel = t('dashboard.footer.sections.videoConference')
  const aiConsultantLabel = t('dashboard.footer.sections.aiConsultant')

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
    setIsModalOpen(true)
  }

  return (
    <div className={s.sections}>
      {sections.map((section, index) => {
        const isPilot = section === videoConferenceLabel
        const isDigital = section === digitalSignatureLabel
        const isApplications = section === applicationsLabel
        const isAi = section === aiConsultantLabel
        const label = section
        return (
          <button
            key={index}
            className={`${s.section} ${(isDigital || isApplications || isAi) ? s.sectionEdo : ''}`}
            onClick={() => handleSectionClick(section)}
          >
            <span className={s.label}>
              {label}
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
                  <Image src={chatIcon} alt="ai" width={26} height={26} />
                </span>
              )}
              {/* Пилот метка убрана для ИИ-консультанта */}
            </span>
            <span className={s.arrow}>
              <Image src={Strelka} alt="arrow" width={28} height={28} />
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
