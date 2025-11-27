# telegram_bot.py
import asyncio
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, InputMediaPhoto
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, CallbackQueryHandler
# from bot_i18n import t  # Բազմալեզու ֆունկցիա / i18n
from i18n import i18n  # Ձեր բազմալեզու կոնֆիգ

BOT_TOKEN = "8274801728:AAHtGEzDyXy_e_fHYnL3_aHvQvqOtvLd9MU"
LOGO_PATH = "public-assets/logo.png"  # Լոգոյի ֆայլի ուղի

SUPPORTED_LANGS = ["en","hy","ru","fr","es","de","zh","ja","ar"]

# Լեզու ստանալու ֆունկցիա
def get_user_language(update: Update, context: ContextTypes.DEFAULT_TYPE):
    return context.user_data.get("lang", getattr(update.effective_user, "language_code", "en"))

# /start command
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = get_user_language(update, context)
    text = f"🇦🇲 {t('welcome', lang)} 🇦🇲"
    keyboard = [
        [InlineKeyboardButton(t("walletConnect", lang), callback_data="walletConnect")],
        [InlineKeyboardButton(t("balance", lang), callback_data="balance"),
         InlineKeyboardButton(t("transfer", lang), callback_data="transfer")],
        [InlineKeyboardButton(t("stake", lang), callback_data="stake"),
         InlineKeyboardButton(t("unstake", lang), callback_data="unstake")],
        [InlineKeyboardButton(t("buyback", lang), callback_data="buyback"),
         InlineKeyboardButton(t("voting", lang), callback_data="voting")],
        [InlineKeyboardButton(t("liveChart", lang), callback_data="liveChart"),
         InlineKeyboardButton(t("dividend", lang), callback_data="dividend")],
        [InlineKeyboardButton(t("growth", lang), callback_data="growth")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Ուղարկում լոգոն + կոճակներ
    try:
        await update.message.reply_photo(photo=open(LOGO_PATH, 'rb'), caption=text, reply_markup=reply_markup)
    except Exception:
        await update.message.reply_text(text, reply_markup=reply_markup)

# Callback query handler
async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    lang = get_user_language(update, context)
    action = query.data
    await query.message.reply_text(f"{t(action, lang)} selected ✅")

# /help command
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = get_user_language(update, context)
    text = t("helpText", lang) if "helpText" in i18n.resources[lang]["translation"] else "Available commands: /start /help /lang"
    await update.message.reply_text(text)

# /lang command
async def set_language(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if len(context.args) != 1:
        await update.message.reply_text("Usage: /lang <en|hy|ru|fr|es|de|zh|ja|ar>")
        return
    lang_code = context.args[0]
    if lang_code not in SUPPORTED_LANGS:
        await update.message.reply_text("Language not supported.")
        return
    context.user_data["lang"] = lang_code
    await update.message.reply_text(f"Language set to {lang_code} ✅")

# Start bot async
async def start_telegram_bot():
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    # Command handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("lang", set_language))

    # Callback handler for buttons
    app.add_handler(CallbackQueryHandler(button_callback))

    print("Telegram Bot սկսեց գործել...")
    await app.initialize()
    await app.start()
    await app.updater.start_polling()
    await asyncio.Event().wait()  # async loop-ը պահել
