import React from 'react'
import s from './Button.module.scss'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'clear' | 'border'
type ButtonSize = 'sm' | 'md' | 'lg' | 'full' | 'auto'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean   // ✅ добавили
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(s.button, s[variant], s[size], className, {
        [s.loading]: loading, // ✅ отдельный стиль для лоадинга
      })}
      disabled={disabled || loading} // ✅ блокируем если loading
      {...props}
    >
      {loading ? <span className={s.spinner} /> : children} 
    </button>
  )
}
