#!/usr/bin/env node
/*
 * AESOA — Sincronizador do "chrome" partilhado (topbar + cabeçalho/nav + rodapé)
 *
 * Problema que resolve: o topbar, o menu principal e o rodapé estão duplicados,
 * byte a byte, em todas as páginas HTML. Sempre que se altera o menu (ex: ligar
 * um novo link), é preciso repetir a edição em todos os ficheiros — já aconteceu
 * várias vezes nesta fase do projeto.
 *
 * O que este script faz: mantém a estrutura do topbar/cabeçalho/rodapé como
 * modelo único aqui (TOPBAR_HTML / HEADER_TEMPLATE / FOOTER_TEMPLATE) e
 * regenera essas três secções em cada página HTML listada em PAGINAS,
 * marcando o item de menu/rodapé correto como "aria-current=page" para
 * essa página. Tudo o resto de cada ficheiro (title, meta tags, <main>...)
 * fica exactamente como está — o script só toca no que vem entre os
 * comentários "<!-- SECTION: topbar -->" / "<!-- SECTION: cabecalho -->" /
 * "<!-- SECTION: rodape -->" e os respectivos fechos.
 *
 * Uso:
 *   node scripts/sync-layout.js           → aplica as alterações
 *   node scripts/sync-layout.js --check   → só mostra que ficheiros mudariam,
 *                                            sem escrever nada (modo seguro)
 *
 * Este script é uma ferramenta de desenvolvimento, não faz parte do site
 * publicado. Quando o projeto migrar para Vue/Laravel, este ficheiro deixa
 * de ser necessário — o topbar/cabeçalho/rodapé passam a ser um componente
 * de layout único (ex: AppLayout.vue).
 */

const fs = require("node:fs");
const path = require("node:path");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

// ===== Modelo único do topbar (sem variação entre páginas) =====
const TOPBAR_HTML = `<!-- SECTION: topbar -->
  <div class="topbar">
    <div class="container topbar__interior">
      <div class="topbar__contactos">
        <a class="topbar__contacto" href="tel:+244923000000">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path
              d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.8 2.1z" />
          </svg>
          <span>+244 923 000 000</span>
        </a>
        <span class="topbar__separador" aria-hidden="true"></span>
        <a class="topbar__contacto" href="mailto:geral@aesoa.ao">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m3 6 9 7 9-7" />
          </svg>
          <span>geral@aesoa.ao</span>
        </a>
      </div>

      <div class="topbar__acoes">
        <a class="topbar__login" href="login.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="8" r="4" />
          </svg>
          Login de membro
        </a>
        <span class="topbar__separador" aria-hidden="true"></span>
        <a class="topbar__cta" href="__CTA_HREF__">Inscrever-se hoje</a>
      </div>
    </div>
  </div>
  <!-- /SECTION: topbar -->`;

// ===== Modelo único do cabeçalho/menu (versão "neutra", sem aria-current) =====
// Para adicionar/remover/renomear um item de menu, editar SÓ aqui.
const HEADER_TEMPLATE = `<!-- SECTION: cabecalho -->
  <header class="cabecalho">
    <div class="container cabecalho__interior">
      <a class="cabecalho__logo" href="index.html" aria-label="AESOA — Página inicial">
        <span class="cabecalho__logo-caixa">
          <img src="assets/img/logo-emblema.png" alt="Logótipo da AESOA" width="40" height="40" />
        </span>
        <span class="cabecalho__logo-texto">AESOA</span>
      </a>

      <nav class="nav" id="nav-principal" aria-label="Navegação principal">
        <ul class="nav__lista">
          <li class="nav__item">
            <a class="nav__link" href="index.html">Início</a>
          </li>

          <li class="nav__item nav__item--dropdown">
            <a class="nav__link" href="about.html">
              Associação
              <svg class="nav__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
            <ul class="nav__submenu">
              <li><a class="nav__link" href="about.html">Sobre a AESOA</a></li>
              <li><a class="nav__link" href="corpossociais.html">Direção institucional</a></li>
              <li><a class="nav__link" href="corpossociais.html">Conselho Fiscal</a></li>
              <li><a class="nav__link" href="estatutos.html">Estatutos</a></li>
            </ul>
          </li>

          <li class="nav__item nav__item--dropdown">
            <a class="nav__link" href="#">
              Serviços
              <svg class="nav__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
            <ul class="nav__submenu">
              <li><a class="nav__link" href="cursos.html">Cursos</a></li>
              <li><a class="nav__link" href="consultadoria-saude.html">Consultadoria de Saúde</a></li>
              <li><a class="nav__link" href="eventos-webinars.html">Eventos & Webinars</a></li>
              <li><a class="nav__link" href="banco-enfermeiros.html">Banco com Enfermeiros</a></li>
              <li><a class="nav__link" href="aconselhamento-juridico.html">Aconselhamento Jurídico</a></li>
            </ul>
          </li>

          <li class="nav__item nav__item--dropdown">
            <a class="nav__link" href="#">
              Eventos
              <svg class="nav__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
            <ul class="nav__submenu">
              <li class="nav__item--dropdown">
                <a class="nav__link" href="#">
                  AESOA Congressos
                  <svg class="nav__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </a>
                <ul class="nav__submenu">
                  <li><a class="nav__link" href="congresso-nacional-2025.html">Congresso Nacional AESOA 2025</a></li>
                </ul>
              </li>
            </ul>
          </li>

          <li class="nav__item">
            <a class="nav__link" href="noticias.html">Notícias</a>
          </li>

          <li class="nav__item">
            <a class="nav__link" href="galeria.html">Galeria</a>
          </li>


          <li class="nav__item">
            <a class="nav__link" href="contactos.html">Contactos</a>
          </li>
        </ul>
      </nav>

      <button type="button" class="cabecalho__alternar" id="botao-menu" aria-controls="nav-principal"
        aria-expanded="false" aria-label="Abrir menu de navegação">
        <span class="cabecalho__alternar-linha"></span>
        <span class="cabecalho__alternar-linha"></span>
        <span class="cabecalho__alternar-linha"></span>
      </button>
    </div>
  </header>
  <!-- /SECTION: cabecalho -->`;

