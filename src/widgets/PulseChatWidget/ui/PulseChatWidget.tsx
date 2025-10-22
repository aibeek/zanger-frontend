'use client';

import { PulseChat } from '@/shared/ui-kit';
import s from './PulseChatWidget.module.scss';
import './pulse-chat-global.css';

interface PulseChatWidgetProps {
  className?: string;
  enabled?: boolean;
}

// Globally disable PulseChat widget rendering by default, with optional env toggle
export const PulseChatWidget = ({ className, enabled }: PulseChatWidgetProps) => {
  const isEnabled = enabled ?? (process.env.NEXT_PUBLIC_ENABLE_PULSECHAT === 'true');

  // If explicitly disabled or env flag not set — render nothing
  if (!isEnabled) return null;

  const chatId = process.env.NEXT_PUBLIC_PULSE_CHAT_ID || '68beb8714d31c577970ac394';

  return (
    <div className={`${s.pulseChatWidget} ${className || ''}`} suppressHydrationWarning>
      <PulseChat chatId={chatId} enabled={isEnabled} />
    </div>
  );
};
