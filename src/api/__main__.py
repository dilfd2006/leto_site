import os
import uvicorn
import dotenv


def main():
    dotenv.load_dotenv()
    
    uvicorn.run("src.api.app:app", 
                host="0.0.0.0",
                port=int(os.getenv("API_PORT", 8000)),
                reload=True)


if __name__ == "__main__":
    main()

