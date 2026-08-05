# Botões Expandir/Fechar do Painel "Conteúdo do curso" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar dois botões junto ao título "Conteúdo do curso" em `public/curso-estudar.html` — um para expandir a largura do painel lateral e outro para o esconder por completo, com uma aba flutuante para o reabrir.

**Architecture:** Alterações em três ficheiros estáticos (sem build step, sem framework): markup em `public/curso-estudar.html`, estilos em `public/assets/css/sections.css`, e lógica de estado (com persistência em `localStorage`) numa nova função `initPainelEstudo()` em `public/assets/js/main.js`, seguindo o padrão `init*()` já usado no ficheiro. O estado do painel (`normal` | `expandido` | `fechado`) controla classes CSS em `.estudo-corpo`.

**Tech Stack:** HTML/CSS/JS vanilla (ES6+), sem dependências. Site estático servido de `public/` (ver `wrangler.jsonc`).

## Global Constraints

- Largura do painel: `420px` (normal, já existente) → `640px` (expandido).
- Breakpoint mobile existente: `900px` (botão "Expandir" escondido abaixo deste valor).
- Chave de persistência: `localStorage` key `aesoa-estudo-painel-estado`, valores `"normal" | "expandido" | "fechado"`.
- Seguir o padrão de nomenclatura BEM em português já usado no projeto (`estudo-lateral__*`, `esta-ativo`, `-dica` para tooltips).
- Ícones SVG inline no estilo já usado no ficheiro: `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`.
- Este projeto não tem framework de testes (sem `package.json`/jest). A verificação de cada tarefa usa Playwright via `npx` (Chromium já está em cache local em `~/.cache/ms-playwright`, pelo que não deve requerer download) contra um servidor estático local (`python3 -m http.server`). Não introduzir nenhuma dependência de teste permanente no repositório — os scripts de verificação são temporários, guardados em `/tmp` ou na pasta de scratchpad da sessão, não commitados.

---

### Task 1: Markup dos botões de ação e da aba de reabrir

**Files:**
- Modify: `public/curso-estudar.html:264-270`

**Interfaces:**
- Produces: elementos com os IDs `#estudo-painel-expandir`, `#estudo-painel-expandir-dica`, `#estudo-painel-fechar`, `#estudo-painel-reabrir` — usados pela Task 3 (JS) e pela Task 2 (CSS, via classes `.estudo-lateral__cabecalho-topo`, `.estudo-lateral__acoes`, `.estudo-lateral__accao`, `.estudo-lateral__accao--expandir`, `.estudo-lateral__accao-dica`, `.estudo-painel-reabrir`, `.estudo-painel-reabrir-dica`).

- [ ] **Step 1: Substituir o bloco do cabeçalho lateral e adicionar a aba de reabrir**

Substituir (linhas 264-270 de `public/curso-estudar.html`):

```html
      <aside class="estudo-lateral">
        <div class="estudo-lateral__cabecalho">
          <h2>Conteúdo do curso</h2>
          <p class="estudo-lateral__resumo" id="estudo-lateral-resumo"></p>
        </div>
        <div class="estudo-lateral__lista" id="estudo-lateral-lista"></div>
      </aside>
```

por:

```html
      <aside class="estudo-lateral">
        <div class="estudo-lateral__cabecalho">
          <div class="estudo-lateral__cabecalho-topo">
            <h2>Conteúdo do curso</h2>
            <div class="estudo-lateral__acoes">
              <button type="button" class="estudo-lateral__accao estudo-lateral__accao--expandir"
                id="estudo-painel-expandir" aria-label="Expandir painel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" aria-hidden="true">
                  <polyline points="18 8 22 12 18 16" />
                  <polyline points="6 8 2 12 6 16" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
                <span class="estudo-lateral__accao-dica" id="estudo-painel-expandir-dica">Expandir painel</span>
              </button>
              <button type="button" class="estudo-lateral__accao" id="estudo-painel-fechar"
                aria-label="Fechar painel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M15 3v18" />
                  <path d="m8 9 3 3-3 3" />
                </svg>
                <span class="estudo-lateral__accao-dica">Fechar painel</span>
              </button>
            </div>
          </div>
          <p class="estudo-lateral__resumo" id="estudo-lateral-resumo"></p>
        </div>
        <div class="estudo-lateral__lista" id="estudo-lateral-lista"></div>
      </aside>
      <button type="button" class="estudo-painel-reabrir" id="estudo-painel-reabrir"
        aria-label="Mostrar conteúdo do curso" hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M15 3v18" />
          <path d="m10 15-3-3 3-3" />
        </svg>
        <span class="estudo-painel-reabrir-dica">Mostrar conteúdo do curso</span>
      </button>
```

