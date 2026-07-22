/**
 * Vaporize Text Cycle — vanilla JS port (originalmente componente React do Originkit)
 * Sem dependências. Dissolve um texto em partículas e reconstrói o seguinte,
 * ciclicamente, num só canvas. Funciona em qualquer site estático (HTML/CSS/JS puro).
 *
 * USO BÁSICO:
 * <div id="titulo-vapor" style="width:900px;height:140px;"></div>
 * <script src="vaporize-text.js"></script>
 * <script>
 *   initVaporizeText(document.getElementById('titulo-vapor'), {
 *     texts: ["CONGRESSO NACIONAL AESOA 2025", "EXCELÊNCIA · INOVAÇÃO · CUIDADO"],
 *     font: { fontFamily: "Montserrat", fontWeight: 800, fontSize: 90 },
 *     color: "rgb(255,255,255)",
 *     spread: 14,
 *     density: 8,
 *     appear: { mode: "particle", order: "left-to-right", transition: { duration: 1.1, ease: "easeOut" } },
 *     disappear: { mode: "particle", order: "right-to-left", transition: { duration: 1.3, ease: "easeOut", delay: 2.2 } },
 *   });
 * </script>
 *
 * Diferenças deliberadas face ao componente React original (não é um bug):
 * 1. O tamanho da fonte ajusta-se automaticamente à largura do contentor
 *    (o texto mais largo da lista `texts` é usado como referência), porque aqui
 *    não há um construtor visual para afinar o tamanho por breakpoint.
 * 2. Existe um limite de partículas (MAX_PARTICLES) com reamostragem adaptativa,
 *    para que frases longas em ecrãs grandes não sobrecarreguem o frame rate.
 * 3. Respeita prefers-reduced-motion: transições quase instantâneas e uma
 *    pausa maior em cada texto, sem o efeito de dispersão constante.
 * 4. Enquanto o texto está parado ("hold"), desenha-se com fillText normal em
 *    vez dos blocos de partículas — os blocos usam uma resolução mais baixa
 *    (ver MAX_PARTICLES) e deixavam o título com ar baço/desfocado durante o
 *    tempo em que fica mais tempo visível.
 */

