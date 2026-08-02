/*
 * AESOA — JavaScript principal (vanilla ES6+)
 * Cada função trata de uma secção/comportamento isolado para facilitar
 * a futura extracção para componentes Vue.
 */

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
  const precoRealFormatado = `${dados.precoReal.toLocaleString("pt-PT")} Kz`;
  precoRealEl.textContent = precoRealFormatado;
  if (dados.precoSocio === 0) {
    precoSocioEl.textContent = "Grátis para Sócios";
  } else {
    precoSocioEl.textContent = `Sócios: ${dados.precoSocio.toLocaleString("pt-PT")} Kz`;
    if (dados.descontoSelo) {
      const selo = document.createElement("span");
      selo.className = "cursos__cartao-preco-selo";
      selo.textContent = dados.descontoSelo;
      precoSocioEl.appendChild(selo);
    }
  }

  document.querySelector("#curso-inscricao-selo-vagas").hidden = !dados.vagasLimitadas;

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
  const favoritos = new Set(JSON.parse(localStorage.getItem(CHAVE) || "[]"));

  function guardar() {
    localStorage.setItem(CHAVE, JSON.stringify(Array.from(favoritos)));
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

document.addEventListener("DOMContentLoaded", () => {
  initVideoHero();
  initCabecalhoFixo();
  initMenuMobile();
  initSubmenusDropdown();
  initAcordeaoValores();
  initAbasPrograma();
  initAcordeaoFAQ();
  initAcordeaoEstatutos();
  initAnoRodape();
  initRevelarAoScroll();
  initBotaoTopo();
  initFormularioMembro();
  initFormularioCongresso();
  initFormularioContacto();
  initFormularioNewsletter();
  initPaginaNoticia();
  initPaginaCurso();
  initFormularioBanco();
  initFiltroGaleria();
  initLightboxGaleria();
  initFiltroCursos();
  initDetalheCursoMovel();
  initDetalheCursoDesktop();
  initFavoritosCursos();
});
