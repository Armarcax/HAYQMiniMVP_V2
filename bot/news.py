import asyncio

async def run_news_sender():
    print("News sender loop սկսում է...")
    while True:
        print("Ուղարկում ենք վերջին նորությունները...")
        await asyncio.sleep(30)
