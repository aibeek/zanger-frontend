# Инструкция по настройке PulseChat на продакшене

## Переменные окружения для деплоя

На сервере деплоя (Vercel/Netlify/etc) необходимо установить следующие переменные окружения:

```bash
NEXT_PUBLIC_PULSE_CHAT_ID=68beb8714d31c577970ac394
NEXT_PUBLIC_ENABLE_PULSECHAT=true
```

## Проверка на продакшене

1. Откройте консоль браузера (F12)
2. Проверьте логи:
   - `PulseChatWidget: isEnabled = true`
   - `PulseChatWidget: chatId = 68beb8714d31c577970ac394`
   - `PulseChat: Loading script for chatId: ...`
   - `PulseChat: Script loaded successfully`

## Если чат не отображается:

### Проверка 1: Переменные окружения
```javascript
// В консоли браузера выполните:
console.log(process.env.NEXT_PUBLIC_ENABLE_PULSECHAT);
console.log(process.env.NEXT_PUBLIC_PULSE_CHAT_ID);
```

### Проверка 2: Компонент смонтирован
```javascript
// В консоли браузера выполните:
document.querySelectorAll('[class*="pulseChatWidget"]');
```

### Проверка 3: Скрипт загружен
```javascript
// В консоли браузера выполните:
document.querySelectorAll('script[src*="pulse"]');
```

## Настройка переменных окружения на популярных платформах:

### Vercel
1. Перейдите в настройки проекта
2. Settings → Environment Variables
3. Добавьте:
   - `NEXT_PUBLIC_PULSE_CHAT_ID` = `68beb8714d31c577970ac394`
   - `NEXT_PUBLIC_ENABLE_PULSECHAT` = `true`
4. Пересоберите проект (Redeploy)

### Netlify
1. Site settings → Environment variables
2. Добавьте переменные
3. Trigger deploy

### Docker
Добавьте в docker-compose.yml или .env файл:
```yaml
environment:
  - NEXT_PUBLIC_PULSE_CHAT_ID=68beb8714d31c577970ac394
  - NEXT_PUBLIC_ENABLE_PULSECHAT=true
```
