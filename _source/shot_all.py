import asyncio, os, sys
from playwright.async_api import async_playwright
base="file://"+os.path.abspath("dist")
pages=["index.html","collectivites.html","hotellerie.html","industrie.html","sport-loisirs.html","contact.html","mentions-legales.html","merci.html","en/index.html","en/cities.html","en/contact.html"]
widths=[int(w) for w in sys.argv[1:]] or [390,768]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w in widths:
            pg=await b.new_page(viewport={"width":w,"height":844},device_scale_factor=1)
            for path in pages:
                await pg.goto(f"{base}/{path}"); await pg.wait_for_timeout(500)
                await pg.evaluate("document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))"); await pg.wait_for_timeout(700)
                # horizontal overflow check
                ov=await pg.evaluate("""()=>{const W=document.documentElement.clientWidth;const bad=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>W+1&&getComputedStyle(e).position!=='fixed')bad.push(e.tagName+'.'+(e.className||'').toString().slice(0,30)+' '+Math.round(r.right))});return {sw:document.documentElement.scrollWidth,W,bad:bad.slice(0,6)}}""")
                if ov['sw']>ov['W'] or ov['bad']: print(w,path,"OVERFLOW",ov)
                await pg.screenshot(path=f"shots/w{w}-{path.replace('/','_').replace('.html','')}.png", full_page=True)
        await b.close()
asyncio.run(main())
