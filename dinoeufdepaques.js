var y = [
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255,
  255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255,
  255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32,
  33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
];
function R(n) {
  if (n >= y.length) throw new Error("Unable to parse base64 string.");
  let e = y[n];
  if (e === 255) throw new Error("Unable to parse base64 string.");
  return e;
}
function Q(n) {
  let e = n.length % 4,
    t = n;
  e !== 0 && (t += e === 3 ? "=" : e === 2 ? "==" : "===");
  let l = t.indexOf("=");
  if (l !== -1 && l < t.length - 2)
    throw new Error("Unable to parse base64 string.");
  let o = t.endsWith("==") ? 2 : t.endsWith("=") ? 1 : 0,
    r = t.length,
    g = new Uint8Array((r / 4) * 3),
    m;
  for (let u = 0, P = 0; u < r; u += 4, P += 3)
    (m =
      (R(t.charCodeAt(u)) << 18) |
      (R(t.charCodeAt(u + 1)) << 12) |
      (R(t.charCodeAt(u + 2)) << 6) |
      R(t.charCodeAt(u + 3))),
      (g[P] = m >> 16),
      (g[P + 1] = (m >> 8) & 255),
      (g[P + 2] = m & 255);
  return g.subarray(0, g.length - o);
}
var T = M(
    "UklGRuwAAABXRUJQVlA4WAoAAAAQAAAAVwAAVAAAQUxQSE0AAAABDzD/ERGCUdtIkiItgOLPZiE1g3rMXXu8I/o/AbRlW6S43VFR7Q8Qwwg7QkDZkHI7xuA2RNVUSJ/3qSNaIqsaUrCtnDK+csQ4gSgdAgBWUDggeAAAAFAJAJ0BKlgAVQA+bSiRRaQiIZjuzABABsS0gAtqXwB/IPf97/CNxcHcc2w/unx9sLS9x6k8GLk0kRXF7wka9obb/mK8UuRZ9K/WzCHrJnw7ofAAAP77nVn5i39pMNLzvCdWDa9Bheh14NumBGnRsEDNUK+pEAAAAA==",
    "image/webp",
  ),
  b = M(
    "UklGRuYAAABXRUJQVlA4WAoAAAAQAAAAVwAAVAAAQUxQSEkAAAABDzD/ERGCTSNJjprB8mfzkIZBB+/nTRzR/wlgHXVocX1FqtY/YNit0IoBotCyWCO4LpmsUrLN++SWOUVXVrSgTk8mRUgTZd4CAFZQOCB2AAAA8AgAnQEqWABVAD5tKJJFpCIhmH8kAEAGxLSAC2pfAH8l9/3v8IyJGmsC/PZUxXKIF9DFBJAYuoiRFcXvCMBregvJVb4Xj+uuCzecZbL5XwAA/vudWieLf2kw3ie36lL47jU36HXg26YEac9949i5P//piwAAAA==",
    "image/webp",
  ),
  a = M(
    "UklGRsgAAABXRUJQVlA4WAoAAAAQAAAAMQAAaAAAQUxQSEcAAAABDzD/ERGCURtJjlpaAENlGQz1gXThO9LmHN4R/Z8AQAlpwfHphOoeLmmDM5eWUoMpaYLS45zjCnGOUQHcm635HaOmXRrWBgBWUDggWgAAAFAGAJ0BKjIAaQA+ZSaPRaQiIRrfJABABkS0gABFY1QPcemKs+XBlVsTKxrD+ICRG5uaseo2YNyxxnwAAP78Xjf+Ur//KqkMgAAMn8fWz8X7X4CKZ/OwAAAAAA==",
    "image/webp",
  );
