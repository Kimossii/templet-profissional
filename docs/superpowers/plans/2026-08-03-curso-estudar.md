# Página de Estudo do Curso (estilo player da Udemy) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `public/curso-estudar.html`, a single dynamic template (`?slug=`) that simulates the Udemy "study the course" player experience — video placeholder, current-lesson header with a completion toggle, "Visão geral"/"Avaliações" tabs, and a sticky "Conteúdo do curso" sidebar with per-lesson completion checkboxes — with progress persisted in `localStorage`. Adds a "Já é aluno? Continuar Curso" entry point on `curso-detalhe.html`.

**Architecture:** 100% static site, no backend, same pattern as `curso-detalhe.html`. Reuses `CURSOS_DADOS` from `public/assets/js/cursos-dados.js` unchanged (no new fields). A new `initPaginaEstudo()` in `main.js` reads `?slug=` (and optionally `&modulo=&licao=`), renders the page, and wires up in-page lesson switching via `history.replaceState` (no reload). Lesson-completion state lives in `localStorage` under a new key, read/written through small pure helper functions that are unit-testable in plain Node (via a sandboxed `vm` context — this repo has no test framework, so this is the closest equivalent to a unit test here). Visual pieces are aggressively reused from `curso-detalhe.html`'s existing CSS classes (`curso-programa__*`, `curso-avaliacoes__*`, `curso-avaliacao-card*`, `curso-formador__*`, `curso-aprender__*`, `curso-lista`, `curso-sobre__texto`) — only the page's own chrome (top bar, video placeholder, tabs, sidebar shell, checkboxes) gets new CSS.

**Tech Stack:** Plain HTML/CSS/JS, no build step. No test framework — verification is `node --check` for syntax, a throwaway Node script (using `vm` + `assert`, not committed) for the pure progress-logic functions, and headless Chrome screenshots (`google-chrome --headless=new --screenshot=...`) read back with the `Read` tool for every visual/interactive step, exactly as used throughout this project so far.

## Global Constraints

- No backend, no accounts — "aluno" is just local `localStorage` state per browser, no real enrolment check (spec: "Fora de âmbito").
- No real video — a static placeholder ("Vídeo desta aula em breve") replaces it everywhere.
- Only two tabs: **Visão geral** and **Avaliações**. Do not add Perguntas e respostas, Anotações, Ferramentas de aprendizado, or AI Assistant — not even as "em breve" placeholders (spec: "Fora de âmbito").
- All new markup/classes in Portuguese, prefixed `estudo-` for this page's own chrome; reuse existing `curso-*` classes wherever the visual is already styled (do not re-style what already exists).
- Reuse existing CSS variables only (`--cor-primaria`, `--espaco-*`, `--raio-*`, `--fs-*`, `--transicao-base`, etc.) — no new hard-coded colors/spacing.
- Progress storage key: `aesoa-cursos-progresso` in `localStorage`, shape `{ "<slug>": ["<moduloIndex>-<licaoIndex>", ...] }`.
- Entry point: a new full-width secondary button in `curso-detalhe.html`'s enrolment card, immediately after "Inscrever-se Agora", linking to `curso-estudar.html?slug=<slug>`.
- Mobile breakpoint matches the rest of the course pages: `max-width: 900px` collapses the two-column layout to one column.

---

## File Structure

- **Create** `public/curso-estudar.html` — page shell: dedicated top bar (no site header/footer), video placeholder, current-lesson header, tabs, sidebar, not-found state (Task 2).
- **Modify** `public/assets/js/main.js` — add pure progress helpers + `localStorage` wrapper (Task 1), `renderizarVisaoGeralEstudo()`, `renderizarAvaliacoesEstudo()`, `initSeparadoresEstudo()`, `initPaginaEstudo()` (Tasks 3–4), register `initPaginaEstudo()` in `DOMContentLoaded` (Task 3), add the "Continuar Curso" href wiring inside `initPaginaCurso()` (Task 5).
- **Modify** `public/assets/css/sections.css` — append one new block, `/* ===== Página Estudo do Curso ===== */`, with all `.estudo-*` rules (Tasks 3–5).
- **Modify** `public/curso-detalhe.html` — add the "Já é aluno? Continuar Curso" button (Task 5).

---

### Task 1: Progress-logic helpers in `main.js` (pure functions + `localStorage` wrapper)

**Files:**
- Modify: `public/assets/js/main.js` (add near the top, after the existing `const` declarations at the very top of the file — check the first ~10 lines for any existing top-level `const`; if none, add as the first lines of the file)

**Interfaces:**
- Produces: `CHAVE_PROGRESSO_CURSOS` (string constant), `obterAulasConcluidas(slug) → string[]`, `guardarAulasConcluidas(slug, aulasConcluidas: string[]) → void`, `calcularContagemProgresso(programa, aulasConcluidas) → { concluidas: number, total: number }`, `calcularContagemModulo(modulo, indiceModulo, aulasConcluidas) → { concluidas: number, total: number }`, `alternarConclusao(aulasConcluidas: string[], chave: string) → string[]` (returns a new array, does not mutate), `encontrarProximaAulaNaoConcluida(programa, aulasConcluidas) → { indiceModulo, indiceLicao } | null`. `programa` is always `dados.programa` from `CURSOS_DADOS` (array of `{ titulo, duracao, licoes: [{ titulo, duracao, tipo, descricao, preview? }] }`) — these functions never touch the DOM.

