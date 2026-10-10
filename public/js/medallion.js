/* Two-sided 3D logo medallion.
   Modeled as a machined challenge coin: brushed-steel face, raised rim,
   knurled edge, and the logo raised in polished metal with glossy enamel
   tops, lit by a studio environment so it catches reflections as it turns.
   Built from images/brand/logo.svg (a vector trace of the logo), so it is
   drawn fresh at screen resolution and never pixelates.

   Two states:
   - opening: while the intro is on screen, large and fully opaque exactly
     where the intro's still of the coin ([data-coin-hero]) sits, riding up
     with the page, with a slow sway and a studio glint crossing the metal;
   - background: once the film covers the screen, centered behind the page
     at 60%, turning once over the whole page as it scrolls, and only
     redrawn while it moves.
   With window.FWSW_COIN_POSTER = { size } it instead draws one frame into a
   square transparent canvas, which is how the intro's still is made, so the
   still and the live coin's first frame match.

   Kept light so it never makes the page stutter:
   - the build runs in short steps while the page is quiet (the intro shows
     the still until then), and the shader compiles wait for a pause in
     scrolling;
   - the logo's curves get only as many points as the eye can tell, the base
     of each letter (buried in the coin body) is left out, and each face is
     drawn in a few calls instead of one per letter;
   - the canvas covers only the coin, not the whole screen;
   - nothing is drawn while the scroll film hides the coin. */