function M(n, e) {
  let t = Q(n),
    l = new Blob([t.buffer], { type: e }),
    o = URL.createObjectURL(l),
    r = new Image();
  return (r.src = o), r;
}
var q = [13, 32, 38],
  $ = [37],
  S = 350,
  d = 1e3,
  ee = 30,
  w = 30,
  x = 400,
  te = 20,
  B = 15,
  V = 2,
  ne = 15,
  k = 12e4,
  _ = 180,
  oe = 40,
  G = 3,
  v = 10,
  N = S - (w + 30),
  I = new AbortController(),
  f = document.createElement("div");
f.style.position = "fixed";
f.style.top = "0px";
f.style.left = "0px";
f.style.width = "100%";
f.style.textAlign = "center";
f.style.zIndex = String(Math.pow(2, 32));
var h = document.createElement("canvas"),
  i = h.getContext("2d");
h.height = S;
h.width = d;
h.style.backgroundColor = "#ffffffcc";
h.style.border = "1px dashed black";
f.appendChild(h);
I.signal.addEventListener("abort", () => {
  f.parentElement.removeChild(f);
});
var W = !1,
  D,
  C,
  p = !0,
  L = !0,
  A = null,
  E = x,
  U = B,
  s = [],
  c = [];
function ie() {
  (W = !0),
    (D = void 0),
    (C = void 0),
    (p = !0),
    (L = !0),
    (A = null),
    (E = x),
    (U = B),
    (s.length = 0),
    (c.length = 0),
    j(800, 1),
    Z(0),
    window.requestAnimationFrame(J);
}
var se = new Promise((n) => {
  document.readyState === "complete" || document.readyState, n();
});
Promise.all([X(T), X(b), X(a), se]).then(() => {
  if (I.signal.aborted) return;
  document.body.appendChild(f);
  let n = (e) => {
    $.includes(e.keyCode)
      ? I.abort()
      : q.includes(e.keyCode) &&
        (e.preventDefault(),
        e.stopPropagation(),
        e.stopImmediatePropagation(),
        O());
  };
  K(0),
    F(),
    z(),
    document.addEventListener("keydown", n),
    h.addEventListener("click", O),
    I.signal.addEventListener("abort", () => {
      document.removeEventListener("keydown", n),
        h.removeEventListener("click", O);
    }),
    (i.font = "24px monospace"),
    (i.fillStyle = "#000000"),
    i.fillText('Jump ("space", "up", or "enter") to start', 10, 80),
    i.fillText('Press "left" to exit', 10, 120);
});
function J(n) {
  if (I.signal.aborted) return;
  D === void 0 && (D = n);
  let e = C === void 0 ? 0 : n - C;
  for (C = n; e > 0; ) {
    let t = e < v ? e : v;
    e -= t;
    let o = C - e - D,
      r = Math.min(o / k, 1) * (te - x) + x;
    if (A !== null && ((U -= t), U <= 0)) {
      A >= _ && ((L = !1), (A = _));
      let m = (_ - A) / _,
        u = Math.ceil(oe * m);
      u < G && (u = G),
        L
          ? ((A += u), (A = Math.min(A, _)))
          : A - u <= 0
            ? ((L = !0), (A = null), (E = r), (p = !p))
            : (A -= u),
        (U += B);
    }
    E !== null && ((E -= t), E <= 0 && ((p = !p), (E += r)));
    let g = Math.min(o / k, 1) * (ne - V) + V;
    if ((Ae(g), ce(g), ae())) {
      H(o), le(), (W = !1);
      return;
    }
  }
  H(n - D), window.requestAnimationFrame(J);
}
function H(n) {
  re(), K(n), F(), fe(), ue(), z();
}
function F() {
  i.beginPath(), i.moveTo(0, N), i.lineTo(d, N), (i.lineWidth = 2), i.stroke();
}
function re() {
  i.clearRect(0, 0, d, S);
}
function O() {
  if (!W) {
    ie();
    return;
  }
  A === null && ((A = 0), (E = null));
}
function ae() {
  let [n, e] = Y();
  for (let t of s)
    if (
      !(t < 10) &&
      !(e > 65 && L) &&
      t + 20 - (n + T.naturalWidth) <= 0 &&
      e - (w + (a.naturalHeight - 30)) <= 0
    )
      return !0;
  return !1;
}
function K(n) {
  (i.font = "18px monospace"),
    i.fillText("Score: " + String(Math.floor(n / 200)), 10, 30);
}
function le() {
  (i.font = "35px monospace"),
    (i.fillStyle = "#990000"),
    i.fillText("GAME OVER", 10, 80),
    (i.font = "24px monospace"),
    (i.fillStyle = "#000000"),
    i.fillText("jump to restart", 10, 120),
    i.fillText('Press "left" to exit', 10, 160);
}
function Y() {
  let n = ee,
    e = w + (A != null ? A : 0);
  return [n, e];
}
function z() {
  let n = p ? T : b,
    [e, t] = Y();
  i.drawImage(n, e, S - n.naturalHeight - t, n.naturalWidth, n.naturalHeight);
}
function Ae(n) {
  for (let t = 0; t < s.length; t++) {
    let o = s[t] - n;
    if (o < -a.naturalWidth) {
      s.splice(t, 1), t--;
      continue;
    }
    s[t] = o;
  }
  let e = s[s.length - 1];
  (e === void 0 || e <= d) && j(e != null ? e : d, n / 2);
}
function ue() {
  for (let n = 0; n < s.length; n++) {
    let e = s[n];
    if (e >= d) return;
    let t = w;
    i.drawImage(a, e, S - a.naturalHeight - t, a.naturalWidth, a.naturalHeight);
  }
}
function ce(n) {
  for (let t = 0; t < c.length; t++) {
    let { x: l, longueur: o } = c[t],
      r = l - n;
    r < -o ? (c.splice(t, 1), t--) : (c[t].x = r);
  }
  let e = c[c.length - 1];
  (e === void 0 || e.x <= d) && Z(d);
}
function fe() {
  i.lineWidth = 1;
  for (let n = 0; n < c.length; n++) {
    let { x: e, y: t, longueur: l } = c[n];
    if (e >= d) return;
    i.beginPath(), i.moveTo(e, t), i.lineTo(e + l, t), i.stroke();
  }
}
function X(n) {
  return new Promise((e, t) => {
    n.addEventListener("load", e), n.addEventListener("error", t);
  });
}
function j(n, e) {
  let t = n;
  s.push(t);
  for (let l = 1; l <= 3; l++) {
    let o = t + a.naturalWidth + 590,
      r = Math.random();
    e >= 3 && r < 0.3
      ? (e >= 5 &&
          r < 0.1 &&
          (s.push(o),
          (o += a.naturalWidth + 1),
          s.push(o),
          (o += a.naturalWidth + 1)),
        e >= 4 && r < 0.2 && (s.push(o), (o += a.naturalWidth + 1)),
        s.push(o),
        (o += a.naturalWidth + 1),
        s.push(o),
        (o += a.naturalWidth + 1),
        s.push(o),
        (o += a.naturalWidth + 1))
      : r > 0.9
        ? (e >= 2 && (s.push(o), (o += a.naturalWidth + 1)),
          s.push(o),
          (o += a.naturalWidth + 1))
        : r > 0.7
          ? (e >= 2 && (s.push(o), (o += a.naturalWidth + 1)), s.push(o))
          : (o += 250 * r),
      s.push(o),
      (t = o);
  }
  s.sort((l, o) => l - o);
}
function Z(n) {
  for (let e = 1; e <= 1e3; e++) {
    let t = Math.random(),
      l = (t * 2 - 1) * 0.7;
    c.push({
      x: n + e * 100 * (1 + l),
      y: t * (S - (N + 5) + 1) + (N + 5),
      longueur: t * 40 + 1,
    });
  }
  c.sort((e, t) => e.x - t.x);
}
