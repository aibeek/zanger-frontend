'use client'

import React from 'react'
import { Modal } from '../Modal'
import { Button } from '../Button'
import s from './ConfirmModal.module.scss'

type Props = {
  isOpen: boolean
  title?: string
  message: string
  confirmText: string
  cancelText?: string
  onConfirm: () => void
  onClose: () => void
  confirmVariant?: 'primary' | 'danger'
  loading?: boolean
}

export const ConfirmModal: React.FC<Props> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Отменить',
  onConfirm,
  onClose,
  confirmVariant = 'primary',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={s.content}>
        <div className={s.message}>{message}</div>
        <div className={s.actions}>
          <Button variant="border" onClick={onClose}> {cancelText} </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}> {confirmText} </Button>
        </div>
      </div>
    </Modal>
  )
}
