# Инструкция по отладке подписки

## Проблема
У юриста есть подписка в API (`personalData.lawyer.subscription`), но она не отображается на странице.

## Данные подписки
```json
{
  "id": 271,
  "plan": {
    "id": 9,
    "name": "Тестовая оплата_каз"
  },
  "started_at": "2025-10-07",
  "ends_at": "2025-11-07"
}
```

## Шаги для отладки

### 1. Откройте консоль браузера (F12)

### 2. Перейдите на страницу профиля

### 3. Посмотрите на логи в консоли

Вы должны увидеть следующие сообщения:

```
📦 localStorage subscription: null
❌ No subscription in localStorage

🔍 Final subscription check: {
  storageSubscription: null,
  apiSubscription: {id: 271, plan: {...}, started_at: "2025-10-07", ends_at: "2025-11-07"},
  finalSubscription: {id: 271, plan: {...}, started_at: "2025-10-07", ends_at: "2025-11-07"},
  hasSubscription: true
}

🔧 getSubscriptionDetails called with: {id: 271, plan: {...}, started_at: "2025-10-07", ends_at: "2025-11-07"}
✅ Using API format
📊 Subscription details: {
  planName: "Тестовая оплата_каз",
  startDate: "2025-10-07",
  endDate: "2025-11-07"
}

🎯 Final subscriptionDetails: {
  planName: "Тестовая оплата_каз",
  startDate: "2025-10-07",
  endDate: "2025-11-07"
}

=== ProfileSubscription Debug ===
personalData: {...}
isLawyer: true
apiSubscription: {id: 271, plan: {...}, started_at: "2025-10-07", ends_at: "2025-11-07"}
storageSubscription: null
subscription (final): {id: 271, plan: {...}, started_at: "2025-10-07", ends_at: "2025-11-07"}
subscription exists? true
================================
```

## Возможные проблемы

### Проблема 1: `personalData` пустой или null
**Лог:**
```
personalData: null
isLawyer: false
apiSubscription: null
```

**Решение:**
- Проверьте, что пользователь залогинен
- Проверьте токен в localStorage (`access_token`)
- Проверьте, что API `/auth/me` возвращает данные

### Проблема 2: `personalData.lawyer` отсутствует
**Лог:**
```
personalData: {id: 284, name: "...", role_id: {...}}
isLawyer: false
apiSubscription: null
```

**Решение:**
- Пользователь не является юристом (это клиент)
- Проверьте `role_id.code` - должно быть `'lawyer'`

### Проблема 3: `personalData.lawyer.subscription` null
**Лог:**
```
personalData: {...}
isLawyer: true
apiSubscription: null
```

**Решение:**
- API не возвращает подписку
- Проверьте ответ от `/auth/me` в Network вкладке
- Возможно подписка не активирована на бэкенде

### Проблема 4: Подписка есть, но `subscriptionDetails` null
**Лог:**
```
subscription (final): {id: 271, ...}
🔧 getSubscriptionDetails called with: {id: 271, ...}
❌ Unknown subscription format
```

**Решение:**
- Формат подписки не соответствует ни одному известному
- Проверьте структуру данных
- Должно быть либо `plan` (API), либо `request_type` (localStorage)

## Что должно отобразиться при успешной подписке

### Визуально на странице:
```
┌────────────────────────────────────────┐
│ ✅ Активная подписка                   │
│                                        │
│ Тарифный план: Тестовая оплата_каз    │
│ Дата начала: 7 октября 2025 г.       │
│ Действительна до: 7 ноября 2025 г.   │
│                                        │
│ [Управление подпиской]                │
└────────────────────────────────────────┘
```

### В консоли:
- Все emoji ✅ (зеленые галочки)
- `hasSubscription: true`
- `subscriptionDetails` содержит данные

## Быстрая проверка через DevTools

### Application → Local Storage → http://localhost:3000

Проверьте наличие ключей:
- `access_token` - должен быть
- `personalData` - должен содержать данные юриста с подпиской
- `subscription` - может отсутствовать (используется API)

### Network → XHR → /auth/me

Проверьте ответ:
```json
{
  "id": 284,
  "name": "Nurdaulet Beketov",
  "lawyer": {
    "id": 143,
    "subscription": {
      "id": 271,
      "plan": {
        "id": 9,
        "name": "Тестовая оплата_каз"
      },
      "started_at": "2025-10-07",
      "ends_at": "2025-11-07"
    }
  }
}
```

## Если ничего не помогает

### 1. Очистите кэш и localStorage
```javascript
localStorage.clear()
location.reload()
```

### 2. Залогиньтесь заново

### 3. Проверьте консоль на ошибки
Красные ошибки в консоли могут указывать на проблему

### 4. Проверьте версию компонента
Убедитесь, что используется обновленная версия `ProfileSubscription.tsx` с отладочными логами

## Контрольный список ✅

- [ ] Пользователь залогинен как юрист
- [ ] В DevTools → Application → localStorage есть `access_token`
- [ ] API `/auth/me` возвращает данные с `lawyer.subscription`
- [ ] В консоли видны логи с emoji
- [ ] `hasSubscription: true` в консоли
- [ ] `subscriptionDetails` не null
- [ ] На странице отображается зеленый блок с подпиской
