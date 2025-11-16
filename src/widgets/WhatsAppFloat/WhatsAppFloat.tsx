"use client"

import React from 'react'
import Image from 'next/image'
import s from './WhatsAppFloat.module.scss'

export const WhatsAppFloat: React.FC = () => {
  return (
    <a 
      href="https://wa.me/77786530889" 
      className={s.waFloat} 
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
    >
      <span className={s.waBubble}>Оставьте заявку</span>
      <Image 
        src="/assets/icons/whatsapp.svg" 
        alt="WhatsApp"
        width={60}
        height={60}
      />
    </a>
  )
}
