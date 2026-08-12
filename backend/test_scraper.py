import asyncio
from app.scrapers.winning_form_scraper import WinningFormScraper

async def main():
    scraper = WinningFormScraper()
    try:
        html, frames = await scraper.fetch_index()
        urls = await scraper.scrape_all_race_links()
        if urls:
            url = urls[0]
            print(f"Scraping {url}")
            race = await scraper.scrape_race_page(url)
            print("Race:")
            print(race)
            if race and race.horses:
                print("First horse:")
                print(race.horses[0])
            
            # Fetch the raw HTML of the first race page and save it
            response = await scraper.client.get(url)
            with open("sample_race.html", "w", encoding="utf-8") as f:
                f.write(response.text)
            print("Saved HTML to sample_race.html")
    finally:
        await scraper.close()

if __name__ == "__main__":
    asyncio.run(main())
