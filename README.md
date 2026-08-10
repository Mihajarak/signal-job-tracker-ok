# Job Search Bot — torolalana fametrahana

Ity dia "robot" mikaroka asa freelance isaky ny 6 ora amin'ny GitHub Actions (maimaimpoana), mampandre anao amin'ny email rehefa misy vaovao, ary manana dashboard (site) hijerena ny asa hita sy ny vola azonao.

## Dingana 1 — Ampidiro amin'ny GitHub

1. Mamorona repository vaovao ao amin'ny GitHub (ohatra: `job-search-bot`), ampiasao ho **Private** raha tianao.
2. Alefaso avokoa ireto rakitra ireto ao amin'ilay repository (mety amin'ny "Upload files" amin'ny GitHub web, na `git push` raha mahay ianao).

## Dingana 2 — Upwork saved search RSS (raha ilainao)

1. Any amin'ny Upwork, ataovy "search" ny asa mifanaraka aminao (ohatra: "Next.js developer" na "Flutter developer"), dia tehirizo ho "Saved Search".
2. Any amin'ny lisitry ny saved search, misy tsindry RSS/orange icon — kopia ilay URL.
3. Apetaho ao amin'ny `config.json`, eo amin'ny `feeds.upworkRss`, solon'ny `PASTE_YOUR_UPWORK_SAVED_SEARCH_RSS_URL_HERE_1`. Azonao ampiana URL maro raha misy "saved search" maromaro.

Raha tsy manana Upwork saved search ianao dia azo esorina tsotra izao ilay tahirin-kevitra, fa mbola miasa ihany ny RemoteOK/Remotive/WeWorkRemotely.

## Dingana 3 — Email (Gmail app password)

1. Any amin'ny kaontinao Gmail: **Manage your Google Account → Security → 2-Step Verification** (mila alefa mihitsy raha tsy mbola misy) → **App passwords**.
2. Mamorona App Password vaovao (ohatra: anarana "job-bot"), dia kopia ilay kaody 16 tarehimarika.
3. Any amin'ny GitHub repository-nao: **Settings → Secrets and variables → Actions → New repository secret**, ampidiro ireto telo ireto:
   - `MAIL_USERNAME` = ny adiresy Gmail-nao feno
   - `MAIL_PASSWORD` = ilay App Password 16 tarehimarika (tsy ny password mahazatra)
   - `MAIL_TO` = ny email tianao handraisana ny fampandrenesana (azo mitovy amin'ny MAIL_USERNAME)

## Dingana 4 — Alefaso ny GitHub Action

1. Any amin'ny tab **Actions** amin'ny repository, ekeo ny "I understand my workflows, go ahead and enable them" raha misy.
2. Tsindrio ny "Fetch Freelance Jobs" workflow → **Run workflow** mba hitsapana azy voalohany indray mandeha.
3. Raha mandeha tsara izy, ho hita ao amin'ny `data/jobs.json` ny asa hita, ary handray email ianao raha misy mifanaraka.
4. Aorian'izay, handeha ho azy izy isaky ny 6 ora (azo ovana ny `cron` ao amin'ny `.github/workflows/fetch-jobs.yml` raha tianao ampiharina isaky ny 1 ora, ohatra `0 */1 * * *`).

## Dingana 5 — Alefaso ny dashboard (GitHub Pages)

1. Any amin'ny **Settings → Pages**.
2. "Source": misafidiana ny branch `main`, folder `/ (root)`.
3. Tehirizo, dia miandry kely — ho hita ny adiresin'ny site (ohatra `https://<anaranao>.github.io/job-search-bot/`).

## Fanovana ny vola azo sy ny asa vita

Ny `data/earnings.json` no ahitana ny tahirin-kevitra momba ny asa nampiharanao/vitanao sy ny vola azo. Rehefa mahazo/mamita asa ianao:

1. Sokafy ny `data/earnings.json` avy amin'ny GitHub (na amin'ny application GitHub amin'ny finday).
2. Ampio "entry" vaovao ao anaty `entries` array, ohatra:

```json
{
  "date": "2026-08-09",
  "client": "Anaran'ny client",
  "platform": "Upwork",
  "title": "Anaran'ny asa",
  "amount": 150,
  "currency": "USD",
  "status": "completed"
}
```

3. Tehirizo (commit) — hisy hita avy hatrany ao amin'ny dashboard.

## Fanovana ny keywords

Ny `config.json` (`keywords`) no mibaiko izay asa raisin'ny robot ho "mifanaraka aminao". Azonao ovana/ampiana araka ny skills-nao (ohatra: "electronics repair", "content writing", sns).