// ===== Modelo único do rodapé (versão "neutra", sem aria-current) =====
const FOOTER_TEMPLATE = `<!-- SECTION: rodape -->
  <footer class="rodape">
    <div class="container">
      <div class="rodape__grelha">
        <div>
          <span class="rodape__logo-caixa">
            <img class="rodape__logo" src="assets/img/logo-emblema.png" alt="Logótipo da AESOA" loading="lazy" />
          </span>
          <p class="rodape__descricao">
            Associação dos Enfermeiros da Sala Operatória de Angola. Formação, representação e
            segurança do doente na sala operatória.
          </p>
        </div>

        <nav aria-label="Links rápidos">
          <h4 class="rodape__titulo">Links Rápidos</h4>
          <ul class="rodape__lista">
            <li><a href="index.html">Início</a></li>
            <li><a href="about.html">Sobre a AESOA</a></li>
            <li><a href="socios.html">Sócios</a></li>
            <li><a href="noticias.html">Notícias</a></li>
            <li><a href="galeria.html">Galeria</a></li>
            <li><a href="contactos.html">Contactos</a></li>
          </ul>
        </nav>

        <div>
          <h4 class="rodape__titulo">Contactos</h4>
          <div class="rodape__contacto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Rua Amílcar Cabral, Bairro Maianga, Luanda, Angola</span>
          </div>
          <div class="rodape__contacto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <path
                d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.8 2.1z" />
            </svg>
            <span><a href="tel:+244923000000">+244 923 000 000</a></span>
          </div>
          <div class="rodape__contacto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
            <span><a href="mailto:geral@aesoa.ao">geral@aesoa.ao</a></span>
          </div>
        </div>
      </div>

      <div class="rodape__baixo">
        <p>© <span data-ano-atual>2026</span> AESOA. Todos os
          direitos reservados.
          <span class="rodape__creditos rodape__creditos--desktop">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Desenvolvido por <strong>Kimossi</strong>
          </span>
        </p>
        <div class="rodape__redes">
          <a href="#" aria-label="AESOA no Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.6-1.5h1.6V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.4H7.7v3H10V21h3.5z" />
            </svg>
          </a>
          <a href="#" aria-label="AESOA no LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M6.9 8.4H3.6V20h3.3V8.4zM5.3 3.3a1.9 1.9 0 1 0 0 3.9 1.9 1.9 0 0 0 0-3.9zM20.4 20h-3.3v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.3-.1.2-.1.6-.1.9V20H10s.1-10.5 0-11.6h3.3v1.6c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5V20z" />
            </svg>
          </a>
          <a href="#" aria-label="AESOA no Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" />
            </svg>
          </a>
        </div>

        <p class="rodape__creditos rodape__creditos--mobile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Desenvolvido por <strong>Kimossi</strong>
        </p>
      </div>
    </div>
  </footer>
  <!-- /SECTION: rodape -->`;

