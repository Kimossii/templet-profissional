/**
 * Carrossel de Palestrantes — vanilla JS (adaptado do "Button Carousel"
 * React/Framer Motion da Originkit). Sem dependências. Mostra um orador em
 * destaque (avatar + nome + cargo + país) com uma tira de avatares em arco
 * por baixo; clicar num avatar da tira desliza o destaque até esse orador,
 * com um efeito de esbater + deslize direccional.
 *
 * USO BÁSICO:
 * <div id="carrossel-palestrantes"></div>
 * <script src="palestrantes-carousel.js"></script>
 * <script>
 *   initPalestrantesCarousel(document.getElementById('carrossel-palestrantes'), {
 *     items: [
 *       { iniciais: "MN", nome: "Maria Fernanda Necaca", cargo: "Presidente da AESOA", pais: "Angola" },
 *       // ...
 *     ],
 *   });
 * </script>
 *
 * Cada item pode ter um campo opcional `foto` (caminho de imagem) e
 * `fotoPos` (object-position CSS, ex.: "70% 30%"). Sem `foto`, mostra-se só
 * o círculo com iniciais (comportamento anterior).
 *
 * Diferenças deliberadas face ao componente React original (não é um bug):
 * 1. Sem fotografias individuais dos oradores (não existem), a `foto` de
 *    cada item é antes uma imagem temática (instrumental, sala operatória)
 *    com um tratamento duotone na cor institucional — não pretende ser o
 *    retrato da pessoa, por isso as iniciais continuam sempre visíveis por
 *    cima, como identificador.
 * 2. A tira renderiza sempre todos os itens, em vez de uma janela deslizante
 *    à volta do activo: com o número de oradores de um congresso (dezenas,
 *    não milhares), não há ganho nenhum em não desenhar os que estão fora
 *    de vista.
 * 3. A troca do avatar em destaque usa transições CSS por classes (entrar/
 *    sair), não Framer Motion — mesma ideia do AnimatePresence, sem a
 *    dependência.
 * 4. Respeita prefers-reduced-motion: troca instantânea, sem deslizes.
 */

