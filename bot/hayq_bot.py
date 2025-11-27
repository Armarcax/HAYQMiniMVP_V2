import asyncio
from telegram_bot import start_telegram_bot
from trader import run_trading_loop

async def main():
    print("HAYQ Bot սկսում է...")
    # Երկու պրոցեսները միաժամանակ
    await asyncio.gather(
        start_telegram_bot(),
        run_trading_loop()
    )

if __name__ == "__main__":
    asyncio.run(main())
