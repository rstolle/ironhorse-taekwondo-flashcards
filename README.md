# Ironhorse Form Practice

Taekwondo flashcards for Ironhorse Martial Arts: form meanings, movement counts, and belt meanings.
A static web app with no build step. It installs to a phone's home screen and works offline.

## Deploy to GitHub Pages

1. Create a new repository on GitHub (for example, `ironhorse-flashcards`).
2. Upload every file in this folder to the repository root, keeping the `.github` and `icons` folders.
   Or from a terminal:
   ```
   git init -b main
   git add .
   git commit -m "Ironhorse flashcards"
   git remote add origin https://github.com/YOUR-USERNAME/ironhorse-flashcards.git
   git push -u origin main
   ```
3. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. The included workflow deploys on every push to `main`. The site appears at
   `https://YOUR-USERNAME.github.io/ironhorse-flashcards/`.

## Updating the cards

Card content lives at the top of `app.js` (`forms`, `emphasis`, `belts`).
After any change, bump `VERSION` in `sw.js` (for example, `ironhorse-v2`) so installed copies refresh.

## Files

- `index.html`: page markup
- `styles.css`: styles
- `app.js`: card data and app logic
- `sw.js`: offline cache
- `manifest.webmanifest`: install metadata and icons
- `.nojekyll`: tells GitHub Pages to serve files as-is
