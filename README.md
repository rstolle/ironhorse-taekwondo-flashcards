# Ironhorse Taekwondo Flashcards

Taekwondo flashcards for [Ironhorse Martial Arts](https://www.ironhorsemartialarts.com/): form meanings, movement counts, and belt meanings.
A static web app with no build step. It installs to a phone's home screen and works offline.

**Live app: https://rstolle.github.io/ironhorse-taekwondo-flashcards/**

On a phone, open the link and add it to your home screen (iPhone: Share → Add to Home Screen; Android: the Install app button).

## Deployment

This repo, [rstolle/ironhorse-taekwondo-flashcards](https://github.com/rstolle/ironhorse-taekwondo-flashcards),
deploys to GitHub Pages with GitHub Actions (**Settings → Pages → Source: GitHub Actions**).
The workflow in `.github/workflows/pages.yml` publishes every push to `main` to
https://rstolle.github.io/ironhorse-taekwondo-flashcards/ within about a minute.

To work on it locally:
```
git clone https://github.com/rstolle/ironhorse-taekwondo-flashcards.git
cd ironhorse-taekwondo-flashcards
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Updating the cards

All card content is in `data.js` (`forms`, `emphasis`, `belts`). Edit it and push to `main`.
The deploy stamps a fresh cache version automatically, so installed copies refresh on their next launch.
Card IDs come from names, so adding or reordering forms keeps everyone's saved progress intact
(renaming a form resets progress for that card only if it was mid-session).

Before you push, you can check your edits with `node tests/validate.js`. It confirms every form has a
whole-number movement count and a meaning, every bold phrase in `emphasis` appears in its form's meaning
(same spelling, quotes, and order), there are no duplicate forms or belts, and every file the app needs exists.
The deploy runs the same check first, so a mistake stops the deploy and the live site stays as it was.

## Files

- `index.html`: page markup
- `styles.css`: styles
- `data.js`: card content
- `app.js`: app logic
- `sw.js`: offline cache
- `fonts/`: Inter font, bundled for offline use (SIL Open Font License, see `fonts/Inter-LICENSE.txt`)
- `tests/validate.js`: data and file checks, run before every deploy
- `manifest.webmanifest`: install metadata and icons
- `.nojekyll`: tells GitHub Pages to serve files as-is
