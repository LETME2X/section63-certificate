# Browser repair — 10 September 2026

The uploaded `index.html` at fc3c1b8 ended immediately after `missingItems`, without closing the core script or including the page controller. The prior controller was recovered from d521172, adapted to the current form and placed in `app.js`.

## Changes

- Restored file selection/drop, hashing, copy/remove, verification, downloads, signing timestamps and clear-all.
- Implemented the existing Hindi/English page controls and translated working labels, statuses and warnings. Document language remains independent; the decision notes remain English as documented in v3.
- Prevented old asynchronous hashes/read results from overwriting a changed algorithm, verification input, replacement file or cleared form. Downloads wait for successful hashing.
- Added keyboard access to both file zones, guarded picker click bubbling, handled read/hash/clipboard failures and rejected invalid hash characters.
- Fixed all four India Code links by restoring the missing `/indiacode/` path segment. All ten distinct external URLs returned HTTP 200 after correction. Publisher access restrictions can still apply.
- Corrected the README's section-number typo and documented local use and tests.

The original CSS and complete certificate/hash core were compared byte-for-byte with the original revision and are unchanged. `explainer.html` and the legal decision text are unchanged.

## Validation

- `node --check app.js`: passed.
- `npm test`: nine passing regression tests, covering local links, hashes against Node crypto, file picker/drop events, languages, copy/remove, algorithm races, verification, pending reset, errors and Word downloads.
- Four exported English/Hindi certificate/report files passed ZIP CRC and XML parsing checks. Their hashes, escaped form values and independent Part A/B names were checked.
- In-app browser: Hindi/English switching, preserving input, both file choosers, actual SHA256 output, copy and matching/mismatching verification passed with synthetic data. No application console errors were reported before testing the native reset confirmation.
- The in-app browser's download event timed out, and its native confirm-dialog automation stalled. These browser-specific end-to-end checks remain unconfirmed; download bytes and reset behaviour passed the automated DOM tests. No native-browser download or visual Word-layout validation is claimed.

## Delivery

For the existing GitHub Pages site, replace `index.html` and add `app.js` beside it. Keep `explainer.html` in that directory. No build or production package installation is required.

The local Git checkout is not authenticated to GitHub, so the remote repository and published site have not been updated.
