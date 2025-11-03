"use client"

import React from 'react'
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
      <img 
        src="https://cdn.sendpulse.com/img/messengers/sp-i-small-forms-wa.svg" 
        alt="WhatsApp"
      />
    </a>
  )
}