(function () {
  var host = window.FWSW_COIN_POSTER ? document.body : document.getElementById('medallion');
  if (!host || !window.THREE || !THREE.SVGLoader) return;

  if (!window.WebGLRenderingContext) return;
  var POSTER = window.FWSW_COIN_POSTER || null;

  // the WebGL canvas is made when the coin is about to be drawn, not when this file loads
  var renderer = null, canvas = null;
  function makeRenderer() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: !!POSTER });
    } catch (e) { return false; }
    renderer.debug.checkShaderErrors = false;   // no extra round trips to the graphics chip while shaders compile
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    canvas = renderer.domElement;
    host.appendChild(canvas);
    return true;
  }
  // resolution follows the screen and the browser zoom (zooming raises devicePixelRatio), so the coin stays
  // sharp when someone zooms in. Up to 3x while it's the opening scene (2x on phones), 2x in the background
  // (1.5x on phones). Lite mode, for computers that can't keep up, draws at 1.5x and 1x.
  function wantDpr(hero) {
    if (POSTER) return 1;
    var small = window.innerWidth < 900;
    var cap = window.FWSW_LITE ? (hero ? 1.5 : 1) : hero ? (small ? 2 : 3) : (small ? 1.5 : 2);
    return Math.min(window.devicePixelRatio || 1, cap);
  }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 1, 8000);

  // studio reflections (made during the build, not at load)
  function makeEnvironment() {
    if (!THREE.RoomEnvironment) return;
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a3550, 0.35));
  var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-500, 650, 900); scene.add(key);
  var rim = new THREE.DirectionalLight(0xffe2a8, 0.6); rim.position.set(700, -250, -300); scene.add(rim);

  var badge = new THREE.Group();
  var coin, front, back, shadow, discR = 300;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var target = 0, current = 0, running = false;
  var COIN_FRACTION = 0.78;            // coin diameter / still image width (room for the shadow)
  var BOX = 1.12 / COIN_FRACTION;      // the canvas around the coin: the still's box plus a margin for the turn
  var heroImg = POSTER ? null : document.querySelector('[data-coin-hero]');
  var intro = POSTER ? null : document.querySelector('.intro');
  var heroBox = null;                  // true while the page has an intro still to sit on
  var blend = 1, idleOn = false, idleStart = 0, lastIdle = 0, lastTick = 0, shown = false, animT = 0;
  var lastActive = performance.now(), REST_AFTER = 60000;   // the opening sway rests after a minute with no activity
  var vw = 1, vh = 1, lastGlowY = -1;
  var glow = POSTER ? null : document.querySelector('.intro-glow');
  // while the scroll film fills the screen it hides the coin completely, so the coin isn't drawn then
  var filmCover = POSTER ? null : document.querySelector('.film-sticky'), hidden = false;
  var box = { W: 0, H: 0, dpr: 0, x: NaN, y: NaN };
  var lastScrollAt = 0;
  if (!POSTER) window.addEventListener('scroll', function () { lastScrollAt = performance.now(); }, { passive: true });

  // a small studio light that travels close across the face while the coin is the opening scene,
  // so a glint moves over the metal instead of the whole face lighting up at once
  var sweep = new THREE.PointLight(0xfff1dc, 0, 1500, 1.4);
  scene.add(sweep);

  fetch('images/brand/logo.svg').then(function (r) { return r.text(); }).then(function (svg) {
    if (POSTER) buildPoster(svg); else whenQuiet(function () { build(svg); });
  }).catch(function () {});

  // ---------- pacing ----------

  // run fn (in a task of its own) once the page is visible and hasn't scrolled for a moment
  function whenQuiet(fn) {
    (function check() {
      if (!document.hidden && performance.now() - lastScrollAt > 400) fn();
      else setTimeout(check, 120);
    })();
  }
  function whenQuietLater(fn) { setTimeout(function () { whenQuiet(fn); }, 0); }
  // run a list of small jobs a few milliseconds at a time, handing the page back in between, and pausing
  // whenever the page is being scrolled
  function sliced(jobs, done) {
    (function slice() {
      if (document.hidden || performance.now() - lastScrollAt < 400) { setTimeout(slice, 150); return; }
      var t0 = performance.now();
      do { jobs.shift()(); } while (jobs.length && performance.now() - t0 < 8);
      if (jobs.length) setTimeout(slice, 0); else done();
    })();
  }

  // ---------- geometry ----------

  // The logo's outline, flattened into straight segments only as finely as the eye can tell: each curve gets just
  // enough points to stay within TOL of the true curve (a quarter of a screen pixel at the largest the coin is ever
  // drawn) instead of the fixed 12 per curve three.js would use, which is a third of the points.
  var TOL = 0.1;
  function bend(a, b, c) { return Math.sqrt((a.x - 2 * b.x + c.x) * (a.x - 2 * b.x + c.x) + (a.y - 2 * b.y + c.y) * (a.y - 2 * b.y + c.y)); }
  function flatten(path) {
    var out = [];
    path.curves.forEach(function (c) {
      var n = c.isLineCurve ? 1
        : c.isCubicBezierCurve ? Math.ceil(Math.sqrt(0.75 * Math.max(bend(c.v0, c.v1, c.v2), bend(c.v1, c.v2, c.v3)) / TOL))
        : c.isQuadraticBezierCurve ? Math.ceil(Math.sqrt(0.25 * bend(c.v0, c.v1, c.v2) / TOL)) : 8;
      n = Math.max(1, Math.min(12, n || 1));
      for (var i = 0; i <= n; i++) {
        var p = c.getPoint(i / n), last = out[out.length - 1];
        if (!last || last.x !== p.x || last.y !== p.y) out.push(p);
      }
    });
    return out;
  }
  var EXTRUDE = { depth: 7, bevelEnabled: true, bevelThickness: 2.2, bevelSize: 1.1, bevelSegments: 2, curveSegments: 1 };

  // Keep only what can be seen: the base of each letter (its bottom cap and bottom bevel, at z <= 0) sits inside
  // the coin body, and texture coordinates aren't used. Faces and sides are gathered separately so the finished
  // logo draws in two calls instead of two per letter.
  function Gather() { this.P = [[], []]; this.N = [[], []]; this.len = [0, 0]; }
  Gather.prototype.add = function (geo) {
    var pos = geo.attributes.position.array, nor = geo.attributes.normal.array, self = this;
    function seen(t) { return pos[t * 3 + 2] > 1e-3 || pos[t * 3 + 5] > 1e-3 || pos[t * 3 + 8] > 1e-3; }
    geo.groups.forEach(function (g) {
      var m = g.materialIndex, end = g.start + g.count, n = 0, t, o;
      for (t = g.start; t < end; t += 3) if (seen(t)) n++;
      if (!n) return;
      var P = new Float32Array(n * 9), N = new Float32Array(n * 9);
      for (t = g.start, o = 0; t < end; t += 3) {
        if (!seen(t)) continue;
        P.set(pos.subarray(t * 3, t * 3 + 9), o); N.set(nor.subarray(t * 3, t * 3 + 9), o); o += 9;
      }
      self.P[m].push(P); self.N[m].push(N); self.len[m] += n * 9;
    });
    geo.dispose();
  };
  Gather.prototype.geometry = function () {
    var total = this.len[0] + this.len[1], P = new Float32Array(total), N = new Float32Array(total), o = 0, self = this;
    [0, 1].forEach(function (m) {
      for (var k = 0; k < self.P[m].length; k++) { P.set(self.P[m][k], o); N.set(self.N[m][k], o); o += self.P[m][k].length; }
    });
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    geo.addGroup(0, this.len[0] / 3, 0);
    geo.addGroup(this.len[0] / 3, this.len[1] / 3, 1);
    return geo;
  };

  // one canvas drives both the brushing on the faces and the knurl on the edge
  function coinSurface(bandStart, bandEnd) {
    var w = 2048, h = 1024, c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    // concentric machining marks: thin horizontal lines vary along the radius
    for (var y = 0; y < h; y++) {
      var v = 1 - y / h;
      if (v > bandStart && v < bandEnd) continue;
      var shade = 124 + Math.round((Math.random() - 0.5) * 12);
      g.fillStyle = 'rgb(' + shade + ',' + shade + ',' + shade + ')';
      g.fillRect(0, y, w, 1);
    }
    // diamond knurl on the edge band
    var y0 = Math.floor((1 - bandEnd) * h), y1 = Math.ceil((1 - bandStart) * h);
    g.save(); g.beginPath(); g.rect(0, y0, w, y1 - y0); g.clip();
    g.fillStyle = '#6a6a6a'; g.fillRect(0, y0, w, y1 - y0);
    g.strokeStyle = '#d8d8d8'; g.lineWidth = 3;
    var step = 9;
    for (var x = -h; x < w + h; x += step) {
      g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (y1 - y0), y1); g.stroke();
      g.beginPath(); g.moveTo(x, y1); g.lineTo(x + (y1 - y0), y0); g.stroke();
    }
    g.restore();
    var t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
    return t;
  }

  function shadowTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, 'rgba(0,8,24,0.65)'); grd.addColorStop(0.55, 'rgba(0,8,24,0.28)'); grd.addColorStop(1, 'rgba(0,8,24,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  // everything but the logo itself: the coin body, the two faces, the shadow
  function assemble(geos) {
    var enamel = [0x061A3D, 0x1F4626];
    geos[1].computeBoundingBox();
    var bb = geos[1].boundingBox;
    var cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2;
    var ringR = (bb.max.x - bb.min.x) / 2;
    discR = ringR * 1.115;

    // coin body: lathe profile with a raised rim and a straight knurled edge
    var R = discR, H = 9, lip = 3.5;
    var pts = [
      [0.001, -H], [R * 0.935, -H], [R * 0.95, -H - lip], [R * 0.985, -H - lip], [R, -H + 1],
      [R, H - 1], [R * 0.985, H + lip], [R * 0.95, H + lip], [R * 0.935, H], [0.001, H]
    ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    var n = pts.length - 1;
    var surf = coinSurface(4 / n, 5 / n);
    var coinMat = new THREE.MeshStandardMaterial({
      color: 0xcfc8b8, metalness: 1, roughness: 0.42,
      roughnessMap: surf, bumpMap: surf, bumpScale: 0.45
    });
    coinMat.color.convertSRGBToLinear();
    coin = new THREE.Mesh(new THREE.LatheGeometry(pts, POSTER ? 220 : 128), coinMat);
    coin.rotation.x = Math.PI / 2;   // lathe axis Y -> face the camera along Z
    badge.add(coin);

    function buildFace() {
      var face = new THREE.Group(), inner = new THREE.Group(), mats = [];
      geos.forEach(function (geo, i) {
        var top = new THREE.MeshPhysicalMaterial({ color: enamel[i] || enamel[0], metalness: 0, roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 0.25, transparent: true });
        var side = new THREE.MeshStandardMaterial({ color: 0xe2dccf, metalness: 1, roughness: 0.2, transparent: true });
        top.color.convertSRGBToLinear(); side.color.convertSRGBToLinear();
        inner.add(new THREE.Mesh(geo, [top, side]));
        mats.push(top, side);
      });
      inner.scale.set(1, -1, 1);
      inner.position.set(-cx, cy, 0);
      face.add(inner);
      face.userData.mats = mats;
      return face;
    }
    front = buildFace(); front.position.z = H - 1;
    back = buildFace(); back.rotation.y = Math.PI; back.position.z = -(H - 1);
    badge.add(front, back);
    scene.add(badge);

    shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, toneMapped: false }));
    shadow.position.set(0, -R * 0.06, -R * 0.55);
    shadow.renderOrder = -1;
    scene.add(shadow);
  }

  // the intro's still is rendered from this path, unchanged, so it keeps matching what's already published
  function buildPoster(svgText) {
    if (!makeRenderer()) return;
    makeEnvironment();
    var data = new THREE.SVGLoader().parse(svgText);
    assemble(data.paths.map(function (path) {
      return new THREE.ExtrudeGeometry(THREE.SVGLoader.createShapes(path),
        { depth: 7, bevelEnabled: true, bevelThickness: 2.2, bevelSize: 1.1, bevelSegments: 3, curveSegments: 12 });
    }));
    vw = vh = POSTER.size;
    renderer.setSize(vw, vh, false);
    place(vw / 2, vh / 2, vw * COIN_FRACTION);
    pose(POSTER.t || 0, 1);
    renderer.render(scene, camera);
    window.FWSW_COIN_POSTER.done = renderer.domElement.toDataURL('image/png');
  }

  // the live coin: geometry in small steps, then the graphics work one piece at a time in pauses between scrolls
  function build(svgText) {
    var data, gathers = [], jobs = [];
    jobs.push(function () { data = new THREE.SVGLoader().parse(svgText); });
    jobs.push(function () {
      data.paths.forEach(function (path, p) {
        var g = gathers[p] = new Gather();
        jobs.push(function () {
          // createShapes samples each outline with getPoints(); hand it the adaptive points instead
          path.subPaths.forEach(function (sp) { sp.getPoints = function () { return flatten(this); }; });
          THREE.SVGLoader.createShapes(path).forEach(function (shape) {
            jobs.push(function () { g.add(new THREE.ExtrudeGeometry(shape, EXTRUDE)); });
          });
        });
      });
    });
    sliced(jobs, function () { whenQuietLater(finish); });
    function finish() {
      assemble(gathers.map(function (g) { return g.geometry(); }));
      measure();
      // compile each kind of material separately, each in a pause between scrolls, while the coin is still hidden
      // behind its still; whatever isn't being compiled yet is hidden for that render
      var steps = [
        function () { if (!makeRenderer()) steps.length = 0; },
        function () { makeEnvironment(); },
        function () { warm([coin]); },
        function () { warm([coin, front]); },
        function () { warm([coin, front, shadow]); },
        start
      ];
      (function next() { if (steps.length) whenQuietLater(function () { steps.shift()(); setTimeout(next, 60); }); })();
    }
  }
  function warm(visible) {
    var s = spot();
    blend = s.blend;
    fit(s.cx, s.cy, s.d, wantDpr(blend < 1), blend === 1);
    pose(animT, reduce ? 0 : 1 - blend);
    [coin, front, back, shadow].forEach(function (o) { o.visible = visible.indexOf(o) >= 0; });
    renderer.render(scene, camera);
  }
  function start() {
    back.visible = shadow.visible = true;
    onScroll(); current = target; frame(performance.now());
    try { window.dispatchEvent(new Event('fwsw-coin-ready')); } catch (e) {}
    window.addEventListener('resize', function () { measure(); frame(performance.now()); });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });
    window.addEventListener('fwsw-lite', function () { frame(performance.now()); });
    ['pointermove', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, function () { var idleWasOff = performance.now() - lastActive > REST_AFTER; lastActive = performance.now(); if (idleWasOff) wake(); }, { passive: true });
    });
  }

  // ---------- drawing ----------

  // a face is fully visible facing the viewer and fades out as it turns away
  function setFace(face, facing) {
    var t = Math.min(1, Math.max(0, (facing - 0.05) / 0.35));
    var o = t * t * (3 - 2 * t);
    face.visible = o > 0.001;
    face.userData.mats.forEach(function (m) { m.opacity = o; m.depthWrite = o > 0.98; });
  }

  function measure() {
    vw = window.innerWidth; vh = window.innerHeight;
    heroBox = heroImg && heroImg.offsetWidth ? true : null;
  }

  // poster: put the coin's center at (cx, cy) on the canvas, d pixels across, seen straight on
  function place(cx, cy, d) {
    var FW = 2 * Math.max(cx, vw - cx), FH = 2 * Math.max(cy, vh - cy);
    camera.aspect = FW / FH;
    camera.position.z = (2 * discR * FH) / (d * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.setViewOffset(FW, FH, FW / 2 - cx, FH / 2 - cy, vw, vh);
    camera.updateProjectionMatrix();
  }

  // live: the camera frames the whole screen around the coin exactly as a full-screen canvas would, but the canvas
  // itself only covers the box around the coin, so only those pixels are drawn. The background coin never moves,
  // so its box is also trimmed to the screen.
  function fit(cx, cy, d, dpr, trim) {
    var side = d * BOX, w = trim ? Math.min(side, vw) : side, h = trim ? Math.min(side, vh) : side;
    var needW = Math.ceil(w * dpr), needH = Math.ceil(h * dpr);
    if (dpr !== box.dpr || needW > box.W || needW < box.W - 24 || needH > box.H || needH < box.H - 24) {
      box.W = needW; box.H = needH; box.dpr = dpr;
      renderer.setSize(needW, needH, false);
      canvas.style.width = (needW / dpr) + 'px'; canvas.style.height = (needH / dpr) + 'px';
      box.x = box.y = NaN;
    }
    var bw = box.W / dpr, bh = box.H / dpr;
    var x = Math.round(cx - bw / 2), y = Math.round(cy - bh / 2);   // whole CSS pixels: browsers place layers on them exactly
    if (x !== box.x || y !== box.y) { box.x = x; box.y = y; canvas.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; }
    var FW = 2 * Math.max(cx, vw - cx), FH = 2 * Math.max(cy, vh - cy);
    camera.aspect = FW / FH;
    camera.position.z = (2 * discR * FH) / (d * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.setViewOffset(FW, FH, FW / 2 - cx + x, FH / 2 - cy + y, bw, bh);
    camera.updateProjectionMatrix();
  }

  // idle: 0 = still, 1 = full opening sway; t in seconds since the coin appeared
  function pose(t, idle) {
    var sway = idle * (0.24 * Math.sin(t * 0.52) + 0.05 * Math.sin(t * 1.27));
    var tilt = idle * 0.045 * Math.sin(t * 0.81 + 0.6);
    var rot = current + sway;
    badge.rotation.y = rot;
    badge.rotation.x = Math.sin(current) * 0.08 + tilt;
    var facing = Math.cos(rot);
    setFace(front, facing);
    setFace(back, -facing);
    var spread = 0.18 + 0.82 * Math.abs(facing);
    shadow.scale.set(discR * 2.5 * spread, discR * 2.3, 1);
    // the glint starts upper left, drifts across to the right and back (about 19 s round trip)
    var k = 0.5 - 0.5 * Math.cos(t * 0.33);
    sweep.position.set(discR * (-1.15 + 2.3 * k), discR * (0.75 - 0.35 * Math.sin(t * 0.21)), discR * 1.05);
    sweep.intensity = 1.25 * idle;
  }

  // where the coin goes this frame: over the intro's still while any of the intro is on screen, otherwise centered
  function spot() {
    var s = { cx: vw / 2, cy: vh / 2, d: 0.8 * Math.min(vw, vh), blend: 1 };
    if (heroBox) {
      // read the still's live position every frame, so the coin can never drift from it
      var r = heroImg.getBoundingClientRect(), ib = intro ? intro.getBoundingClientRect().bottom : r.bottom;
      if (ib > 1) { s.blend = 0; s.cx = r.left + r.width / 2; s.cy = r.top + r.height / 2; s.d = r.width * COIN_FRACTION; }
    }
    return s;
  }

  function frame(now) {
    var s = spot();
    blend = s.blend;
    if (!shown) {
      // over the intro the live coin appears at full strength right under the still, then the still fades;
      // anywhere else it fades in. After that, opacity follows the scroll directly.
      if (blend < 1) host.style.transition = 'none';
      else setTimeout(function () { host.style.transition = 'none'; }, 950);
    }
    host.style.opacity = String(1 - 0.4 * blend);
    if (glow && blend < 1 && Math.abs(s.cy - lastGlowY) > 0.5) {      // the spotlight behind the coin follows it
      lastGlowY = s.cy;
      glow.style.transform = 'translate3d(0,' + s.cy.toFixed(1) + 'px,0)';
    }
    if (shown && filmCover) {
      var fr = filmCover.getBoundingClientRect(), cover = fr.top <= 0 && fr.bottom >= vh;
      if (cover !== hidden) { hidden = cover; host.style.visibility = cover ? 'hidden' : ''; }
      if (cover) return;
    }
    fit(s.cx, s.cy, s.d, wantDpr(blend < 1), blend === 1);
    var idle = reduce ? 0 : 1 - blend;
    // the sway's clock only runs while it's animating, so after a rest it picks up where it stopped
    if (idle > 0) { if (idleOn && idleStart) animT += Math.min(0.1, (now - idleStart) / 1000); idleOn = true; idleStart = now; }
    else idleOn = false;
    pose(animT, idle);
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      host.classList.add('is-ready');
      if (heroImg) requestAnimationFrame(function () { heroImg.classList.add('is-live'); });
    }
  }

  function onScroll() {
    lastActive = performance.now();
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    target = (window.scrollY / max) * Math.PI * 2;
    wake();
  }

  function wake() { if (!running) { running = true; lastTick = 0; requestAnimationFrame(tick); } }

  function tick(now) {
    // ease toward the scroll position at the same speed whatever the frame rate
    var dt = lastTick ? Math.min(0.1, (now - lastTick) / 1000) : 1 / 60;
    lastTick = now;
    current += (target - current) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
    if (Math.abs(target - current) < 0.0005) current = target;
    // the opening sway keeps going while the intro is on screen (30 fps is plenty for a motion this slow)
    // (lite mode skips the sway: the coin holds still until the page scrolls)
    var idling = heroBox && blend < 1 && !reduce && !window.FWSW_LITE && !document.hidden && now - lastActive < REST_AFTER;
    if (current !== target || !idling || now - lastIdle > 32) { frame(now); lastIdle = now; }
    if (current !== target || idling) requestAnimationFrame(tick); else { running = false; idleOn = false; }
  }
})();
