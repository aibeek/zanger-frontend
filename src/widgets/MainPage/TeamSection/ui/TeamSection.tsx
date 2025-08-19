'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useMemo, useState } from 'react'
import s from './TeamSection.module.scss'

interface TeamMember {
  id: number
  name: string
  position: string
  experience: string
  description: string
  moreExperience: string
  image: string
}

export const TeamSection = () => {
  const t = useTranslations('lending.teamSection')
  const sectionRef = useRef<HTMLElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'КЕНЖЕБАЕВ БАҚЫТЖАН',
      position: 'Юридический консультант',
      experience: 'более 9 лет',
      moreExperience:
        'Правовое обеспечение корпоративного управления; Представительство интересов компании по правовым вопросам в отношениях с третьими лицами; Претензионно-исковая работа; Юридическое сопровождение проверок контролирующих органов; Правовая поддержка и консультация по текущим правовым вопросам работников компании, оказание содействия в оформлении документов и актов имущественно-правового характера; Регистрация товарных знаков и защита интеллектуальной собственности; Участие в разработке и осуществлении мероприятий по укреплению договорной, финансовой и трудовой дисциплины; Представительство интересов компании в судебных и правоохранительных органах.',
      description:
        'Корпоративное право, гражданское право, претензионно-исковая работа и дp',
      image: '/assets/images/kb.jpg',
    },
    {
      id: 2,
      name: 'МУКАНОВА НАЗЫМ',
      position: 'Медиатор, Юридический консультант',
      experience: 'более 2 лет',
      moreExperience: 'Прошла стажировки в частных юридических компаниях.',
      description:
        'Медиатор в области уголовных, гражданских, семейных, трудовых споров',
      image: '/assets/images/mn.jpg',
    },
    {
      id: 3,
      name: 'Рахматулина Светлана',
      position: 'Медиатор, Юридический консультант, Арбитр',
      experience: 'более 20 лет',
      moreExperience: `Судебное представительство по гражданским, уголовным и административным делам; Семейные споры (развод, алименты, раздел имущества, установление отцовства, усыновление); Банковские споры и реструктуризация задолженности; Снятие арестов и запретов; Отмена решений суда;
Трудовые споры;
Споры по интеллектуальной собственности;
Наследственные дела;
Жилищно-коммунальные споры.`,
      description:
        'Гражданское, уголовное, семейное, трудовое, наследственное право',
      image: '/assets/images/rsa.jpeg',
    },
    {
      id: 4,
      name: 'Мусабеков Меирбек',
      position: 'Адвокат, Юридический консультант',
      experience: 'более 20 лет',
      moreExperience:
        'Профессиональный опыт:\n• 2005-2007 гг. - инспектор отдела ОВП Министерства обороны РК\n• 2007-2022 гг. - прокурор гарнизонных прокуратур Главной военной прокуратуры\n• 2022-2023 гг. - начальник отдела юридического Департамента Министерства обороны РК\n\nСпециализация:\n⚔️ Военные дела\n🏠 Жилищные споры\n🚗 ДТП и страховые споры\n📋 Наследственные дела',
      description:
        'Военные дела, гражданское право, ДТП, жилищные, наследственные споры.',
      image: '/assets/images/mma.jpg',
    },
    {
      id: 5,
      name: 'Дмитрий Субботин',
      position: 'Адвокат, Юридический консультант',
      experience: 'Профессиональный опыт более 20 лет',
      moreExperience:
        'Основные направления деятельности:\n• Правовое обеспечение юридических и физических лиц в Казахстане и за рубежом\n• Представительство в судах\n• Сопровождение исполнительного производства\n• Взыскание задолженности\n• Защита имущественных и неимущественных прав\n• Правовая экспертиза документов и их приведение в соответствие с законодательством\n• Представительство в контролирующих органах и обжалование решений госорганов\n\nДостижения:\n💰 17 млн $ взыскано и сохранено\n🏠 2 млн $ признаны права на недвижимость\n⚖️ 90% дел выиграно',
      description:
        'Гражданское право, корпоративное право, административное право',
      image: '/assets/images/ds.jpg',
    },
  ]

  // Убираем дублирование для более чистого отображения
  const displayMembers = useMemo(
    () => teamMembers,
    [teamMembers]
  )

  const openModal = (member: TeamMember) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMember(null)
  }

  useEffect(() => {
    const teamGrid = sectionRef.current?.querySelector(`.${s.teamGrid}`)
    if (teamGrid) {
      if (isModalOpen) {
        teamGrid.classList.add(s.paused)
      } else {
        teamGrid.classList.remove(s.paused)
      }
    }
  }, [isModalOpen])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(s.animated)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className={s.wrapper} ref={sectionRef}>
      <div className={s.container}>
        <h2 className={s.title}>{t('title')}</h2>

        <div className={s.teamGrid}>
          {displayMembers.map((member, index) => (
            <div key={`member-${member.id}-${index}`} className={s.memberCard}>
              <img
                src={member.image}
                alt={member.name}
                className={s.memberImage}
              />
              <div className={s.memberOverlay}>
                <h3 className={s.memberName}>{member.name}</h3>
                <p className={s.memberPosition}>{member.position}</p>
                <p className={s.memberExperience}>{member.experience}</p>
                <p className={s.memberDescription}>{member.description}</p>
                
                <button
                  className={s.moreBtn}
                  onClick={() => openModal(member)}
                >
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && selectedMember && (
        <div className={s.modalOverlay} onClick={closeModal}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={s.modalCloseBtn} onClick={closeModal}>
              ×
            </button>
            <div className={s.modalHeader}>
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className={s.modalImage}
              />
              <div className={s.modalInfo}>
                <h3 className={s.modalName}>{selectedMember.name}</h3>
                <p className={s.modalPosition}>{selectedMember.position}</p>
                <p className={s.modalExperience}>{selectedMember.experience}</p>
              </div>
            </div>
            <div className={s.modalBody}>
              <h4 className={s.modalSectionTitle}>Опыт работы:</h4>
              <p className={s.modalDescription}>{selectedMember.moreExperience}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
