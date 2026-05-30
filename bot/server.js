require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const BOT_TOKEN = process.env.BOT_TOKEN || '8953449891:AAHwMAZjl4AoEhf-gPwTnIlQDpKyEwj-4SQ';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://2fb4378.arena.site';

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Inline клавиатура с кнопкой Mini App
// Работает везде: в ЛС, группах, супергруппах
// ============================================
const miniAppInlineKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '📚 Открыть дневник',
          web_app: { url: WEB_APP_URL }
        }
      ],
      [
        {
          text: '📋 Расписание',
          web_app: { url: WEB_APP_URL + '?tab=schedule' }
        },
        {
          text: '🔍 Поиск',
          web_app: { url: WEB_APP_URL + '?tab=search' }
        }
      ]
    ]
  }
};

// Клавиатура для личных сообщений
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '📚 Открыть дневник', web_app: { url: WEB_APP_URL } }],
      [{ text: '📋 Расписание', web_app: { url: WEB_APP_URL + '?tab=schedule' } }],
      [{ text: '🔍 Поиск', web_app: { url: WEB_APP_URL + '?tab=search' } }],
      [{ text: '❓ Помощь' }, { text: '📖 О боте' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

// ============================================
// Установка глобальной кнопки меню (Menu Button)
// ============================================
async function setMenuButton() {
  try {
    await bot.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: '📚 Дневник',
        web_app: { url: WEB_APP_URL }
      }
    });
    console.log('✅ Menu Button настроена глобально');
  } catch (error) {
    console.error('❌ Ошибка настройки Menu Button:', error.message);
  }
}

setMenuButton();

// ============================================
// Приветственное сообщение
// ============================================
function getWelcomeText(firstName) {
  return `👋 Привет, ${firstName}!

🎓 Я — бот твоего личного дневника **ДЗ и ГДЗ**!

📌 **Что я умею:**
• 📅 Домашние задания и готовые решения
• 📋 Расписание с числителем/знаменателем
• 🔍 Поиск по всем записям
• 📸 Загрузка фото и видео
• 🔗 Ссылки на материалы
• ☁️ Резервные копии

Нажми кнопку ниже, чтобы открыть дневник!`;
}

// ============================================
// Команда /start — работает везде
// ============================================
bot.onText(/\/start(@\w+)?/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'друг';
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  if (isGroup) {
    // В группе отправляем inline keyboard
    bot.sendMessage(chatId,
      `👋 Привет всем! Я бот дневника **ДЗ и ГДЗ**.

Нажмите кнопку ниже, чтобы открыть дневник прямо в Telegram!`,
      {
        parse_mode: 'Markdown',
        ...miniAppInlineKeyboard
      }
    );
  } else {
    // В личных сообщениях — полная клавиатура
    bot.sendMessage(chatId, getWelcomeText(firstName), {
      parse_mode: 'Markdown',
      ...mainKeyboard
    });
  }
});

// ============================================
// Команда /help — работает везде
// ============================================
bot.onText(/\/help(@\w+)?/, (msg) => {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  bot.sendMessage(chatId,
    `📖 **Помощь**

**Команды:**
/start — Запустить бота
/help — Показать справку
/dnevnik — Открыть дневник
/rasp — Расписание

**Возможности приложения:**
• 📅 ДЗ и ГДЗ по календарю
• 📋 Расписание на 2 недели
• 🔍 Поиск по предметам
• 📸 Фото и видео
• 🔗 Внешние ссылки
• ☁️ Резервное копирование

💡 *Приложение открывается прямо в Telegram!*`,
    {
      parse_mode: 'Markdown',
      ...(isGroup ? miniAppInlineKeyboard : mainKeyboard)
    }
  );
});

// ============================================
// Команда /dnevnik — открыть дневник (везде)
// ============================================
bot.onText(/\/dnevnik(@\w+)?/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📚 Открываю дневник...', {
    ...miniAppInlineKeyboard
  });
});

// ============================================
// Команда /rasp — расписание (везде)
// ============================================
bot.onText(/\/rasp(@\w+)?/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📋 Открываю расписание...', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '📋 Открыть расписание',
          web_app: { url: WEB_APP_URL + '?tab=schedule' }
        }]
      ]
    }
  });
});

