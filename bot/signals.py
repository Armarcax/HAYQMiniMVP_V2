import asyncio

async def run_signal_bot():
    print("Signal bot loop սկսում է...")
    while True:
        print("Ուղարկում ենք ազդանշաններ / սիգնալներ...")
        await asyncio.sleep(20)
