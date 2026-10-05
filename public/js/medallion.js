/* Two-sided 3D logo medallion that turns behind the page as it scrolls.
   Built from images/brand/logo.svg (a vector trace of the logo), so it is
   drawn fresh at screen resolution and never pixelates. Renders only while
   it is moving, to save battery. */
(function () {
  var host = document.getElementById('medallion');
  if (!host || !window.THREE || !THREE.SVGLoader) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 1, 6000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a5a, 0.85));
  var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(-400, 500, 900); scene.add(key);
  var rim = new THREE.DirectionalLight(0xffe7b0, 0.35); rim.position.set(600, -200, -400); scene.add(rim);

  var badge = new THREE.Group();
  var front, back, discR = 300;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var target = 0, current = 0, running = false;

  fetch('images/brand/logo.svg').then(function (r) { return r.text(); }).then(build).catch(function () {});

  function build(svgText) {
    var data = new THREE.SVGLoader().parse(svgText);
    var colors = [0x0B2D63, 0x3A5E3A];
    var geos = data.paths.map(function (path) {
      return new THREE.ExtrudeGeometry(THREE.SVGLoader.createShapes(path),
        { depth: 14, bevelEnabled: true, bevelThickness: 2, bevelSize: 0.8, bevelSegments: 2, curveSegments: 10 });
    });
    geos[1].computeBoundingBox();
    var box = geos[1].boundingBox;
    var cx = (box.min.x + box.max.x) / 2, cy = (box.min.y + box.max.y) / 2;
    var ringR = (box.max.x - box.min.x) / 2;
    discR = ringR * 1.115;

    function buildFace() {
      var face = new THREE.Group(), inner = new THREE.Group();
      var mats = geos.map(function (geo, i) {
        var mat = new THREE.MeshStandardMaterial({ color: colors[i] || 0x0B2D63, metalness: 0.45, roughness: 0.38, transparent: true });
        mat.color.convertSRGBToLinear();
        inner.add(new THREE.Mesh(geo, mat));
        return mat;
      });
      inner.scale.set(1, -1, 1);
      inner.position.set(-cx, cy, 0);
      face.add(inner);
      face.userData.mats = mats;
      return face;
    }
    front = buildFace(); front.position.z = 6;
    back = buildFace(); back.rotation.y = Math.PI; back.position.z = -12;
    badge.add(front, back);

    var disc = new THREE.Mesh(
      new THREE.CylinderGeometry(discR, discR, 18, 128),
      [new THREE.MeshStandardMaterial({ color: 0xbdb3a0, metalness: 0.7, roughness: 0.42 }),
       new THREE.MeshStandardMaterial({ color: 0xe9e4d8, metalness: 0.35, roughness: 0.5 }),
       new THREE.MeshStandardMaterial({ color: 0xc9b48a, metalness: 0.6, roughness: 0.45 })]
    );
    disc.material.forEach(function (m) { m.color.convertSRGBToLinear(); });
    disc.rotation.x = Math.PI / 2;
    disc.position.z = -3;
    badge.add(disc);
    scene.add(badge);

    resize(); onScroll(); current = target; draw();
    host.classList.add('is-ready');
    window.addEventListener('resize', function () { resize(); draw(); });
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // a face is fully visible facing the viewer and fades out as it turns away
  function setFace(face, facing) {
    var t = Math.min(1, Math.max(0, (facing - 0.05) / 0.35));
    var o = t * t * (3 - 2 * t);
    face.visible = o > 0.001;
    face.userData.mats.forEach(function (m) { m.opacity = o; m.depthWrite = o > 0.98; });
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    var fitH = (discR * 2.5) / Math.min(1, camera.aspect);
    camera.position.z = fitH / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix();
  }

  function onScroll() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    target = (window.scrollY / max) * Math.PI * 2;
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function draw() {
    badge.rotation.y = current;
    badge.rotation.x = Math.sin(current) * 0.08;
    var facing = Math.cos(current);
    setFace(front, facing);
    setFace(back, -facing);
    renderer.render(scene, camera);
  }

  function tick() {
    current += (target - current) * (reduce ? 1 : 0.08);
    if (Math.abs(target - current) < 0.0005) current = target;
    draw();
    if (current !== target) requestAnimationFrame(tick); else running = false;
  }
})();
