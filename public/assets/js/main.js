/*
 * AESOA — JavaScript principal (vanilla ES6+)
 * Cada função trata de uma secção/comportamento isolado para facilitar
 * a futura extracção para componentes Vue.
 */

const CHAVE_PROGRESSO_CURSOS = "aesoa-cursos-progresso";
const SVG_NS = "http://www.w3.org/2000/svg";

function calcularIniciais(nome) {
  return nome
    .replace(/Enf\.º|Enf\.ª|Chefe|Dr\./g, "")
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function criarSetaColapso(className) {
  const seta = document.createElementNS(SVG_NS, "svg");
  seta.setAttribute("class", className);
  seta.setAttribute("viewBox", "0 0 24 24");
  seta.setAttribute("fill", "none");
  seta.setAttribute("stroke", "currentColor");
  seta.setAttribute("stroke-width", "2");
  seta.setAttribute("stroke-linecap", "round");
  seta.setAttribute("stroke-linejoin", "round");
  seta.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "m6 9 6 6 6-6");
  seta.appendChild(path);
  return seta;
}

function obterAulasConcluidas(slug) {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO_CURSOS) || "{}");
    return Array.isArray(dados[slug]) ? dados[slug] : [];
  } catch {
    return [];
  }
}

function guardarAulasConcluidas(slug, aulasConcluidas) {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO_CURSOS) || "{}");
    dados[slug] = aulasConcluidas;
    localStorage.setItem(CHAVE_PROGRESSO_CURSOS, JSON.stringify(dados));
  } catch {
    // localStorage indisponível ou corrompido — progresso simplesmente não é guardado.
  }
}

function calcularContagemProgresso(programa, aulasConcluidas) {
  const concluidasSet = new Set(aulasConcluidas);
  let total = 0;
  let concluidas = 0;
  programa.forEach((modulo, indiceModulo) => {
    modulo.licoes.forEach((_licao, indiceLicao) => {
      total += 1;
      if (concluidasSet.has(`${indiceModulo}-${indiceLicao}`)) concluidas += 1;
    });
  });
  return { concluidas, total };
}

function calcularContagemModulo(modulo, indiceModulo, aulasConcluidas) {
  const concluidasSet = new Set(aulasConcluidas);
  let concluidas = 0;
  modulo.licoes.forEach((_licao, indiceLicao) => {
    if (concluidasSet.has(`${indiceModulo}-${indiceLicao}`)) concluidas += 1;
  });
  return { concluidas, total: modulo.licoes.length };
}

function alternarConclusao(aulasConcluidas, chave) {
  if (aulasConcluidas.includes(chave)) {
    return aulasConcluidas.filter((item) => item !== chave);
  }
  return [...aulasConcluidas, chave];
}

function encontrarProximaAulaNaoConcluida(programa, aulasConcluidas) {
  const concluidasSet = new Set(aulasConcluidas);
  for (let indiceModulo = 0; indiceModulo < programa.length; indiceModulo += 1) {
    const modulo = programa[indiceModulo];
    for (let indiceLicao = 0; indiceLicao < modulo.licoes.length; indiceLicao += 1) {
      if (!concluidasSet.has(`${indiceModulo}-${indiceLicao}`)) {
        return { indiceModulo, indiceLicao };
      }
    }
  }
  return null;
}

function obterListaPlanaAulas(programa) {
  const lista = [];
  programa.forEach((modulo, indiceModulo) => {
    modulo.licoes.forEach((licao, indiceLicao) => {
      lista.push({ indiceModulo, indiceLicao, titulo: licao.titulo });
    });
  });
  return lista;
}

function initVideoHero() {
  const videos = document.querySelectorAll(".hero__video, .pagina-hero__video");
  if (!videos.length) return;

  const preferenciaReduzida = window.matchMedia("(prefers-reduced-motion: reduce)");

  const aplicarPreferencia = (correspondeReducida) => {
    videos.forEach((video) => {
      if (correspondeReducida) {
        video.pause();
        video.removeAttribute("autoplay");
      } else {
        video.play().catch(() => {});
      }
    });
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

function initMenuMobile() {
  const botao = document.querySelector("#botao-menu");
  const nav = document.querySelector("#nav-principal");
  if (!botao || !nav) return;

  const PONTO_QUEBRA = 1200;

  const fecharSubmenus = () => {
    nav.querySelectorAll(".nav__item--dropdown.esta-aberto").forEach((item) => {
      item.classList.remove("esta-aberto");
      item.querySelector(":scope > .nav__link")?.setAttribute("aria-expanded", "false");
    });
  };

  const fecharMenu = () => {
    nav.classList.remove("esta-aberto");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir menu de navegação");
    document.body.classList.remove("menu-aberto");
    fecharSubmenus();
  };

  const alternarMenu = () => {
    const aberto = nav.classList.toggle("esta-aberto");
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu de navegação" : "Abrir menu de navegação");
    document.body.classList.toggle("menu-aberto", aberto);
    if (!aberto) fecharSubmenus();
  };

  botao.addEventListener("click", alternarMenu);

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth > PONTO_QUEBRA || link.hasAttribute("data-tem-submenu")) return;
      fecharMenu();
    });
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && nav.classList.contains("esta-aberto")) {
      fecharMenu();
      botao.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > PONTO_QUEBRA) fecharMenu();
  });
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
        if (outro !== item && !outro.contains(item)) {
          outro.classList.remove("esta-aberto");
          outro.querySelector(":scope > .nav__link")?.setAttribute("aria-expanded", "false");
        }
      });
    });
  });
}

