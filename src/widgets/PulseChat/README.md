# Pulse Chat Integration

Интеграция онлайн-чата Pulse в Next.js приложение.

## Установка

Компонент уже установлен и настроен во всех layout файлах проекта:
- `(public)/layout.tsx` - для публичных страниц
- `(dashboard)/layout.tsx` - для панели управления
- `(subscription)/layout.tsx` - для страниц подписки
- `(auth)/auth/layout.tsx` - для страниц авторизации

## Использование

### Базовое использование

```tsx
import { PulseChat } from '@/widgets/PulseChat'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <PulseChat />
    </div>
  )
}
```

### Расширенное использование

```tsx
import { PulseChat } from '@/widgets/PulseChat'

export default function Layout({ children }: { children: React.ReactNode }) {
  const handleChatLoad = () => {
    console.log('Pulse Chat загружен!')
  }

  const handleChatError = (error: Error) => {
    console.error('Ошибка загрузки Pulse Chat:', error)
  }

  return (
    <div>
      {children}
      <PulseChat
        chatId="your-custom-chat-id"
        onLoad={handleChatLoad}
        onError={handleChatError}
        disabled={false}
      />
    </div>
  )
}
```

## Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `chatId` | `string` | `"68beb8714d31c577970ac394"` | Уникальный ID чата Pulse |
| `disabled` | `boolean` | `false` | Отключить загрузку чата |
| `onLoad` | `() => void` | `undefined` | Callback при успешной загрузке |
| `onError` | `(error: Error) => void` | `undefined` | Callback при ошибке загрузки |

## Особенности

### ✅ Что сделано правильно:

1. **SSR совместимость** - компонент использует `'use client'` и `useEffect`
2. **Предотвращение дублирования** - проверка на существующие скрипты
3. **Правильная очистка** - удаление скриптов при размонтировании
4. **TypeScript поддержка** - полная типизация
5. **Асинхронная загрузка** - не блокирует рендеринг страницы
6. **Error handling** - обработка ошибок загрузки

### 🔧 Как это работает:

1. Компонент загружается на клиенте после гидратации
2. Создается `<script>` элемент с правильными атрибутами
3. Скрипт загружается асинхронно с CDN Pulse
4. Pulse автоматически создает виджет чата
5. При размонтировании компонента всё очищается

### 🎨 Кастомизация:

Внешний вид и поведение чата настраивается через **админ-панель Pulse**, а не через код.

### 🚀 Производительность:

- Скрипт загружается асинхронно (`async`)
- Не блокирует загрузку остального контента
- Загружается только один раз на страницу
- Автоматическая очистка при переходах между страницами

## Программное управление

### Утилиты

```tsx
import { 
  showPulseChat, 
  hidePulseChat, 
  togglePulseChat,
  isPulseChatAvailable,
  usePulseChat 
} from '@/widgets/PulseChat'

// Прямое управление
showPulseChat()    // Показать чат
hidePulseChat()    // Скрыть чат
togglePulseChat()  // Переключить видимость

// Проверка доступности API
if (isPulseChatAvailable()) {
  showPulseChat()
}
```

### React Hook

```tsx
import { usePulseChat } from '@/widgets/PulseChat'

function MyComponent() {
  const pulseChat = usePulseChat()

  return (
    <div>
      <button 
        onClick={pulseChat.show}
        disabled={!pulseChat.isAvailable}
      >
        Открыть поддержку
      </button>
      
      <button onClick={pulseChat.toggle}>
        Переключить чат
      </button>
      
      {pulseChat.isAvailable && (
        <p>Pulse Chat готов к использованию!</p>
      )}
    </div>
  )
}
```

### Пример компонента

См. `examples/ChatController.tsx` для полного примера управления чатами.

## Конфликты с существующим чатом

В проекте уже есть компонент `ChatBot`. Оба чата могут работать одновременно:

- **ChatBot** - ваш собственный чат-бот с формой
- **PulseChat** - внешний сервис онлайн-чата

Если нужно отключить один из чатов, просто удалите соответствующий компонент из layout файлов.

## Troubleshooting

### Чат не появляется

1. Проверьте правильность `chatId`
2. Убедитесь, что нет блокировщиков рекламы
3. Проверьте консоль браузера на ошибки
4. Убедитесь, что сайт добавлен в настройки Pulse

### Чат появляется несколько раз

Это означает, что компонент подключен в нескольких местах. Проверьте layout файлы.

### Ошибки в консоли

Используйте параметр `onError` для отслеживания проблем:

```tsx
<PulseChat 
  onError={(error) => {
    // Отправьте ошибку в вашу систему мониторинга
    console.error('Pulse Chat Error:', error)
  }}
/>
```
