import type { Metadata } from 'next'
import React from 'react'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { AuthGuard } from '@/shared/lib'
import { DashboardLayout } from '@/shared/ui-kit/DashboardLayout'
import { AppToaster } from '@/shared/ui-kit'
import { SWRConfig } from 'swr'

export const metadata: Metadata = {
  title: 'Zanger — ЭЦП',
  description: 'Модуль ЭЦП',
  icons: {
    icon: '/logo-blue.svg',
    shortcut: '/logo-blue.svg',
    apple: '/logo-blue.svg',
  },
}

export default async function EcpLayoutRoot({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthGuard>
        <SWRConfig value={{ shouldRetryOnError: false }}>
            <DashboardLayout language={locale}>
                {children}
            </DashboardLayout>
            <AppToaster />
        </SWRConfig>
      </AuthGuard>
    </NextIntlClientProvider>
  )
}