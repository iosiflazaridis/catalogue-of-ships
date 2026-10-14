# The Catalogue of Ships

A record of Homer's Catalogue of Ships (*Iliad* 2.484–759) and of the Trojan Catalogue (2.816–877).

**Site:** https://iosiflazaridis.github.io/catalogue-of-ships/

- **Every place on one map:** all 228 places, the Achaean and the Trojan side, each with its picture and the line that
  names it; dashed rings for sites uncertain or disputed and for the lands of peoples; the 18 places with no known
  site listed.
- **The contingents:** the 29 Achaean contingents and the 16 Trojan peoples, with their leaders, ships, places and lines.
- **The ships:** the 1,186 ships of the 29 contingents.
- **The text, entry by entry:** the Greek of Monro and Allen with A. T. Murray's English, line by line.
- **Hear it read:** the whole Catalogue read in reconstructed ancient Greek (27 min), embedded from YouTube.
- **Downloads:** the places, entries and text as CSV and JSON.

## Files

- `index.html`, `style.css`, `app.js`: the page. `data.js`: all the data.
- `tiles/`: the relief map (a tile pyramid, zoom 0–5, and `under.jpg`, the whole relief at half size).
- `img/th`, `img/md`: the pictures (520 and 1280 px); `img/poster.jpg`; `og.jpg`: the preview image.
- `dl/`: the downloads.
- `lib/leaflet`: Leaflet 1.9.4 (BSD 2-Clause, `lib/leaflet/LICENSE.txt`). `fonts/`: EB Garamond (SIL Open Font
  Licence, `fonts/OFL.txt`), subset to Latin and Greek.

The page needs no server: `index.html` also works when opened from a folder (but the YouTube player plays only
when the page is served over http, as on GitHub Pages).

The reading: put its YouTube video id in `app.js` (`var YT_ID = '...'`). The page then embeds it, and a small ▶ beside
each entry, line and place plays it from there.

## Credits and licences

- Greek text: Homer, *Iliad*, ed. D. B. Monro and T. W. Allen (Oxford, 1920), from the Perseus Digital Library
  (CC BY-SA). English: A. T. Murray (Loeb, 1924), public domain.
- Places: Pleiades (CC BY). Relief: Terrain Tiles on AWS (EU-DEM, SRTM, GMTED2010, ETOPO1).
- Pictures: Wikimedia Commons; each picture's author and licence are given on the page, with a link to its Commons
  page. Pictures under CC BY-SA are shared here under the same licence.
- Earlier work: *Mapping the Catalogue of Ships* (Jenny Strauss Clay, Courtney Evans, Ben Jasnow; Scholars' Lab,
  University of Virginia), https://ships.lib.virginia.edu/.

Iosif Lazaridis, 2026, made with Claude.