Nota: `#estudo-painel-reabrir` fica como irmão de `<aside class="estudo-lateral">`, ainda dentro de `<main class="container estudo-corpo">` (a tag `</main>` está na linha 271 original — confirmar que o botão fica *antes* dela).

- [ ] **Step 2: Verificar a estrutura HTML**

Run: `grep -n "estudo-painel-expandir\|estudo-painel-fechar\|estudo-painel-reabrir" "public/curso-estudar.html"`
Expected: 5 linhas de resultado (expandir botão + expandir dica id, fechar botão, reabrir botão).

- [ ] **Step 3: Commit**

```bash
git add public/curso-estudar.html
git commit -m "feat: adicionar botões de expandir/fechar ao painel de conteúdo do curso"
```

---

### Task 2: Estilos dos botões, estados do painel e aba de reabrir

**Files:**
- Modify: `public/assets/css/sections.css` (inserir depois da regra `.estudo-lateral__aula-botao .curso-programa__licao-titulo` — linha 5427 — e antes de `@media (max-width: 900px) { .estudo-corpo {...} }` — linha 5429)
- Modify: `public/assets/css/sections.css:5429-5438` (media query existente, para esconder o botão "Expandir" e neutralizar o estado expandido em mobile)

**Interfaces:**
- Consumes: classes/IDs produzidos na Task 1 (`.estudo-lateral__cabecalho-topo`, `.estudo-lateral__acoes`, `.estudo-lateral__accao`, `.estudo-lateral__accao--expandir`, `.estudo-lateral__accao-dica`, `#estudo-painel-reabrir`, `.estudo-painel-reabrir-dica`).
- Produces: classes de estado `estudo-painel--expandido` e `estudo-painel--fechado` (aplicadas em `.estudo-corpo`) e `esta-ativo` (aplicada em `#estudo-painel-expandir`) — consumidas pela Task 3 (JS).

- [ ] **Step 1: Adicionar as novas regras CSS**

Inserir imediatamente antes de `@media (max-width: 900px) {` (linha 5429 atual):

```css
.estudo-lateral__cabecalho-topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--espaco-sm);
}

.estudo-lateral__acoes {
  display: flex;
  flex-shrink: 0;
  gap: 0.4rem;
}

.estudo-lateral__accao {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--cor-borda);
  border-radius: 50%;
  background-color: var(--cor-fundo-alt);
  color: var(--cor-texto-suave);
  cursor: pointer;
  transition: background-color var(--transicao-base), border-color var(--transicao-base), color var(--transicao-base);
}

.estudo-lateral__accao svg {
  width: 16px;
  height: 16px;
}

.estudo-lateral__accao:hover,
.estudo-lateral__accao:focus-visible {
  border-color: var(--cor-primaria);
  color: var(--cor-primaria);
}

.estudo-lateral__accao.esta-ativo {
  background-color: var(--cor-primaria);
  border-color: var(--cor-primaria);
  color: var(--cor-texto-claro);
}

.estudo-lateral__accao-dica {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 3;
  padding: 0.35rem 0.65rem;
  border-radius: var(--raio-sm);
  background-color: rgba(10, 20, 16, 0.92);
  color: var(--cor-texto-claro);
  font-size: var(--fs-xs);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity var(--transicao-base), transform var(--transicao-base);
}

.estudo-lateral__accao:hover .estudo-lateral__accao-dica,
.estudo-lateral__accao:focus-visible .estudo-lateral__accao-dica {
  opacity: 1;
  transform: translateY(0);
}

.estudo-corpo {
  position: relative;
  transition: grid-template-columns 0.35s ease;
}

.estudo-corpo.estudo-painel--expandido {
  grid-template-columns: minmax(0, 1fr) 640px;
}

.estudo-corpo.estudo-painel--fechado {
  grid-template-columns: 1fr;
}

.estudo-corpo.estudo-painel--fechado .estudo-lateral {
  display: none;
}

.estudo-painel-reabrir {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 48px;
  border: 1px solid var(--cor-borda);
  border-right: none;
  border-radius: var(--raio-sm) 0 0 var(--raio-sm);
  background-color: var(--cor-fundo);
  color: var(--cor-primaria);
  box-shadow: var(--sombra-md);
  cursor: pointer;
  transform: translate(0, -50%);
  transition: background-color var(--transicao-base), transform var(--transicao-base);
}

.estudo-painel-reabrir:hover,
.estudo-painel-reabrir:focus-visible {
  background-color: var(--cor-primaria-suave);
  transform: translate(-4px, -50%);
}

.estudo-painel-reabrir svg {
  width: 18px;
  height: 18px;
}

.estudo-painel-reabrir-dica {
  position: absolute;
  right: calc(100% + 0.5rem);
  padding: 0.35rem 0.65rem;
  border-radius: var(--raio-sm);
  background-color: rgba(10, 20, 16, 0.92);
  color: var(--cor-texto-claro);
  font-size: var(--fs-xs);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translateX(4px);
  transition: opacity var(--transicao-base), transform var(--transicao-base);
}

.estudo-painel-reabrir:hover .estudo-painel-reabrir-dica,
.estudo-painel-reabrir:focus-visible .estudo-painel-reabrir-dica {
  opacity: 1;
  transform: translateX(0);
}
```

