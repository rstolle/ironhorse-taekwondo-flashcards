# Ironhorse Form Practice

Taekwondo flashcards for Ironhorse Martial Arts: form meanings, movement counts, and belt meanings.
A static web app with no build step. It installs to a phone's home screen and works offline.

**Live app: https://rstolle.github.io/ironhorse-taekwondo-flashcards/**

On a phone, open the link and add it to your home screen (iPhone: Share → Add to Home Screen; Android: the Install app button).

## Deploy to GitHub Pages

1. Create a new repository on GitHub (this one is `ironhorse-taekwondo-flashcards`).
2. Upload every file in this folder to the repository root, keeping the `.github` and `icons` folders.
   Or from a terminal:
   ```
   git init -b main
   git add .
   git commit -m "Ironhorse flashcards"
   git remote add origin https://github.com/YOUR-USERNAME/ironhorse-taekwondo-flashcards.git
   git push -u origin main
   ```
3. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. The included workflow deploys on every push to `main`. The site appears at
   `https://YOUR-USERNAME.github.io/ironhorse-taekwondo-flashcards/`.

## Updating the cards

All card content is in `data.js` (`forms`, `emphasis`, `belts`). Edit it and push to `main`.
The deploy stamps a fresh cache version automatically, so installed copies refresh on their next launch.
Card IDs come from names, so adding or reordering forms keeps everyone's saved progress intact
(renaming a form resets progress for that card only if it was mid-session).

## Files

- `index.html`: page markup
- `styles.css`: styles
- `data.js`: card content
- `app.js`: app logic
- `sw.js`: offline cache
- `manifest.webmanifest`: install metadata and icons
- `.nojekyll`: tells GitHub Pages to serve files as-is