function initAcordeaoValores() {
  const itens = document.querySelectorAll(".valores__item");
  if (!itens.length) return;

  itens.forEach((item) => {
    const botao = item.querySelector(".valores__cabecalho");
    if (!botao) return;

    botao.addEventListener("click", () => {
      const aberto = item.classList.toggle("esta-aberto");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  });
}

function initAbasPrograma() {
  const abas = document.querySelectorAll(".programa__aba");
  const dias = document.querySelectorAll(".programa__dia");
  if (!abas.length || !dias.length) return;

  abas.forEach((aba) => {
    aba.addEventListener("click", () => {
      const alvo = aba.dataset.dia;

      abas.forEach((outraAba) => {
        const estaAtiva = outraAba === aba;
        outraAba.classList.toggle("esta-ativo", estaAtiva);
        outraAba.setAttribute("aria-selected", String(estaAtiva));
      });

      dias.forEach((dia) => {
        dia.classList.toggle("esta-ativo", dia.dataset.dia === alvo);
      });
    });
  });
}

function initAcordeaoFAQ() {
  const itens = document.querySelectorAll(".faq__item");
  if (!itens.length) return;

  itens.forEach((item) => {
    const botao = item.querySelector(".faq__cabecalho");
    if (!botao) return;

    botao.addEventListener("click", () => {
      const aberto = item.classList.toggle("esta-aberto");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  });
}

function initAcordeaoEstatutos() {
  const itens = document.querySelectorAll(".estatuto__capitulo");
  if (!itens.length) return;

  const abrirItem = (item) => {
    if (!item) return;
    item.classList.add("esta-aberto");
    const botao = item.querySelector(".estatuto__cabecalho");
    if (botao) botao.setAttribute("aria-expanded", "true");
  };

  itens.forEach((item) => {
    const botao = item.querySelector(".estatuto__cabecalho");
    if (!botao) return;

    botao.addEventListener("click", () => {
      const aberto = item.classList.toggle("esta-aberto");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  });

  document.querySelectorAll(".estatuto-indice__link").forEach((link) => {
    link.addEventListener("click", () => {
      abrirItem(document.querySelector(link.getAttribute("href")));
    });
  });

  if (location.hash) {
    const alvo = document.querySelector(location.hash);
    if (alvo && alvo.classList.contains("estatuto__capitulo")) {
      abrirItem(alvo);
      window.requestAnimationFrame(() => alvo.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }
}

function initAcordeaoProgramaCurso() {
  document.querySelectorAll(".curso-programa__modulo").forEach((item) => {
    const botao = item.querySelector(".curso-programa__cabecalho");
    if (!botao) return;

    botao.addEventListener("click", () => {
      const aberto = item.classList.toggle("esta-aberto");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  });

  document.querySelectorAll(".curso-programa__licao").forEach((item) => {
    const botao = item.querySelector(".curso-programa__licao-cabecalho");
    if (!botao) return;

    botao.addEventListener("click", () => {
      const aberto = item.classList.toggle("esta-aberto");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  });
}

function initTextoExpandir(seletorTexto, seletorBotao) {
  const texto = document.querySelector(seletorTexto);
  const botao = document.querySelector(seletorBotao);
  if (!texto || !botao) return;

  botao.addEventListener("click", () => {
    const expandido = texto.classList.toggle("esta-expandido");
    botao.textContent = expandido ? "Mostrar menos" : "Mostrar mais";
  });
}

function initSobreCursoExpandir() {
  initTextoExpandir("#curso-sobre-texto", "#curso-sobre-mostrar-mais");
}

function initSobreEstudoExpandir() {
  initTextoExpandir("#estudo-sobre-texto", "#estudo-sobre-mostrar-mais");
}

function initFormularioCongresso() {
  const formulario = document.querySelector("#formulario-congresso");
  if (!formulario) return;

  const mensagem = formulario.querySelector(".formulario__mensagem");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    // Sem backend por enquanto: confirma a intenção de inscrição no ecrã.
    // Substituir por uma chamada à API (ex: fetch) quando o backend existir.
    mensagem.textContent =
      "Inscrição recebida. A comissão organizadora do congresso entrará em contacto para confirmar o pagamento.";
    mensagem.classList.remove("formulario__mensagem--erro");
    mensagem.classList.add("formulario__mensagem--sucesso", "esta-visivel");

    formulario.reset();
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

function initFormularioContacto() {
  const formulario = document.querySelector("#formulario-contacto");
  if (!formulario) return;

  const mensagem = formulario.querySelector(".formulario__mensagem");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    // Sem backend por enquanto: confirma a receção da mensagem no ecrã.
    // Substituir por uma chamada à API (ex: fetch) quando o backend existir.
    mensagem.textContent =
      "Mensagem enviada. A equipa da AESOA entrará em contacto brevemente.";
    mensagem.classList.remove("formulario__mensagem--erro");
    mensagem.classList.add("formulario__mensagem--sucesso", "esta-visivel");

    formulario.reset();
  });
}

function initFormularioNewsletter() {
  const formulario = document.querySelector("#formulario-newsletter");
  if (!formulario) return;

  const mensagem = formulario.querySelector(".formulario__mensagem");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    // Sem backend por enquanto: confirma a subscrição no ecrã.
    // Substituir por uma chamada à API (ex: fetch) quando o backend existir.
    mensagem.textContent = "Subscrição confirmada! Vai começar a receber as novidades da AESOA por email.";
    mensagem.classList.remove("formulario__mensagem--erro");
    mensagem.classList.add("formulario__mensagem--sucesso", "esta-visivel");

    formulario.reset();
  });
}

function initFormularioBanco() {
  const formulario = document.querySelector("#formulario-banco");
  if (!formulario) return;

  const mensagem = formulario.querySelector(".formulario__mensagem");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    // Sem backend por enquanto: confirma o registo no ecrã.
    // Substituir por uma chamada à API (ex: fetch) quando o backend existir.
    mensagem.textContent =
      "Registo recebido. A AESOA vai rever a sua candidatura e entrará em contacto brevemente.";
    mensagem.classList.remove("formulario__mensagem--erro");
    mensagem.classList.add("formulario__mensagem--sucesso", "esta-visivel");

    formulario.reset();
  });
}

function initPaginaNoticia() {
  const container = document.querySelector("#noticia-conteudo");
  const naoEncontrada = document.querySelector("#noticia-nao-encontrada");
  if (!container || !naoEncontrada) return;

  const slug = new URLSearchParams(location.search).get("slug");
  const dados =
    typeof NOTICIAS_DADOS !== "undefined" && slug && Object.hasOwn(NOTICIAS_DADOS, slug)
      ? NOTICIAS_DADOS[slug]
      : null;

  if (!dados) {
    naoEncontrada.hidden = false;
    container.hidden = true;
    return;
  }

  document.title = `${dados.titulo} | AESOA`;

  document.querySelector("#noticia-hero").style.backgroundImage = `url('${dados.imagem}')`;
  document.querySelector("#noticia-categoria").textContent = dados.categoria;
  document.querySelector("#noticia-titulo").textContent = dados.titulo;
  document.querySelector("#noticia-data").textContent = dados.data;

  const totalPalavras = dados.corpo.join(" ").trim().split(/\s+/).length;
  const minutos = Math.max(1, Math.round(totalPalavras / 200));
  document.querySelector("#noticia-tempo-leitura").textContent = `${minutos} min de leitura`;

  const corpoEl = document.querySelector("#noticia-corpo");
  corpoEl.replaceChildren();
  const posicaoCitacao = Math.floor(dados.corpo.length / 2) - 1;

  dados.corpo.forEach((paragrafo, indice) => {
    const p = document.createElement("p");
    p.textContent = paragrafo;
    if (indice === 0) p.classList.add("noticia-corpo__lead");
    corpoEl.appendChild(p);

    if (dados.citacao && indice === posicaoCitacao) {
      const citacao = document.createElement("blockquote");
      citacao.className = "noticia-corpo__citacao";
      citacao.textContent = dados.citacao;
      corpoEl.appendChild(citacao);
    }
  });

  const urlAtual = encodeURIComponent(location.href);
  const tituloAtual = encodeURIComponent(dados.titulo);
  document.querySelector("#partilha-whatsapp").href = `https://wa.me/?text=${tituloAtual}%20${urlAtual}`;
  document.querySelector("#partilha-facebook").href =
    `https://www.facebook.com/sharer/sharer.php?u=${urlAtual}`;
  document.querySelector("#partilha-linkedin").href =
    `https://www.linkedin.com/sharing/share-offsite/?url=${urlAtual}`;
  document.querySelector("#partilha-email").href = `mailto:?subject=${tituloAtual}&body=${urlAtual}`;

  const relacionadasEl = document.querySelector("#noticia-relacionadas-grelha");
  const relacionadas = Object.entries(NOTICIAS_DADOS)
    .filter(([outroSlug]) => outroSlug !== slug)
    .slice(0, 3);

  relacionadas.forEach(([outroSlug, outraNoticia]) => {
    const artigo = document.createElement("article");
    artigo.className = "cartao";

    const imagem = document.createElement("img");
    imagem.className = "cartao__imagem";
    imagem.src = outraNoticia.imagem;
    imagem.alt = outraNoticia.imagemAlt;
    imagem.width = 480;
    imagem.height = 320;
    imagem.loading = "lazy";
    artigo.appendChild(imagem);

    const corpo = document.createElement("div");
    corpo.className = "cartao__corpo";

    const etiqueta = document.createElement("span");
    etiqueta.className = "cartao__etiqueta";
    etiqueta.textContent = outraNoticia.categoria;
    corpo.appendChild(etiqueta);

    const data = document.createElement("span");
    data.className = "cartao__data";
    data.textContent = outraNoticia.data;
    corpo.appendChild(data);

    const titulo = document.createElement("h3");
    titulo.className = "cartao__titulo";
    titulo.textContent = outraNoticia.titulo;
    corpo.appendChild(titulo);

    const texto = document.createElement("p");
    texto.className = "cartao__texto";
    texto.textContent = outraNoticia.resumo;
    corpo.appendChild(texto);

    const leiaMais = document.createElement("a");
    leiaMais.className = "cartao__leiamais";
    leiaMais.href = `noticia.html?slug=${encodeURIComponent(outroSlug)}`;
    leiaMais.append("Ler mais ");

    const svgNS = "http://www.w3.org/2000/svg";
    const seta = document.createElementNS(svgNS, "svg");
    seta.setAttribute("viewBox", "0 0 24 24");
    seta.setAttribute("fill", "none");
    seta.setAttribute("stroke", "currentColor");
    seta.setAttribute("stroke-width", "2");
    seta.setAttribute("stroke-linecap", "round");
    seta.setAttribute("stroke-linejoin", "round");
    seta.setAttribute("aria-hidden", "true");
    const setaPath = document.createElementNS(svgNS, "path");
    setaPath.setAttribute("d", "M5 12h14M13 6l6 6-6 6");
    seta.appendChild(setaPath);
    leiaMais.appendChild(seta);

    corpo.appendChild(leiaMais);

    artigo.appendChild(corpo);
    relacionadasEl.appendChild(artigo);
  });

  if (!relacionadas.length) {
    document.querySelector("#noticia-relacionadas-secao").hidden = true;
  }

  container.hidden = false;
}

function initPaginaCurso() {
  const container = document.querySelector("#curso-conteudo");
  const naoEncontrado = document.querySelector("#curso-nao-encontrado");
  if (!container || !naoEncontrado) return;

  const slug = new URLSearchParams(location.search).get("slug");
  const dados =
    typeof CURSOS_DADOS !== "undefined" && slug && Object.hasOwn(CURSOS_DADOS, slug) ? CURSOS_DADOS[slug] : null;

  if (!dados) {
    naoEncontrado.hidden = false;
    container.hidden = true;
    return;
  }

  document.title = `${dados.titulo} | AESOA`;

  document.querySelector("#curso-breadcrumb-categoria").textContent = dados.categoria;
  document.querySelector("#curso-breadcrumb-titulo").textContent = dados.titulo;

  document.querySelector("#curso-categoria-pastilha").textContent = dados.categoria;

  const nivelEl = document.querySelector("#curso-nivel-pastilha");
  nivelEl.textContent = dados.nivel;
  nivelEl.className = "cursos__cartao-nivel";
  const nivelModificador = {
    Básico: "cursos__cartao-nivel--basico",
    Intermediário: "cursos__cartao-nivel--intermediario",
    Avançado: "cursos__cartao-nivel--avancado",
    "Todos os Níveis": "cursos__cartao-nivel--todos",
  }[dados.nivel];
  if (nivelModificador) nivelEl.classList.add(nivelModificador);

  const seloEl = document.querySelector("#curso-selo");
  if (dados.selo) {
    seloEl.textContent = dados.selo;
    seloEl.className = "cursos__cartao-selo";
    if (dados.selo === "Últimas Vagas") seloEl.classList.add("cursos__cartao-selo--urgente");
    seloEl.hidden = false;
  } else {
    seloEl.hidden = true;
  }

  document.querySelector("#curso-titulo").textContent = dados.titulo;
  document.querySelector("#curso-subtitulo").textContent = dados.subtitulo;

  document.querySelector("#curso-estrelas-preenchimento").style.width = `${(dados.avaliacaoMedia / 5) * 100}%`;
  document.querySelector("#curso-avaliacao-numero").textContent = dados.avaliacaoMedia.toFixed(1);
  document.querySelector("#curso-avaliacao-total").textContent = `(${dados.totalAvaliacoes} avaliações)`;

  document.querySelector("#curso-formador-hero-nome").textContent = dados.formador.nome;

  document.querySelector("#curso-meta-duracao").textContent = dados.duracao;
  document.querySelector("#curso-meta-data").textContent = `Início: ${dados.dataInicio}`;
  document.querySelector("#curso-meta-modalidade").textContent = dados.local
    ? `${dados.modalidade} · ${dados.local}`
    : dados.modalidade;

  document.querySelector("#curso-inscricao-imagem").src = dados.imagem;
  document.querySelector("#curso-inscricao-imagem").alt = dados.imagemAlt;

  const precoRealEl = document.querySelector("#curso-inscricao-preco-real");
  const precoSocioEl = document.querySelector("#curso-inscricao-preco-socio");
  const precoRealFormatado = `${dados.precoReal.toLocaleString("pt-BR")} Kz`;
  precoRealEl.textContent = precoRealFormatado;
  if (dados.precoSocio === 0) {
    precoSocioEl.textContent = "Grátis para Sócios";
  } else {
    precoSocioEl.textContent = `Sócios: ${dados.precoSocio.toLocaleString("pt-BR")} Kz`;
    if (dados.descontoSelo) {
      const selo = document.createElement("span");
      selo.className = "cursos__cartao-preco-selo";
      selo.textContent = dados.descontoSelo;
      precoSocioEl.appendChild(selo);
    }
  }

  document.querySelector("#curso-inscricao-selo-vagas").hidden = !dados.vagasLimitadas;
  document.querySelector("#curso-inscricao-continuar").href = `curso-estudar.html?slug=${slug}`;

  const favoritoBotao = document.querySelector("#curso-inscricao-favorito");
  favoritoBotao.dataset.slug = slug;

  const urlAtual = encodeURIComponent(location.href);
  const tituloAtual = encodeURIComponent(dados.titulo);
  document.querySelector("#curso-inscricao-whatsapp").href = `https://wa.me/?text=${tituloAtual}%20${urlAtual}`;
  document.querySelector("#curso-inscricao-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${urlAtual}`;
  document.querySelector("#curso-inscricao-email").href = `mailto:?subject=${tituloAtual}&body=${urlAtual}`;

  document.querySelector("#curso-inscricao-fixa-preco").textContent =
    dados.precoSocio === 0 ? `${precoRealFormatado} · Grátis p/ Sócios` : precoRealFormatado;

  const aprenderEl = document.querySelector("#curso-aprender-lista");
  aprenderEl.replaceChildren();
  dados.oQueVaiAprender.forEach((item) => {
    const li = document.createElement("li");
    li.className = "curso-aprender__item";

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    const polyline = document.createElementNS(svgNS, "polyline");
    polyline.setAttribute("points", "20 6 9 17 4 12");
    svg.appendChild(polyline);
    li.appendChild(svg);

    const texto = document.createElement("span");
    texto.textContent = item;
    li.appendChild(texto);

    aprenderEl.appendChild(li);
  });

  const totalHoras = dados.programa.reduce((soma, modulo) => soma + parseInt(modulo.duracao, 10), 0);
  document.querySelector("#curso-programa-resumo").textContent =
    `${dados.programa.length} módulos · ${totalHoras} horas de conteúdo`;

  const TIPO_ROTULO = { aula: "Aula", pratica: "Prática", avaliacao: "Avaliação" };
  const programaEl = document.querySelector("#curso-programa-lista");
  programaEl.replaceChildren();

  const svgNS = "http://www.w3.org/2000/svg";

  const criarIconePreview = () => {
    const icone = document.createElementNS(svgNS, "svg");
    icone.setAttribute("class", "curso-programa__licao-preview-icone");
    icone.setAttribute("viewBox", "0 0 24 24");
    icone.setAttribute("fill", "none");
    icone.setAttribute("stroke", "currentColor");
    icone.setAttribute("stroke-width", "2");
    icone.setAttribute("stroke-linecap", "round");
    icone.setAttribute("stroke-linejoin", "round");
    icone.setAttribute("aria-hidden", "true");
    const circulo = document.createElementNS(svgNS, "circle");
    circulo.setAttribute("cx", "12");
    circulo.setAttribute("cy", "12");
    circulo.setAttribute("r", "10");
    icone.appendChild(circulo);
    const triangulo = document.createElementNS(svgNS, "polygon");
    triangulo.setAttribute("points", "10 8 16 12 10 16");
    icone.appendChild(triangulo);
    return icone;
  };

  dados.programa.forEach((modulo, indiceModulo) => {
    const item = document.createElement("div");
    item.className = "curso-programa__modulo";

    const idCabecalho = `curso-programa-cabecalho-${indiceModulo}`;
    const idPainel = `curso-programa-painel-${indiceModulo}`;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "curso-programa__cabecalho";
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-controls", idPainel);
    botao.id = idCabecalho;

    botao.appendChild(criarSetaColapso("curso-programa__seta"));

    const tituloModulo = document.createElement("span");
    tituloModulo.className = "curso-programa__titulo-modulo";
    tituloModulo.textContent = modulo.titulo;
    botao.appendChild(tituloModulo);

    const meta = document.createElement("span");
    meta.className = "curso-programa__cabecalho-meta";

    const contagemModulo = document.createElement("span");
    contagemModulo.className = "curso-programa__contagem";
    contagemModulo.textContent = `${modulo.licoes.length} ${modulo.licoes.length === 1 ? "aula" : "aulas"}`;
    meta.appendChild(contagemModulo);

    const duracaoModulo = document.createElement("span");
    duracaoModulo.className = "curso-programa__duracao";
    duracaoModulo.textContent = modulo.duracao;
    meta.appendChild(duracaoModulo);

    botao.appendChild(meta);

    item.appendChild(botao);

    const painel = document.createElement("div");
    painel.className = "curso-programa__painel";
    painel.id = idPainel;
    painel.setAttribute("role", "region");
    painel.setAttribute("aria-labelledby", idCabecalho);
    const painelInterior = document.createElement("div");
    painelInterior.className = "curso-programa__painel-interior";

    const licoesEl = document.createElement("ul");
    licoesEl.className = "curso-programa__licoes";
    modulo.licoes.forEach((licao, indiceLicao) => {
      const li = document.createElement("li");
      li.className = licao.preview ? "curso-programa__licao curso-programa__licao--preview" : "curso-programa__licao";

      const idLicaoCabecalho = `curso-programa-licao-cabecalho-${indiceModulo}-${indiceLicao}`;
      const idLicaoPainel = `curso-programa-licao-painel-${indiceModulo}-${indiceLicao}`;

      const botaoLicao = document.createElement("button");
      botaoLicao.type = "button";
      botaoLicao.className = "curso-programa__licao-cabecalho";
      botaoLicao.setAttribute("aria-expanded", "false");
      botaoLicao.setAttribute("aria-controls", idLicaoPainel);
      botaoLicao.id = idLicaoCabecalho;

      botaoLicao.appendChild(criarSetaColapso("curso-programa__licao-seta"));

      const tipoEl = document.createElement("span");
      tipoEl.className = `curso-programa__licao-tipo curso-programa__licao-tipo--${licao.tipo}`;
      tipoEl.textContent = TIPO_ROTULO[licao.tipo];
      botaoLicao.appendChild(tipoEl);

      const tituloLicao = document.createElement("span");
      tituloLicao.className = "curso-programa__licao-titulo";
      tituloLicao.textContent = licao.titulo;
      botaoLicao.appendChild(tituloLicao);

      if (licao.preview) {
        const previaEl = document.createElement("span");
        previaEl.className = "curso-programa__licao-previa";
        previaEl.appendChild(criarIconePreview());
        previaEl.append("Pré-visualização");
        botaoLicao.appendChild(previaEl);
      }

      const duracaoLicao = document.createElement("span");
      duracaoLicao.className = "curso-programa__licao-duracao";
      duracaoLicao.textContent = licao.duracao;
      botaoLicao.appendChild(duracaoLicao);

      li.appendChild(botaoLicao);

      const painelLicao = document.createElement("div");
      painelLicao.className = "curso-programa__licao-painel";
      painelLicao.id = idLicaoPainel;
      painelLicao.setAttribute("role", "region");
      painelLicao.setAttribute("aria-labelledby", idLicaoCabecalho);
      const painelLicaoInterior = document.createElement("div");
      painelLicaoInterior.className = "curso-programa__licao-painel-interior";

      const descricaoLicao = document.createElement("p");
      descricaoLicao.className = "curso-programa__licao-descricao";
      descricaoLicao.textContent = licao.descricao;
      painelLicaoInterior.appendChild(descricaoLicao);

      painelLicao.appendChild(painelLicaoInterior);
      li.appendChild(painelLicao);

      licoesEl.appendChild(li);
    });

    painelInterior.appendChild(licoesEl);
    painel.appendChild(painelInterior);
    item.appendChild(painel);

    programaEl.appendChild(item);
  });

  const requisitosEl = document.querySelector("#curso-requisitos-lista");
  requisitosEl.replaceChildren();
  dados.requisitos.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    requisitosEl.appendChild(li);
  });

  const sobreEl = document.querySelector("#curso-sobre-texto");
  sobreEl.replaceChildren();
  dados.descricao.forEach((paragrafo) => {
    const p = document.createElement("p");
    p.textContent = paragrafo;
    sobreEl.appendChild(p);
  });
  sobreEl.classList.remove("esta-expandido");
  document.querySelector("#curso-sobre-mostrar-mais").textContent = "Mostrar mais";

  const publicoEl = document.querySelector("#curso-publico-lista");
  publicoEl.replaceChildren();
  dados.publicoAlvo.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    publicoEl.appendChild(li);
  });

  document.querySelector("#curso-formador-iniciais").textContent = calcularIniciais(dados.formador.nome);
  document.querySelector("#curso-formador-nome").textContent = dados.formador.nome;
  document.querySelector("#curso-formador-credenciais").textContent = dados.formador.credenciais;
  document.querySelector("#curso-formador-bio").textContent = dados.formador.bio;
  document.querySelector("#curso-formador-stat-cursos").textContent = dados.formador.nCursos;
  document.querySelector("#curso-formador-stat-formandos").textContent = `${dados.formador.nFormandos}+`;
  document.querySelector("#curso-formador-stat-avaliacao").textContent = dados.formador.avaliacaoMedia.toFixed(1);

  document.querySelector("#curso-avaliacoes-media-numero").textContent = dados.avaliacaoMedia.toFixed(1);
  document.querySelector("#curso-avaliacoes-media-estrelas").style.width = `${(dados.avaliacaoMedia / 5) * 100}%`;
  document.querySelector("#curso-avaliacoes-media-total").textContent = `${dados.totalAvaliacoes} avaliações`;

  const barrasEl = document.querySelector("#curso-avaliacoes-barras");
  barrasEl.replaceChildren();
  dados.distribuicaoEstrelas.forEach((percentagem, indice) => {
    const estrelas = 5 - indice;
    const linha = document.createElement("div");
    linha.className = "curso-avaliacoes__barra";

    const rotulo = document.createElement("span");
    rotulo.textContent = `${estrelas} ★`;
    linha.appendChild(rotulo);

    const trilho = document.createElement("div");
    trilho.className = "curso-avaliacoes__barra-trilho";
    const preenchimento = document.createElement("div");
    preenchimento.className = "curso-avaliacoes__barra-preenchimento";
    preenchimento.style.width = `${percentagem}%`;
    trilho.appendChild(preenchimento);
    linha.appendChild(trilho);

    const valor = document.createElement("span");
    valor.textContent = `${percentagem}%`;
    linha.appendChild(valor);

    barrasEl.appendChild(linha);
  });

  const reviewsEl = document.querySelector("#curso-avaliacoes-lista");
  reviewsEl.replaceChildren();
  dados.reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "curso-avaliacao-card";

    const avatar = document.createElement("div");
    avatar.className = "curso-avaliacao-card__avatar";
    avatar.textContent = calcularIniciais(review.nome);
    card.appendChild(avatar);

    const corpo = document.createElement("div");
    corpo.className = "curso-avaliacao-card__corpo";

    const cabecalho = document.createElement("div");
    cabecalho.className = "curso-avaliacao-card__cabecalho";
    const nome = document.createElement("strong");
    nome.textContent = review.nome;
    cabecalho.appendChild(nome);
    const data = document.createElement("span");
    data.textContent = review.data;
    cabecalho.appendChild(data);
    corpo.appendChild(cabecalho);

    const cargo = document.createElement("p");
    cargo.className = "curso-avaliacao-card__cargo";
    cargo.textContent = review.cargo;
    corpo.appendChild(cargo);

    const estrelas = document.createElement("span");
    estrelas.className = "cursos__estrelas";
    const preenchimentoEstrelas = document.createElement("span");
    preenchimentoEstrelas.className = "cursos__estrelas-preenchimento";
    preenchimentoEstrelas.style.width = `${(review.avaliacao / 5) * 100}%`;
    estrelas.appendChild(preenchimentoEstrelas);
    corpo.appendChild(estrelas);

    const texto = document.createElement("p");
    texto.className = "curso-avaliacao-card__texto";
    texto.textContent = review.texto;
    corpo.appendChild(texto);

    card.appendChild(corpo);
    reviewsEl.appendChild(card);
  });

  const relacionadosEl = document.querySelector("#curso-relacionados-grelha");
  relacionadosEl.replaceChildren();
  const relacionados = Object.entries(CURSOS_DADOS)
    .filter(([outroSlug, outroCurso]) => outroSlug !== slug && outroCurso.categoriaSlug === dados.categoriaSlug)
    .slice(0, 3);

  relacionados.forEach(([outroSlug, outroCurso]) => {
    const artigo = document.createElement("article");
    artigo.className = "cartao";

    const imagem = document.createElement("img");
    imagem.className = "cartao__imagem";
    imagem.src = outroCurso.imagem;
    imagem.alt = outroCurso.imagemAlt;
    imagem.width = 480;
    imagem.height = 320;
    imagem.loading = "lazy";
    artigo.appendChild(imagem);

    const corpoRelacionado = document.createElement("div");
    corpoRelacionado.className = "cartao__corpo";

    const etiqueta = document.createElement("span");
    etiqueta.className = "cartao__etiqueta";
    etiqueta.textContent = outroCurso.categoria;
    corpoRelacionado.appendChild(etiqueta);

    const tituloRelacionado = document.createElement("h3");
    tituloRelacionado.className = "cartao__titulo";
    tituloRelacionado.textContent = outroCurso.titulo;
    corpoRelacionado.appendChild(tituloRelacionado);

    const textoRelacionado = document.createElement("p");
    textoRelacionado.className = "cartao__texto";
    textoRelacionado.textContent = outroCurso.subtitulo;
    corpoRelacionado.appendChild(textoRelacionado);

    const link = document.createElement("a");
    link.className = "cartao__leiamais";
    link.href = `curso-detalhe.html?slug=${encodeURIComponent(outroSlug)}`;
    link.append("Ver curso ");

    const svgNS = "http://www.w3.org/2000/svg";
    const seta = document.createElementNS(svgNS, "svg");
    seta.setAttribute("viewBox", "0 0 24 24");
    seta.setAttribute("fill", "none");
    seta.setAttribute("stroke", "currentColor");
    seta.setAttribute("stroke-width", "2");
    seta.setAttribute("stroke-linecap", "round");
    seta.setAttribute("stroke-linejoin", "round");
    seta.setAttribute("aria-hidden", "true");
    const setaPath = document.createElementNS(svgNS, "path");
    setaPath.setAttribute("d", "M5 12h14M13 6l6 6-6 6");
    seta.appendChild(setaPath);
    link.appendChild(seta);

    corpoRelacionado.appendChild(link);
    artigo.appendChild(corpoRelacionado);
    relacionadosEl.appendChild(artigo);
  });

  document.querySelector("#curso-relacionados-secao").hidden = relacionados.length === 0;

  container.hidden = false;
}

function initFiltroGaleria() {
  const filtros = document.querySelectorAll(".galeria__filtro");
  const itens = document.querySelectorAll(".galeria__item");
  if (!filtros.length || !itens.length) return;

  filtros.forEach((filtro) => {
    filtro.addEventListener("click", () => {
      const alvo = filtro.dataset.filtro;

      filtros.forEach((outroFiltro) => {
        const estaAtivo = outroFiltro === filtro;
        outroFiltro.classList.toggle("esta-ativo", estaAtivo);
        outroFiltro.setAttribute("aria-selected", String(estaAtivo));
      });

      itens.forEach((item) => {
        const mostrar = alvo === "todos" || item.dataset.tipo === alvo;
        item.classList.toggle("galeria__item--oculto", !mostrar);
      });
    });
  });
}

function initFiltroCursos() {
  const cursos = document.querySelectorAll(".cursos__cartao");
  const vazio = document.querySelector("#cursos-vazio");
  const grelha = document.querySelector(".cursos__grelha");
  if (!cursos.length) return;

  const campoPesquisa = document.querySelector("#cursos-pesquisa");

  // ----- Dropdown de categoria -----
  const dropdown = document.querySelector("[data-categoria-dropdown]");
  const categoriaTrigger = dropdown?.querySelector(".cursos__categoria-trigger");
  const categoriaTexto = dropdown?.querySelector(".cursos__categoria-texto");
  const categoriaContagemTrigger = dropdown?.querySelector(
    ".cursos__categoria-trigger > .cursos__filtro-contagem"
  );
  const categoriaLista = dropdown?.querySelector(".cursos__categoria-lista");
  const opcoesCategoria = dropdown ? Array.from(dropdown.querySelectorAll('[role="option"]')) : [];

  let categoriaAtiva = "todos";

  opcoesCategoria.forEach((opcao) => {
    const contagemEl = opcao.querySelector(".cursos__filtro-contagem");
    if (!contagemEl) return;
    const alvo = opcao.dataset.filtro;
    contagemEl.textContent =
      alvo === "todos"
        ? cursos.length
        : Array.from(cursos).filter((curso) => curso.dataset.categoria === alvo).length;
  });
  if (categoriaContagemTrigger) categoriaContagemTrigger.textContent = cursos.length;

  function fecharCategoria() {
    if (!categoriaLista) return;
    categoriaLista.hidden = true;
    categoriaTrigger?.setAttribute("aria-expanded", "false");
  }

  function abrirCategoria() {
    if (!categoriaLista) return;
    categoriaLista.hidden = false;
    categoriaTrigger?.setAttribute("aria-expanded", "true");
  }

  categoriaTrigger?.addEventListener("click", () => {
    if (categoriaLista?.hidden === false) fecharCategoria();
    else abrirCategoria();
  });

  opcoesCategoria.forEach((opcao) => {
    opcao.addEventListener("click", () => {
      categoriaAtiva = opcao.dataset.filtro;

      opcoesCategoria.forEach((outraOpcao) => {
        const estaAtiva = outraOpcao === opcao;
        outraOpcao.classList.toggle("esta-ativo", estaAtiva);
        outraOpcao.setAttribute("aria-selected", String(estaAtiva));
      });

      if (categoriaTexto) categoriaTexto.textContent = opcao.dataset.label;
      if (categoriaContagemTrigger) {
        categoriaContagemTrigger.textContent = opcao.querySelector(".cursos__filtro-contagem")?.textContent || "";
      }

      fecharCategoria();
      aplicarFiltro();
    });

    opcao.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        opcao.click();
      }
    });
  });

  document.addEventListener("click", (evento) => {
    if (dropdown && !dropdown.contains(evento.target)) fecharCategoria();
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharCategoria();
  });

  // ----- Painel de filtros avançados -----
  const painelBotao = document.querySelector(".cursos__filtros-avancados-botao");
  const painel = document.querySelector("#cursos-filtros-painel");
  const painelContagem = document.querySelector(".cursos__filtros-avancados-contagem");
  const campoModalidade = document.querySelector("#cursos-filtro-modalidade");
  const campoNivel = document.querySelector("#cursos-filtro-nivel");
  const campoPreco = document.querySelector("#cursos-filtro-preco");
  const campoGratis = document.querySelector("#cursos-filtro-gratis");
  const campoCertificado = document.querySelector("#cursos-filtro-certificado");
  const botaoLimpar = document.querySelector(".cursos__filtros-limpar");

  painelBotao?.addEventListener("click", () => {
    if (!painel) return;
    const abrir = painel.hidden;
    if (abrir) {
      painel.hidden = false;
      requestAnimationFrame(() => painel.classList.add("esta-visivel"));
    } else {
      painel.classList.remove("esta-visivel");
      painel.addEventListener("transitionend", () => { painel.hidden = true; }, { once: true });
    }
    painelBotao.setAttribute("aria-expanded", String(abrir));
  });

  function atualizarContagemAvancados() {
    if (!painelContagem) return;
    let total = 0;
    if (campoModalidade && campoModalidade.value !== "todos") total += 1;
    if (campoNivel && campoNivel.value !== "todos") total += 1;
    if (campoPreco && campoPreco.value !== "todos") total += 1;
    if (campoGratis?.checked) total += 1;
    if (campoCertificado?.checked) total += 1;

    painelContagem.textContent = total;
    painelContagem.hidden = total === 0;
  }

  // O painel de detalhe abre para a esquerda nos cards da última coluna
  // da grelha. Usar `:nth-child` no CSS para isso não funciona depois de
  // filtrar: os cards escondidos continuam a contar para a posição,
  // por isso um card que fica sozinho no início da lista filtrada podia
  // herdar a mesma posição (e o mesmo espelhamento) que tinha na grelha
  // completa. Aqui recalculamos a última coluna a partir dos cards
  // realmente visíveis, usando o nº de colunas atual da grelha.
  function atualizarUltimaColuna() {
    if (!grelha) return;
    const colunas = getComputedStyle(grelha).gridTemplateColumns.split(" ").length;
    const visiveis = Array.from(cursos).filter((curso) => !curso.classList.contains("cursos__cartao--oculto"));

    cursos.forEach((curso) => curso.classList.remove("cursos__cartao--ultima-coluna"));
    visiveis.forEach((curso, indice) => {
      if ((indice + 1) % colunas === 0) {
        curso.classList.add("cursos__cartao--ultima-coluna");
      }
    });
  }

  function aplicarFiltro() {
    const termo = (campoPesquisa?.value || "").trim().toLowerCase();
    const modalidade = campoModalidade?.value || "todos";
    const nivel = campoNivel?.value || "todos";
    const [precoMin, precoMax] = (campoPreco?.value || "todos").split("-").map(Number);
    const soGratis = campoGratis?.checked || false;
    const soCertificado = campoCertificado?.checked || false;
    let visiveis = 0;

    cursos.forEach((curso) => {
      const correspondeCategoria = categoriaAtiva === "todos" || curso.dataset.categoria === categoriaAtiva;
      const titulo = curso.querySelector(".cartao__titulo")?.textContent.toLowerCase() || "";
      const formador = curso.querySelector(".cursos__cartao-formador")?.textContent.toLowerCase() || "";
      const correspondePesquisa = !termo || titulo.includes(termo) || formador.includes(termo);
      const correspondeModalidade = modalidade === "todos" || curso.dataset.modalidade === modalidade;
      const correspondeNivel = nivel === "todos" || curso.dataset.nivel === nivel || curso.dataset.nivel === "todos";
      const preco = Number(curso.dataset.preco || 0);
      const correspondePreco =
        campoPreco?.value === "todos" || !campoPreco?.value || (preco >= precoMin && preco <= precoMax);
      const correspondeGratis = !soGratis || curso.dataset.gratis === "true";
      const correspondeCertificado = !soCertificado || curso.dataset.certificado === "true";

      const mostrar =
        correspondeCategoria &&
        correspondePesquisa &&
        correspondeModalidade &&
        correspondeNivel &&
        correspondePreco &&
        correspondeGratis &&
        correspondeCertificado;

      curso.classList.toggle("cursos__cartao--oculto", !mostrar);
      if (mostrar) visiveis += 1;
    });

    vazio?.classList.toggle("esta-visivel", visiveis === 0);
    atualizarContagemAvancados();
    atualizarUltimaColuna();
  }

  [campoModalidade, campoNivel, campoPreco].forEach((campo) => {
    campo?.addEventListener("change", aplicarFiltro);
  });
  [campoGratis, campoCertificado].forEach((campo) => {
    campo?.addEventListener("change", aplicarFiltro);
  });

  botaoLimpar?.addEventListener("click", () => {
    if (campoModalidade) campoModalidade.value = "todos";
    if (campoNivel) campoNivel.value = "todos";
    if (campoPreco) campoPreco.value = "todos";
    if (campoGratis) campoGratis.checked = false;
    if (campoCertificado) campoCertificado.checked = false;
    aplicarFiltro();
  });

  campoPesquisa?.addEventListener("input", aplicarFiltro);

  let redimensionarTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(redimensionarTimeout);
    redimensionarTimeout = setTimeout(atualizarUltimaColuna, 150);
  });

  atualizarContagemAvancados();
  atualizarUltimaColuna();
}

