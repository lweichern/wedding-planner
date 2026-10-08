/* ------------------------------------------------------------------
   Wax seals and parchment
   Every seal on the page is generated: an irregular rim with a drip or
   two, a domed highlight, a pressed well, and an engraved motif. A
   seeded random keeps each seal the same on every load while making
   every seal on the page different, the way hand-pressed wax is.
   ------------------------------------------------------------------ */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const f2 = (n) => Math.round(n * 100) / 100;

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; };
  }
  function el(name, attrs, children) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) {
      if (k === "href") { n.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", attrs[k]); n.setAttribute("href", attrs[k]); }
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach((c) => n.appendChild(c));
    return n;
  }

  const COLOURS = {
    burgundy: { light: "#b8424f", base: "#7a1f2b", dark: "#4a0f18" },
    forest: { light: "#5f8a6e", base: "#2f4a3a", dark: "#172a20" },
    navy: { light: "#4f6a8f", base: "#233c5a", dark: "#121f33" },
    gold: { light: "#dcb86a", base: "#b48a3c", dark: "#6e4f1a" },
  };

  /* an irregular rim: a closed curve around the centre with low-frequency bumps */
  function rimPath(rand, cx, cy, r) {
    const pts = [];
    const n = 48;
    const b1 = rand() * Math.PI * 2, b2 = rand() * Math.PI * 2, b3 = rand() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 + 0.045 * Math.sin(a * 3 + b1) + 0.03 * Math.sin(a * 5 + b2) + 0.02 * Math.sin(a * 9 + b3) + (rand() - 0.5) * 0.02);
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % n];
      const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      d += ` Q${f2(p0[0])} ${f2(p0[1])} ${f2(m[0])} ${f2(m[1])}`;
    }
    return d + " Z";
  }

  function seal(container, opts) {
    const o = Object.assign({ colour: "burgundy", motif: "olive", text: "", seed: 1, cracks: false, drips: 2 }, opts || {});
    const c = COLOURS[o.colour] || COLOURS.burgundy;
    const rand = rng(o.seed);
    const id = "s" + o.seed + Math.floor(rand() * 1e6);
    const svg = el("svg", { viewBox: "0 0 120 120", class: "wax", "aria-hidden": "true", focusable: "false" });

    const defs = el("defs");
    defs.appendChild(el("radialGradient", { id: id + "g", cx: "38%", cy: "32%", r: "72%" }, [
      el("stop", { offset: "0", "stop-color": c.light }),
      el("stop", { offset: ".45", "stop-color": c.base }),
      el("stop", { offset: "1", "stop-color": c.dark }),
    ]));
    defs.appendChild(el("filter", { id: id + "f", x: "-20%", y: "-20%", width: "140%", height: "150%", "color-interpolation-filters": "sRGB" }, [
      el("feDropShadow", { dx: "0", dy: "2.5", stdDeviation: "2.2", "flood-color": "#2a1208", "flood-opacity": ".45" }),
    ]));
    defs.appendChild(el("filter", { id: id + "b", x: "-20%", y: "-20%", width: "140%", height: "140%" }, [el("feGaussianBlur", { stdDeviation: "2.2" })]));
    svg.appendChild(defs);

    const body = el("g", { filter: `url(#${id}f)` });
    // drips: a couple of blobs that spilled past the rim
    for (let i = 0; i < o.drips; i++) {
      const a = rand() * Math.PI * 2;
      const d = 44 + rand() * 8;
      body.appendChild(el("ellipse", { cx: f2(60 + d * Math.cos(a)), cy: f2(60 + d * Math.sin(a)), rx: f2(5 + rand() * 5), ry: f2(4 + rand() * 4), fill: `url(#${id}g)`, transform: `rotate(${f2(rand() * 180)} ${f2(60 + d * Math.cos(a))} ${f2(60 + d * Math.sin(a))})` }));
    }
    body.appendChild(el("path", { d: rimPath(rand, 60, 60, 46), fill: `url(#${id}g)` }));
    svg.appendChild(body);

    // the dome: a soft highlight top-left and a shadowed foot bottom-right
    svg.appendChild(el("ellipse", { cx: 46, cy: 42, rx: 20, ry: 12, fill: "#fff", opacity: ".22", filter: `url(#${id}b)`, transform: "rotate(-30 46 42)" }));
    // the pressed well where the matrix sat
    svg.appendChild(el("circle", { cx: 60, cy: 60, r: 36, fill: "none", stroke: c.dark, "stroke-width": "2.6", opacity: ".55" }));
    svg.appendChild(el("circle", { cx: 59, cy: 59, r: 35.5, fill: "none", stroke: "#fff", "stroke-width": "1", opacity: ".28" }));
    svg.appendChild(el("circle", { cx: 60, cy: 60, r: 31, fill: "none", stroke: c.dark, "stroke-width": ".8", opacity: ".35", "stroke-dasharray": "1.5 2.5" }));

    // the engraving: light pass offset down-right, dark pass on top, so it reads as pressed in
    const engraved = (node, light) => {
      node.setAttribute("fill", "none");
      node.setAttribute("stroke", light ? "#fff" : c.dark);
      node.setAttribute("stroke-opacity", light ? ".45" : ".9");
      node.setAttribute("stroke-width", "1.6");
      node.setAttribute("stroke-linecap", "round");
      node.setAttribute("stroke-linejoin", "round");
      return node;
    };
    if (o.motif === "monogram") {
      const mk = (light) => {
        const tx = el("text", { x: light ? 60.8 : 60, y: light ? 70.8 : 70, "text-anchor": "middle", "font-family": "'IM Fell English', Georgia, serif", "font-size": "30", "letter-spacing": "1" });
        tx.textContent = o.text;
        tx.setAttribute("fill", light ? "#fff" : c.dark);
        tx.setAttribute("fill-opacity", light ? ".4" : ".85");
        return tx;
      };
      svg.appendChild(mk(true)); svg.appendChild(mk(false));
    } else {
      svg.appendChild(engraved(el("use", { href: "#m-" + o.motif, x: 30.8, y: 30.8, width: 60, height: 60 }), true));
      svg.appendChild(engraved(el("use", { href: "#m-" + o.motif, x: 30, y: 30, width: 60, height: 60 }), false));
    }

    if (o.cracks) {
      const g = el("g", { class: "cracks", fill: "none", stroke: c.dark, "stroke-width": "1.4", "stroke-linecap": "round", "stroke-linejoin": "round" });
      const n = 5;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand() * 0.6;
        let x = 60, y = 60, d = `M60 60`;
        for (let s = 1; s <= 5; s++) {
          const len = 8 + rand() * 6;
          const ang = a + (rand() - 0.5) * 0.9;
          x += len * Math.cos(ang); y += len * Math.sin(ang);
          d += ` L${f2(x)} ${f2(y)}`;
        }
        g.appendChild(el("path", { d, pathLength: "1" }));
      }
      svg.appendChild(g);
    }
    container.replaceChildren(svg);
    return svg;
  }

  /* a deckled edge, as a mask the parchment cards can share */
  function deckleMask(seed) {
    const rand = rng(seed || 3);
    const W = 400, H = 300, step = 6;
    const pts = [];
    for (let x = 0; x <= W; x += step) pts.push([x, 3 + rand() * 4]);
    for (let y = 0; y <= H; y += step) pts.push([W - 3 - rand() * 4, y]);
    for (let x = W; x >= 0; x -= step) pts.push([x, H - 3 - rand() * 4]);
    for (let y = H; y >= 0; y -= step) pts.push([3 + rand() * 4, y]);
    const d = "M" + pts.map((p) => `${f2(p[0])} ${f2(p[1])}`).join(" L") + " Z";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'><path d='${d}' fill='black'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  window.Wax = { seal, deckleMask, COLOURS };
})();