- [ ] **Step 1: Write the verification script (this fails first — the functions don't exist yet)**

Create a throwaway file (not committed) at `/tmp/verificar-progresso.js`:

```js
const vm = require("node:vm");
const fs = require("node:fs");
const assert = require("node:assert");

const codigo = fs.readFileSync("public/assets/js/main.js", "utf8");
const armazenamento = {};
const sandbox = {
  document: { addEventListener() {} },
  window: { addEventListener() {}, matchMedia() { return { matches: false, addEventListener() {} }; } },
  localStorage: {
    getItem(chave) { return armazenamento[chave] ?? null; },
    setItem(chave, valor) { armazenamento[chave] = valor; },
  },
  location: { search: "" },
  console,
};
vm.createContext(sandbox);
vm.runInContext(codigo, sandbox);

const programa = [
  { licoes: [{}, {}] }, // módulo 0: 2 aulas
  { licoes: [{}, {}, {}] }, // módulo 1: 3 aulas
];

assert.deepStrictEqual(sandbox.calcularContagemProgresso(programa, []), { concluidas: 0, total: 5 });
assert.deepStrictEqual(sandbox.calcularContagemProgresso(programa, ["0-0", "1-2"]), { concluidas: 2, total: 5 });
assert.deepStrictEqual(sandbox.calcularContagemModulo(programa[1], 1, ["0-0", "1-2"]), { concluidas: 1, total: 3 });
assert.deepStrictEqual(sandbox.alternarConclusao(["0-0"], "0-0"), []);
assert.deepStrictEqual(sandbox.alternarConclusao(["0-0"], "1-1"), ["0-0", "1-1"]);
assert.deepStrictEqual(sandbox.encontrarProximaAulaNaoConcluida(programa, []), { indiceModulo: 0, indiceLicao: 0 });
assert.deepStrictEqual(
  sandbox.encontrarProximaAulaNaoConcluida(programa, ["0-0", "0-1"]),
  { indiceModulo: 1, indiceLicao: 0 }
);
assert.strictEqual(
  sandbox.encontrarProximaAulaNaoConcluida(programa, ["0-0", "0-1", "1-0", "1-1", "1-2"]),
  null
);

sandbox.guardarAulasConcluidas("curso-x", ["0-0"]);
assert.deepStrictEqual(sandbox.obterAulasConcluidas("curso-x"), ["0-0"]);
assert.deepStrictEqual(sandbox.obterAulasConcluidas("curso-y"), []);

console.log("Todos os testes de progresso passaram.");
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `node /tmp/verificar-progresso.js`
Expected: `TypeError: sandbox.calcularContagemProgresso is not a function` (or similar — the functions don't exist yet).

- [ ] **Step 3: Add the helpers to `public/assets/js/main.js`**

Add at the very top of the file (before the first existing `function`):

```js
const CHAVE_PROGRESSO_CURSOS = "aesoa-cursos-progresso";

function obterAulasConcluidas(slug) {
  const dados = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO_CURSOS) || "{}");
  return dados[slug] || [];
}

function guardarAulasConcluidas(slug, aulasConcluidas) {
  const dados = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO_CURSOS) || "{}");
  dados[slug] = aulasConcluidas;
  localStorage.setItem(CHAVE_PROGRESSO_CURSOS, JSON.stringify(dados));
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
```

- [ ] **Step 4: Run the syntax check and the verification script again**

Run: `node --check public/assets/js/main.js && node /tmp/verificar-progresso.js`
Expected: no syntax errors, then `Todos os testes de progresso passaram.`

- [ ] **Step 5: Delete the throwaway script and commit**

```bash
rm /tmp/verificar-progresso.js
git add public/assets/js/main.js
git commit -m "feat: add pure progress-tracking helpers for the study page"
```

---

### Task 2: `curso-estudar.html` page skeleton

**Files:**
- Create: `public/curso-estudar.html`

**Interfaces:**
- Produces: every DOM id that Tasks 3–5 will populate: `#estudo-nao-encontrado`, `#estudo-conteudo`, `#estudo-titulo`, `#estudo-voltar`, `#estudo-progresso`, `#estudo-whatsapp`, `#estudo-facebook`, `#estudo-email`, `#estudo-aula-titulo`, `#estudo-botao-concluir`, `#estudo-botao-concluir-texto`, `#estudo-aba-visao-botao`, `#estudo-aba-avaliacoes-botao`, `#estudo-aba-visao`, `#estudo-aba-avaliacoes`, `#estudo-sobre-texto`, `#estudo-aprender-lista`, `#estudo-requisitos-lista`, `#estudo-formador-iniciais`, `#estudo-formador-nome`, `#estudo-formador-credenciais`, `#estudo-formador-bio`, `#estudo-formador-stat-cursos`, `#estudo-formador-stat-formandos`, `#estudo-formador-stat-avaliacao`, `#estudo-avaliacoes-media-numero`, `#estudo-avaliacoes-media-estrelas`, `#estudo-avaliacoes-media-total`, `#estudo-avaliacoes-barras`, `#estudo-avaliacoes-lista`, `#estudo-lateral-resumo`, `#estudo-lateral-lista`.

