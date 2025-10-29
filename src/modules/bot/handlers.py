from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.filters.command import Command
from aiogram.types import Message

router = Router()

@router.message(CommandStart())
async def start(message: Message):
    await message.answer("Hello! I'm your friendly bot. How can I assist you today?")
    
@router.message(Command("help"))
async def help_command(message: Message):
    await message.answer("Here are the commands you can use:\n/start - Start the bot\n/help - Show this help message")
    
@router.message(Command("set_admin"))
async def set_admin(message: Message):
    # here i set user as admin and others cannot be admin only one
    await message.answer("set admin")

@router.message(Command("unset_admin"))
async def unset_admin(message: Message):
    await message.answer("unset admin")




    