- [ ] **Step 2: Atualizar a media query de 900px para esconder "Expandir" e neutralizar o estado expandido em mobile**

Localizar (dentro do bloco `@media (max-width: 900px) { ... }` que começa na linha 5429 original):

```css
  .estudo-lateral {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
```

Adicionar logo a seguir, ainda dentro do mesmo bloco `@media (max-width: 900px)`:

```css

  .estudo-lateral__accao--expandir {
    display: none;
  }

  .estudo-corpo.estudo-painel--expandido {
    grid-template-columns: 1fr;
  }
```

- [ ] **Step 3: Verificar visualmente com Playwright (desktop)**

Criar `/tmp/claude-1000/-home-eluckimossi-Documentos-Outros-Projectos-AESOA-Site-apcir-templet-profissional/37f0babd-05e0-4caf-8c6a-8d42c17a377b/scratchpad/verificar-painel.mjs`:

```js
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORTA = 8099;
const servidor = spawn("python3", ["-m", "http.server", String(PORTA), "--directory", "public"], {
  cwd: process.cwd(),
  stdio: "ignore",
});
await sleep(600);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://localhost:${PORTA}/curso-estudar.html?slug=${process.argv[2] ?? ""}`);
  await page.waitForSelector("#estudo-painel-expandir", { timeout: 5000 });
  await page.screenshot({ path: "/tmp/painel-desktop-normal.png" });

  await page.hover("#estudo-painel-fechar");
  await page.screenshot({ path: "/tmp/painel-desktop-tooltip.png" });

  console.log("Botões visíveis e tooltip capturados com sucesso.");
} finally {
  await browser.close();
  servidor.kill();
}
```

Run: `node /tmp/claude-1000/-home-eluckimossi-Documentos-Outros-Projectos-AESOA-Site-apcir-templet-profissional/37f0babd-05e0-4caf-8c6a-8d42c17a377b/scratchpad/verificar-painel.mjs <slug-de-um-curso-existente>`

(Se `playwright` não estiver instalado localmente, correr primeiro `npm install --no-save playwright` na raiz do projeto — o Chromium já está em cache em `~/.cache/ms-playwright`, não deve haver download.)

Expected: script termina sem erro, imprime a mensagem de sucesso, e `/tmp/painel-desktop-normal.png` mostra os dois botões circulares no canto superior direito do painel "Conteúdo do curso"; `/tmp/painel-desktop-tooltip.png` mostra o tooltip "Fechar painel" visível.

- [ ] **Step 4: Commit**

```bash
git add public/assets/css/sections.css
git commit -m "style: estilizar botões de expandir/fechar e estados do painel de conteúdo"
```

---

### Task 3: Lógica de estado (expandir/fechar/reabrir) com persistência

**Files:**
- Modify: `public/assets/js/main.js:2110` (adicionar chamada `initPainelEstudo();` a seguir a `initPaginaEstudo();`, dentro do listener `DOMContentLoaded`)
- Modify: `public/assets/js/main.js` (adicionar as novas funções antes de `document.addEventListener("DOMContentLoaded", ...)`, ou seja, imediatamente antes da linha 2091 atual)

**Interfaces:**
- Consumes: `#estudo-painel-expandir`, `#estudo-painel-expandir-dica`, `#estudo-painel-fechar`, `#estudo-painel-reabrir` (Task 1); classes `estudo-painel--expandido`, `estudo-painel--fechado`, `esta-ativo` (Task 2).
- Produces: função `initPainelEstudo()` sem argumentos nem retorno, chamada uma vez no arranque da página.

- [ ] **Step 1: Adicionar as funções de estado e `initPainelEstudo()`**

Inserir imediatamente antes de `document.addEventListener("DOMContentLoaded", () => {` (linha 2091 original):

