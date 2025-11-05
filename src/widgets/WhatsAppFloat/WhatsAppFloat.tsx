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
      <Image 
        src="https://cdn.sendpulse.com/img/messengers/sp-i-small-forms-wa.svg" 
        alt="WhatsApp"
        width={60}
        height={60}
        unoptimized
      />
    </a>
  )
}
