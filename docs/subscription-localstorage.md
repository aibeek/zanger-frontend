# Подписка из localStorage

## Проблема
Подписка юриста хранится в `localStorage` в формате, отличном от API `/auth/me`.

## Структура данных подписки в localStorage

```json
{
    "id": "694b849b-9099-43b0-a9cf-11c7ec571206",
    "user_id": 243,
    "request_type_id": "bce9aea7-aa26-41ed-bd1a-2cbd82c58506",
    "request_type": "ТЕСТОВЫЙ для админов",
    "start_date": "2025-08-18T00:00:00Z",
    "end_date": "2026-11-18T00:00:00Z",
    "total_used": 51,
    "last_reset": "2025-08-18T00:00:00Z",
    "requests_per_month": 10000000
}
```

**Ключ в localStorage:** `subscription`

## Изменения в коде

### 1. Новый тип данных (`src/shared/lib/types/profile.ts`)

Добавлен новый тип для подписки из localStorage:

```typescript
export type SubscriptionFromStorage = {
    id: string
    user_id: number
    request_type_id: string
    request_type: string
    start_date: string
    end_date: string
    total_used: number
    last_reset: string
    requests_per_month: number
}
```

### 2. Обновленный компонент ProfileSubscription

Компонент теперь проверяет **два источника** данных о подписке:

1. **localStorage** (ключ `subscription`) - приоритетный
2. **API** (`personalData.lawyer.subscription`) - резервный

```typescript
// Получаем подписку из localStorage
useEffect(() => {
    try {
        const subscriptionData = localStorage.getItem('subscription')
        if (subscriptionData) {
            const parsed = JSON.parse(subscriptionData)
            setStorageSubscription(parsed)
        }
    } catch (error) {
        console.error('Ошибка при чтении подписки из localStorage:', error)
    }
}, [])

// Используем подписку из localStorage, если она есть, иначе из API
const subscription = storageSubscription || apiSubscription
```

### 3. Функция определения деталей подписки

Компонент автоматически определяет формат подписки и извлекает нужные поля:

```typescript
const getSubscriptionDetails = () => {
    if (!subscription) return null

    // Если это подписка из localStorage
    if ('request_type' in subscription) {
        return {
            planName: subscription.request_type,
            startDate: subscription.start_date,
            endDate: subscription.end_date
        }
    }

    // Если это подписка из API
    if ('plan' in subscription) {
        return {
            planName: subscription.plan.name,
            startDate: subscription.started_at,
            endDate: subscription.ends_at
        }
    }

    return null
}
```

## Как это работает

### Сценарий 1: Подписка в localStorage
1. Пользователь оплачивает подписку
2. Бэкенд сохраняет данные в localStorage с ключом `subscription`
3. Компонент `ProfileSubscription` читает данные
4. Отображается активная подписка с полями:
   - **План:** `request_type` ("ТЕСТОВЫЙ для админов")
   - **Дата начала:** `start_date` (18 августа 2025)
   - **Дата окончания:** `end_date` (18 ноября 2026)

### Сценарий 2: Подписка из API
1. Данных в localStorage нет
2. Компонент использует `personalData.lawyer.subscription` из API
3. Отображается активная подписка с полями из API:
   - **План:** `plan.name`
   - **Дата начала:** `started_at`
   - **Дата окончания:** `ends_at`

### Сценарий 3: Нет подписки
1. Нет данных ни в localStorage, ни в API
2. Отображается серый блок "Подписка отсутствует"
3. Кнопка "Оформить подписку"

## Отладка

В консоли браузера отображается полная информация:

```javascript
=== ProfileSubscription Debug ===
personalData: {...}
isLawyer: true
apiSubscription: {...} или null
storageSubscription: {...} или null
subscription (final): {...}
subscription exists? true/false
================================
```

## Как установить подписку в localStorage вручную (для тестирования)

Откройте консоль браузера и выполните:

```javascript
const testSubscription = {
    "id": "694b849b-9099-43b0-a9cf-11c7ec571206",
    "user_id": 243,
    "request_type_id": "bce9aea7-aa26-41ed-bd1a-2cbd82c58506",
    "request_type": "ТЕСТОВЫЙ для админов",
    "start_date": "2025-08-18T00:00:00Z",
    "end_date": "2026-11-18T00:00:00Z",
    "total_used": 51,
    "last_reset": "2025-08-18T00:00:00Z",
    "requests_per_month": 10000000
}

localStorage.setItem('subscription', JSON.stringify(testSubscription))

// Перезагрузите страницу
location.reload()
```

## Визуальные изменения

### С активной подпиской (из localStorage):
- ✅ Зеленая рамка (`border: 2px solid #10b981`)
- ✅ Светло-зеленый фон (`background: #f0fdf4`)
- ✅ Отображается:
  - План: "ТЕСТОВЫЙ для админов"
  - Дата начала: "18 августа 2025 г."
  - Дата окончания: "18 ноября 2026 г."

### Без подписки:
- ❌ Серая пунктирная рамка
- ❌ Светло-серый фон
- ❌ Кнопка "Оформить подписку"

## Приоритет источников данных

**localStorage > API**

Если данные есть в обоих источниках, используется localStorage.

## Дополнительные поля подписки из localStorage

Доступны, но пока не используются в UI:
- `total_used` - количество использованных запросов
- `requests_per_month` - лимит запросов в месяц (10000000)
- `last_reset` - дата последнего сброса счетчика

Эти поля можно добавить в интерфейс при необходимости.

## После оплаты подписки

Бэкенд должен:
1. Сохранить данные подписки в `localStorage.setItem('subscription', JSON.stringify(subscriptionData))`
2. Вызвать `refreshUser()` для обновления всех данных
3. Редирект на страницу профиля

Компонент автоматически подхватит изменения и отобразит активную подписку.
