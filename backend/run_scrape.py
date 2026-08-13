import asyncio
from app.core.database import SessionLocal
from app.services.scrape_service import ScrapeService
import app.services.scrape_service as ss
ss.MAX_RACES = 2

async def main():
    print("Scraping upcoming meetings...")
    db = SessionLocal()
    try:
        service = ScrapeService(db)
        # Just run a quick scrape, this uses winning_form_scraper inside
        await service.sync()
        print("Scrape complete!")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(main())