(function (global) {
  "use strict";

  const DURACAO_DESLIZE = 320; // ms — tempo do "voo" da tira ao seleccionar um orador
  const DURACAO_ESBATER = 500; // ms — tempo do crossfade do avatar em destaque

  const OMISSOES = {
    items: [],
    buttonSize: 64,
    gap: 22,
    curve: 6,
    buttonCount: 7,
    avatarSize: 168,
  };

  function mod(i, n) {
    return ((i % n) + n) % n;
  }

  function easeCubicInOut(p) {
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function iniciaisDe(item) {
    if (item.iniciais) return item.iniciais;
    return (item.nome || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (p) { return p[0]; })
      .join("")
      .toUpperCase();
  }

  function initPalestrantesCarousel(container, options) {
    if (!container) return;
    const opts = Object.assign({}, OMISSOES, options);
    const items = opts.items && opts.items.length ? opts.items : OMISSOES.items;
    const M = items.length;
    if (!M) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ===== geometria da tira em arco =====
    const buttonSize = opts.buttonSize;
    const gap = opts.gap;
    const half = Math.floor(Math.min(Math.max(1, opts.buttonCount), M) / 2);
    const t = Math.max(0.0001, Math.min(10, opts.curve) / 10);
    const step = buttonSize + gap;
    const dPsi = ((Math.PI * 2) / M) * t;
    const R = step / (2 * Math.sin(dPsi / 2));
    const baseTop = buttonSize * 0.9;
    const fadeInner = Math.max(0, half - 0.4);
    const fadeEnd = half + 0.6;
    const maxPsi = Math.min(Math.PI, fadeEnd * dPsi);
    const stripHeight = baseTop + R * (1 - Math.cos(maxPsi)) + buttonSize / 2 + 16;

    // ===== markup =====
    const setaSvg = function (dir) {
      const d = dir < 0 ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6";
      return (
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
        d +
        '" /></svg>'
      );
    };

    container.classList.add("palestrantes-carrossel");
    container.innerHTML =
      '<div class="palestrantes-carrossel__vitrine">' +
      '<div class="palestrantes-carrossel__avatar-caixa" style="width:' + opts.avatarSize + "px;height:" + opts.avatarSize + 'px;"></div>' +
      '<div class="palestrantes-carrossel__legenda"></div>' +
      "</div>" +
      '<div class="palestrantes-carrossel__navegacao">' +
      '<button type="button" class="palestrantes-carrossel__seta palestrantes-carrossel__seta--anterior" style="width:' + buttonSize + "px;height:" + buttonSize + "px;margin-top:" + baseTop + 'px;" aria-label="Orador anterior">' + setaSvg(-1) + "</button>" +
      '<div class="palestrantes-carrossel__tira" style="height:' + stripHeight + 'px;" role="group" aria-label="Escolher orador"></div>' +
      '<button type="button" class="palestrantes-carrossel__seta palestrantes-carrossel__seta--seguinte" style="width:' + buttonSize + "px;height:" + buttonSize + "px;margin-top:" + baseTop + 'px;" aria-label="Orador seguinte">' + setaSvg(1) + "</button>" +
      "</div>";

    const avatarCaixa = container.querySelector(".palestrantes-carrossel__avatar-caixa");
    const legenda = container.querySelector(".palestrantes-carrossel__legenda");
    const tira = container.querySelector(".palestrantes-carrossel__tira");
    const setaAnterior = container.querySelector(".palestrantes-carrossel__seta--anterior");
    const setaSeguinte = container.querySelector(".palestrantes-carrossel__seta--seguinte");

    // ===== destaque (avatar grande + legenda) =====
    function montarAvatarFoto(item) {
      const img = document.createElement("img");
      img.className = "palestrantes-carrossel__avatar-foto";
      img.src = item.foto;
      img.alt = "";
      img.loading = "lazy";
      if (item.fotoPos) img.style.objectPosition = item.fotoPos;
      const tinta = document.createElement("span");
      tinta.className = "palestrantes-carrossel__avatar-tinta";
      const selo = document.createElement("span");
      selo.className = "palestrantes-carrossel__avatar-selo";
      selo.textContent = iniciaisDe(item);
      return [img, tinta, selo];
    }

    function montarCamada(item) {
      const camada = document.createElement("div");
      camada.className = "palestrantes-carrossel__camada";
      const avatar = document.createElement("span");
      avatar.className = "palestrantes-carrossel__avatar";
      avatar.setAttribute("aria-hidden", "true");
      if (item.foto) {
        montarAvatarFoto(item).forEach(function (el) { avatar.appendChild(el); });
      } else {
        const iniciais = document.createElement("span");
        iniciais.className = "palestrantes-carrossel__avatar-iniciais";
        iniciais.textContent = iniciaisDe(item);
        avatar.appendChild(iniciais);
      }
      camada.appendChild(avatar);
      return camada;
    }

    function mostrarDestaque(idx, dir) {
      const item = items[idx];
      const nova = montarCamada(item);
      nova.style.setProperty("--dir", dir || 1);

      if (reducedMotion) {
        avatarCaixa.innerHTML = "";
        avatarCaixa.appendChild(nova);
      } else {
        nova.classList.add("palestrantes-carrossel__camada--a-entrar");
        avatarCaixa.appendChild(nova);
        const antigas = Array.prototype.slice.call(avatarCaixa.children).filter(function (el) {
          return el !== nova;
        });
        // Força um reflow para que o estado inicial "a-entrar" seja aplicado
        // antes de o removermos — caso contrário o browser funde os dois
        // estados num só frame e a transição de entrada não corre.
        void nova.offsetWidth;
        nova.classList.remove("palestrantes-carrossel__camada--a-entrar");
        antigas.forEach(function (el) {
          el.style.setProperty("--dir", dir || 1);
          el.classList.add("palestrantes-carrossel__camada--a-sair");
          el.addEventListener("transitionend", function () { el.remove(); }, { once: true });
          window.setTimeout(function () { if (el.parentNode) el.remove(); }, DURACAO_ESBATER + 100);
        });
      }

      const numero = String(idx + 1).padStart(2, "0");
      const total = String(M).padStart(2, "0");
      const atualizarTexto = function () {
        legenda.innerHTML =
          '<span class="palestrantes-carrossel__contador">' + numero + " — " + total + "</span>" +
          '<h3 class="palestrantes-carrossel__nome">' + escapeHtml(item.nome || "") + "</h3>" +
          (item.cargo ? '<p class="palestrantes-carrossel__cargo">' + escapeHtml(item.cargo) + "</p>" : "") +
          (item.pais ? '<span class="palestrantes-carrossel__pais">' + escapeHtml(item.pais) + "</span>" : "");
      };
      if (reducedMotion) {
        atualizarTexto();
      } else {
        legenda.classList.add("palestrantes-carrossel__legenda--a-desvanecer");
        window.setTimeout(function () {
          atualizarTexto();
          legenda.classList.remove("palestrantes-carrossel__legenda--a-desvanecer");
        }, 150);
      }
    }

    // ===== tira em arco =====
    const botoes = items.map(function (item, idx) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "palestrantes-carrossel__botao";
      botao.style.width = buttonSize + "px";
      botao.style.height = buttonSize + "px";
      botao.style.marginLeft = -(buttonSize / 2) + "px";
      botao.style.marginTop = -(buttonSize / 2) + "px";
      botao.style.top = baseTop + "px";
      botao.setAttribute("aria-label", "Ver " + (item.nome || "orador"));
      if (item.foto) {
        const img = document.createElement("img");
        img.className = "palestrantes-carrossel__botao-foto";
        img.src = item.foto;
        img.alt = "";
        img.loading = "lazy";
        if (item.fotoPos) img.style.objectPosition = item.fotoPos;
        botao.appendChild(img);
        const tinta = document.createElement("span");
        tinta.className = "palestrantes-carrossel__botao-tinta";
        botao.appendChild(tinta);
      }
      const avatar = document.createElement("span");
      avatar.className = "palestrantes-carrossel__botao-avatar";
      avatar.textContent = iniciaisDe(item);
      avatar.setAttribute("aria-hidden", "true");
      botao.appendChild(avatar);
      botao.addEventListener("click", function () { selecionar(idx); });
      tira.appendChild(botao);
      return botao;
    });

    function getVisualSlot(itemIdx, posDisplay) {
      let slot = itemIdx - posDisplay;
      slot = slot % M;
      if (slot > M / 2) slot -= M;
      if (slot < -M / 2) slot += M;
      return slot;
    }

    function slotStyle(slot) {
      const angle = slot * dPsi;
      const x = R * Math.sin(angle);
      const y = R * (1 - Math.cos(angle));
      const deg = (angle * 180) / Math.PI;
      const absSlot = Math.abs(slot);
      const depth = Math.max(0, 1 - (0.55 * absSlot) / Math.max(1, half));
      const scale = 0.55 + 0.45 * depth;
      const opacity =
        absSlot <= fadeInner ? 1 : absSlot >= fadeEnd ? 0 : 1 - (absSlot - fadeInner) / (fadeEnd - fadeInner);
      const zIndex = Math.round(depth * 100) + (absSlot < 0.5 ? 100 : 0);
      return { x: x, y: y, deg: deg, scale: scale, opacity: opacity, zIndex: zIndex };
    }

    let posRef = 0;
    let ativo = 0;
    let rafId = null;

    function atualizarTira(posDisplay) {
      botoes.forEach(function (botao, idx) {
        const slot = getVisualSlot(idx, posDisplay);
        const s = slotStyle(slot);
        botao.style.transform =
          "translate(" + s.x + "px, " + s.y + "px) rotate(" + s.deg + "deg) scale(" + s.scale + ")";
        botao.style.opacity = String(s.opacity);
        botao.style.zIndex = String(s.zIndex);
        const isActive = idx === mod(Math.round(posDisplay), M);
        botao.classList.toggle("is-activo", isActive);
        botao.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    function selecionar(itemIdx) {
      const activoAtual = mod(Math.round(posRef), M);
      if (itemIdx === activoAtual) return;

      let delta = itemIdx - Math.round(posRef);
      delta = ((delta % M) + M) % M;
      if (delta > M / 2) delta -= M;
      const dir = Math.sign(delta) || 1;

      if (reducedMotion) {
        posRef = mod(itemIdx, M);
        ativo = itemIdx;
        atualizarTira(posRef);
        mostrarDestaque(itemIdx, dir);
        return;
      }

      if (rafId) cancelAnimationFrame(rafId);
      const startPos = posRef;
      const targetPos = posRef + delta;
      const startTime = performance.now();
      let ultimoActivo = mod(Math.round(startPos), M);

      function tick(now) {
        const progress = Math.min(1, (now - startTime) / DURACAO_DESLIZE);
        posRef = startPos + (targetPos - startPos) * easeCubicInOut(progress);
        atualizarTira(posRef);
        const activoAgora = mod(Math.round(posRef), M);
        if (activoAgora !== ultimoActivo) {
          ultimoActivo = activoAgora;
          ativo = activoAgora;
          mostrarDestaque(activoAgora, dir);
        }
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          posRef = targetPos;
          atualizarTira(posRef);
          rafId = null;
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    container.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        selecionar(mod(ativo + 1, M));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        selecionar(mod(ativo - 1, M));
      }
    });

    setaAnterior.addEventListener("click", function () { selecionar(mod(ativo - 1, M)); });
    setaSeguinte.addEventListener("click", function () { selecionar(mod(ativo + 1, M)); });

    // estado inicial
    atualizarTira(0);
    mostrarDestaque(0, 1);
  }

  global.initPalestrantesCarousel = initPalestrantesCarousel;
})(typeof window !== "undefined" ? window : this);
