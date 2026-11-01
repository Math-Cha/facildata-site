import asyncio, os, json
from playwright.async_api import async_playwright
base="file://"+os.path.abspath("dist")
async def run(b, w, picks, name, fill=None):
    pg=await b.new_page(viewport={"width":w,"height":844})
    sent=[]
    async def h(route):
        sent.append(json.loads(route.request.post_data)); await route.fulfill(status=200,body='{"success":"true"}',content_type="application/json")
    await pg.route("https://formsubmit.co/**",h)
    popups=[]; pg.on("popup",lambda p: popups.append(p.url))
    await pg.goto(f"{base}/index.html"); await pg.wait_for_timeout(400)
    await pg.click(".hero a[data-rdv]"); await pg.wait_for_timeout(2500)
    for p in picks:
        await pg.click(f"#fd-chat .chips-q button:has-text('{p}')"); await pg.wait_for_timeout(2200)
    if fill:
        for k,v in fill.items(): await pg.fill(f"#fd-chat form.lead input[name={k}]",v)
        await pg.click("#fd-chat form.lead button"); await pg.wait_for_timeout(2500)
        if await pg.locator("#fd-chat button.rdv").count():
            await pg.locator("#fd-chat button.rdv").last.click(); await pg.wait_for_timeout(800)
    await pg.screenshot(path=f"shots/flow-{name}.png")
    txt=await pg.inner_text("#fd-chat .msgs")
    print("==",name,"| leads:",[(s.get('statut'),s.get('score')) for s in sent],"| popup:",popups[:1])
    print(txt[-260:].replace("\n"," / "))
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        await run(b,390,["Direction / DGST","Collectivité","Plus de 300","Piloter mes prestataires","Dans les 3 mois"],"qualifie",
                  {"nom":"Jean Dupont","organisation":"Ville de Test","email":"jean@test.fr","telephone":"0600000000"})
        await run(b,1366,["Autre (étudiant"],"horscible")
        await run(b,1366,["Gestionnaire immobilier","Immobilier","Moins de 5","Gagner du temps","Je me renseigne"],"nurture",{"email":"a@b.fr"})
        await b.close()
asyncio.run(main())
