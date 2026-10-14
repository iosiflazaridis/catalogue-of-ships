/* The Catalogue of Ships (Iliad 2.484-759, 2.816-877): a record of the places, contingents, ships and text.
   All the data is in data.js (window.COS). */
(function () {
  'use strict';
  // The reading on YouTube: put its video id here (the part after "watch?v=" or "youtu.be/"). The page then embeds it,
  // and a small ▶ beside each entry, line and place plays it from there. Empty: the reading is linked to the channel.
  var YT_ID = 'KlH91MW9KJg';
  var CHANNEL = 'https://www.youtube.com/channel/UCUFCnOKUFN1rge3LKAHL0Mw';

  var D = window.COS, P = D.places, ENT = D.entries, TXT = D.text;
  // the lands of peoples drawn on the map beside the places (not counted among them): the Paeonians
  var PEO = {}; (D.peoples || []).forEach(function (p) { p.people = true; PEO[p.id] = p; });
  function pl(id) { return P[id] || PEO[id]; }
  var byN = {}; ENT.forEach(function (e) { byN[e.n] = e; });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function mmss(t) { t = Math.floor(t); var m = Math.floor(t / 60), s = t % 60; return m + ':' + String(s).padStart(2, '0'); }
  function tlink(t, label) {
    if (!YT_ID || t == null) return '';
    return '<a class="t" data-t="' + Math.floor(t) + '" title="Hear it from here (' + mmss(t) + ')">' + (label || 'hear') + '</a>';
  }

  // ------------------------------------------------------------------ the reading (YouTube), embedded
  var fb = $('#filmbox');
  function embed(t, autoplay) {
    if (!YT_ID) return;
    var q = 'rel=0' + (autoplay ? '&autoplay=1' : '') + (t ? '&start=' + t : '');
    var f = fb.querySelector('iframe');
    var src = 'https://www.youtube-nocookie.com/embed/' + YT_ID + '?' + q;
    if (f) { f.src = src; return; }
    fb.innerHTML = '<iframe src="' + src + '" title="The Catalogue of Ships, read in reconstructed ancient Greek" loading="lazy" ' +
      'referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"></iframe>';
  }
  function play(t) { embed(t || 0, true); }
  if (YT_ID) {
    fb.classList.remove('nolink'); fb.style.cursor = 'default'; embed(0, false);
    $('#ytlink').innerHTML = '<a href="https://www.youtube.com/watch?v=' + YT_ID + '" target="_blank" rel="noopener">Watch on YouTube</a>';
  } else {
    $('#filmsoon').innerHTML = 'The reading will be on <a href="' + CHANNEL + '">YouTube</a>.';
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a.t[data-t]'); if (!a) return;
    ev.preventDefault(); play(+a.dataset.t); document.getElementById('reading').scrollIntoView({ behavior: 'smooth' });
  });

  // ------------------------------------------------------------------ the lightbox
  var lb = $('#lb');
  function open(src, cap) { $('img', lb).src = src; $('.cap', lb).innerHTML = cap || ''; lb.classList.add('on'); }
  lb.addEventListener('click', function (ev) { if (ev.target === lb || ev.target.classList.contains('x')) lb.classList.remove('on'); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') lb.classList.remove('on'); });
  function credit(o) { return o.url ? '<a href="' + esc(o.url) + '" target="_blank" rel="noopener">' + esc(o.credit || 'Wikimedia Commons') + '</a>' : esc(o.credit || ''); }
  document.addEventListener('click', function (ev) {
    var im = ev.target.closest('img[data-md]'); if (!im) return;
    open('img/md/' + im.dataset.md + '.jpg', im.dataset.cap ? decodeURIComponent(im.dataset.cap) : '');
  });

  // ------------------------------------------------------------------ the map
  var M = D.map, Z = M.zmax;
  var map = L.map('leaf', { crs: L.CRS.Simple, minZoom: 0, maxZoom: 7, zoomSnap: 0, zoomDelta: 0.5, wheelPxPerZoomLevel: 90,
    fadeAnimation: false, maxBoundsViscosity: 1.0 });
  var bounds = L.latLngBounds(map.unproject([0, M.H], Z), map.unproject([M.W, 0], Z));
  // the whole relief at half size under the tiles: the hairlines between tiles at fractional zoom show the same picture
  L.imageOverlay('tiles/under.jpg', bounds, { interactive: false }).addTo(map);
  L.tileLayer('tiles/{z}/{x}/{y}.jpg', { minZoom: 0, maxZoom: 7, maxNativeZoom: Z, tileSize: 256, noWrap: true, bounds: bounds, className: 'relief',
    attribution: 'Relief: Terrain Tiles on AWS · places: <a href="https://pleiades.stoa.org/">Pleiades</a>' }).addTo(map);
  map.setMaxBounds(bounds);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  var KMPX = 400 / (111.32 * Math.cos(39 * Math.PI / 180));        // map pixels (full size) per km, at 39 N
  function ll(p) { return map.unproject([p.x, p.y], Z); }
  var layers = { achaean: L.layerGroup().addTo(map), trojan: L.layerGroup().addTo(map) };
  var hlLayer = L.layerGroup().addTo(map);
  function color(p) { return p.side === 'trojan' ? '#e2836a' : '#ecc878'; }
  Object.keys(PEO).forEach(function (id) {
    var p = PEO[id];
    var m = L.circle(ll(p), { radius: p.ring * KMPX / Math.pow(2, Z), color: '#f2e8d2', weight: 1.4, dashArray: '5 5',
      fill: true, fillColor: color(p), fillOpacity: 0.06 });
    m.bindTooltip('<span class="g">' + esc(p.g) + '</span> · ' + esc(p.e), { className: 'pl', direction: 'top', offset: [0, -6] });
    m.on('click', function () { show(id, false); });
    m.addTo(layers[p.side]);
  });
  Object.keys(P).forEach(function (id) {
    var p = P[id]; if (p.x == null) return;
    var m;
    if (p.status === 'uncertain') {
      var r = Math.max(p.ring || 4, 2.5) * KMPX / Math.pow(2, Z);
      m = L.circle(ll(p), { radius: r, color: p.region ? '#f2e8d2' : color(p), weight: p.region ? 1.4 : 1.8, dashArray: '5 5',
        fill: true, fillColor: color(p), fillOpacity: p.region ? 0.04 : 0.12 });
      if (!p.region) L.circleMarker(ll(p), { radius: 2.5, stroke: false, fillColor: color(p), fillOpacity: 0.9, interactive: false }).addTo(layers[p.side]);
    } else {
      m = L.circleMarker(ll(p), { radius: 5.5, color: '#1a140c', weight: 1.5, fillColor: color(p), fillOpacity: 1 });
    }
    m.bindTooltip('<span class="g">' + esc(p.g) + '</span> · ' + esc(p.e), { className: 'pl', direction: 'top', offset: [0, -6] });
    m.on('click', function () { show(id, false); });
    m.addTo(layers[p.side]);
  });
  // the first view: from Ithaca to Paphlagonia, and north to Paeonia; never smaller than the box (the relief always fills it)
  var view = L.latLngBounds(map.unproject([150, M.H - 80], Z), map.unproject([M.W - 60, 100], Z));
  function fit() { map.setMinZoom(map.getBoundsZoom(bounds, true)); }
  fit(); map.fitBounds(view, { animate: false }); map.on('resize', fit);
  if (document.getElementById('leaf').clientWidth < 600) map.setView(map.unproject([0.36 * M.W, 0.49 * M.H], Z), map.getZoom(), { animate: false });
  $('#f-a').addEventListener('change', function () { this.checked ? layers.achaean.addTo(map) : map.removeLayer(layers.achaean); });
  $('#f-t').addEventListener('change', function () { this.checked ? layers.trojan.addTo(map) : map.removeLayer(layers.trojan); });

  var STATUS = { located: 'Site located', uncertain: 'Site uncertain or disputed: a dashed ring on the map', unknown: 'Site unknown: not on the map' };
  var panel = $('#panel');
  function openPanel(h) {
    panel.innerHTML = '<button class="x" aria-label="Close">×</button>' + h; panel.classList.add('on'); panel.scrollTop = 0;
    $('.x', panel).addEventListener('click', function () { panel.classList.remove('on'); hlLayer.clearLayers(); });
    if (window.innerWidth <= 820) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function ring(p, big) {
    L.circleMarker(ll(p), { radius: big ? 13 : 10, color: '#f2e8d2', weight: 2, fill: false, interactive: false }).addTo(hlLayer);
  }
  function show(id, fly) {
    var p = pl(id); if (!p) return;
    var h = '';
    if (p.photo) h += '<img src="img/th/' + p.photo + '.jpg" alt="' + esc(p.e) + '" data-md="' + p.photo + '" data-cap="' +
      encodeURIComponent('<b>' + esc(p.g) + '</b> · ' + esc(p.e) + '<br>' + esc(p.note) + '<small>' + credit(p) + '</small>') + '">';
    h += '<div class="in"><div class="pg" lang="grc">' + esc(p.g) + '</div><div class="pe">' + esc(p.e) + '</div>';
    h += '<div class="st">' + (p.people ? 'The land of a people: a dashed ring on the map' : p.region ? 'A country or people, not a town' : STATUS[p.status]) + '</div>';
    if (p.note && !/^Site (unknown|uncertain)$/.test(p.note)) h += '<div class="note">' + esc(p.note) + '</div>';
    if (p.photo) h += '<div class="cr">' + credit(p) + '</div>';
    var seen = {};
    p.named.forEach(function (x) {
      var k = x.n + ':' + x.line; if (seen[k]) return; seen[k] = 1;
      var e = byN[x.n], t = TXT[x.line] || ['', ''];
      h += '<div class="named"><div class="ln">Iliad 2.' + x.line + ' · <a href="#e-' + x.n + '" data-open="' + x.n + '">' + x.n + '. ' +
        esc(e.e) + '</a> ' + tlink(x.t) + '</div><div class="lg" lang="grc">' + esc(t[0]) + '</div><div class="le">' + esc(t[1]) + '</div></div>';
    });
    openPanel(h + '</div>');
    hlLayer.clearLayers();
    if (p.x != null) {
      ring(p, true);
      if (fly) map.flyTo(ll(p), Math.max(map.getZoom(), p.people ? 3 : p.region ? 3.5 : 4.5), { duration: 0.8 });
    }
  }
  function showEntry(n) {
    var e = byN[n]; if (!e) return;
    var pts = e.places.concat(e.peoples || []).map(pl).filter(function (p) { return p.x != null; });
    hlLayer.clearLayers(); pts.forEach(function (p) { ring(p, false); });
    var sh = e.ships ? e.ships + ' ships' : ORD[e.n - 30] + ' of the sixteen Trojan peoples';
    var h = '<div class="in"><div class="pg" lang="grc">' + esc(e.g) + '</div><div class="pe">' + esc(e.e) + '</div><div class="st">Iliad 2.' +
      e.lines[0] + '–' + e.lines[1] + ' · ' + sh + '</div><div class="leaders">' + e.leaders.map(function (l) {
        return '<div><span class="g" lang="grc">' + esc(l.g) + '</span> ' + esc(l.e) + '</div>'; }).join('') + '</div><div>' +
      chips(e) + '</div><p class="ln"><a href="#e-' + n + '" data-open="' + n + '">Read the lines</a> ' + tlink(e.t) + '</p></div>';
    openPanel(h);
    if (pts.length) {
      var b = L.latLngBounds(pts.map(ll));
      map.flyToBounds(b.pad(pts.length > 1 ? 0.35 : 0), { maxZoom: 4.6, duration: 0.8, paddingBottomRight: window.innerWidth > 820 ? [380, 0] : [0, 0] });
    }
  }
  function goPlace(id) { document.getElementById('map').scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { show(id, true); }, 350); }
  function goEntry(n) { document.getElementById('map').scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { showEntry(n); }, 350); }
  document.addEventListener('click', function (ev) {
    var c = ev.target.closest('[data-place]'); if (c) { ev.preventDefault(); goPlace(c.dataset.place); return; }
    var m = ev.target.closest('[data-onmap]'); if (m) { ev.preventDefault(); ev.stopPropagation(); goEntry(+m.dataset.onmap); return; }
    var o = ev.target.closest('a[data-open]'); if (o) { var d = document.getElementById('e-' + o.dataset.open); if (d) d.open = true; }
  });
  // find a place
  var dl = $('#placelist'), names = {};
  Object.keys(P).concat(Object.keys(PEO)).forEach(function (id) { var p = pl(id); var k = p.e + ' · ' + p.g; names[k] = id;
    var o = document.createElement('option'); o.value = k; dl.appendChild(o); });
  $('#find').addEventListener('change', function () { var id = names[this.value]; if (id) { show(id, true); this.blur(); } });
  function chip(id) { var p = pl(id);
    return '<span class="chip' + (p.status !== 'located' ? ' u' : '') + (p.side === 'trojan' ? ' t' : '') + '" data-place="' + id + '" title="' + esc(p.people ? 'The land of a people' : STATUS[p.status]) +
      '"><span lang="grc">' + esc(p.g) + '</span> · ' + esc(p.e) + '</span>'; }
  function chips(e) { return e.places.concat(e.peoples || []).map(chip).join(''); }
  // the places with no known site
  var unk = Object.keys(P).filter(function (id) { return P[id].x == null; });
  $('#unk-n').textContent = unk.length === 18 ? 'Eighteen' : unk.length;
  $('#unknown').innerHTML = unk.map(chip).join('');

  // ------------------------------------------------------------------ the contingents
  var ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth',
             'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth'];
  var CH = [{ seg: 'ch1', t: 'Central Greece', l: '2.494–558' }, { seg: 'ch2', t: 'The Peloponnese', l: '2.559–624' },
            { seg: 'ch3', t: 'The West', l: '2.625–644' }, { seg: 'ch4', t: 'Crete and the Islands', l: '2.645–680' },
            { seg: 'ch5', t: 'Thessaly and the North', l: '2.681–759' }, { seg: 'ch6', t: 'The Trojans and their Allies', l: '2.816–877' }];
  function leadersShort(e) { return e.leaders.map(function (l) { return '<span class="g" lang="grc">' + esc(l.g) + '</span> <span class="le2">' +
    esc(l.e.split(/,| who/)[0]) + '</span>'; }).join('<br>'); }
  function table(side) {
    var tr = side === 'trojan';
    var h = '<thead><tr><th class="num">№</th><th>People</th><th>Leaders</th>' + (tr ? '' : '<th class="r">Ships</th>') +
            '<th class="r hide-s">Places</th><th class="r hide-s">Lines</th><th></th></tr></thead><tbody>';
    CH.forEach(function (c) {
      var es = ENT.filter(function (e) { return e.seg === c.seg && e.side === side; }); if (!es.length) return;
      if (!tr) h += '<tr class="grp"><td></td><td colspan="6">' + c.t + ' <span class="h3meta">' + c.l + ' · ' +
        es.reduce(function (s, e) { return s + e.ships; }, 0) + ' ships</span></td></tr>';
      es.forEach(function (e) {
        h += '<tr><td class="num">' + e.n + '</td><td><a href="#e-' + e.n + '" data-open="' + e.n + '"><span class="eg" lang="grc">' + esc(e.g) +
          '</span><br><span class="ee2">' + esc(e.e.split(':')[0]) + '</span></a></td><td>' + leadersShort(e) + '</td>' +
          (tr ? '' : '<td class="r big">' + e.ships + '</td>') + '<td class="r hide-s">' + e.places.length + '</td><td class="r nowrap hide-s">' + e.lines[0] + '–' + e.lines[1] +
          '</td><td class="r"><button class="onmap" data-onmap="' + e.n + '" title="Show on the map" aria-label="Show on the map">⌖</button></td></tr>';
      });
    });
    var all = ENT.filter(function (e) { return e.side === side; });
    var nl = all.reduce(function (s, e) { return s + e.leaders.length; }, 0), np = all.reduce(function (s, e) { return s + e.places.length; }, 0);
    var nli = all.reduce(function (s, e) { return s + e.lines[1] - e.lines[0] + 1; }, 0);
    if (!tr) h += '<tr class="tot"><td></td><td>' + all.length + ' contingents</td><td>' + nl + ' leaders</td><td class="r big">' +
      all.reduce(function (s, e) { return s + e.ships; }, 0).toLocaleString('en') + '</td><td class="r hide-s">' + np + '</td><td class="r hide-s">' + nli + '</td><td></td></tr>';
    else h += '<tr class="tot"><td></td><td>' + all.length + ' peoples</td><td>' + nl + ' leaders</td><td class="r hide-s">' + np + '</td><td class="r hide-s">' + nli + '</td><td></td></tr>';
    return h + '</tbody>';
  }
  $('#t-achaean').innerHTML = table('achaean'); $('#t-trojan').innerHTML = table('trojan');

  // ------------------------------------------------------------------ the text, entry by entry
  function lines(a, b, lt) {
    var h = '<table class="text">';
    for (var n = a; n <= b; n++) {
      var t = TXT[n] || ['', ''];
      h += '<tr id="l-' + n + '"><td class="n">' + n + (lt && lt[n] != null ? ' ' + tlink(lt[n], '') : '') +
        '</td><td class="g" lang="grc">' + esc(t[0]) + '</td><td class="e">' + esc(t[1]) + '</td></tr>';
    }
    return h + '</table>';
  }
  function storyfig(k) {
    var s = D.stories[k]; if (!s) return '';
    var cap = '<b>' + esc(s.g) + '</b> · ' + esc(s.e) + '<br>' + esc(s.note) + '<small>' + credit(s) + '</small>';
    return '<figure><img loading="lazy" src="img/th/' + s.photo + '.jpg" alt="' + esc(s.note) + '" data-md="' + s.photo + '" data-cap="' + encodeURIComponent(cap) +
      '"><figcaption><b lang="grc">' + esc(s.g) + '</b> · ' + esc(s.note) + '</figcaption></figure>';
  }
  var H = '';
  H += '<div class="chap"><h3>The invocation of the Muses</h3><span class="meta">2.484–493</span></div>';
  H += '<details class="entry inv" id="e-0"><summary><span class="num"></span><span><span class="eg" lang="grc">ΕΣΠΕΤΕ ΝΥΝ ΜΟΙ ΜΟΥΣΑΙ</span> ' +
    '<span class="ee">Tell me now, ye Muses</span></span><span class="ships"></span><span class="sub">“Not though ten tongues were mine and ten mouths”: ' +
    'the poet asks the Muses for the leaders and the ships</span></summary><div class="ebody"><div class="stories">' +
    D.inv.stories.map(storyfig).join('') + '</div>' + lines(484, 493, D.inv.line_t) + '</div></details>';
  CH.forEach(function (c) {
    var es = ENT.filter(function (e) { return e.seg === c.seg; });
    var ships = es.reduce(function (s, e) { return s + (e.ships || 0); }, 0);
    H += '<div class="chap"><h3>' + c.t + '</h3><span class="meta">' + c.l + ' · ' + (c.seg === 'ch6' ? '16 peoples, no ships' : es.length + ' contingents, ' + ships + ' ships') + '</span></div>';
    es.forEach(function (e) {
      var sh = e.ships ? e.ships + ' ships' : '<span style="color:var(--troy)">' + ORD[e.n - 30] + ' of 16</span>';
      var lead = e.leaders.map(function (l) { return '<span class="l"><span class="g" lang="grc">' + esc(l.g) + '</span> ' + esc(l.e) + '</span>'; }).join('');
      H += '<details class="entry" id="e-' + e.n + '"><summary><span class="num">' + e.n + '</span><span><span class="eg" lang="grc">' + esc(e.g) + '</span> <span class="ee">' +
        esc(e.e) + '</span></span><span class="ships">' + sh + '</span><span class="sub">2.' + e.lines[0] + '–' + e.lines[1] + ' · ' +
        e.leaders.map(function (l) { return esc(l.e.split(/,| son of| who/)[0]); }).join(', ') + ' · ' + e.places.length + (e.places.length === 1 ? ' place' : ' places') +
        '</span></summary><div class="ebody"><div class="leaders">' + lead + '</div><div>' + chips(e) +
        ' <button class="onmap wide" data-onmap="' + e.n + '">⌖ on the map</button> ' + tlink(e.t, 'hear this entry') + '</div>' +
        (e.stories.length ? '<div class="stories">' + e.stories.map(storyfig).join('') + '</div>' : '') + lines(e.lines[0], e.lines[1], e.line_t) + '</div></details>';
    });
  });
  $('#entries').innerHTML = H;
  $('#openall').addEventListener('click', function () { document.querySelectorAll('details.entry').forEach(function (d) { d.open = true; }); });
  $('#closeall').addEventListener('click', function () { document.querySelectorAll('details.entry').forEach(function (d) { d.open = false; }); });

  // ------------------------------------------------------------------ the ships
  var SHORT = { 2: 'Minyans', 5: 'Abantes', 13: 'Epeians', 14: 'Dulichium', 19: 'Syme (Nireus)', 20: 'Kos', 22: 'Phylake',
                23: 'Pherai', 24: 'Methone', 28: 'Enienes' };
  function drawShips() {
    var A = ENT.filter(function (e) { return e.ships; }), svg = $('#chart'), s = '', narrow = window.innerWidth < 700;
    var lab = function (e) { return SHORT[e.n] || e.short; };
    var names = { ch1: 'Central Greece', ch2: 'Peloponnese', ch3: 'West', ch4: 'Crete, islands', ch5: 'Thessaly, north' };
    var chs = {};
    if (!narrow) {
      var W = 1080, Hh = 450, x0 = 46, x1 = 1066, yb = 318, ytop = 34, bw = (x1 - x0) / A.length, sc = (yb - ytop) / 100;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
      [0, 25, 50, 75, 100].forEach(function (v) { var y = yb - v * sc;
        s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y + '" y2="' + y + '" stroke="#3a3326"/><text x="' + (x0 - 8) + '" y="' + (y + 5) +
             '" fill="#7d7466" font-size="15" text-anchor="end">' + v + '</text>'; });
      A.forEach(function (e, i) {
        var x = x0 + i * bw + bw * 0.16, w = bw * 0.68, h = e.ships * sc, hi = e.n === 9 || e.n === 19, c = hi ? '#ecc878' : '#a99f8d';
        s += '<g><title>' + esc(e.n + '. ' + e.short + ': ' + e.ships + ' ships') + '</title><rect x="' + x.toFixed(1) + '" y="' + (yb - h).toFixed(1) +
          '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + (hi ? '#ecc878' : '#cfc3a8') + '"/><text x="' + (x + w / 2).toFixed(1) + '" y="' +
          (yb - h - 6).toFixed(1) + '" fill="' + c + '" font-size="15" text-anchor="middle">' + e.ships + '</text><text transform="translate(' + (x + w / 2 + 5).toFixed(1) +
          ',' + (yb + 10) + ') rotate(-62)" fill="' + c + '" font-size="14.5" text-anchor="end">' + esc(lab(e)) + '</text></g>';
        (chs[e.seg] = chs[e.seg] || []).push(i);
      });
      s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + yb + '" y2="' + yb + '" stroke="#7d7466"/>';
      Object.keys(chs).forEach(function (k) { var a = chs[k][0], b = chs[k][chs[k].length - 1], xa = x0 + a * bw + 3, xb = x0 + (b + 1) * bw - 3;
        s += '<line x1="' + xa + '" x2="' + xb + '" y1="' + (Hh - 22) + '" y2="' + (Hh - 22) + '" stroke="#c9a75c" stroke-width="1.5"/><text x="' + ((xa + xb) / 2) +
             '" y="' + (Hh - 4) + '" fill="#c9a75c" font-size="15" text-anchor="middle">' + names[k] + '</text>'; });
    } else {
      var rh = 21, xl = 128, xr = 356, scn = (xr - xl) / 100, y = 8, last = null;
      A.forEach(function (e) {
        if (e.seg !== last) { y += last ? 10 : 0; s += '<text x="0" y="' + (y + 14) + '" fill="#c9a75c" font-size="14">' + names[e.seg] + '</text>'; y += 20; last = e.seg; }
        var hi = e.n === 9 || e.n === 19, c = hi ? '#ecc878' : '#a99f8d', w = e.ships * scn;
        s += '<g><title>' + esc(e.short + ': ' + e.ships + ' ships') + '</title><text x="' + (xl - 8) + '" y="' + (y + 14) + '" fill="' + c +
             '" font-size="14" text-anchor="end">' + esc(lab(e)) + '</text><rect x="' + xl + '" y="' + (y + 3) + '" width="' + w.toFixed(1) + '" height="' + (rh - 7) +
             '" fill="' + (hi ? '#ecc878' : '#cfc3a8') + '"/><text x="' + (xl + w + 5).toFixed(1) + '" y="' + (y + 14) + '" fill="' + c + '" font-size="13">' + e.ships + '</text></g>';
        y += rh;
      });
      svg.setAttribute('viewBox', '0 0 390 ' + (y + 6));
    }
    svg.innerHTML = s; svg.dataset.narrow = narrow ? 1 : 0;
  }
  drawShips();
  window.addEventListener('resize', function () { if ((window.innerWidth < 700 ? '1' : '0') !== $('#chart').dataset.narrow) drawShips(); });

  // ------------------------------------------------------------------ the reading's chapters, counts, pictures
  var segT = {}; D.film.segs.forEach(function (s) { segT[s.name] = s.t0; });
  var CHL = [[0, 'Opening'], [D.inv.t, 'The invocation of the Muses (2.484–493)'],
             [byN[1].t, 'Central Greece, from the Boeotians (2.494–558)'], [segT.ch2, 'The Peloponnese (2.559–624)'],
             [segT.ch3, 'The West (2.625–644)'], [segT.ch4, 'Crete and the Islands (2.645–680)'],
             [segT.ch5, 'Thessaly and the North (2.681–759)'], [segT.ch6, 'The Trojans and their Allies (2.816–877)']];
  $('#chapters').innerHTML = CHL.map(function (c) { return '<li><span class="tm">' + (YT_ID ? tlink(c[0], mmss(c[0])) : mmss(c[0])) + '</span> ' + c[1] + '</li>'; }).join('');
  var C = D.counts; $('#n-loc').textContent = C.located; $('#n-unc').textContent = C.uncertain; $('#n-unk').textContent = C.unknown;
  var pics = [];
  Object.keys(P).forEach(function (id) { var p = P[id]; if (p.photo) pics.push({ t: p.e + ' (' + p.g + ')', o: p, n: p.named[0] ? p.named[0].line : 0 }); });
  Object.keys(D.stories).forEach(function (k) { var s = D.stories[k]; pics.push({ t: s.g + ': ' + s.note, o: s, n: s.line || 0 }); });
  pics.sort(function (a, b) { return a.n - b.n; });
  $('#n-pics').textContent = pics.length;
  $('#pics').innerHTML = pics.map(function (q) { return '<li><b>' + esc(q.t) + '</b> · ' + credit(q.o) + '</li>'; }).join('');
})();
