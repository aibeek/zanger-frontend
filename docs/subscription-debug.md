# Отладка отображения подписки

## Проблема
Подписка юриста не отображалась, несмотря на то, что данные приходят с API.

## Что было исправлено

### 1. Типы данных (`src/shared/lib/types/profile.ts`)
- Обновлен тип `UserProfile` для поддержки как `LawyerProfile`, так и `ClientProfile`:
```typescript
export type UserProfile = LawyerProfile | ClientProfile | null
```

- Обновлен тип подписки в `LawyerProfile`:
```typescript
subscription: {
    id: number
    plan: {
        id: number
        name: string
    }
    started_at: string
    ends_at: string
} | null
```

### 2. LoginStore (`src/features/auth/login/model/loginStore.ts`)
- Обновлен тип `personalData` в интерфейсе `AuthState`:
```typescript
interface AuthState {
    personalData: UserProfile | null  // было: UserProfile
    // ...
}
```

### 3. Компонент ProfileSubscription
- Добавлена проверка типа перед доступом к `lawyer`:
```typescript
const isLawyer = personalData && 'lawyer' in personalData
const subscription = isLawyer ? personalData.lawyer?.subscription : null
```

- Добавлено логирование для отладки (можно удалить после проверки):
```typescript
useEffect(() => {
    console.log('=== ProfileSubscription Debug ===')
    console.log('personalData:', personalData)
    console.log('isLawyer:', isLawyer)
    console.log('lawyer data:', isLawyer ? personalData.lawyer : 'Not a lawyer')
    console.log('subscription:', subscription)
    console.log('subscription exists?', !!subscription)
    console.log('================================')
}, [personalData, subscription, isLawyer])
```

## Как проверить работу

1. Откройте консоль браузера (F12)
2. Перейдите на страницу профиля юриста
3. В консоли должны появиться логи:
   ```
   === ProfileSubscription Debug ===
   personalData: {id: 123, lawyer: {...}, ...}
   isLawyer: true
   lawyer data: {id: 456, subscription: {...}, ...}
   subscription: {id: 271, plan: {...}, started_at: "2025-10-07", ends_at: "2025-11-07"}
   subscription exists? true
   ================================
   ```

4. На странице должен отобразиться блок с активной подпиской:
   - Зелёная рамка
   - Светло-зелёный фон
   - Название тарифного плана
   - Даты начала и окончания подписки
   - Кнопка "Управление подпиской"

## Структура данных API

Пример ответа от `/api/auth/me`:
```json
{
    "id": 123,
    "name": "Иванов Иван",
    "role_id": {
        "id": 2,
        "name": "Юрист",
        "code": "lawyer"
    },
    "lawyer": {
        "id": 456,
        "subscription": {
            "id": 271,
            "plan": {
                "id": 9,
                "name": "Тестовая оплата"
            },
            "started_at": "2025-10-07",
            "ends_at": "2025-11-07"
        }
    }
}
```

## Визуальные изменения

### С активной подпиской:
- **Рамка**: `border: 2px solid #10b981` (зелёная сплошная)
- **Фон**: `background: #f0fdf4` (светло-зелёный)
- **Текст заголовка**: `color: #065f46` (тёмно-зелёный)

### Без подписки:
- **Рамка**: `border: 2px dashed #d1d5db` (серая пунктирная)
- **Фон**: `background: #f9fafb` (светло-серый)

## Переводы

Добавлены ключи в `locales/ru/messages.json` и `locales/kz/messages.json`:
- `profile.subscription.active` - "Активная подписка"
- `profile.subscription.plan` - "Тарифный план"
- `profile.subscription.started_at` - "Дата начала"
- `profile.subscription.ends_at` - "Действительна до"
- `profile.subscription.manage` - "Управление подпиской"
