'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button, Input, Checkbox } from '@/shared/ui-kit'
import s from './NewPaymentPopup.module.scss'

interface NewPaymentPopupProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (cardData: any) => void
}

export const NewPaymentPopup = ({ isOpen, onClose, onSubmit }: NewPaymentPopupProps) => {
    const t = useTranslations('newPaymentPopup')
    const [cardNumber, setCardNumber] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [cvv, setCvv] = useState('')
    const [saveForFuture, setSaveForFuture] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!cardNumber || !expiryDate || !cvv) {
            return
        }

        setIsProcessing(true)
        
        try {
            await onSubmit({
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiryDate,
                cvv,
                saveForFuture
            })
            onClose()
        } catch (error) {
            console.error('Payment error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g)
        const match = matches && matches[0] || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        if (parts.length) {
            return parts.join(' ')
        } else {
            return v
        }
    }

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        if (v.length >= 2) {
            return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '')
        }
        return v
    }

    if (!isOpen) return null

    return (
        <div className={s.overlay}>
            <div className={s.modal}>
                <form onSubmit={handleSubmit} className={s.form}>
                    <div className={s.field}>
                        <label>{t('cardNumber')}</label>
                        <Input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                        />
                    </div>
                    
                    <div className={s.row}>
                        <div className={s.field}>
                            <label>MM/YY</label>
                            <Input
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                placeholder="MM/YY"
                                maxLength={5}
                                required
                            />
                        </div>
                        <div className={s.field}>
                            <label>CVV</label>
                            <Input
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="123"
                                maxLength={3}
                                required
                            />
                        </div>
                    </div>

                    <div className={s.checkbox}>
                        <Checkbox
                            checked={saveForFuture}
                            onChange={(checked) => setSaveForFuture(checked)}
                            label={t('saveForFuture')}
                        />
                    </div>

                    <div className={s.securityNote}>
                        <p>{t('securityNote')}</p>
                    </div>

                    <div className={s.actions}>
                        <Button 
                            variant="secondary" 
                            onClick={onClose}
                            type="button"
                        >
                            Отмена
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={isProcessing}
                        >
                            {isProcessing ? t('processing') : t('submit')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
