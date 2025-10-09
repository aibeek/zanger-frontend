# Реализация ограничения доступа для юристов без подписки

## Что было реализовано

### 1. Обрезка описания заявок
Юристы **без подписки** теперь видят только первые 2 предложения из описания заявки. Полное описание скрыто.

### 2. Визуальный индикатор
- Обрезанное описание отображается с лёгким размытием и затемнением
- Под обрезанным текстом показывается яркий баннер с призывом оформить подписку
- Используется градиентный фон для привлечения внимания

### 3. Проверка подписки при отклике
При нажатии на кнопку **"Откликнуться"**:
- Проверяется наличие активной подписки у юриста
- Если подписки нет → показывается сообщение об ошибке и перенаправление на страницу оформления подписки
- Если подписка есть → отклик отправляется как обычно

## Технические детали

### Новые файлы
1. **`src/shared/lib/helpers/truncateDescription.ts`**
   - Функция для обрезки текста до первых N предложений
   - Автоматически добавляет многоточие
   - Fallback на 150 символов, если не найдены предложения

### Изменённые файлы
1. **`src/app/[locale]/(dashboard)/dashboard/applications/components/LawyerApplicationsList.tsx`**
   - Добавлен импорт `useLoginStore`, `useRouter`, `truncateDescription`
   - Добавлена проверка подписки: `hasSubscription`
   - Условный рендер описания (полное/обрезанное)
   - Проверка подписки в функции `handleRespond`
   - Автоматическое перенаправление на `/dashboard/subscription`

2. **`src/app/[locale]/(dashboard)/dashboard/applications/components/LawyerApplicationsList.module.scss`**
   - Добавлены стили `.descriptionTruncated` (серый градиентный фон, размытие)
   - Добавлены стили `.subscriptionOverlay` (фиолетовый градиентный баннер)
   - Добавлены стили `.subscriptionHint` (белый текст на баннере)

3. **`locales/ru/messages.json`**
   - `"needSubscription"`: "Необходимо оформить подписку для отклика на заявки"
   - `"subscriptionRequiredToViewFull"`: "Оформите подписку, чтобы видеть полное описание заявок"

4. **`locales/kz/messages.json`**
   - `"needSubscription"`: "Өтінімдерге жауап беру үшін жазылым жасау керек"
   - `"subscriptionRequiredToViewFull"`: "Өтінімдердің толық сипаттамасын көру үшін жазылым жасаңыз"

5. **`src/shared/lib/helpers/index.ts`**
   - Добавлен экспорт `truncateDescription`

## Логика работы

### Определение наличия подписки
```typescript
const hasSubscription = personalData && 'lawyer' in personalData && personalData.lawyer?.subscription
```

Проверяется:
1. Есть ли `personalData` (данные пользователя)
2. Является ли пользователь юристом (`'lawyer' in personalData`)
3. Есть ли у юриста объект `subscription` (не `null`)

### Обрезка текста
```typescript
const displayDescription = hasSubscription 
  ? app.description 
  : truncateDescription(app.description, 2)
```

- Если есть подписка → показываем полное описание
- Если нет → обрезаем до 2 предложений

### Проверка при отклике
```typescript
if (!hasSubscription) {
  toast.error(t('needSubscription'))
  router.push(`/${language}/dashboard/subscription`)
  return
}
```

## Визуальное оформление

### Обрезанное описание
- Серо-голубой градиентный фон
- Лёгкое размытие текста (`filter: blur(0.5px)`)
- Пониженная прозрачность (`opacity: 0.7`)
- Пунктирная рамка

### Баннер подписки
- Градиент от синего к фиолетовому (`#667eea` → `#764ba2`)
- Белый текст, жирное начертание
- Центрированное выравнивание

## Примечания
- Подписка определяется через API профиля юриста
- Дата окончания подписки хранится в `personalData.lawyer.subscription.ends_at`
- Проверка активности подписки выполняется на бэкенде (наличие объекта `subscription` уже означает активную подписку)
