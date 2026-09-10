# section63-certificate
Fills the Schedule certificate under section 63(4)(c) , Bharatiya Sakshya Adhiniyam 2023, and computes the hash report - entirely in the browser

[Open the live app](https://letme2x.github.io/section63-certificate/)

## Run locally
Serve this directory with a static HTTP server (for example, `python -m http.server 3063`) and open http://localhost:3063. Deploy `index.html`, `app.js`, and `explainer.html` together. No build step or runtime dependency is required.

## Regression checks
With Node.js 18 or newer, run `npm ci` then `npm test`. The development dependency is used only for DOM tests; the application never loads it. Tests use synthetic files and exercise hashing, controls, language switching, resets and Word exports.