(function (global) {
  "use strict";

  const DRIFT_REACH = 45;
  const SWEEP_SPAN = 0.6;
  const MAX_PARTICLES = 5000;

  const DEFAULTS = {
    texts: ["TEXT", "VAPORIZE"],
    font: {
      fontFamily: "Inter",
      fontWeight: 400,
      fontSize: 120,
    },
    color: "rgb(255, 255, 255)",
    spread: 20,
    density: 10,
    appear: {
      mode: "particle",
      order: "left-to-right",
      transition: { duration: 1, ease: "easeOut" },
    },
    disappear: {
      mode: "particle",
      order: "left-to-right",
      transition: { duration: 2, ease: "easeOut", delay: 0.5 },
    },
    alignment: "center",
  };

  const NAMED_EASES = {
    linear: [0, 0, 1, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
  };

  function cubicBezierEase(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
    const sampleY = (t) => ((ay * t + by) * t + cy) * t;
    const dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (p) => {
      let t = p;
      for (let i = 0; i < 8; i++) {
        const x = sampleX(t) - p;
        const d = dX(t);
        if (Math.abs(x) < 1e-4 || Math.abs(d) < 1e-6) break;
        t -= x / d;
      }
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      return sampleY(t);
    };
  }

  function makeEase(ease) {
    if (Array.isArray(ease) && ease.length === 4) return cubicBezierEase(ease[0], ease[1], ease[2], ease[3]);
    const b = (typeof ease === "string" && NAMED_EASES[ease]) || NAMED_EASES.easeOut;
    return cubicBezierEase(b[0], b[1], b[2], b[3]);
  }

  const durationOf = (t, fb) => (typeof t?.duration === "number" ? t.duration : fb);
  const delayOf = (t, fb) => (typeof t?.delay === "number" ? t.delay : fb);

  function calculateVaporizeSpread(fontSize) {
    const points = [{ size: 20, spread: 0.2 }, { size: 50, spread: 0.5 }, { size: 100, spread: 1.5 }];
    if (fontSize <= points[0].size) return points[0].spread;
    if (fontSize >= points[points.length - 1].size) return points[points.length - 1].spread;
    let i = 0;
    while (i < points.length - 1 && points[i + 1].size < fontSize) i++;
    const p1 = points[i], p2 = points[i + 1];
    return p1.spread + ((fontSize - p1.size) * (p2.spread - p1.spread)) / (p2.size - p1.size);
  }

  function transformValue(input, inRange, outRange, clamp) {
    const [iMin, iMax] = inRange, [oMin, oMax] = outRange;
    const progress = (input - iMin) / (iMax - iMin);
    let result = oMin + progress * (oMax - oMin);
    if (clamp) result = oMax > oMin ? Math.min(Math.max(result, oMin), oMax) : Math.min(Math.max(result, oMax), oMin);
    return result;
  }

  function localProgress(e, start) {
    const span = 1 - (start || 0);
    if (span <= 0) return e >= start ? 1 : 0;
    return Math.max(0, Math.min(1, (e - start) / span));
  }

  function assignStarts(particles, boundaries, order) {
    const width = boundaries?.width || 1;
    const left = boundaries?.left ?? 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (order === "together") { p.start = 0; continue; }
      const frac = Math.max(0, Math.min(1, (p.originalX - left) / width));
      p.start = (order === "right-to-left" ? 1 - frac : frac) * SWEEP_SPAN;
    }
  }

  function assignScatter(particles, spreadMul) {
    const reach = Math.max(20, spreadMul * 60);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const angle = Math.random() * Math.PI * 2;
      const dist = (0.4 + Math.random() * 0.6) * reach;
      p.scatterX = p.originalX + Math.cos(angle) * dist;
      p.scatterY = p.originalY + Math.sin(angle) * dist * 0.5;
    }
  }

  function resetParticles(particles) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x = p.originalX; p.y = p.originalY; p.opacity = p.originalAlpha;
      p.speed = 0; p.driftX = 0; p.driftY = 0;
    }
  }

  function updateParticlesOut(particles, progress, spreadMul, density) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (progress < (p.start || 0)) continue;
      if (p.speed === 0) {
        p.angle = Math.random() * Math.PI * 2;
        p.speed = 0.5 + Math.random();
        const reach = p.speed * spreadMul * DRIFT_REACH;
        p.driftX = Math.cos(p.angle) * reach;
        p.driftY = Math.sin(p.angle) * reach * 0.6;
        p.wobble = (Math.random() - 0.5) * 2;
        p.shouldFadeQuickly = Math.random() > density;
      }
      const local = localProgress(progress, p.start || 0);
      const fade = p.shouldFadeQuickly ? Math.min(1, local * 2) : local;
      p.opacity = p.originalAlpha * (1 - fade);
      const travel = local * (2 - local);
      const wobble = Math.sin(local * Math.PI * 3 + p.angle) * p.wobble * spreadMul * 4 * local;
      p.x = p.originalX + p.driftX * travel + wobble;
      p.y = p.originalY + p.driftY * travel;
    }
  }

  function renderParticles(ctx, particles, canvas, bufferState) {
    const w = canvas.width, h = canvas.height;
    if (w <= 0 || h <= 0) return;
    let buf = bufferState.buf;
    if (!buf || buf.width !== w || buf.height !== h) {
      buf = ctx.createImageData(w, h);
      bufferState.buf = buf;
    }
    const data = buf.data;
    data.fill(0);
    const size = Math.max(1, canvas.particleSize || 1);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const a = p.opacity;
      if (a <= 0.01) continue;
      const alpha = a > 1 ? 255 : (a * 255) | 0;
      const px = p.x | 0, py = p.y | 0;
      for (let dy = 0; dy < size; dy++) {
        const y = py + dy;
        if (y < 0 || y >= h) continue;
        let idx = (y * w + px) * 4;
        for (let dx = 0; dx < size; dx++) {
          const x = px + dx;
          if (x >= 0 && x < w) {
            data[idx] = p.r; data[idx + 1] = p.g; data[idx + 2] = p.b; data[idx + 3] = alpha;
          }
          idx += 4;
        }
      }
    }
    ctx.putImageData(buf, 0, 0);
  }

  function drawCrispText(ctx, canvas, draw) {
    if (!draw) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = draw.color;
    ctx.font = draw.cssFont;
    ctx.textAlign = draw.alignment;
    ctx.textBaseline = "middle";
    ctx.fillText(draw.text, draw.textX, draw.textY);
  }

  function sampleAlphaPoints(data, boxW, boxH, step) {
    const out = [];
    for (let y = 0; y < boxH; y += step) {
      for (let x = 0; x < boxW; x += step) {
        const index = (y * boxW + x) * 4;
        if (data[index + 3] > 0) out.push(index);
      }
    }
    return out;
  }

  function createParticles(ctx, canvas, text, textX, textY, cssFont, color, alignment) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = cssFont;
    ctx.textAlign = alignment;
    ctx.textBaseline = "middle";
    ctx.imageSmoothingEnabled = true;
    if (ctx.fontKerning) ctx.fontKerning = "normal";

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    let textLeft;
    if (alignment === "center") textLeft = textX - textWidth / 2;
    else if (alignment === "left") textLeft = textX;
    else textLeft = textX - textWidth;

    const textBoundaries = { left: textLeft, right: textLeft + textWidth, width: textWidth || 1 };
    ctx.fillText(text, textX, textY);

    const ascent = metrics.actualBoundingBoxAscent || 60;
    const descent = metrics.actualBoundingBoxDescent || 20;
    const pad = 4;
    const x0 = Math.max(0, Math.floor(textLeft - pad));
    const y0 = Math.max(0, Math.floor(textY - ascent - pad));
    const x1 = Math.min(canvas.width, Math.ceil(textLeft + textWidth + pad));
    const y1 = Math.min(canvas.height, Math.ceil(textY + descent + pad));
    const boxW = Math.max(1, x1 - x0), boxH = Math.max(1, y1 - y0);

    let data;
    try { data = ctx.getImageData(x0, y0, boxW, boxH).data; } catch (_) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return { particles: [], textBoundaries };
    }

    const currentDPR = canvas.width / parseFloat(canvas.style.width || canvas.width) || 1;
    let sampleRate = Math.max(1, Math.round(currentDPR));

    let points = sampleAlphaPoints(data, boxW, boxH, sampleRate);
    if (points.length > MAX_PARTICLES) {
      const factor = Math.sqrt(points.length / MAX_PARTICLES);
      sampleRate = Math.max(sampleRate, Math.round(sampleRate * factor));
      points = sampleAlphaPoints(data, boxW, boxH, sampleRate);
    }
    canvas.particleSize = sampleRate;

    const particles = new Array(points.length);
    for (let i = 0; i < points.length; i++) {
      const index = points[i];
      const px = index / 4;
      const y = Math.floor(px / boxW);
      const x = px - y * boxW;
      const originalAlpha = data[index + 3] / 255;
      particles[i] = {
        x: x0 + x, y: y0 + y, originalX: x0 + x, originalY: y0 + y,
        r: data[index], g: data[index + 1], b: data[index + 2],
        opacity: originalAlpha, originalAlpha,
        angle: 0, speed: 0, start: 0, driftX: 0, driftY: 0, wobble: 0,
        scatterX: 0, scatterY: 0, shouldFadeQuickly: false,
      };
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return { particles, textBoundaries };
  }

  function parseColor(c) {
    return typeof c === "string" && c.trim() ? c.trim() : "rgb(153, 153, 153)";
  }

  /**
   * @param {HTMLElement} container - elemento onde o canvas será montado
   * @param {Object} options - mesmas props do componente React original (texts, font,
   *   color, spread, density, appear, disappear, alignment)
   */
  function initVaporizeText(container, options) {
    if (!container) throw new Error("initVaporizeText: container element is required");

    const opts = Object.assign({}, DEFAULTS, options);
    opts.font = Object.assign({}, DEFAULTS.font, options?.font || {});
    opts.appear = Object.assign({}, DEFAULTS.appear, options?.appear || {});
    opts.appear.transition = Object.assign({}, DEFAULTS.appear.transition, options?.appear?.transition || {});
    opts.disappear = Object.assign({}, DEFAULTS.disappear, options?.disappear || {});
    opts.disappear.transition = Object.assign({}, DEFAULTS.disappear.transition, options?.disappear?.transition || {});

    const prefersReducedMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    container.style.position = "relative";
    container.style.overflow = "visible";
    if (!container.style.width) container.style.width = (options?.width || 600) + "px";
    if (!container.style.height) container.style.height = (options?.height || 160) + "px";

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    container.innerHTML = "";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });

    const globalDpr = Math.min(2, window.devicePixelRatio || 1);
    const bufferState = { buf: null };

    let dims = { W: 0, H: 0 };
    let particles = [];
    let textBoundaries = null;
    let glyphDraw = null;
    let currentIndex = 0;
    let phase = "in";
    let phaseTime = 0;
    let startsKey = "";
    let scatterDone = false;
    let holdDrawn = false;
    let lastFrame = 0;
    let animId = null;
    let running = false;
    let fitFontSize = null;

    function timing() {
      const dt = opts.disappear.transition, at = opts.appear.transition;
      return {
        outMode: opts.disappear.mode || "particle",
        outOrder: opts.disappear.order || "left-to-right",
        outDuration: Math.max(0.01, prefersReducedMotion ? 0.01 : durationOf(dt, 2)),
        outEase: makeEase(dt.ease),
        inMode: opts.appear.mode || "opacity",
        inOrder: opts.appear.order || "together",
        inDuration: Math.max(0.01, prefersReducedMotion ? 0.01 : durationOf(at, 1)),
        inEase: makeEase(at.ease),
        hold: Math.max(0, prefersReducedMotion ? 2.5 : delayOf(dt, 0.5)),
      };
    }

    function baseFontSize() {
      return parseInt(String(opts.font.fontSize || 50).toString().replace("px", ""), 10) || 50;
    }

    // Ajusta a fonte à largura do contentor usando o texto mais largo do ciclo,
    // para que nenhuma das frases transborde nem fique demasiado pequena.
    function fitFont() {
      const { W } = dims;
      if (!W) { fitFontSize = baseFontSize(); return; }
      const maxWidthPx = W * globalDpr * 0.94;
      let size = baseFontSize();
      const probe = document.createElement("canvas").getContext("2d");
      const texts = opts.texts && opts.texts.length ? opts.texts : [""];
      for (let guard = 0; guard < 40; guard++) {
        probe.font = `${opts.font.fontWeight || 400} ${size * globalDpr}px ${opts.font.fontFamily}`;
        let widest = 0;
        for (let i = 0; i < texts.length; i++) widest = Math.max(widest, probe.measureText(texts[i] || "").width);
        if (widest <= maxWidthPx || size <= 10) break;
        size = Math.max(10, Math.floor(size * (maxWidthPx / widest)));
      }
      fitFontSize = size;
    }

    function fontString() {
      const fontSize = fitFontSize || baseFontSize();
      return {
        fontSize,
        spreadMul: calculateVaporizeSpread(fontSize) * (opts.spread ?? 20),
        cssFont: `${opts.font.fontWeight || 400} ${fontSize * globalDpr}px ${opts.font.fontFamily}`,
      };
    }

    function regenerate() {
      const { W, H } = dims;
      if (!W || !H) return;
      if (fitFontSize == null) fitFont();
      const fc = fontString();
      const text = (opts.texts && opts.texts[currentIndex]) || "";

      ctx.font = fc.cssFont;
      let widest = 0;
      const texts = opts.texts && opts.texts.length ? opts.texts : [text];
      for (let i = 0; i < texts.length; i++) widest = Math.max(widest, ctx.measureText(texts[i] || "").width);
      const overflowX = Math.max(0, (widest / globalDpr - W) / 2);
      const driftRoom = fc.spreadMul * DRIFT_REACH * 0.6;
      const bleed = Math.ceil(Math.min(400, overflowX + fc.fontSize + driftRoom));

      const cssW = W + bleed * 2, cssH = H + bleed * 2;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.style.left = -bleed + "px";
      canvas.style.top = -bleed + "px";
      canvas.width = Math.floor(cssW * globalDpr);
      canvas.height = Math.floor(cssH * globalDpr);

      const inset = bleed * globalDpr;
      const boxW = W * globalDpr;
      const textY = canvas.height / 2;
      let textX;
      if (opts.alignment === "left") textX = inset;
      else if (opts.alignment === "right") textX = inset + boxW;
      else textX = inset + boxW / 2;

      const color = parseColor(opts.color);
      const alignment = opts.alignment || "center";
      const result = createParticles(ctx, canvas, text, textX, textY, fc.cssFont, color, alignment);
      particles = result.particles;
      textBoundaries = result.textBoundaries;
      glyphDraw = { text, textX, textY, cssFont: fc.cssFont, color, alignment };
      startsKey = "";
      scatterDone = false;
    }

    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      const W = Math.round(r.width), H = Math.round(r.height);
      if (!W || !H || (W === dims.W && H === dims.H)) return;
      dims = { W, H };
      fitFont();
      regenerate();
    });
    ro.observe(container);

    const io = new IntersectionObserver((ents) => {
      if (ents[0]?.isIntersecting) start(); else stop();
    }, { threshold: 0.15 });
    io.observe(container);

    function frame(now) {
      animId = requestAnimationFrame(frame);
      const { W, H } = dims;
      if (!W || !H || !particles.length) { lastFrame = now; return; }
      const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 1 / 60;
      lastFrame = now;
      const t = timing();
      phaseTime += dt;

      if (phase === "out") {
        const p = Math.min(1, phaseTime / t.outDuration);
        const e = t.outEase(p);
        const key = "out|" + t.outOrder;
        if (startsKey !== key) { assignStarts(particles, textBoundaries, t.outOrder); startsKey = key; }
        if (t.outMode === "particle") {
          updateParticlesOut(particles, e, fontString().spreadMul, transformValue(opts.density ?? 10, [0, 10], [0.3, 1], true));
        } else {
          for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            particle.x = particle.originalX; particle.y = particle.originalY;
            particle.opacity = particle.originalAlpha * (1 - localProgress(e, particle.start));
          }
        }
        renderParticles(ctx, particles, canvas, bufferState);
        if (p >= 1) {
          currentIndex = (currentIndex + 1) % Math.max(1, (opts.texts || []).length);
          regenerate();
          phase = "in"; phaseTime = 0;
        }
      } else if (phase === "in") {
        const p = Math.min(1, phaseTime / t.inDuration);
        const e = t.inEase(p);
        const key = "in|" + t.inOrder;
        if (startsKey !== key) { assignStarts(particles, textBoundaries, t.inOrder); startsKey = key; }
        if (t.inMode === "particle") {
          if (!scatterDone) { assignScatter(particles, fontString().spreadMul); scatterDone = true; }
          for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const local = localProgress(e, particle.start);
            particle.x = particle.scatterX + (particle.originalX - particle.scatterX) * local;
            particle.y = particle.scatterY + (particle.originalY - particle.scatterY) * local;
            particle.opacity = particle.originalAlpha * local;
          }
        } else {
          for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            particle.x = particle.originalX; particle.y = particle.originalY;
            particle.opacity = particle.originalAlpha * localProgress(e, particle.start);
          }
        }
        renderParticles(ctx, particles, canvas, bufferState);
        if (p >= 1) {
          resetParticles(particles);
          phase = "hold"; phaseTime = 0; startsKey = ""; holdDrawn = false;
        }
      } else {
        // Em repouso desenha-se o texto real (fillText), não os blocos de partículas:
        // os blocos são reamostrados a uma resolução mais baixa que a fonte (ver
        // MAX_PARTICLES acima) e deixavam o título com um ar baço/desfocado
        // enquanto ficava parado, que é o tempo em que é mais visto.
        if (!holdDrawn) { drawCrispText(ctx, canvas, glyphDraw); holdDrawn = true; }
        if (phaseTime >= t.hold) {
          resetParticles(particles);
          phase = "out"; phaseTime = 0; startsKey = ""; holdDrawn = false;
        }
      }
    }

    function start() {
      if (running) return;
      running = true;
      lastFrame = 0;
      animId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      animId = null;
    }

    const rect0 = container.getBoundingClientRect();
    if (rect0.width && rect0.height) {
      dims = { W: Math.round(rect0.width), H: Math.round(rect0.height) };
      fitFont();
      regenerate();
    }
    start();

    // O canvas desenha logo de início com a fonte que já estiver disponível
    // (evita ecrã vazio), mas se a tipografia pedida ainda não tiver
    // carregado nesse instante, o texto sai com a serifa de recurso do
    // browser. Assim que a webfont estiver mesmo pronta, refazemos o
    // desenho uma única vez com o tipo de letra correcto.
    if (typeof document !== "undefined" && document.fonts && typeof document.fonts.load === "function") {
      document.fonts.load(`${opts.font.fontWeight || 400} 32px ${opts.font.fontFamily}`)
        .catch(function () {})
        .then(function () { return document.fonts.ready; })
        .then(function () {
          currentIndex = 0; phase = "in"; phaseTime = 0;
          fitFont();
          regenerate();
        });
    }

  }

  global.initVaporizeText = initVaporizeText;
})(typeof window !== "undefined" ? window : this);