// Em ecrãs de toque não há hover, por isso o painel de detalhe do
// curso (o que aprende, formador, duração) abre ao tocar no botão
// "Ver detalhes do curso" em vez de ao passar o rato — ver a media
// query "(hover: none), (pointer: coarse), (max-width: 640px)" em
// sections.css para a posição/visibilidade do painel nesse caso.
function initDetalheCursoMovel() {
  const botoes = document.querySelectorAll(".cursos__cartao-detalhe-toggle");
  if (!botoes.length) return;

  function fechar(cartao) {
    cartao.classList.remove("cursos__cartao--aberto");
    cartao.querySelector(".cursos__cartao-detalhe-toggle")?.setAttribute("aria-expanded", "false");
  }

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      const cartao = botao.closest(".cursos__cartao");
      if (!cartao) return;
      const estaAberto = cartao.classList.contains("cursos__cartao--aberto");

      document.querySelectorAll(".cursos__cartao--aberto").forEach((outroCartao) => {
        if (outroCartao !== cartao) fechar(outroCartao);
      });

      cartao.classList.toggle("cursos__cartao--aberto", !estaAberto);
      botao.setAttribute("aria-expanded", String(!estaAberto));
    });
  });

  document.addEventListener("click", (evento) => {
    const aberto = document.querySelector(".cursos__cartao--aberto");
    if (!aberto || aberto.contains(evento.target)) return;
    fechar(aberto);
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    const aberto = document.querySelector(".cursos__cartao--aberto");
    if (aberto) fechar(aberto);
  });
}

