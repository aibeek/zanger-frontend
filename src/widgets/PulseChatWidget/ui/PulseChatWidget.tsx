'use client';

import { PulseChat } from '@/shared/ui-kit';
import s from './PulseChatWidget.module.scss';
import './pulse-chat-global.css';

interface PulseChatWidgetProps {
  className?: string;
  enabled?: boolean;
}

export const PulseChatWidget = ({ className, enabled = true }: PulseChatWidgetProps) => {
  const chatId = process.env.NEXT_PUBLIC_PULSE_CHAT_ID || '68beb8714d31c577970ac394';
  
  return (
    <div className={`${s.pulseChatWidget} ${className || ''}`} suppressHydrationWarning>
      <PulseChat chatId={chatId} enabled={enabled} />
    </div>
  );
};
