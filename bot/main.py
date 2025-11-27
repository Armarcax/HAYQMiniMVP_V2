# main.py
import asyncio
from telegram_bot import start_telegram_bot
from trader import run_trading_loop
from news import run_news_sender
from signals import run_signal_bot

async def main():
    print("HAYQ Bot սկսում է...")
    # Միաժամանակ բոլոր պրոցեսները
    await asyncio.gather(
        start_telegram_bot(),
        run_trading_loop(),
        run_news_sender(),
        run_signal_bot()
    )

if __name__ == "__main__":
    asyncio.run(main())