// ===== Qual página marca qual link de menu / rodapé como "actual" =====
// footerCurrent fica a null quando o rodapé não tem link para essa página
// (ex.: Estatutos e os Serviços não aparecem nos "Links Rápidos" do rodapé)
// ou quando, hoje, essa página ainda não marca o próprio link no rodapé
// (mantido tal como está, para não mudar comportamento existente).
//
// pularRodape: true → esta página tem um rodapé personalizado (diferente do
// modelo partilhado) e o script não lhe mexe. Caso conhecido:
// congresso-nacional-2025.html troca o link "Sócios" por um link próprio
// para si mesma nos Links Rápidos — é intencional, não uma inconsistência.
const PAGINAS = {
  "index.html": { navCurrent: "index.html", footerCurrent: null, ctaHref: "#torne-se-membro" },
  "about.html": { navCurrent: "about.html", footerCurrent: "about.html" },
  "estatutos.html": { navCurrent: "estatutos.html", footerCurrent: null },
  "contactos.html": { navCurrent: "contactos.html", footerCurrent: "contactos.html" },
  "noticias.html": { navCurrent: "noticias.html", footerCurrent: "noticias.html" },
  "noticia.html": { navCurrent: "noticias.html", footerCurrent: "noticias.html" },
  "galeria.html": { navCurrent: "galeria.html", footerCurrent: "galeria.html" },
  "congresso-nacional-2025.html": {
    navCurrent: "congresso-nacional-2025.html",
    footerCurrent: null,
    pularRodape: true,
  },
  "cursos.html": { navCurrent: "cursos.html", footerCurrent: null },
  "consultadoria-saude.html": { navCurrent: "consultadoria-saude.html", footerCurrent: null },
  "eventos-webinars.html": { navCurrent: "eventos-webinars.html", footerCurrent: null },
  "banco-enfermeiros.html": { navCurrent: "banco-enfermeiros.html", footerCurrent: null },
  "aconselhamento-juridico.html": { navCurrent: "aconselhamento-juridico.html", footerCurrent: null },
};

function escapeRegExp(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderTopbar(ctaHref) {
  return TOPBAR_HTML.replace("__CTA_HREF__", ctaHref || "index.html#torne-se-membro");
}

function renderHeader(navCurrent) {
  const alvo = new RegExp(`(<a class="nav__link" href="${escapeRegExp(navCurrent)}")>`, "g");
  return HEADER_TEMPLATE.replace(alvo, '$1 aria-current="page">');
}

function renderFooter(footerCurrent) {
  if (!footerCurrent) return FOOTER_TEMPLATE;
  const alvo = `href="${footerCurrent}">`;
  return FOOTER_TEMPLATE.replace(alvo, `href="${footerCurrent}" aria-current="page">`);
}

function substituirSeccao(conteudo, nomeSeccao, novoBloco) {
  const regex = new RegExp(
    `<!-- SECTION: ${nomeSeccao} -->[\\s\\S]*?<!-- /SECTION: ${nomeSeccao} -->`
  );
  if (!regex.test(conteudo)) {
    throw new Error(`Secção "${nomeSeccao}" não encontrada`);
  }
  return conteudo.replace(regex, novoBloco);
}

function main() {
  const modoVerificacao = process.argv.includes("--check");
  let alterados = 0;
  let inalterados = 0;

  for (const [ficheiro, config] of Object.entries(PAGINAS)) {
    const caminho = path.join(PUBLIC_DIR, ficheiro);
    if (!fs.existsSync(caminho)) {
      console.log(`(ignorado, não existe) ${ficheiro}`);
      continue;
    }

    const original = fs.readFileSync(caminho, "utf8");
    let atualizado = original;
    atualizado = substituirSeccao(atualizado, "topbar", renderTopbar(config.ctaHref));
    atualizado = substituirSeccao(atualizado, "cabecalho", renderHeader(config.navCurrent));
    if (!config.pularRodape) {
      atualizado = substituirSeccao(atualizado, "rodape", renderFooter(config.footerCurrent));
    }

    if (atualizado === original) {
      inalterados += 1;
      continue;
    }

    alterados += 1;
    console.log(`${modoVerificacao ? "[mudaria]" : "[atualizado]"} ${ficheiro}`);
    if (!modoVerificacao) {
      fs.writeFileSync(caminho, atualizado, "utf8");
    }
  }

  console.log(
    `\n${alterados} ficheiro(s) ${modoVerificacao ? "mudariam" : "atualizados"}, ${inalterados} já estavam em sincronia.`
  );
}

main();
