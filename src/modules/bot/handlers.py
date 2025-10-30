from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.filters.command import Command
from aiogram.types import Message
from aiogram import F, Bot
import requests
from aiogram.types import CallbackQuery
from src.config import settings

router = Router()

async def approve_feedback(feedback_id: str):
    # call http api
    url = f"http://{settings.api.API_HOST}:{settings.api.API_PORT}/api/feedback/approve/{feedback_id}"
    response = requests.post(url)
    return response.json()

async def reject_feedback(feedback_id: str):
    # call http api
    url = f"http://{settings.api.API_HOST}:{settings.api.API_PORT}/api/feedback/approve/{feedback_id}"
    response = requests.post(url)
    return response.json()
    

@router.message(CommandStart())
async def start(message: Message):
    await message.answer("Hello! I'm your friendly bot. How can I assist you today?")
    
@router.message(Command("help"))
async def help_command(message: Message):
    await message.answer("Вы можете использовать следующие команды:\n/start - Запустить бота\n/help - Показать это сообщение помощи/")
    
@router.callback_query(F.data.startswith("confirm_feedback:"))
async def confirm_feedback_callback(callback_query: CallbackQuery, bot: Bot):
    feedback_id = callback_query.data.split(":")[1] # type: ignore

    await approve_feedback(feedback_id)

    await bot.delete_message(
        chat_id=callback_query.message.chat.id, # type: ignore
        message_id=callback_query.message.message_id # type: ignore
    )
    
    await callback_query.answer("Отзыв подтвержден.")
    
@router.callback_query(F.data.startswith("reject_feedback:"))
async def reject_feedback_callback(callback_query: CallbackQuery, bot: Bot):
    feedback_id = callback_query.data.split(":")[1] # type: ignore

    await reject_feedback(feedback_id)

    await bot.delete_message(
        chat_id=callback_query.message.chat.id, # type: ignore
        message_id=callback_query.message.message_id # type: ignore
    )
    
    await callback_query.answer("Отзыв отклонен.")





    
