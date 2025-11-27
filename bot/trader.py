import asyncio
from ai_utils import predict_price
import random

async def run_trading_loop():
    print("Trader loop սկսում է...")
    while True:
        # Fake market data (օրինակ purposes–ի համար)
        market_data = [random.uniform(0.9, 1.1) for _ in range(10)]
        
        # AI price prediction
        predicted_price = predict_price(market_data)
        print(f"Վերլուծություն ավարտված: կանխատեսված գին = {predicted_price:.4f}")

        # Decision logic (example)
        if predicted_price > 1.05:
            print("➡️ Գնա վաճառքի (SELL) դիրք")
        elif predicted_price < 0.95:
            print("➡️ Գնա գնման (BUY) դիրք")
        else:
            print("➡️ Ոչինչ չանել (HOLD)")

        # Ուսումնասիրված async sleep
        await asyncio.sleep(10)