// No desktop, o painel de detalhe abre ao passar o rato. Um :hover CSS
// puro fecha tudo assim que o cursor sai do card — incluindo o
// instante em que atravessa o pequeno vão até ao painel — o que faz o
// painel desaparecer antes do utilizador conseguir clicar em "Mostrar
// mais". Aqui damos uma margem de tolerância: só fecha se o rato não
// voltar a entrar no card (ou no próprio painel, que é seu descendente)
// dentro de ATRASO_FECHO_MS.
function initDetalheCursoDesktop() {
  const cartoes = document.querySelectorAll(".cursos__cartao");
  if (!cartoes.length) return;

  const ATRASO_FECHO_MS = 100;

  cartoes.forEach((cartao) => {
    let temporizador = null;

    cartao.addEventListener("mouseenter", () => {
      clearTimeout(temporizador);
      cartao.classList.add("cursos__cartao--hover-aberto");
    });

    cartao.addEventListener("mouseleave", () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        cartao.classList.remove("cursos__cartao--hover-aberto");
      }, ATRASO_FECHO_MS);
    });
  });
}

function initFavoritosCursos() {
  const botoes = document.querySelectorAll(".cursos__favorito");
  if (!botoes.length) return;

  const CHAVE = "aesoa-cursos-favoritos";

  function obterFavoritosGuardados() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE) || "[]");
    } catch {
      return [];
    }
  }

  const favoritos = new Set(obterFavoritosGuardados());

  function guardar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(Array.from(favoritos)));
    } catch {
      // localStorage indisponível — favoritos simplesmente não persistem.
    }
  }

  botoes.forEach((botao) => {
    const slug = botao.dataset.slug;
    const estaFavorito = favoritos.has(slug);
    botao.classList.toggle("esta-favorito", estaFavorito);
    botao.setAttribute("aria-pressed", String(estaFavorito));

    botao.addEventListener("click", () => {
      const ativo = botao.classList.toggle("esta-favorito");
      botao.setAttribute("aria-pressed", String(ativo));
      if (ativo) {
        favoritos.add(slug);
      } else {
        favoritos.delete(slug);
      }
      guardar();
    });
  });
}