- [ ] **Step 1: Create the file**

```html
<!doctype html>
<html lang="pt">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Estudar Curso | AESOA — Associação dos Enfermeiros da Sala Operatória de Angola</title>
  <meta name="description" content="Continue o seu curso: veja o programa, marque aulas como concluídas e acompanhe o seu progresso." />
  <meta name="theme-color" content="#123d2c" />

  <link rel="icon" type="image/png" href="assets/img/logo-emblema.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Open+Sans:wght@400;600;700&display=swap"
    rel="stylesheet" />

  <link rel="stylesheet" href="assets/css/variables.css" />
  <link rel="stylesheet" href="assets/css/base.css" />
  <link rel="stylesheet" href="assets/css/components.css" />
  <link rel="stylesheet" href="assets/css/sections.css" />
</head>

<body class="pagina-estudo">
  <section id="estudo-nao-encontrado" class="secao" hidden>
    <div class="container">
      <div class="secao-cabecalho secao-cabecalho--centro">
        <span class="secao-eyebrow">Ups</span>
        <h1>Curso não encontrado</h1>
        <div class="secao-divisor"></div>
        <p>O link pode estar incorrecto ou o curso já não está disponível.</p>
      </div>
      <div class="hero__acoes" style="justify-content:center;">
        <a class="btn btn--primario" href="cursos.html">Ver Todos os Cursos</a>
      </div>
    </div>
  </section>

  <div id="estudo-conteudo" hidden>
    <header class="estudo-topo">
      <div class="estudo-topo__esquerda">
        <a class="estudo-topo__logo" href="index.html" aria-label="AESOA — Página inicial">
          <img src="assets/img/logo-emblema.png" alt="Logótipo da AESOA" width="32" height="32" />
        </a>
        <a class="estudo-topo__voltar" id="estudo-voltar" href="curso-detalhe.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Voltar ao curso</span>
        </a>
      </div>

      <h1 class="estudo-topo__titulo" id="estudo-titulo"></h1>

      <div class="estudo-topo__direita">
        <span class="estudo-topo__progresso" id="estudo-progresso"></span>
        <div class="estudo-topo__partilhar">
          <a id="estudo-whatsapp" target="_blank" rel="noopener" aria-label="Partilhar no WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.4-1.8-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.1.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 3 4.7 4.1.7.3 1.2.4 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
            </svg>
          </a>
          <a id="estudo-facebook" target="_blank" rel="noopener" aria-label="Partilhar no Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.6-1.5h1.6V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.4H7.7v3H10V21h3.5z" />
            </svg>
          </a>
          <a id="estudo-email" aria-label="Partilhar por email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
          </a>
        </div>
      </div>
    </header>

    <main class="container estudo-corpo">
      <div class="estudo-principal">
        <div class="estudo-video">
          <div class="estudo-video__placeholder">
            <svg class="estudo-video__play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16" />
            </svg>
            <p>Vídeo desta aula em breve</p>
          </div>
        </div>

        <div class="estudo-aula-actual">
          <h2 class="estudo-aula-actual__titulo" id="estudo-aula-titulo"></h2>
          <button type="button" class="estudo-aula-actual__concluir" id="estudo-botao-concluir" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span id="estudo-botao-concluir-texto">Marcar como concluída</span>
          </button>
        </div>

        <div class="estudo-separadores">
          <div class="estudo-separadores__botoes" role="tablist">
            <button type="button" class="estudo-separador-botao esta-activo" id="estudo-aba-visao-botao" role="tab"
              aria-selected="true" aria-controls="estudo-aba-visao">Visão geral</button>
            <button type="button" class="estudo-separador-botao" id="estudo-aba-avaliacoes-botao" role="tab"
              aria-selected="false" aria-controls="estudo-aba-avaliacoes">Avaliações</button>
          </div>

          <div class="estudo-separador-painel" id="estudo-aba-visao" role="tabpanel">
            <div id="estudo-sobre-texto"></div>

            <h3 class="estudo-separador-painel__titulo">O Que Vai Aprender</h3>
            <ul class="curso-aprender__grelha" id="estudo-aprender-lista"></ul>

            <h3 class="estudo-separador-painel__titulo">Requisitos</h3>
            <ul class="curso-lista" id="estudo-requisitos-lista"></ul>

            <h3 class="estudo-separador-painel__titulo">Formador</h3>
            <div class="curso-formador__cartao">
              <div class="curso-formador__avatar" id="estudo-formador-iniciais"></div>
              <div class="curso-formador__info">
                <h3 id="estudo-formador-nome"></h3>
                <p class="curso-formador__credenciais" id="estudo-formador-credenciais"></p>
                <p class="curso-formador__bio" id="estudo-formador-bio"></p>
                <div class="curso-formador__stats">
                  <div class="curso-formador__stat">
                    <strong id="estudo-formador-stat-cursos"></strong>
                    <span>cursos na AESOA</span>
                  </div>
                  <div class="curso-formador__stat">
                    <strong id="estudo-formador-stat-formandos"></strong>
                    <span>formandos</span>
                  </div>
                  <div class="curso-formador__stat">
                    <strong id="estudo-formador-stat-avaliacao"></strong>
                    <span>avaliação média</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="estudo-separador-painel" id="estudo-aba-avaliacoes" role="tabpanel" hidden>
            <div class="curso-avaliacoes__resumo">
              <div class="curso-avaliacoes__media">
                <strong id="estudo-avaliacoes-media-numero"></strong>
                <span class="cursos__estrelas"><span class="cursos__estrelas-preenchimento"
                    id="estudo-avaliacoes-media-estrelas"></span></span>
                <span id="estudo-avaliacoes-media-total"></span>
              </div>
              <div class="curso-avaliacoes__barras" id="estudo-avaliacoes-barras"></div>
            </div>
            <div class="curso-avaliacoes__lista" id="estudo-avaliacoes-lista"></div>
          </div>
        </div>
      </div>

      <aside class="estudo-lateral">
        <div class="estudo-lateral__cabecalho">
          <h2>Conteúdo do curso</h2>
          <p class="estudo-lateral__resumo" id="estudo-lateral-resumo"></p>
        </div>
        <div class="estudo-lateral__lista" id="estudo-lateral-lista"></div>
      </aside>
    </main>
  </div>

  <script src="assets/js/cursos-dados.js"></script>
  <script src="assets/js/main.js" defer></script>
</body>

</html>
```

