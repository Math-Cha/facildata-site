# Sources du site facildata.com
- Contenu FR/EN : `content.py` · gabarits, CSS, JS, chat Facilia : `build.py`
- Générer : `python3 -I build.py` → `dist/` (copier le contenu à la racine du dépôt)
- Vidéo du héros : `python3 make_video.py img/hero.jpg img/paris.mp4`
- Assistant IA (mode réel) : `worker/` (Cloudflare Worker, clé Anthropic en secret, jamais dans le site), puis `CHAT_ENDPOINT=https://… python3 -I build.py`
