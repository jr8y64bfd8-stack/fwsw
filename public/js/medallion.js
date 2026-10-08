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
   still and the live coin's first frame match. */
(function () {
  var host = window.FWSW_COIN_POSTER ? document.body : document.getElementById('medallion');
  if (!host || !window.THREE || !THREE.SVGLoader) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: !!window.FWSW_COIN_POSTER });
  } catch (e) { return; }
  renderer.setPixelRatio(window.FWSW_COIN_POSTER ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 1, 8000);

  // studio reflections
  if (THREE.RoomEnvironment) {
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
  }
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a3550, 0.35));
  var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-500, 650, 900); scene.add(key);
  var rim = new THREE.DirectionalLight(0xffe2a8, 0.6); rim.position.set(700, -250, -300); scene.add(rim);

  var badge = new THREE.Group();
  var front, back, shadow, discR = 300;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var target = 0, current = 0, running = false;
  var POSTER = window.FWSW_COIN_POSTER || null;
  var COIN_FRACTION = 0.78;            // coin diameter / still image width (room for the shadow)
  var heroImg = POSTER ? null : document.querySelector('[data-coin-hero]');
  var intro = POSTER ? null : document.querySelector('.intro');
  var heroBox = null;                  // true while the page has an intro still to sit on
  var blend = 1, idleOn = false, idleStart = 0, lastIdle = 0, shown = false, animT = 0;
  var lastActive = performance.now(), REST_AFTER = 60000;   // the opening sway rests after a minute with no activity
  var vw = 1, vh = 1, lastGlowY = -1;
  var backdrop = POSTER ? null : document.querySelector('.backdrop');

  // a small studio light that travels close across the face while the coin is the opening scene,
  // so a glint moves over the metal instead of the whole face lighting up at once
  var sweep = new THREE.PointLight(0xfff1dc, 0, 1500, 1.4);
  scene.add(sweep);

  fetch('images/brand/logo.svg').then(function (r) { return r.text(); }).then(build).catch(function () {});

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

  function build(svgText) {
    var data = new THREE.SVGLoader().parse(svgText);
    var enamel = [0x061A3D, 0x1F4626];
    var geos = data.paths.map(function (path) {
      return new THREE.ExtrudeGeometry(THREE.SVGLoader.createShapes(path),
        { depth: 7, bevelEnabled: true, bevelThickness: 2.2, bevelSize: 1.1, bevelSegments: 3, curveSegments: 12 });
    });
    geos[1].computeBoundingBox();
    var box = geos[1].boundingBox;
    var cx = (box.min.x + box.max.x) / 2, cy = (box.min.y + box.max.y) / 2;
    var ringR = (box.max.x - box.min.x) / 2;
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
    var coin = new THREE.Mesh(new THREE.LatheGeometry(pts, 220), coinMat);
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

    if (POSTER) {
      vw = vh = POSTER.size;
      renderer.setSize(vw, vh, false);
      place(vw / 2, vh / 2, vw * COIN_FRACTION);
      pose(POSTER.t || 0, 1);
      renderer.render(scene, camera);
      window.FWSW_COIN_POSTER.done = renderer.domElement.toDataURL('image/png');
      return;
    }
    measure(); onScroll(); current = target; frame(performance.now());
    window.addEventListener('resize', function () { measure(); frame(performance.now()); });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });
    ['pointermove', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, function () { var idleWasOff = performance.now() - lastActive > REST_AFTER; lastActive = performance.now(); if (idleWasOff) wake(); }, { passive: true });
    });
  }

  // a face is fully visible facing the viewer and fades out as it turns away
  function setFace(face, facing) {
    var t = Math.min(1, Math.max(0, (facing - 0.05) / 0.35));
    var o = t * t * (3 - 2 * t);
    face.visible = o > 0.001;
    face.userData.mats.forEach(function (m) { m.opacity = o; m.depthWrite = o > 0.98; });
  }

  function measure() {
    vw = window.innerWidth; vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    heroBox = heroImg && heroImg.offsetWidth ? true : null;
  }

  // put the coin's center at (cx, cy) on screen, d pixels across, seen straight on
  function place(cx, cy, d) {
    var FW = 2 * Math.max(cx, vw - cx), FH = 2 * Math.max(cy, vh - cy);
    camera.aspect = FW / FH;
    camera.position.z = (2 * discR * FH) / (d * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.setViewOffset(FW, FH, FW / 2 - cx, FH / 2 - cy, vw, vh);
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

  function frame(now) {
    var cx = vw / 2, cy = vh / 2, d = 0.8 * Math.min(vw, vh);
    // while any of the intro is on screen the coin rides along with it, exactly where the still sits;
    // once the intro has scrolled away the film covers the screen, and the coin quietly becomes the background coin
    blend = 1;
    if (heroBox) {
      // read the still's live position every frame, so the coin can never drift from it
      var r = heroImg.getBoundingClientRect(), ib = intro ? intro.getBoundingClientRect().bottom : r.bottom;
      if (ib > 1) { blend = 0; cx = r.left + r.width / 2; cy = r.top + r.height / 2; d = r.width * COIN_FRACTION; }
    }
    if (!shown) {
      // over the intro the live coin appears at full strength right under the still, then the still fades;
      // anywhere else it fades in. After that, opacity follows the scroll directly.
      if (blend < 1) host.style.transition = 'none';
      else setTimeout(function () { host.style.transition = 'none'; }, 950);
    }
    place(cx, cy, d);
    host.style.opacity = String(1 - 0.4 * blend);
    if (backdrop && Math.abs(cy - lastGlowY) > 0.5) {      // the spotlight behind the coin follows it
      lastGlowY = cy;
      backdrop.style.setProperty('--coin-y', (cy / vh * 100).toFixed(2) + '%');
    }
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

  function wake() { if (!running) { running = true; requestAnimationFrame(tick); } }

  function tick(now) {
    current += (target - current) * (reduce ? 1 : 0.08);
    if (Math.abs(target - current) < 0.0005) current = target;
    // the opening sway keeps going while the intro is on screen (about 40 fps is plenty)
    var idling = heroBox && blend < 1 && !reduce && !document.hidden && now - lastActive < REST_AFTER;
    if (current !== target || !idling || now - lastIdle > 24) { frame(now); lastIdle = now; }
    if (current !== target || idling) requestAnimationFrame(tick); else { running = false; idleOn = false; }
  }
})();