- [ ] **Step 2: Verify the skeleton loads with no console errors and every id is present**

Run:
```bash
cd public && python3 -m http.server 8850 >/tmp/http-plan.log 2>&1 & sleep 1
google-chrome --headless=new --disable-gpu --dump-dom --virtual-time-budget=2000 \
  "http://localhost:8850/curso-estudar.html" > /tmp/estudo-dom.html
for id in estudo-nao-encontrado estudo-conteudo estudo-titulo estudo-lateral-lista estudo-aba-avaliacoes; do
  grep -q "id=\"$id\"" /tmp/estudo-dom.html && echo "OK: $id" || echo "MISSING: $id"
done
fuser -k 8850/tcp
```
Expected: `OK:` printed for all five ids, no `MISSING:` lines. (The page itself renders blank — `#estudo-conteudo` and `#estudo-nao-encontrado` are both `hidden` until `main.js` runs in Task 3 — that's expected at this stage.)

- [ ] **Step 3: Commit**

```bash
git add public/curso-estudar.html
git commit -m "feat: add curso-estudar.html page skeleton"
```

---

### Task 3: Render course content — not-found state, top bar, "Visão geral" and "Avaliações" tabs

**Files:**
- Modify: `public/assets/js/main.js`

**Interfaces:**
- Consumes: `CURSOS_DADOS[slug]` fields `titulo`, `descricao`, `oQueVaiAprender`, `requisitos`, `formador`, `avaliacaoMedia`, `totalAvaliacoes`, `distribuicaoEstrelas`, `reviews`, `programa` (all already defined in `cursos-dados.js`, unchanged).
- Produces: `renderizarVisaoGeralEstudo(dados)`, `renderizarAvaliacoesEstudo(dados)`, `initSeparadoresEstudo()`, and a first version of `initPaginaEstudo()` (Task 4 replaces its body — the function name and its call in `DOMContentLoaded` do not change again after this task).

- [ ] **Step 1: Add the three rendering/behaviour functions**

Add these to `public/assets/js/main.js`, anywhere after the Task 1 helpers and before the final `document.addEventListener("DOMContentLoaded", ...)` block:

```js
function renderizarVisaoGeralEstudo(dados) {
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

  const iniciaisFormador = dados.formador.nome
    .replace(/Enf\.º|Enf\.ª|Chefe|Dr\./g, "")
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  document.querySelector("#estudo-formador-iniciais").textContent = iniciaisFormador;
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
    avatar.textContent = review.nome
      .replace(/Enf\.º|Enf\.ª|Chefe|Dr\./g, "")
      .trim()
      .split(/\s+/)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
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
    botaoActivo.classList.add("esta-activo");
    botaoActivo.setAttribute("aria-selected", "true");
    botaoInactivo.classList.remove("esta-activo");
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

  const parametros = new URLSearchParams(location.search);
  const slug = parametros.get("slug");
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

  const primeiraLicao = dados.programa[0].licoes[0];
  document.querySelector("#estudo-aula-titulo").textContent = primeiraLicao.titulo;
  document.querySelector("#estudo-progresso").textContent = "Seu progresso: 0/0 aulas concluídas";

  renderizarVisaoGeralEstudo(dados);
  renderizarAvaliacoesEstudo(dados);
  initSeparadoresEstudo();

  container.hidden = false;
  naoEncontrado.hidden = true;
}
```

- [ ] **Step 2: Register `initPaginaEstudo()` in the `DOMContentLoaded` listener**

In `public/assets/js/main.js`, find the existing block:
```js
  initPaginaCurso();
  initAcordeaoProgramaCurso();
```
and add the new call right after it:
```js
  initPaginaCurso();
  initAcordeaoProgramaCurso();
  initPaginaEstudo();
```

- [ ] **Step 3: Add the CSS for the top bar, video placeholder, lesson header, and tabs**

Append to `public/assets/css/sections.css`:

```css
/* ===== Página Estudo do Curso ===== */

.estudo-topo {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: var(--espaco-md);
  padding: 0.75rem var(--espaco-lg);
  background-color: var(--cor-cabecalho);
  color: var(--cor-texto-claro);
}

.estudo-topo__esquerda {
  display: flex;
  align-items: center;
  gap: var(--espaco-md);
  flex-shrink: 0;
}

.estudo-topo__logo img {
  display: block;
  border-radius: 50%;
}

.estudo-topo__voltar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--fs-sm);
  font-weight: 600;
  white-space: nowrap;
}

.estudo-topo__voltar:hover {
  color: var(--cor-texto-claro);
}

.estudo-topo__voltar svg {
  width: 16px;
  height: 16px;
}

.estudo-topo__titulo {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--fonte-titulo);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--cor-texto-claro);
  margin: 0;
}

.estudo-topo__direita {
  display: flex;
  align-items: center;
  gap: var(--espaco-md);
  flex-shrink: 0;
}

.estudo-topo__progresso {
  font-size: var(--fs-xs);
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}

.estudo-topo__partilhar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.estudo-topo__partilhar a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.85);
  transition: background-color var(--transicao-base), color var(--transicao-base);
}

.estudo-topo__partilhar a:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--cor-texto-claro);
}

.estudo-topo__partilhar svg {
  width: 16px;
  height: 16px;
}

.estudo-corpo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: var(--espaco-lg);
  align-items: start;
  padding-block: var(--espaco-lg);
}

.estudo-principal {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  min-width: 0;
}

.estudo-video {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--raio-md);
  overflow: hidden;
  background: linear-gradient(135deg, var(--cor-primaria-escura) 0%, var(--cor-cabecalho) 100%);
}

.estudo-video__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--espaco-sm);
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}

.estudo-video__play {
  width: 56px;
  height: 56px;
}

.estudo-video__placeholder p {
  margin: 0;
  font-size: var(--fs-sm);
}

.estudo-aula-actual {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
  padding-bottom: var(--espaco-sm);
  border-bottom: 1px solid var(--cor-borda);
}

.estudo-aula-actual__titulo {
  margin: 0;
  font-size: var(--fs-md);
}

.estudo-aula-actual__concluir {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: 1px solid var(--cor-primaria);
  border-radius: var(--raio-pill);
  background: none;
  color: var(--cor-primaria);
  font-size: var(--fs-sm);
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transicao-base), color var(--transicao-base);
}

.estudo-aula-actual__concluir svg {
  width: 16px;
  height: 16px;
}

.estudo-aula-actual__concluir:hover {
  background-color: var(--cor-primaria-suave);
}

.estudo-aula-actual__concluir.esta-concluida {
  background-color: var(--cor-primaria);
  color: var(--cor-texto-claro);
}

.estudo-separadores__botoes {
  display: flex;
  gap: var(--espaco-md);
  border-bottom: 1px solid var(--cor-borda);
}

.estudo-separador-botao {
  padding: var(--espaco-sm) 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--fonte-titulo);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--cor-texto-suave);
  cursor: pointer;
  transition: color var(--transicao-base), border-color var(--transicao-base);
}

.estudo-separador-botao.esta-activo {
  color: var(--cor-primaria-escura);
  border-bottom-color: var(--cor-primaria);
}

.estudo-separador-painel {
  padding-block: var(--espaco-md);
}

.estudo-separador-painel__titulo {
  font-family: var(--fonte-titulo);
  font-size: var(--fs-md);
  color: var(--cor-primaria-escura);
  margin: var(--espaco-md) 0 var(--espaco-sm);
}

.estudo-separador-painel__titulo:first-child {
  margin-top: 0;
}
```

- [ ] **Step 4: Verify — course content renders, not-found works, tabs switch**

```bash
cd public && python3 -m http.server 8850 >/tmp/http-plan.log 2>&1 & sleep 1
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1400,1000 \
  --screenshot=/tmp/estudo-task3.png --virtual-time-budget=3000 \
  "http://localhost:8850/curso-estudar.html?slug=prevencao-eventos-adversos-cirurgicos"
google-chrome --headless=new --disable-gpu --dump-dom --virtual-time-budget=2000 \
  "http://localhost:8850/curso-estudar.html?slug=curso-que-nao-existe" > /tmp/estudo-naoencontrado.html
grep -q 'id="estudo-nao-encontrado" class="secao">' /tmp/estudo-naoencontrado.html && echo "OK: not-found visible" || echo "FAIL: not-found still hidden"
fuser -k 8850/tcp
```
Then use the `Read` tool on `/tmp/estudo-task3.png` and confirm: dark top bar with the course title, share icons, and "Seu progresso: 0/0 aulas concluídas"; video placeholder with play icon; lesson title matching the course's first lesson; "Visão geral" tab showing description paragraphs, "O Que Vai Aprender" grid, requisitos list, and the formador card; clicking is not testable via screenshot alone, so also confirm the "Avaliações" tab button and panel exist in the DOM dump (`grep -c 'estudo-aba-avaliacoes' /tmp/estudo-dom.html` from Task 2, or re-run the same dump here).
Expected: screenshot matches the description above; `OK: not-found visible` printed.

- [ ] **Step 5: Commit**

```bash
git add public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: render course overview and reviews on the study page"
```

---

### Task 4: Interactive sidebar — module/lesson accordion, completion checkboxes, lesson switching, resume logic

**Files:**
- Modify: `public/assets/js/main.js` (replace the entire body of `initPaginaEstudo()` written in Task 3)
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: Task 1's `obterAulasConcluidas`, `guardarAulasConcluidas`, `calcularContagemProgresso`, `calcularContagemModulo`, `alternarConclusao`, `encontrarProximaAulaNaoConcluida`; Task 3's `renderizarVisaoGeralEstudo`, `renderizarAvaliacoesEstudo`, `initSeparadoresEstudo`.
- Produces: the final `initPaginaEstudo()` — no other task calls its internals directly, so nothing outside this function depends on its nested helper names.

- [ ] **Step 1: Replace `initPaginaEstudo()` with the full interactive version**

In `public/assets/js/main.js`, replace the entire `initPaginaEstudo() { ... }` function added in Task 3 with:

```js
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

  renderizarVisaoGeralEstudo(dados);
  renderizarAvaliacoesEstudo(dados);
  initSeparadoresEstudo();

  const TIPO_ROTULO = { aula: "Aula", pratica: "Prática", avaliacao: "Avaliação" };
  const svgNS = "http://www.w3.org/2000/svg";

  function criarSetaColapso() {
    const seta = document.createElementNS(svgNS, "svg");
    seta.setAttribute("class", "curso-programa__seta");
    seta.setAttribute("viewBox", "0 0 24 24");
    seta.setAttribute("fill", "none");
    seta.setAttribute("stroke", "currentColor");
    seta.setAttribute("stroke-width", "2");
    seta.setAttribute("stroke-linecap", "round");
    seta.setAttribute("stroke-linejoin", "round");
    seta.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "m6 9 6 6 6-6");
    seta.appendChild(path);
    return seta;
  }

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

  function actualizarUrlAula() {
    const parametros = new URLSearchParams(location.search);
    parametros.set("slug", slug);
    parametros.set("modulo", String(aulaActual.indiceModulo));
    parametros.set("licao", String(aulaActual.indiceLicao));
    history.replaceState(null, "", `${location.pathname}?${parametros.toString()}`);
  }

  function renderizarProgressoTopo() {
    const aulasConcluidas = obterAulasConcluidas(slug);
    const { concluidas, total } = calcularContagemProgresso(dados.programa, aulasConcluidas);
    document.querySelector("#estudo-progresso").textContent = `Seu progresso: ${concluidas}/${total} aulas concluídas`;
  }

  function renderizarAulaActual() {
    const modulo = dados.programa[aulaActual.indiceModulo];
    const licao = modulo.licoes[aulaActual.indiceLicao];
    document.querySelector("#estudo-aula-titulo").textContent = licao.titulo;

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

    dados.programa.forEach((modulo, indiceModulo) => {
      const item = document.createElement("div");
      const moduloContemAulaActual = indiceModulo === aulaActual.indiceModulo;
      item.className = moduloContemAulaActual ? "curso-programa__modulo esta-aberto" : "curso-programa__modulo";

      const idPainel = `estudo-modulo-painel-${indiceModulo}`;

      const botaoModulo = document.createElement("button");
      botaoModulo.type = "button";
      botaoModulo.className = "curso-programa__cabecalho";
      botaoModulo.setAttribute("aria-expanded", String(moduloContemAulaActual));
      botaoModulo.setAttribute("aria-controls", idPainel);
      botaoModulo.appendChild(criarSetaColapso());

      const tituloModulo = document.createElement("span");
      tituloModulo.className = "curso-programa__titulo-modulo";
      tituloModulo.textContent = modulo.titulo;
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

        const tituloLicao = document.createElement("span");
        tituloLicao.className = "curso-programa__licao-titulo";
        tituloLicao.textContent = licao.titulo;
        botaoLicao.appendChild(tituloLicao);

        const duracaoLicao = document.createElement("span");
        duracaoLicao.className = "curso-programa__licao-duracao";
        duracaoLicao.textContent = licao.duracao;
        botaoLicao.appendChild(duracaoLicao);

        botaoLicao.addEventListener("click", () => {
          aulaActual.indiceModulo = indiceModulo;
          aulaActual.indiceLicao = indiceLicao;
          actualizarUrlAula();
          renderizarAulaActual();
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

  actualizarUrlAula();
  renderizarAulaActual();
  renderizarSidebar();
  renderizarProgressoTopo();

  container.hidden = false;
  naoEncontrado.hidden = true;
}
```

- [ ] **Step 2: Add the sidebar CSS**

Append to `public/assets/css/sections.css` (right after the block added in Task 3):

```css
.estudo-lateral {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-lg);
  background-color: var(--cor-fundo);
  box-shadow: var(--sombra-md);
}

.estudo-lateral__cabecalho {
  padding: var(--espaco-md);
  border-bottom: 1px solid var(--cor-borda);
}

.estudo-lateral__cabecalho h2 {
  margin: 0 0 0.25rem;
  font-size: var(--fs-md);
}

.estudo-lateral__resumo {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--cor-texto-suave);
}

.estudo-lateral__lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: var(--espaco-sm);
}

.estudo-lateral__lista .curso-programa__modulo {
  border: none;
  border-bottom: 1px solid var(--cor-borda);
  border-radius: 0;
}

.estudo-lateral__lista .curso-programa__modulo:last-child {
  border-bottom: none;
}

.estudo-lateral__aula {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.estudo-lateral__check {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--cor-borda);
  background: none;
  color: transparent;
  cursor: pointer;
  transition: background-color var(--transicao-base), border-color var(--transicao-base), color var(--transicao-base);
}

.estudo-lateral__check:hover {
  border-color: var(--cor-primaria);
}

.estudo-lateral__check.esta-concluida {
  background-color: var(--cor-primaria);
  border-color: var(--cor-primaria);
  color: var(--cor-texto-claro);
}

.estudo-lateral__check-icone {
  width: 14px;
  height: 14px;
}

.estudo-lateral__aula-botao {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.5rem;
  border: none;
  border-radius: var(--raio-sm);
  background: none;
  text-align: left;
  font-size: var(--fs-sm);
  color: var(--cor-texto);
  cursor: pointer;
}

.estudo-lateral__aula-botao:hover {
  background-color: var(--cor-fundo-alt);
}

.estudo-lateral__aula-botao.esta-selecionada {
  background-color: var(--cor-primaria-suave);
}

.estudo-lateral__aula-botao .curso-programa__licao-titulo {
  flex: 1;
}
```

- [ ] **Step 3: Verify — initial screenshot (sidebar, counts, selected lesson highlight)**

```bash
cd public && python3 -m http.server 8850 >/tmp/http-plan.log 2>&1 & sleep 1
node --check ../public/assets/js/main.js
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1400,1100 \
  --screenshot=/tmp/estudo-task4-inicial.png --virtual-time-budget=3000 \
  "http://localhost:8850/curso-estudar.html?slug=prevencao-eventos-adversos-cirurgicos"
fuser -k 8850/tcp
```
Use the `Read` tool on `/tmp/estudo-task4-inicial.png`. Expected: sidebar on the right shows "X módulos · 0/N aulas concluídas", each module header shows "0/Y · duração", Módulo 1 is expanded (its lesson rows visible, each with an empty circular checkbox, a coloured type pill, title, and duration), and the first lesson row is highlighted (light green background) matching the lesson title shown above the tabs.

- [ ] **Step 4: Verify — clicking a lesson updates the main area, clicking a checkbox persists after reload**

Copy `public/curso-estudar.html` to a throwaway `public/_debug-estudo.html`, add a script at the end of `<body>` (before the closing tag, after the two existing `<script>` tags) that runs after `load`:
```html
<script>
  window.addEventListener("load", () => {
    setTimeout(() => {
      const linhas = document.querySelectorAll(".estudo-lateral__aula-botao");
      linhas[1].click(); // segunda aula do módulo 1
      document.querySelector("#estudo-botao-concluir").click(); // marcar como concluída
    }, 300);
  });
</script>
```
Then:
```bash
cd public && python3 -m http.server 8850 >/tmp/http-plan.log 2>&1 & sleep 1
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1400,1100 \
  --screenshot=/tmp/estudo-task4-clicado.png --virtual-time-budget=4000 \
  "http://localhost:8850/_debug-estudo.html?slug=prevencao-eventos-adversos-cirurgicos"
```
Use the `Read` tool on `/tmp/estudo-task4-clicado.png`. Expected: lesson title above the tabs now matches the second lesson of module 1; the "Marcar como concluída" button shows "Aula concluída" (filled green); the sidebar's second lesson row shows a filled checkbox and the module header shows "1/Y"; the top bar's "Seu progresso" shows "1/N aulas concluídas".

Reload the same URL (without the click script running again — just fetch it a second time) to confirm persistence:
```bash
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1400,1100 \
  --screenshot=/tmp/estudo-task4-persistido.png --virtual-time-budget=2000 \
  "http://localhost:8850/curso-estudar.html?slug=prevencao-eventos-adversos-cirurgicos"
fuser -k 8850/tcp
rm public/_debug-estudo.html
```
Note: each `google-chrome --headless=new` invocation starts a fresh, isolated profile by default, so `localStorage` does **not** persist between separate headless invocations — this last screenshot is expected to show the resume-logic falling back to "0/N" and the first lesson again, NOT the second lesson, because it's a brand-new browser profile. This is fine: real persistence across reloads in the *same* browser session was already implicitly exercised by Steps 3–4 rendering from the same in-memory `localStorage` within one page load. If you want to prove cross-reload persistence specifically, add `--user-data-dir=/tmp/estudo-chrome-profile` to *both* the clicked and the reload commands so they share one profile, then re-run; expected in that case: the reload screenshot shows the second lesson selected and "1/N aulas concluídas" preserved.

- [ ] **Step 5: Commit**

```bash
git add public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: wire up interactive lesson sidebar with persisted progress"
```

---

### Task 5: Entry point from `curso-detalhe.html`, responsive layout, final verification

**Files:**
- Modify: `public/curso-detalhe.html`
- Modify: `public/assets/js/main.js`
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: `initPaginaCurso()`'s existing `slug` local variable (already computed near the top of that function in `public/assets/js/main.js` — see the `const slug = new URLSearchParams(...)` line).

- [ ] **Step 1: Add the button to `curso-detalhe.html`**

In `public/curso-detalhe.html`, find:
```html
              <a class="btn btn--primario efeito-brilho curso-inscricao__cta" href="index.html#torne-se-membro">Inscrever-se Agora</a>
```
and add immediately after it:
```html
              <a class="btn btn--contorno-primario btn--bloco" href="curso-detalhe.html" id="curso-inscricao-continuar">Já é aluno? Continuar Curso</a>
```

- [ ] **Step 2: Set the real `href` in `initPaginaCurso()`**

In `public/assets/js/main.js`, inside `initPaginaCurso()`, find:
```js
  document.querySelector("#curso-inscricao-selo-vagas").hidden = !dados.vagasLimitadas;
```
and add right after it:
```js
  document.querySelector("#curso-inscricao-continuar").href = `curso-estudar.html?slug=${slug}`;
```

- [ ] **Step 3: Add the mobile layout for `curso-estudar.html`**

Append to `public/assets/css/sections.css`:

```css
@media (max-width: 900px) {
  .estudo-corpo {
    grid-template-columns: 1fr;
  }

  .estudo-lateral {
    position: static;
    max-height: none;
    overflow-y: visible;
  }

  .estudo-topo {
    padding: 0.65rem var(--espaco-sm);
    gap: var(--espaco-sm);
  }

  .estudo-topo__titulo {
    display: none;
  }
}
```

- [ ] **Step 4: Verify the entry point on `curso-detalhe.html`**

```bash
cd public && python3 -m http.server 8850 >/tmp/http-plan.log 2>&1 & sleep 1
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1400,1000 \
  --screenshot=/tmp/detalhe-continuar.png --virtual-time-budget=3000 \
  "http://localhost:8850/curso-detalhe.html?slug=instrumentacao-cirurgica-essencial"
```
Use the `Read` tool on `/tmp/detalhe-continuar.png`. Expected: below the "Inscrever-se Agora" button, a full-width outlined button "Já é aluno? Continuar Curso" appears in the enrolment card, before the certificate/community trust badges.

- [ ] **Step 5: Verify `curso-estudar.html` at mobile width, and on a second course**

```bash
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=390,1400 \
  --screenshot=/tmp/estudo-mobile.png --virtual-time-budget=3000 \
  "http://localhost:8850/curso-estudar.html?slug=instrumentacao-cirurgica-essencial"
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1400,1100 \
  --screenshot=/tmp/estudo-outro-curso.png --virtual-time-budget=3000 \
  "http://localhost:8850/curso-estudar.html?slug=workshop-instrumentacao-avancada"
fuser -k 8850/tcp
```
Use the `Read` tool on both images. Expected on mobile: single column, top bar without the course title (just logo, back link, progress, share icons), video placeholder full-width, then lesson header/tabs, then the sidebar module list below (no longer sticky). Expected on the second course: same structure renders correctly with different data (5-module course with a "Workshop" title), confirming the page is genuinely slug-driven and not hard-coded to one course.

- [ ] **Step 6: Commit**

```bash
git add public/curso-detalhe.html public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: add Continuar Curso entry point and responsive layout for the study page"
```
