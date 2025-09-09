# Pulse Chat Integration

Интеграция онлайн-чата Pulse в Next.js приложение.

## Компоненты

### PulseChat (базовый компонент)

Базовый компонент для подключения Pulse чата.

```tsx
import { PulseChat } from '@/shared/ui-kit';

const MyComponent = () => {
  return (
    <div>
      <PulseChat 
        chatId="68beb8714d31c577970ac394" 
        enabled={true} 
      />
    </div>
  );
};
```

**Props:**
- `chatId: string` - уникальный идентификатор чата
- `enabled?: boolean` - включить/выключить чат (по умолчанию `true`)

### PulseChatWidget (виджет)

Готовый виджет для использования в layout'ах.

```tsx
import { PulseChatWidget } from '@/widgets/PulseChatWidget';

const Layout = ({ children }) => {
  return (
    <div>
      {children}
      <PulseChatWidget />
    </div>
  );
};
```

**Props:**
- `className?: string` - CSS класс
- `enabled?: boolean` - включить/выключить чат

## Хук usePulseChat

Хук для программного управления чатом.

```tsx
import { usePulseChat } from '@/shared/lib/hooks';

const MyComponent = () => {
  usePulseChat('68beb8714d31c577970ac394', {
    enabled: true,
    onLoad: () => console.log('Chat loaded'),
    onError: (error) => console.error('Chat error:', error)
  });

  return <div>My component</div>;
};
```

**Параметры:**
- `chatId: string` - ID чата
- `options: UsePulseChatOptions` - опции
  - `enabled?: boolean` - включить чат
  - `onLoad?: () => void` - callback при загрузке
  - `onError?: (error: Error) => void` - callback при ошибке

## Переменные окружения

Добавьте в `.env.local`:

```bash
NEXT_PUBLIC_PULSE_CHAT_ID=68beb8714d31c577970ac394
```

## Использование в проекте

Чат уже подключен в:
- `/src/app/[locale]/(public)/layout.tsx` - для публичных страниц
- `/src/app/[locale]/(dashboard)/layout.tsx` - для dashboard'а

## Настройка

1. **ID чата** - получите в админ-панели Pulse
2. **Переменные окружения** - установите `NEXT_PUBLIC_PULSE_CHAT_ID`
3. **Позиционирование** - чат появляется в правом нижнем углу автоматически
4. **Стилизация** - настраивается через админ-панель Pulse

## Особенности

- Скрипт загружается асинхронно
- Предотвращает дублирование при повторных рендерах
- Автоматическая очистка при размонтировании компонента
- Поддержка TypeScript

## Troubleshooting

**Чат не появляется:**
1. Проверьте ID чата в переменных окружения
2. Убедитесь, что домен добавлен в настройки Pulse
3. Проверьте консоль браузера на ошибки

**Дублирование чатов:**
- Компонент автоматически предотвращает дублирование

**Конфликт с другими чатами:**
- Компоненты изолированы и не должны конфликтовать