```js
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

  botaoFechar.addEventListener("click", () => aplicarEstado("fechado"));
  botaoReabrir.addEventListener("click", () => aplicarEstado(ultimoEstadoAberto));

  aplicarEstado(obterEstadoPainel());
}
```

- [ ] **Step 2: Registar a chamada em `DOMContentLoaded`**

Em `document.addEventListener("DOMContentLoaded", () => { ... })`, adicionar `initPainelEstudo();` imediatamente a seguir a `initPaginaEstudo();`:

```js
  initPaginaEstudo();
  initPainelEstudo();
  initPartilhaModalEstudo();
```

- [ ] **Step 3: Verificar o comportamento com Playwright (clique, fecho, reabertura, persistência, mobile)**

Criar `/tmp/claude-1000/-home-eluckimossi-Documentos-Outros-Projectos-AESOA-Site-apcir-templet-profissional/37f0babd-05e0-4caf-8c6a-8d42c17a377b/scratchpad/verificar-painel-estado.mjs`:

```js
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import assert from "node:assert/strict";

const PORTA = 8098;
const servidor = spawn("python3", ["-m", "http.server", String(PORTA), "--directory", "public"], {
  cwd: process.cwd(),
  stdio: "ignore",
});
await sleep(600);

const slug = process.argv[2];
if (!slug) throw new Error("Uso: node verificar-painel-estado.mjs <slug-de-um-curso-existente>");

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const url = `http://localhost:${PORTA}/curso-estudar.html?slug=${slug}`;
  await page.goto(url);
  await page.waitForSelector("#estudo-painel-expandir", { timeout: 5000 });

  // Expandir
  await page.click("#estudo-painel-expandir");
  await page.waitForTimeout(400);
  const largura1 = await page.locator(".estudo-lateral").evaluate((el) => el.getBoundingClientRect().width);
  assert.ok(largura1 > 500, `Painel deveria estar expandido (largura=${largura1})`);
  await page.screenshot({ path: "/tmp/painel-desktop-expandido.png" });

  // Fechar
  await page.click("#estudo-painel-fechar");
  await page.waitForTimeout(200);
  const visivel = await page.locator(".estudo-lateral").isVisible();
  assert.equal(visivel, false, "Painel deveria estar escondido depois de 'Fechar'");
  const reabrirVisivel = await page.locator("#estudo-painel-reabrir").isVisible();
  assert.equal(reabrirVisivel, true, "Aba de reabrir deveria estar visível");
  await page.screenshot({ path: "/tmp/painel-desktop-fechado.png" });

  // Reabrir — deve voltar ao último estado aberto (expandido)
  await page.click("#estudo-painel-reabrir");
  await page.waitForTimeout(400);
  const largura2 = await page.locator(".estudo-lateral").evaluate((el) => el.getBoundingClientRect().width);
  assert.ok(largura2 > 500, `Painel deveria reabrir expandido (largura=${largura2})`);

  // Persistência: recarregar a página e confirmar que o estado 'expandido' se mantém
  await page.reload();
  await page.waitForSelector("#estudo-painel-expandir", { timeout: 5000 });
  const largura3 = await page.locator(".estudo-lateral").evaluate((el) => el.getBoundingClientRect().width);
  assert.ok(largura3 > 500, `Estado deveria persistir após reload (largura=${largura3})`);

  // Mobile: botão Expandir deve estar escondido
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);
  const expandirVisivelMobile = await page.locator("#estudo-painel-expandir").isVisible();
  assert.equal(expandirVisivelMobile, false, "Botão Expandir deveria estar escondido em mobile");
  await page.screenshot({ path: "/tmp/painel-mobile.png" });

  console.log("Todas as verificações passaram.");
} finally {
  await browser.close();
  servidor.kill();
}
```

Run: `node /tmp/claude-1000/-home-eluckimossi-Documentos-Outros-Projectos-AESOA-Site-apcir-templet-profissional/37f0babd-05e0-4caf-8c6a-8d42c17a377b/scratchpad/verificar-painel-estado.mjs <slug-de-um-curso-existente>`

(Para encontrar um slug válido: `grep -o '"[a-z0-9-]*":\s*{' public/assets/js/cursos-dados.js | head -3` ou inspecionar `CURSOS_DADOS` nesse ficheiro.)

Expected: `Todas as verificações passaram.` impresso na consola, sem `AssertionError`. As três capturas de ecrã em `/tmp/` confirmam visualmente os estados expandido, fechado e mobile.

- [ ] **Step 4: Commit**

```bash
git add public/assets/js/main.js
git commit -m "feat: adicionar lógica de expandir/fechar/reabrir o painel de conteúdo do curso"
```