function initLightboxGaleria() {
  const itens = Array.from(document.querySelectorAll(".galeria__item"));
  const lightbox = document.querySelector("#lightbox-galeria");
  if (!itens.length || !lightbox) return;

  const conteudo = lightbox.querySelector("#lightbox-conteudo");
  const legenda = lightbox.querySelector("#lightbox-legenda");
  const contador = lightbox.querySelector("#lightbox-contador");
  const botaoAnterior = lightbox.querySelector("[data-lightbox-anterior]");
  const botaoSeguinte = lightbox.querySelector("[data-lightbox-seguinte]");

  let indiceAtual = 0;
  let elementoAnterior = null;

  const itensVisiveis = () => itens.filter((item) => !item.classList.contains("galeria__item--oculto"));

  const pararMedia = () => {
    const media = conteudo.querySelector("video");
    if (media) media.pause();
  };

  const renderizar = (indice) => {
    const lista = itensVisiveis();
    if (!lista.length) return;

    indiceAtual = (indice + lista.length) % lista.length;
    const item = lista[indiceAtual];

    conteudo.innerHTML = "";

    if (item.dataset.tipo === "video") {
      const video = document.createElement("video");
      video.src = item.dataset.src;
      video.poster = item.dataset.poster || "";
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.className = "lightbox__video";
      conteudo.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = item.dataset.src;
      img.alt = item.dataset.legenda || "";
      img.className = "lightbox__imagem";
      conteudo.appendChild(img);
    }

    legenda.textContent = item.dataset.legenda || "";
    contador.textContent = `${indiceAtual + 1} / ${lista.length}`;
  };

  const abrir = (indice, origem) => {
    elementoAnterior = origem || document.activeElement;
    renderizar(indice);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-aberta");
    lightbox.querySelector(".lightbox__fechar").focus();
  };

  const fechar = () => {
    pararMedia();
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-aberta");
    conteudo.innerHTML = "";
    elementoAnterior?.focus();
  };

  const anterior = () => {
    pararMedia();
    renderizar(indiceAtual - 1);
  };

  const seguinte = () => {
    pararMedia();
    renderizar(indiceAtual + 1);
  };

  itens.forEach((item) => {
    item.addEventListener("click", () => {
      const indiceVisivel = itensVisiveis().indexOf(item);
      abrir(indiceVisivel === -1 ? 0 : indiceVisivel, item);
    });
  });

  lightbox.querySelectorAll("[data-lightbox-fechar]").forEach((elemento) => {
    elemento.addEventListener("click", fechar);
  });

  botaoAnterior?.addEventListener("click", anterior);
  botaoSeguinte?.addEventListener("click", seguinte);

  document.addEventListener("keydown", (evento) => {
    if (lightbox.hidden) return;
    if (evento.key === "Escape") fechar();
    if (evento.key === "ArrowLeft") anterior();
    if (evento.key === "ArrowRight") seguinte();
  });
}

