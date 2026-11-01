import asyncio, os
from playwright.async_api import async_playwright
base="file://"+os.path.abspath("dist")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for name,w in [("desk",1366),("mob",390)]:
            pg=await b.new_page(viewport={"width":w,"height":900})
            for path in ["index.html","collectivites.html","contact.html"]:
                await pg.goto(f"{base}/{path}"); await pg.wait_for_timeout(600); await pg.evaluate("document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))"); await pg.wait_for_timeout(800)
                await pg.screenshot(path=f"shots/{name}-{path.replace('.html','')}.png", full_page=True)
        await b.close()
asyncio.run(main())
