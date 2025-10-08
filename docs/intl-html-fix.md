# Исправление ошибки IntlError: INVALID_TAG

## Проблема

При использовании HTML тегов в файлах переводов `next-intl` выдаёт ошибку:

```
IntlError: INVALID_MESSAGE: INVALID_TAG 
(Оформляя подписку, вы соглашаетесь с условиями <a href="#">Пользовательского соглашения</a>...)
```

## Причина

`next-intl` по умолчанию **экранирует HTML** теги для безопасности. Когда вы вызываете `t('agreement')`, библиотека пытается распарсить строку и находит недопустимые HTML теги.

## Решение

Используйте метод `t.raw()` вместо `t()` для получения **необработанной** строки:

```tsx
// ❌ Неправильно
<p dangerouslySetInnerHTML={{ __html: t('agreement') }} />

// ✅ Правильно  
<p dangerouslySetInnerHTML={{ __html: t.raw('agreement') }} />
```

## Что изменено

### Файл: `src/app/[locale]/(dashboard)/dashboard/subscription/page.tsx`

**Строка 124:**

```tsx
// Было:
dangerouslySetInnerHTML={{ __html: t('agreement') }}

// Стало:
dangerouslySetInnerHTML={{ __html: t.raw('agreement') }}
```

## Альтернативное решение

Если вы хотите использовать безопасный подход next-intl с rich text:

### 1. Измените формат в `messages.json`:

```json
{
  "agreement": "Оформляя подписку, вы соглашаетесь с условиями {termsLink} и {privacyLink}."
}
```

### 2. Используйте `t.rich()` в компоненте:

```tsx
<p className={s.footerText}>
  {t.rich('agreement', {
    termsLink: (chunks) => <a href="/terms">{chunks}</a>,
    privacyLink: (chunks) => <a href="/privacy">{chunks}</a>
  })}
</p>
```

## Документация

- [next-intl Rich Text](https://next-intl-docs.vercel.app/docs/usage/messages#rich-text)
- [next-intl Raw Messages](https://next-intl-docs.vercel.app/docs/usage/messages#raw-messages)
