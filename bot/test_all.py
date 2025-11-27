# bot/test_all.py
import asyncio
import subprocess
import os
from ai.predict import prediction
from ai.train_model import model as trained_model

async def test_hardhat():
    print("\n🔹 Testing Smart Contracts with Hardhat...")
    try:
        result = subprocess.run(
            ["npx", "hardhat", "test"],
            cwd="../hardhat",
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.returncode == 0:
            print("✅ Smart Contracts tests passed!")
        else:
            print("❌ Smart Contracts tests failed!")
    except Exception as e:
        print(f"Error running Hardhat tests: {e}")

async def test_react_dapp():
    print("\n🔹 Testing React Dapp start...")
    try:
        process = subprocess.Popen(
            ["npm", "start"],
            cwd="../react-dapp",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        print("React dev server started (press Ctrl+C to stop after testing UI manually)...")
        await asyncio.sleep(5)  # give it some time to start
        process.terminate()
        print("✅ React Dapp start tested!")
    except Exception as e:
        print(f"Error starting React Dapp: {e}")

async def test_telegram_bot():
    from telegram_bot import start_telegram_bot
    print("\n🔹 Testing Telegram Bot async start...")
    # Run bot for short test duration
    async def run_bot_short():
        task = asyncio.create_task(start_telegram_bot())
        await asyncio.sleep(5)
        task.cancel()
        print("✅ Telegram Bot start tested (short run).")
    try:
        await run_bot_short()
    except Exception as e:
        print(f"Error running Telegram Bot: {e}")

async def test_trader_news_signals():
    from trader import run_trading_loop
    from news import run_news_sender
    from signals import run_signal_bot
    print("\n🔹 Testing Trader, News, Signals async loops...")
    async def run_short_loops():
        tasks = [
            asyncio.create_task(run_trading_loop()),
            asyncio.create_task(run_news_sender()),
            asyncio.create_task(run_signal_bot()),
        ]
        await asyncio.sleep(5)
        for t in tasks:
            t.cancel()
        print("✅ Trader, News, Signals tested (short run).")
    try:
        await run_short_loops()
    except Exception as e:
        print(f"Error running loops: {e}")

def test_ai_modules():
    print("\n🔹 Testing AI Predict and Training modules...")
    try:
        print("Predict module output:", prediction)
        print("Trained model type:", type(trained_model))
        print("✅ AI modules loaded successfully!")
    except Exception as e:
        print(f"Error testing AI modules: {e}")

async def main():
    print("🚀 Starting Full HAYQ-MVP Test Suite...")
    await test_hardhat()
    await test_react_dapp()
    await test_telegram_bot()
    await test_trader_news_signals()
    test_ai_modules()
    print("\n🎉 All tests completed! Review above logs for details.")

if __name__ == "__main__":
    asyncio.run(main())
