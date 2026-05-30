# 🚀 Деплой и настройка онлайн-версии

## 1. Настройка Supabase

### Шаг 1: Создание таблиц
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект: `pcwqetnwnfczjsodzopb`
3. Перейдите в **SQL Editor**
4. Скопируйте содержимое файла `supabase-setup.sql` и выполните его

### Шаг 2: Проверка подключения
После выполнения SQL скрипта должны создаться три таблицы:
- `entries` - для ДЗ, ГДЗ, СРС
- `schedule` - для расписания
- `subjects` - для предметов

## 2. Локальный запуск

```bash
npm install
npm run dev
```

Приложение автоматически подключится к Supabase и начнет синхронизировать данные.

## 3. Деплой на Vercel (рекомендуется)

### Автоматический деплой:
1. Зарегистрируйтесь на [Vercel](https://vercel.com)
2. Подключите ваш GitHub репозиторий
3. Vercel автоматически определит настройки и задеплоит приложение

### Ручной деплой:
```bash
npm install -g vercel
vercel --prod
```

## 4. Деплой на Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 5. Деплой на GitHub Pages

```bash
npm run build
# Загрузите содержимое папки dist/ на GitHub Pages
```

## 6. Синхронизация данных

Приложение автоматически:
- ✅ Загружает данные из Supabase при запуске
- ✅ Сохраняет изменения в Supabase
- ✅ Кэширует данные локально (IndexedDB)
- ✅ Работает оффлайн с последующей синхронизацией

## 7. Настройка RLS (опционально)

Для продакшена рекомендуется настроить Row Level Security:

```sql
-- Разрешить только аутентифицированным пользователям
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own entries" 
  ON entries FOR ALL 
  USING (auth.uid() = user_id);
```

## 8. Мониторинг

- Supabase Dashboard: https://supabase.com/dashboard/project/pcwqetnwnfczjsodzopb
- Логи запросов: SQL Editor -> Query History

## 9. Резервное копирование

Данные автоматически сохраняются в Supabase. Дополнительно можно использовать встроенную функцию "Резервная копия" в приложении для экспорта в JSON.