function initPartilhaModalEstudo() {
  const modal = document.querySelector("#estudo-partilha-modal");
  const botaoAbrir = document.querySelector("#estudo-partilhar-abrir");
  if (!modal || !botaoAbrir) return;

  const campoLink = modal.querySelector("#estudo-partilha-link-campo");
  const botaoCopiar = modal.querySelector("#estudo-partilha-copiar");
  const textoCopiar = modal.querySelector("#estudo-partilha-copiar-texto");
  let elementoAnterior = null;

  const abrir = () => {
    elementoAnterior = document.activeElement;
    modal.hidden = false;
    modal.querySelector(".partilha-modal__fechar").focus();
  };

  const fechar = () => {
    modal.hidden = true;
    elementoAnterior?.focus();
  };

  botaoAbrir.addEventListener("click", abrir);

  modal.querySelectorAll("[data-partilha-fechar]").forEach((elemento) => {
    elemento.addEventListener("click", fechar);
  });

  document.addEventListener("keydown", (evento) => {
    if (modal.hidden) return;
    if (evento.key === "Escape") fechar();
  });

  botaoCopiar?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(campoLink.value);
    } catch {
      campoLink.select();
      document.execCommand("copy");
    }
    textoCopiar.textContent = "Copiado!";
    setTimeout(() => {
      textoCopiar.textContent = "Copiar link";
    }, 2000);
  });
}

function renderizarVisaoGeralEstudo(dados) {
  document.querySelector("#estudo-resumo-titulo").textContent = dados.titulo;
  document.querySelector("#estudo-resumo-subtitulo").textContent = dados.subtitulo;
  document.querySelector("#estudo-resumo-estrelas").style.width = `${(dados.avaliacaoMedia / 5) * 100}%`;
  document.querySelector("#estudo-resumo-avaliacao-numero").textContent = dados.avaliacaoMedia.toFixed(1);
  document.querySelector("#estudo-resumo-avaliacao-total").textContent = `(${dados.totalAvaliacoes} avaliações)`;
  document.querySelector("#estudo-resumo-meta-duracao").textContent = dados.duracao;
  document.querySelector("#estudo-resumo-meta-data").textContent = `Início: ${dados.dataInicio}`;
  document.querySelector("#estudo-resumo-meta-modalidade").textContent = dados.local
    ? `${dados.modalidade} · ${dados.local}`
    : dados.modalidade;

  const totalAulas = dados.programa.reduce((soma, modulo) => soma + modulo.licoes.length, 0);
  const horasVideo = dados.duracao.match(/(\d+)\s*h/);
  document.querySelector("#estudo-numeros-nivel").textContent =
    dados.nivel === "Todos os Níveis" ? dados.nivel : `Nível ${dados.nivel}`;
  document.querySelector("#estudo-numeros-aulas").textContent = `${totalAulas} aulas`;
  document.querySelector("#estudo-numeros-video").textContent = horasVideo
    ? `${horasVideo[1]} horas no total`
    : dados.duracao;
  document.querySelector("#estudo-numeros-idioma").textContent = "Português";
  document.querySelector("#estudo-numeros-legendas").textContent = "Não";

  const sobreEl = document.querySelector("#estudo-sobre-texto");
  sobreEl.className = "curso-sobre__texto";
  sobreEl.replaceChildren();
  dados.descricao.forEach((paragrafo) => {
    const p = document.createElement("p");
    p.textContent = paragrafo;
    sobreEl.appendChild(p);
  });

  const svgNS = "http://www.w3.org/2000/svg";
  const aprenderEl = document.querySelector("#estudo-aprender-lista");
  aprenderEl.replaceChildren();
  dados.oQueVaiAprender.forEach((item) => {
    const li = document.createElement("li");
    li.className = "curso-aprender__item";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    const polyline = document.createElementNS(svgNS, "polyline");
    polyline.setAttribute("points", "20 6 9 17 4 12");
    svg.appendChild(polyline);
    li.appendChild(svg);
    const texto = document.createElement("span");
    texto.textContent = item;
    li.appendChild(texto);
    aprenderEl.appendChild(li);
  });

  const requisitosEl = document.querySelector("#estudo-requisitos-lista");
  requisitosEl.replaceChildren();
  dados.requisitos.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    requisitosEl.appendChild(li);
  });

  document.querySelector("#estudo-formador-iniciais").textContent = calcularIniciais(dados.formador.nome);
  document.querySelector("#estudo-formador-nome").textContent = dados.formador.nome;
  document.querySelector("#estudo-formador-credenciais").textContent = dados.formador.credenciais;
  document.querySelector("#estudo-formador-bio").textContent = dados.formador.bio;
  document.querySelector("#estudo-formador-stat-cursos").textContent = dados.formador.nCursos;
  document.querySelector("#estudo-formador-stat-formandos").textContent = `${dados.formador.nFormandos}+`;
  document.querySelector("#estudo-formador-stat-avaliacao").textContent = dados.formador.avaliacaoMedia.toFixed(1);
}

function renderizarAvaliacoesEstudo(dados) {
  document.querySelector("#estudo-avaliacoes-media-numero").textContent = dados.avaliacaoMedia.toFixed(1);
  document.querySelector("#estudo-avaliacoes-media-estrelas").style.width = `${(dados.avaliacaoMedia / 5) * 100}%`;
  document.querySelector("#estudo-avaliacoes-media-total").textContent = `${dados.totalAvaliacoes} avaliações`;

  const barrasEl = document.querySelector("#estudo-avaliacoes-barras");
  barrasEl.replaceChildren();
  dados.distribuicaoEstrelas.forEach((percentagem, indice) => {
    const estrelas = 5 - indice;
    const linha = document.createElement("div");
    linha.className = "curso-avaliacoes__barra";

    const rotulo = document.createElement("span");
    rotulo.textContent = `${estrelas} ★`;
    linha.appendChild(rotulo);

    const trilho = document.createElement("div");
    trilho.className = "curso-avaliacoes__barra-trilho";
    const preenchimento = document.createElement("div");
    preenchimento.className = "curso-avaliacoes__barra-preenchimento";
    preenchimento.style.width = `${percentagem}%`;
    trilho.appendChild(preenchimento);
    linha.appendChild(trilho);

    const valor = document.createElement("span");
    valor.textContent = `${percentagem}%`;
    linha.appendChild(valor);

    barrasEl.appendChild(linha);
  });

  const reviewsEl = document.querySelector("#estudo-avaliacoes-lista");
  reviewsEl.replaceChildren();
  dados.reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "curso-avaliacao-card";

    const avatar = document.createElement("div");
    avatar.className = "curso-avaliacao-card__avatar";
    avatar.textContent = calcularIniciais(review.nome);
    card.appendChild(avatar);

    const corpo = document.createElement("div");
    corpo.className = "curso-avaliacao-card__corpo";

    const cabecalho = document.createElement("div");
    cabecalho.className = "curso-avaliacao-card__cabecalho";
    const nome = document.createElement("strong");
    nome.textContent = review.nome;
    cabecalho.appendChild(nome);
    const data = document.createElement("span");
    data.textContent = review.data;
    cabecalho.appendChild(data);
    corpo.appendChild(cabecalho);

    const cargo = document.createElement("p");
    cargo.className = "curso-avaliacao-card__cargo";
    cargo.textContent = review.cargo;
    corpo.appendChild(cargo);

    const estrelas = document.createElement("span");
    estrelas.className = "cursos__estrelas";
    const preenchimentoEstrelas = document.createElement("span");
    preenchimentoEstrelas.className = "cursos__estrelas-preenchimento";
    preenchimentoEstrelas.style.width = `${(review.avaliacao / 5) * 100}%`;
    estrelas.appendChild(preenchimentoEstrelas);
    corpo.appendChild(estrelas);

    const texto = document.createElement("p");
    texto.className = "curso-avaliacao-card__texto";
    texto.textContent = review.texto;
    corpo.appendChild(texto);

    card.appendChild(corpo);
    reviewsEl.appendChild(card);
  });
}

function initSeparadoresEstudo() {
  const botaoVisao = document.querySelector("#estudo-aba-visao-botao");
  const botaoAvaliacoes = document.querySelector("#estudo-aba-avaliacoes-botao");
  const painelVisao = document.querySelector("#estudo-aba-visao");
  const painelAvaliacoes = document.querySelector("#estudo-aba-avaliacoes");
  if (!botaoVisao || !botaoAvaliacoes || !painelVisao || !painelAvaliacoes) return;

  function activar(botaoActivo, botaoInactivo, painelActivo, painelInactivo) {
    botaoActivo.classList.add("esta-ativo");
    botaoActivo.setAttribute("aria-selected", "true");
    botaoInactivo.classList.remove("esta-ativo");
    botaoInactivo.setAttribute("aria-selected", "false");
    painelActivo.hidden = false;
    painelInactivo.hidden = true;
  }

  botaoVisao.addEventListener("click", () => activar(botaoVisao, botaoAvaliacoes, painelVisao, painelAvaliacoes));
  botaoAvaliacoes.addEventListener("click", () => activar(botaoAvaliacoes, botaoVisao, painelAvaliacoes, painelVisao));
}

