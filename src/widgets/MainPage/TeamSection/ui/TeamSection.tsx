'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useMemo, useState } from 'react'
import Image from 'next/image'
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
  const gridRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const lastXRef = useRef(0)
  const dragOffsetRef = useRef(0)
  const lastTimeRef = useRef(0)
  const velocityRef = useRef(0)
  const momentumRafRef = useRef<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Бақытжан Кенжебаев',
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
      name: 'Назым Муканова',
      position: 'Медиатор',
      experience: 'Профессиональный опыт более 2 лет',
      moreExperience: 'Прошла стажировки в частных юридических компаниях.',
      description:
        'Медиатор в области уголовных, гражданских, семейных, трудовых споров',
      image: '/assets/images/mn.jpg',
    },
    {
      id: 3,
      name: 'Светлана Рахматулина',
      position: 'Медиатор',
      experience: 'Профессиональный опыт более 20 лет',
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
      name: 'Меирбек Мусабеков',
      position: 'Адвокат',
      experience: 'Профессиональный опыт более 20 лет',
      moreExperience:
        'Профессиональный опыт:\n• 2005-2007 гг. - инспектор отдела ОВП Министерства обороны РК\n• 2007-2022 гг. - прокурор гарнизонных прокуратур Главной военной прокуратуры\n• 2022-2023 гг. - начальник отдела юридического Департамента Министерства обороны РК\n\nСпециализация:\n⚔️ Военные дела\n🏠 Жилищные споры\n🚗 ДТП и страховые споры\n📋 Наследственные дела',
      description:
        'Военные дела, гражданское право, ДТП, жилищные, наследственные споры.',
      image: '/assets/images/mma.jpg',
    },
    {
      id: 5,
      name: 'Дмитрий Субботин',
      position: 'Юридический консультант',
      experience: 'Профессиональный опыт более 20 лет',
      moreExperience:
        'Основные направления деятельности:\n• Правовое обеспечение юридических и физических лиц в Казахстане и за рубежом\n• Представительство в судах\n• Сопровождение исполнительного производства\n• Взыскание задолженности\n• Защита имущественных и неимущественных прав\n• Правовая экспертиза документов и их приведение в соответствие с законодательством\n• Представительство в контролирующих органах и обжалование решений госорганов\n\nДостижения:\n💰 17 млн $ взыскано и сохранено\n🏠 2 млн $ признаны права на недвижимость\n⚖️ 90% дел выиграно',
      description:
        'Гражданское право, корпоративное право, административное право',
      image: '/assets/images/ds.jpg',
    },
    {
      id: 6,
      name: 'Биржан Дабылов',
      position: 'Юридический консультант',
      experience: 'Профессиональный опыт более 20 лет',
      moreExperience:
        'Претензионно-исковая работа, разработка и правовая экспертиза корпоративных документов, получение разрешительных документов и иное.',
      description:
        'Гражданское право, корпоративное право, административное право',
      image: '/assets/images/db.jpeg',
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const grid = gridRef.current
    if (!grid) return
    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current)
      momentumRafRef.current = null
    }
    isDraggingRef.current = true
    startXRef.current = e.clientX
    lastXRef.current = e.clientX
    dragOffsetRef.current = 0
    lastTimeRef.current = performance.now()
    velocityRef.current = 0
    grid.classList.add(s.dragging)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const grid = gridRef.current
    if (!grid) return
    const now = performance.now()
    const dx = e.clientX - lastXRef.current
    const dt = Math.max(1, now - lastTimeRef.current)
    lastXRef.current = e.clientX
    lastTimeRef.current = now
    dragOffsetRef.current += dx
    // Low-pass filter for velocity in px/ms
    const instantV = dx / dt
    velocityRef.current = velocityRef.current * 0.8 + instantV * 0.2
    grid.style.setProperty('--drag-x', `${dragOffsetRef.current}px`)
  }

  const endDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const grid = gridRef.current
    if (!grid) return
    isDraggingRef.current = false
    grid.classList.remove(s.dragging)
    if (e) {
      ;(e.target as Element).releasePointerCapture?.((e as any).pointerId)
    }
    // Keep the current offset and start momentum if still hovered
    grid.style.setProperty('--drag-x', `${dragOffsetRef.current}px`)

    const friction = 0.94 // velocity decay each frame
    const minVelocity = 0.02 // px/ms

    const step = () => {
      // stop if not hovered (autoplay resumes) or new drag started
      if (!grid.matches(':hover') || isDraggingRef.current) {
        momentumRafRef.current = null
        return
      }
      // advance position using velocity (assume ~16ms per frame)
      const v = velocityRef.current
      if (Math.abs(v) < minVelocity) {
        momentumRafRef.current = null
        return
      }
      dragOffsetRef.current += v * 16
      grid.style.setProperty('--drag-x', `${dragOffsetRef.current}px`)
      velocityRef.current *= friction
      momentumRafRef.current = requestAnimationFrame(step)
    }
    momentumRafRef.current = requestAnimationFrame(step)
  }

  return (
    <section id="lawyers" className={s.wrapper} ref={sectionRef}>
      <div className={s.container}>
        <div className={s.titleLine}></div>
        <h2 className={s.title}>{t('title')}</h2>
        
        <div className={s.searchForm}>
          <input 
            type="text" 
            placeholder="Найти юриста..." 
            className={s.searchInput}
          />
          <select className={s.searchSelect}>
            <option value="">Регион</option>
            <option value="almaty">Алматы</option>
            <option value="nur-sultan">Нур-Султан</option>
            <option value="shymkent">Шымкент</option>
          </select>
          <select className={s.searchSelect}>
            <option value="">Специализация</option>
            <option value="civil">Гражданское право</option>
            <option value="criminal">Уголовное право</option>
            <option value="family">Семейное право</option>
            <option value="corporate">Корпоративное право</option>
          </select>
          <button className={s.searchButton}>
            Найти
          </button>
        </div>

        <div
          className={s.teamGrid}
          ref={gridRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          {displayMembers.map((member, index) => (
            <div key={`member-${member.id}-${index}`} className={s.memberCard}>
              <Image
                src={member.image}
                alt={member.name}
                width={300}
                height={300}
                className={s.memberImage}
                width={200}
                height={200}
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
              <Image
                src={selectedMember.image}
                alt={selectedMember.name}
                width={200}
                height={200}
                className={s.modalImage}
                width={120}
                height={120}
              />
              <div className={s.modalInfo}>
                <h3 className={s.modalName}>{selectedMember.name}</h3>
                <p className={s.modalPosition}>{selectedMember.position}</p>
                <p className={s.modalExperience}>{selectedMember.experience}</p>
                
                <div className={s.headerContacts}>
                  <div className={s.contactIconOnly}>
                    <svg 
                      className={s.whatsappIcon} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" 
                        fill="#25D366"
                      />
                    </svg>
                  </div>
                  
                  <div className={s.contactIconOnly}>
                    <svg 
                      className={s.phoneIcon} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" 
                        stroke="#2563eb" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
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

