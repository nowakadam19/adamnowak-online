# Tier Planner — etap 3 (bot): raport testów

| Plik | Co to jest |
|---|---|
| `check-bot.mjs` | Playwright na lokalnym buildzie, `/api/chat` przechwycony atrapą (test układu i payloadu, nie modelu). Wynik: `wynik-check-bot.txt`. |
| `360-*.png`, `1280-*.png` | Zrzuty panelu z `check-bot.mjs`: przed startem, pierwszy komentarz, widok ekranu z aktywnym polem, rozmowa, limit. Teksty bota w tych zrzutach to atrapa. |
| `payload-sample.json` | Dokładnie to, co idzie do `/api/chat` przy starcie (dane przykładowe). |
| `live-bot.mjs` | Ten sam scenariusz na żywym modelu (podgląd Vercel): pełna rozmowa z Evą do `CONTACT_COLLECTED`, bot na danych przykładowych (360 px, ze zmianą progu w trakcie) i na małym CSV (1280 px), potem wspólny limit. Zapisuje `transkrypty.md` i `live-*.png`. |
| `maly-60-wierszy.csv` | Mały CSV do `live-bot.mjs` (pierwsze 60 wierszy pliku testowego z etapu 2). |

Uruchomienie (potrzebny `playwright-core`, Chrome/Chromium):

```bash
# lokalnie, atrapa modelu
npm run build && npm start   # w drugim terminalu:
BASE=http://localhost:3000 node karty/raporty/tier-planner-bot-25-09/check-bot.mjs

# na podglądzie Vercel, żywy model (zużywa ok. 15 wiadomości dziennego limitu z Twojego IP)
BASE="https://<podgląd>.vercel.app/tools/loyalty-tier-planner?_vercel_share=<token>" node karty/raporty/tier-planner-bot-25-09/live-bot.mjs
```