function initPaginaEstudo() {
  const container = document.querySelector("#estudo-conteudo");
  const naoEncontrado = document.querySelector("#estudo-nao-encontrado");
  if (!container || !naoEncontrado) return;

  const parametrosIniciais = new URLSearchParams(location.search);
  const slug = parametrosIniciais.get("slug");
  const dados =
    typeof CURSOS_DADOS !== "undefined" && slug && Object.hasOwn(CURSOS_DADOS, slug) ? CURSOS_DADOS[slug] : null;

  if (!dados) {
    naoEncontrado.hidden = false;
    container.hidden = true;
    return;
  }

  document.title = `${dados.titulo} | Estudar | AESOA`;
  document.querySelector("#estudo-titulo").textContent = dados.titulo;
  document.querySelector("#estudo-voltar").href = `curso-detalhe.html?slug=${slug}`;

  const urlAtual = encodeURIComponent(location.href);
  const tituloCodificado = encodeURIComponent(dados.titulo);
  document.querySelector("#estudo-whatsapp").href = `https://wa.me/?text=${tituloCodificado}%20${urlAtual}`;
  document.querySelector("#estudo-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${urlAtual}`;
  document.querySelector("#estudo-email").href = `mailto:?subject=${tituloCodificado}&body=${urlAtual}`;
  document.querySelector("#estudo-partilha-link-campo").value = location.href;

  renderizarVisaoGeralEstudo(dados);
  renderizarAvaliacoesEstudo(dados);
  initSeparadoresEstudo();

  const TIPO_ROTULO = { aula: "Aula", pratica: "Prática", avaliacao: "Avaliação" };
  const svgNS = "http://www.w3.org/2000/svg";

  function criarIconeCheck() {
    const icone = document.createElementNS(svgNS, "svg");
    icone.setAttribute("class", "estudo-lateral__check-icone");
    icone.setAttribute("viewBox", "0 0 24 24");
    icone.setAttribute("fill", "none");
    icone.setAttribute("stroke", "currentColor");
    icone.setAttribute("stroke-width", "2.5");
    icone.setAttribute("stroke-linecap", "round");
    icone.setAttribute("stroke-linejoin", "round");
    icone.setAttribute("aria-hidden", "true");
    const polyline = document.createElementNS(svgNS, "polyline");
    polyline.setAttribute("points", "20 6 9 17 4 12");
    icone.appendChild(polyline);
    return icone;
  }

  function resolverAulaInicial() {
    const parametros = new URLSearchParams(location.search);
    const moduloParam = Number.parseInt(parametros.get("modulo"), 10);
    const licaoParam = Number.parseInt(parametros.get("licao"), 10);
    if (
      Number.isInteger(moduloParam) &&
      Number.isInteger(licaoParam) &&
      dados.programa[moduloParam] &&
      dados.programa[moduloParam].licoes[licaoParam]
    ) {
      return { indiceModulo: moduloParam, indiceLicao: licaoParam };
    }

    const aulasConcluidas = obterAulasConcluidas(slug);
    if (aulasConcluidas.length > 0) {
      const proxima = encontrarProximaAulaNaoConcluida(dados.programa, aulasConcluidas);
      if (proxima) return proxima;
    }

    return { indiceModulo: 0, indiceLicao: 0 };
  }

  const aulaActual = resolverAulaInicial();
  const modulosAbertos = new Set();

  function atualizarUrlAula() {
    const parametros = new URLSearchParams(location.search);
    parametros.set("slug", slug);
    parametros.set("modulo", String(aulaActual.indiceModulo));
    parametros.set("licao", String(aulaActual.indiceLicao));
    history.replaceState(null, "", `${location.pathname}?${parametros.toString()}`);
  }

  function renderizarProgressoTopo() {
    const aulasConcluidas = obterAulasConcluidas(slug);
    const { concluidas, total } = calcularContagemProgresso(dados.programa, aulasConcluidas);
    document.querySelector("#estudo-progresso-fracao").textContent = `${concluidas}/${total}`;

    const percentagem = total > 0 ? concluidas / total : 0;
    const circunferencia = 2 * Math.PI * 13;
    const arco = document.querySelector("#estudo-progresso-arco");
    arco.style.strokeDasharray = String(circunferencia);
    arco.style.strokeDashoffset = String(circunferencia * (1 - percentagem));

    document.querySelector("#estudo-progresso").classList.toggle("esta-completo", total > 0 && concluidas === total);
  }

  function renderizarAulaActual() {
    const modulo = dados.programa[aulaActual.indiceModulo];
    const licao = modulo.licoes[aulaActual.indiceLicao];
    const lista = obterListaPlanaAulas(dados.programa);
    const numeroAula =
      lista.findIndex(
        (item) => item.indiceModulo === aulaActual.indiceModulo && item.indiceLicao === aulaActual.indiceLicao
      ) + 1;
    document.querySelector("#estudo-aula-titulo").textContent = `${numeroAula}. ${licao.titulo}`;

    const aulasConcluidas = obterAulasConcluidas(slug);
    const chave = `${aulaActual.indiceModulo}-${aulaActual.indiceLicao}`;
    const estaConcluida = aulasConcluidas.includes(chave);
    const botaoConcluir = document.querySelector("#estudo-botao-concluir");
    botaoConcluir.classList.toggle("esta-concluida", estaConcluida);
    botaoConcluir.setAttribute("aria-pressed", String(estaConcluida));
    document.querySelector("#estudo-botao-concluir-texto").textContent = estaConcluida
      ? "Aula concluída"
      : "Marcar como concluída";
  }

  function renderizarNavegacaoVideo() {
    const lista = obterListaPlanaAulas(dados.programa);
    const indiceActual = lista.findIndex(
      (item) => item.indiceModulo === aulaActual.indiceModulo && item.indiceLicao === aulaActual.indiceLicao
    );

    const botaoAnterior = document.querySelector("#estudo-video-anterior");
    const dicaAnterior = document.querySelector("#estudo-video-anterior-dica");
    const aulaAnterior = lista[indiceActual - 1];
    botaoAnterior.disabled = !aulaAnterior;
    botaoAnterior.setAttribute("aria-label", aulaAnterior ? `Aula anterior: ${aulaAnterior.titulo}` : "Aula anterior");
    dicaAnterior.textContent = aulaAnterior ? aulaAnterior.titulo : "";

    const botaoSeguinte = document.querySelector("#estudo-video-seguinte");
    const dicaSeguinte = document.querySelector("#estudo-video-seguinte-dica");
    const aulaSeguinte = lista[indiceActual + 1];
    botaoSeguinte.disabled = !aulaSeguinte;
    botaoSeguinte.setAttribute("aria-label", aulaSeguinte ? `Próxima aula: ${aulaSeguinte.titulo}` : "Próxima aula");
    dicaSeguinte.textContent = aulaSeguinte ? aulaSeguinte.titulo : "";
  }

  function irParaAulaRelativa(delta) {
    const lista = obterListaPlanaAulas(dados.programa);
    const indiceActual = lista.findIndex(
      (item) => item.indiceModulo === aulaActual.indiceModulo && item.indiceLicao === aulaActual.indiceLicao
    );
    const destino = lista[indiceActual + delta];
    if (!destino) return;

    aulaActual.indiceModulo = destino.indiceModulo;
    aulaActual.indiceLicao = destino.indiceLicao;
    atualizarUrlAula();
    renderizarAulaActual();
    renderizarNavegacaoVideo();
    renderizarSidebar();
  }

  function renderizarSidebar() {
    const aulasConcluidas = obterAulasConcluidas(slug);
    const listaEl = document.querySelector("#estudo-lateral-lista");
    listaEl.replaceChildren();

    const { concluidas: totalConcluidas, total: totalAulas } = calcularContagemProgresso(
      dados.programa,
      aulasConcluidas
    );
    document.querySelector("#estudo-lateral-resumo").textContent =
      `${dados.programa.length} módulos · ${totalConcluidas}/${totalAulas} aulas concluídas`;

    let contadorAula = 0;

    dados.programa.forEach((modulo, indiceModulo) => {
      const item = document.createElement("div");
      const moduloContemAulaActual =
        modulosAbertos.size > 0
          ? modulosAbertos.has(indiceModulo)
          : indiceModulo === aulaActual.indiceModulo;
      item.className = moduloContemAulaActual ? "curso-programa__modulo esta-aberto" : "curso-programa__modulo";

      const idPainel = `estudo-modulo-painel-${indiceModulo}`;

      const botaoModulo = document.createElement("button");
      botaoModulo.type = "button";
      botaoModulo.className = "curso-programa__cabecalho";
      botaoModulo.setAttribute("aria-expanded", String(moduloContemAulaActual));
      botaoModulo.setAttribute("aria-controls", idPainel);
      botaoModulo.appendChild(criarSetaColapso("curso-programa__seta"));

      const tituloModulo = document.createElement("span");
      tituloModulo.className = "curso-programa__titulo-modulo";
      tituloModulo.textContent = modulo.titulo.replace(/\s+—\s+/, ": ");
      botaoModulo.appendChild(tituloModulo);

      const meta = document.createElement("span");
      meta.className = "curso-programa__cabecalho-meta";
      const { concluidas: concluidasModulo, total: totalModulo } = calcularContagemModulo(
        modulo,
        indiceModulo,
        aulasConcluidas
      );
      const contagem = document.createElement("span");
      contagem.className = "curso-programa__contagem";
      contagem.textContent = `${concluidasModulo}/${totalModulo}`;
      meta.appendChild(contagem);
      const duracao = document.createElement("span");
      duracao.className = "curso-programa__duracao";
      duracao.textContent = modulo.duracao;
      meta.appendChild(duracao);
      botaoModulo.appendChild(meta);

      botaoModulo.addEventListener("click", () => {
        const aberto = item.classList.toggle("esta-aberto");
        botaoModulo.setAttribute("aria-expanded", String(aberto));
        if (aberto) {
          modulosAbertos.add(indiceModulo);
        } else {
          modulosAbertos.delete(indiceModulo);
        }
      });

      item.appendChild(botaoModulo);

      const painel = document.createElement("div");
      painel.className = "curso-programa__painel";
      painel.id = idPainel;
      const painelInterior = document.createElement("div");
      painelInterior.className = "curso-programa__painel-interior";

      const licoesEl = document.createElement("ul");
      licoesEl.className = "curso-programa__licoes";

      modulo.licoes.forEach((licao, indiceLicao) => {
        const li = document.createElement("li");
        li.className = "curso-programa__licao";

        const linha = document.createElement("div");
        linha.className = "estudo-lateral__aula";

        const chave = `${indiceModulo}-${indiceLicao}`;
        const estaConcluida = aulasConcluidas.includes(chave);
        const estaSelecionada =
          indiceModulo === aulaActual.indiceModulo && indiceLicao === aulaActual.indiceLicao;

        const check = document.createElement("button");
        check.type = "button";
        check.className = estaConcluida ? "estudo-lateral__check esta-concluida" : "estudo-lateral__check";
        check.setAttribute("aria-pressed", String(estaConcluida));
        check.setAttribute(
          "aria-label",
          estaConcluida ? "Marcar aula como não concluída" : "Marcar aula como concluída"
        );
        check.appendChild(criarIconeCheck());
        check.addEventListener("click", () => {
          guardarAulasConcluidas(slug, alternarConclusao(obterAulasConcluidas(slug), chave));
          renderizarSidebar();
          renderizarProgressoTopo();
          renderizarAulaActual();
        });
        linha.appendChild(check);

        const botaoLicao = document.createElement("button");
        botaoLicao.type = "button";
        botaoLicao.className = estaSelecionada
          ? "estudo-lateral__aula-botao esta-selecionada"
          : "estudo-lateral__aula-botao";

        const tipoEl = document.createElement("span");
        tipoEl.className = `curso-programa__licao-tipo curso-programa__licao-tipo--${licao.tipo}`;
        tipoEl.textContent = TIPO_ROTULO[licao.tipo];
        botaoLicao.appendChild(tipoEl);

        contadorAula += 1;
        const tituloLicao = document.createElement("span");
        tituloLicao.className = "curso-programa__licao-titulo";
        tituloLicao.textContent = `${contadorAula}. ${licao.titulo}`;
        botaoLicao.appendChild(tituloLicao);

        const duracaoLicao = document.createElement("span");
        duracaoLicao.className = "curso-programa__licao-duracao";
        duracaoLicao.textContent = licao.duracao;
        botaoLicao.appendChild(duracaoLicao);

        botaoLicao.addEventListener("click", () => {
          aulaActual.indiceModulo = indiceModulo;
          aulaActual.indiceLicao = indiceLicao;
          atualizarUrlAula();
          renderizarAulaActual();
          renderizarNavegacaoVideo();
          renderizarSidebar();
        });
        linha.appendChild(botaoLicao);

        li.appendChild(linha);
        licoesEl.appendChild(li);
      });

      painelInterior.appendChild(licoesEl);
      painel.appendChild(painelInterior);
      item.appendChild(painel);
      listaEl.appendChild(item);
    });
  }

  document.querySelector("#estudo-botao-concluir").addEventListener("click", () => {
    const chave = `${aulaActual.indiceModulo}-${aulaActual.indiceLicao}`;
    guardarAulasConcluidas(slug, alternarConclusao(obterAulasConcluidas(slug), chave));
    renderizarAulaActual();
    renderizarSidebar();
    renderizarProgressoTopo();
  });

  document.querySelector("#estudo-video-anterior").addEventListener("click", () => irParaAulaRelativa(-1));
  document.querySelector("#estudo-video-seguinte").addEventListener("click", () => irParaAulaRelativa(1));

  atualizarUrlAula();
  renderizarAulaActual();
  renderizarNavegacaoVideo();
  renderizarSidebar();
  renderizarProgressoTopo();

  container.hidden = false;
  naoEncontrado.hidden = true;
}

const CHAVE_PAINEL_ESTUDO = "aesoa-estudo-painel-estado";

function obterEstadoPainel() {
  try {
    const estado = localStorage.getItem(CHAVE_PAINEL_ESTUDO);
    return estado === "expandido" || estado === "fechado" ? estado : "normal";
  } catch {
    return "normal";
  }
}

function guardarEstadoPainel(estado) {
  try {
    localStorage.setItem(CHAVE_PAINEL_ESTUDO, estado);
  } catch {
    // localStorage indisponível — a preferência simplesmente não persiste.
  }
}

function initPainelEstudo() {
  const corpo = document.querySelector(".estudo-corpo");
  const botaoExpandir = document.querySelector("#estudo-painel-expandir");
  const dicaExpandir = document.querySelector("#estudo-painel-expandir-dica");
  const botaoFechar = document.querySelector("#estudo-painel-fechar");
  const botaoReabrir = document.querySelector("#estudo-painel-reabrir");
  if (!corpo || !botaoExpandir || !dicaExpandir || !botaoFechar || !botaoReabrir) return;

  let ultimoEstadoAberto = "normal";

  function aplicarEstado(estado) {
    corpo.classList.toggle("estudo-painel--expandido", estado === "expandido");
    corpo.classList.toggle("estudo-painel--fechado", estado === "fechado");
    botaoExpandir.classList.toggle("esta-ativo", estado === "expandido");
    botaoExpandir.setAttribute("aria-label", estado === "expandido" ? "Reduzir painel" : "Expandir painel");
    dicaExpandir.textContent = estado === "expandido" ? "Reduzir painel" : "Expandir painel";
    botaoReabrir.hidden = estado !== "fechado";
    if (estado !== "fechado") ultimoEstadoAberto = estado;
    guardarEstadoPainel(estado);
  }

  botaoExpandir.addEventListener("click", () => {
    const estaExpandido = corpo.classList.contains("estudo-painel--expandido");
    aplicarEstado(estaExpandido ? "normal" : "expandido");
  });

  botaoFechar.addEventListener("click", () => {
    aplicarEstado("fechado");
    botaoReabrir.focus();
  });
  botaoReabrir.addEventListener("click", () => {
    aplicarEstado(ultimoEstadoAberto);
    botaoFechar.focus();
  });

  aplicarEstado(obterEstadoPainel());
}

/*
 * Cada init*() trata da secção/página onde os seus elementos existem e
 * faz early-return quando não os encontra. Numa página normal, a maioria
 * das ~30 chamadas abaixo é um no-op. Correr cada uma através deste
 * wrapper evita que um erro numa (ex.: um id em falta nessa página)
 * aborte todas as chamadas seguintes na fila — sem isto, uma excepção
 * lançada a meio da lista impede a inicialização de secções completamente
 * não relacionadas que vêm depois.
 */
function executarInit(funcaoInit) {
  try {
    funcaoInit();
  } catch (erro) {
    console.error(`Falha ao inicializar "${funcaoInit.name}":`, erro);
  }
}

function initLogin() {
  const pagina = document.querySelector(".pagina-login");
  if (!pagina) return;

  const formularioLogin = document.querySelector("#formulario-login");
  const botaoSenha = document.querySelector("[data-alternar-senha]");

  if (botaoSenha) {
    const campoSenha = document.querySelector("#login-senha");
    const iconeAberto = botaoSenha.querySelector(".login__icone-olho:not(.login__icone-olho--fechado)");
    const iconeFechado = botaoSenha.querySelector(".login__icone-olho--fechado");

    botaoSenha.addEventListener("click", () => {
      const estaVisivel = campoSenha.type === "text";
      campoSenha.type = estaVisivel ? "password" : "text";
      botaoSenha.setAttribute("aria-pressed", String(!estaVisivel));
      botaoSenha.setAttribute("aria-label", estaVisivel ? "Mostrar senha" : "Ocultar senha");
      iconeAberto.hidden = !estaVisivel;
      iconeFechado.hidden = estaVisivel;
    });
  }

  function tratarSubmissaoSimulada(formulario, mensagens) {
    if (!formulario) return;

    const mensagem = formulario.querySelector(".formulario__mensagem");
    const botao = formulario.querySelector("button[type='submit']");
    const textoOriginal = botao.textContent;

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
      }

      // Sem backend por enquanto: simula o pedido de entrada.
      // Substituir por uma chamada à API (ex: fetch) quando o backend existir.
      botao.disabled = true;
      botao.textContent = mensagens.aEnviar;
      mensagem.classList.remove("formulario__mensagem--erro", "esta-visivel");

      setTimeout(() => {
        botao.disabled = false;
        botao.textContent = textoOriginal;
        mensagem.textContent = mensagens.sucesso;
        mensagem.classList.add("formulario__mensagem--sucesso", "esta-visivel");
        formulario.reset();
      }, 900);
    });
  }

  tratarSubmissaoSimulada(formularioLogin, {
    aEnviar: "A entrar…",
    sucesso: "Sessão simulada. A área de sócio está em preparação — brevemente disponível.",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  executarInit(initVideoHero);
  executarInit(initCabecalhoFixo);
  executarInit(initMenuMobile);
  executarInit(initSubmenusDropdown);
  executarInit(initAcordeaoValores);
  executarInit(initAbasPrograma);
  executarInit(initAcordeaoFAQ);
  executarInit(initAcordeaoEstatutos);
  executarInit(initAnoRodape);
  executarInit(initRevelarAoScroll);
  executarInit(initBotaoTopo);
  executarInit(initFormularioMembro);
  executarInit(initFormularioCongresso);
  executarInit(initFormularioContacto);
  executarInit(initFormularioNewsletter);
  executarInit(initPaginaNoticia);
  executarInit(initPaginaCurso);
  executarInit(initAcordeaoProgramaCurso);
  executarInit(initPaginaEstudo);
  executarInit(initPainelEstudo);
  executarInit(initPartilhaModalEstudo);
  executarInit(initSobreCursoExpandir);
  executarInit(initSobreEstudoExpandir);
  executarInit(initFormularioBanco);
  executarInit(initFiltroGaleria);
  executarInit(initLightboxGaleria);
  executarInit(initFiltroCursos);
  executarInit(initDetalheCursoMovel);
  executarInit(initDetalheCursoDesktop);
  executarInit(initFavoritosCursos);
  executarInit(initLogin);
});
