/* Scroll film frames for the home page.
   Runs in a background worker: fetches each frame once, keeps it compressed, and decodes it into a
   ready-to-draw bitmap whenever the page asks, so the page's own thread never stops to unpack an image. */
var sets = {};

onmessage = function (e) {
  var m = e.data;
  if (m.type === 'load') load(m);
  else if (m.type === 'decode') decode(m);
  else if (m.type === 'drop') delete sets[m.gen];
};

function load(m) {
  var s = sets[m.gen] = { blobs: [] }, next = 0, active = 0;
  function pump() {
    while (sets[m.gen] === s && active < 6 && next < m.order.length) get(m.order[next++]);
  }
  function get(i) {
    active++;
    fetch(m.urls[i]).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.blob();
    }).then(function (b) {
      active--;
      if (sets[m.gen] !== s) return;
      s.blobs[i] = b;
      postMessage({ type: 'have', gen: m.gen, i: i });
      pump();
    }, function () { active--; pump(); });
  }
  pump();
}

function decode(m) {
  var s = sets[m.gen], b = s && s.blobs[m.i];
  if (!b) { postMessage({ type: 'error', gen: m.gen, i: m.i }); return; }
  if (typeof createImageBitmap !== 'function') { postMessage({ type: 'nodecode', gen: m.gen, i: m.i }); return; }
  createImageBitmap(b).then(function (bmp) {
    postMessage({ type: 'bmp', gen: m.gen, i: m.i, bmp: bmp }, [bmp]);
  }, function () {
    postMessage({ type: 'error', gen: m.gen, i: m.i });
  });
}