// ============================================
// Обработка добавления бота в группу
// ============================================
bot.on('my_chat_member', (msg) => {
  const chat = msg.chat;
  const newStatus = msg.new_chat_member?.status;
  const oldStatus = msg.old_chat_member?.status;

  // Бот добавлен в группу
  if (newStatus === 'member' && oldStatus !== 'member') {
    bot.sendMessage(chat.id,
      `👋 Привет, ${chat.title || 'всем'}!

🎓 Я — бот дневника **ДЗ и ГДЗ**.

Нажмите кнопку ниже, чтобы открыть дневник прямо в Telegram!`,
      {
        parse_mode: 'Markdown',
        ...miniAppInlineKeyboard
      }
    );
  }
});

// ============================================
// Обработка новых участников в группе
// ============================================
bot.on('new_chat_members', (msg) => {
  const chatId = msg.chat.id;
  const newMembers = msg.new_chat_members;

  // Проверяем, добавлен ли сам бот
  const botAdded = newMembers.some(m => m.id === bot.options.polling?.params?.offset);
  if (botAdded) return; // Уже обработано в my_chat_member

  // Приветствуем новых участников
  newMembers.forEach(member => {
    if (member.is_bot) return;
    const firstName = member.first_name || 'друг';
    bot.sendMessage(chatId,
      `👋 Привет, ${firstName}!

Нажми кнопку ниже, чтобы открыть дневник:`,
      {
        ...miniAppInlineKeyboard
      }
    );
  });
});

// ============================================
// Обработка текстовых сообщений в группах
// ============================================
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  if (!text) return;
  if (text.startsWith('/')) return; // Команды обрабатываются отдельно

  // В группах отвечаем только на упоминания бота или ключевые слова
  if (isGroup) {
    const botUsername = 'pd_circles_bot'; // Укажите username вашего бота
    const mentionsBot = text.includes('@' + botUsername);
    const keywords = ['дз', 'дневник', 'расписание', 'помощь', 'гдз'];
    const hasKeyword = keywords.some(k => text.toLowerCase().includes(k));

    if (!mentionsBot && !hasKeyword) return;

    bot.sendMessage(chatId,
      `💡 Нажмите кнопку ниже, чтобы открыть дневник:`,
      { ...miniAppInlineKeyboard }
    );
    return;
  }

  // В личных сообщениях — обработка кнопок
  switch (text) {
    case '📚 Открыть дневник':
    case '📋 Расписание':
    case '🔍 Поиск':
      bot.sendMessage(chatId, 'Открываю...', { ...mainKeyboard });
      break;

    case '❓ Помощь':
      bot.emit('text', { ...msg, text: '/help' });
      break;

    case '📖 О боте':
      bot.sendMessage(chatId,
        `🎓 **ДЗ и ГДЗ — Личный дневник**

📱 Работает прямо в Telegram
☁️ Резервные копии

Версия: 1.0`,
        { parse_mode: 'Markdown', ...mainKeyboard }
      );
      break;

    default:
      bot.sendMessage(chatId,
        `💡 Нажми кнопку **«📚 Открыть дневник»** ниже!`,
        { ...mainKeyboard }
      );
  }
});

// ============================================
// Обработка inline запросов
// ============================================
bot.on('inline_query', (query) => {
  const results = [
    {
      type: 'article',
      id: 'dnevnik',
      title: '📚 Открыть дневник',
      description: 'Открыть приложение ДЗ и ГДЗ',
      input_message_content: {
        message_text: '📚 Дневник ДЗ и ГДЗ'
      },
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Открыть дневник',
            web_app: { url: WEB_APP_URL }
          }]
        ]
      }
    }
  ];

  bot.answerInlineQuery(query.id, results);
});

// ============================================
// Обработка ошибок
// ============================================
bot.on('polling_error', (error) => {
  console.error('❌ Ошибка polling:', error.message);
});

bot.on('error', (error) => {
  console.error('❌ Ошибка бота:', error.message);
});

// ============================================
// HTTP сервер
// ============================================
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'ДЗ и ГДЗ Бот',
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅ Бот запущен!`);
  console.log(`📡 Telegram: @pd_circles_bot`);
  console.log(`🌐 Web App: ${WEB_APP_URL}`);
  console.log(`💻 API: http://localhost:${PORT}`);
  console.log(`\n💡 Бот работает в ЛС и группах`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});
