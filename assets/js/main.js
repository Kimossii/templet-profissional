/*
 * AESOA — JavaScript principal (vanilla ES6+)
 * Cada função trata de uma secção/comportamento isolado para facilitar
 * a futura extracção para componentes Vue.
 */

function initVideoHero() {
  const video = document.querySelector(".hero__video");
  if (!video) return;

  const preferenciaReduzida = window.matchMedia("(prefers-reduced-motion: reduce)");

  const aplicarPreferencia = (correspondeReducida) => {
    if (correspondeReducida) {
      video.pause();
      video.removeAttribute("autoplay");
    } else {
      video.play().catch(() => {});
    }
  };

  aplicarPreferencia(preferenciaReduzida.matches);
  preferenciaReduzida.addEventListener("change", (evento) => aplicarPreferencia(evento.matches));
}

function initCabecalhoFixo() {
  const cabecalho = document.querySelector(".cabecalho");
  if (!cabecalho) return;

  const aoScrollar = () => {
    cabecalho.classList.toggle("esta-fixo", window.scrollY > 8);
  };

  aoScrollar();
  window.addEventListener("scroll", aoScrollar, { passive: true });
}

function initSubmenusDropdown() {
  const itens = document.querySelectorAll(".nav__item--dropdown");

  itens.forEach((item) => {
    const link = item.querySelector(":scope > .nav__link");
    if (!link) return;

    link.setAttribute("data-tem-submenu", "true");
    link.setAttribute("aria-expanded", "false");

    link.addEventListener("click", (evento) => {
      if (window.innerWidth > 1200) return;
      evento.preventDefault();

      const aberto = item.classList.toggle("esta-aberto");
      link.setAttribute("aria-expanded", String(aberto));

      itens.forEach((outro) => {
        if (outro !== item) {
          outro.classList.remove("esta-aberto");
          outro.querySelector(":scope > .nav__link")?.setAttribute("aria-expanded", "false");
        }
      });
    });
  });
}

function initAnoRodape() {
  const elemento = document.querySelector("[data-ano-atual]");
  if (!elemento) return;
  elemento.textContent = String(new Date().getFullYear());
}

function initRevelarAoScroll() {
  const elementos = document.querySelectorAll("[data-revelar]");
  if (!elementos.length) return;

  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("esta-visivel"));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("esta-visivel");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elementos.forEach((el) => observador.observe(el));
}

function initBotaoTopo() {
  const botao = document.querySelector("#botao-topo");
  if (!botao) return;

  const aoScrollar = () => {
    botao.classList.toggle("esta-visivel", window.scrollY > 480);
  };

  aoScrollar();
  window.addEventListener("scroll", aoScrollar, { passive: true });

  botao.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initFormularioMembro() {
  const formulario = document.querySelector("#formulario-membro");
  if (!formulario) return;

  const mensagem = formulario.querySelector(".formulario__mensagem");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    // Sem backend por enquanto: confirma a intenção de adesão no ecrã.
    // Substituir por uma chamada à API (ex: fetch) quando o backend existir.
    mensagem.textContent =
      "Pedido de adesão recebido. A equipa da AESOA entrará em contacto brevemente.";
    mensagem.classList.remove("formulario__mensagem--erro");
    mensagem.classList.add("formulario__mensagem--sucesso", "esta-visivel");

    formulario.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initVideoHero();
  initCabecalhoFixo();
  initSubmenusDropdown();
  initAnoRodape();
  initRevelarAoScroll();
  initBotaoTopo();
  initFormularioMembro();
});
