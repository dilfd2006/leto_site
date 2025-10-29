
from aiogram import Bot, Dispatcher
import asyncio
from src.modules.bot.handlers import router
from src.config import settings

async def start_bot():
    bot = Bot(token=settings.TOKEN)
    dp = Dispatcher()
    
    dp.include_router(router)
    
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()

# dp.include_router()

if __name__ == "__main__":
    asyncio.run(start_bot())
