# Página de Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `public/login.html`, uma página de login autónoma (sem cabeçalho/rodapé do site), com um bloco diagonal de marca institucional, formulário de entrada + recuperação de senha simulados no front-end, e ligar os 14 links "Login de membro" já existentes no site a esta página.

**Architecture:** Página HTML nova, autocontida, que reutiliza os 4 CSS partilhados do projeto (`variables.css`, `base.css`, `components.css`, `sections.css`) e acrescenta um bloco `/* SECTION: login */` dedicado a `sections.css`. Um único módulo `initLogin()` em `main.js` trata a alternância mostrar/ocultar senha, a troca entre o formulário de login e o de recuperação, e a simulação de submissão (sem backend). A ligação a partir do resto do site é feita através de `scripts/sync-layout.js` (o gerador central do topbar partilhado por 13 das 14 páginas) mais uma edição direta em `curso-detalhe.html`, que mantém uma cópia própria do topbar fora do alcance desse script.

**Tech Stack:** HTML, CSS (variáveis/tokens já definidos em `variables.css`), JavaScript vanilla (sem framework, sem bundler), Node.js só para o script utilitário `sync-layout.js`. Sem backend, sem dependências novas.

## Global Constraints

- Sem backend de autenticação: toda a submissão de formulário é simulada no front-end (`setTimeout`, sem `fetch`).
- Português (grafia moderna/AO90 — "atualizar", não "actualizar" — conforme já padronizado no resto do código).
- Não criar página de "criar conta" nova — o link aponta para `index.html#torne-se-membro`.
- Não criar página de recuperação de senha nova — é um segundo estado dentro do mesmo cartão de `login.html`.
- Reutilizar tokens de `variables.css` (cores, espaçamentos, raios, sombras) e classes existentes (`.btn`, `.btn--primario`, `.btn--bloco`, `.efeito-brilho`, `.formulario__grupo`, `.formulario__mensagem`, `.formulario__consentimento`) — não introduzir novos valores de cor/espaçamento hardcoded.
- Seguir a convenção de comentários `<!-- SECTION: nome --> ... <!-- /SECTION: nome -->` em HTML e `/* SECTION: nome */` em CSS já usada no projeto.
- `curso-detalhe.html` **não** está na lista `PAGINAS` de `scripts/sync-layout.js` — o script não lhe toca. A sua topbar tem de ser editada manualmente.
- Sem test runner automatizado neste projeto — verificação é manual, num browser, servindo `public/` localmente (ex.: `python3 -m http.server 8080` a partir de `public/`).

---

### Task 1: Estrutura e visual do ecrã de login (bloco diagonal + cartão)

**Files:**
- Create: `public/login.html`
- Modify: `public/assets/css/sections.css` (adicionar no fim do ficheiro, depois da última linha existente)

**Interfaces:**
- Produces: classes CSS `.pagina-login`, `.login`, `.login__faixa`, `.login__faixa-emblema`, `.login__faixa-frase`, `.login__voltar`, `.login__cartao`, `.login__cabecalho`, `.login__campo-senha`, `.login__alternar-senha`, `.login__opcoes`, `.login__esqueci-link`, `.login__rodape` — usadas por `login.html` nesta task e reutilizadas nas Tasks 2 e 3.
- Produces: elementos com `id="formulario-login"`, `id="login-email"`, `id="login-senha"`, e o botão de alternar senha marcado com `data-alternar-senha` — consumidos pelo JS da Task 2.

- [ ] **Step 1: Criar `public/login.html` com o `<head>` padrão e a estrutura do ecrã**

Criar o ficheiro com o conteúdo abaixo (o `<head>` segue exatamente o padrão das outras páginas do site — ver `public/contactos.html:1-30`):

```html
<!doctype html>
<html lang="pt">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login | AESOA — Associação dos Enfermeiros da Sala Operatória de Angola</title>
  <meta name="description"
    content="Entre na área de sócio da AESOA para aceder aos conteúdos exclusivos, cursos e serviços reservados aos associados." />
  <meta name="theme-color" content="#1b5e43" />

  <link rel="icon" type="image/png" href="assets/img/logo-emblema.png" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="Login — AESOA — Associação dos Enfermeiros da Sala Operatória de Angola" />
  <meta property="og:description" content="Entre na área de sócio da AESOA." />

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

<body class="pagina-login">
  <!-- SECTION: login -->
  <div class="login">
    <div class="login__faixa" aria-hidden="true">
      <img class="login__faixa-emblema" src="assets/img/logo-emblema-branco.png" alt="" />
      <p class="login__faixa-frase">Formação e representação da enfermagem de sala operatória.</p>
    </div>

    <a class="login__voltar" href="index.html" aria-label="Voltar à página inicial da AESOA">
      <img src="assets/img/logo-emblema-branco.png" alt="" width="28" height="28" />
      <span>AESOA</span>
    </a>

    <div class="login__cartao">
      <div class="login__cabecalho">
        <h1>Área de Sócio</h1>
        <p>Entre com as suas credenciais para aceder aos conteúdos exclusivos da AESOA.</p>
      </div>

      <form class="login__formulario" id="formulario-login" novalidate>
        <div class="formulario__grupo">
          <label for="login-email">E-mail</label>
          <input type="email" id="login-email" name="email" autocomplete="email" required />
        </div>

        <div class="formulario__grupo">
          <label for="login-senha">Senha</label>
          <div class="login__campo-senha">
            <input type="password" id="login-senha" name="senha" autocomplete="current-password" required />
            <button type="button" class="login__alternar-senha" data-alternar-senha aria-pressed="false"
              aria-label="Mostrar senha">
              <svg class="login__icone-olho" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg class="login__icone-olho login__icone-olho--fechado" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true" hidden>
                <path
                  d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.7 21.7 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <div class="login__opcoes">
          <label class="formulario__consentimento">
            <input type="checkbox" name="lembrar" />
            Lembrar-me
          </label>
          <button type="button" class="login__esqueci-link" data-mostrar-recuperar>Esqueci-me da senha</button>
        </div>

        <button class="btn btn--primario btn--bloco efeito-brilho" type="submit">Entrar</button>

        <p class="formulario__mensagem" role="status"></p>
      </form>

      <p class="login__rodape">
        Ainda não é sócio? <a href="index.html#torne-se-membro">Torne-se sócio</a>
      </p>
    </div>
  </div>
  <!-- /SECTION: login -->

  <script src="assets/js/main.js" defer></script>
</body>

</html>
```

- [ ] **Step 2: Adicionar o bloco de estilos `/* SECTION: login */` no fim de `public/assets/css/sections.css`**

Acrescentar no fim do ficheiro (depois da última linha existente):

```css

/* SECTION: login */

.pagina-login {
  background-color: var(--cor-fundo);
}

.login {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
  padding: var(--espaco-lg);
}

.login__faixa {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--espaco-2xl) var(--espaco-lg);
  background: linear-gradient(135deg,
      var(--cor-primaria-clara),
      var(--cor-primaria) 55%,
      var(--cor-primaria-escura));
  clip-path: polygon(0 0, 62% 0, 38% 100%, 0 100%);
}

.login__faixa-emblema {
  width: 72px;
  height: 72px;
  opacity: 0.3;
  margin-bottom: var(--espaco-sm);
}

.login__faixa-frase {
  max-width: 260px;
  color: var(--cor-texto-claro);
  font-family: var(--fonte-titulo);
  font-size: var(--fs-lg);
  font-weight: 600;
  line-height: var(--lh-titulo);
}

.login__voltar {
  position: absolute;
  top: var(--espaco-lg);
  left: var(--espaco-lg);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: var(--espaco-2xs);
  color: var(--cor-texto-claro);
  font-family: var(--fonte-titulo);
  font-weight: 700;
  text-decoration: none;
}

.login__voltar img {
  border-radius: 50%;
}

.login__cartao {
  position: relative;
  z-index: 1;
  width: min(420px, 100%);
  background-color: var(--cor-fundo);
  border-radius: var(--raio-lg);
  box-shadow: var(--sombra-lg);
  padding: var(--espaco-lg);
}

.login__cabecalho {
  margin-bottom: var(--espaco-md);
}

.login__cabecalho h1,
.login__cabecalho h2 {
  font-size: var(--fs-xl);
  margin-bottom: var(--espaco-2xs);
}

.login__cabecalho p {
  color: var(--cor-texto-suave);
  font-size: var(--fs-sm);
}

.login__campo-senha {
  position: relative;
}

.login__campo-senha input {
  padding-right: 2.75rem;
}

.login__alternar-senha {
  position: absolute;
  top: 50%;
  right: 0.6rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--cor-texto-suave);
  background: none;
  border: none;
  cursor: pointer;
}

.login__alternar-senha svg {
  width: 20px;
  height: 20px;
}

.login__opcoes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-md);
}

.login__opcoes .formulario__consentimento {
  margin-bottom: 0;
}

.login__esqueci-link {
  padding: 0;
  border: none;
  background: none;
  color: var(--cor-primaria);
  font-size: var(--fs-sm);
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.login__rodape {
  margin-top: var(--espaco-md);
  text-align: center;
  font-size: var(--fs-sm);
  color: var(--cor-texto-suave);
}

.login__rodape a {
  color: var(--cor-primaria);
  font-weight: 600;
}

@media (max-width: 768px) {
  .login {
    flex-direction: column;
    justify-content: flex-start;
    padding: 0 0 var(--espaco-xl);
  }

  .login__faixa {
    position: static;
    clip-path: none;
    width: 100%;
    padding: calc(var(--espaco-2xl) + 2rem) var(--espaco-lg) var(--espaco-lg);
  }

  .login__voltar {
    top: var(--espaco-sm);
    left: var(--espaco-sm);
  }

  .login__cartao {
    margin: 0 var(--espaco-md);
    margin-top: calc(-1 * var(--espaco-lg));
  }
}

/* /SECTION: login */
```

- [ ] **Step 3: Verificar visualmente no browser**

A partir da pasta `public/`, correr:

```bash
cd public && python3 -m http.server 8080
```

Abrir `http://localhost:8080/login.html` no browser. Confirmar:
- Faixa diagonal verde visível à esquerda, cartão de login flutuante à direita, sem overflow horizontal.
- Reduzir a largura da janela para <768px (ou usar as devtools em modo responsivo): a faixa passa a um bloco sólido no topo, sem diagonal, e o cartão fica por baixo, a toda a largura.
- O botão "Entrar" mostra o efeito de brilho animado (mesma classe `.efeito-brilho` já usada em `curso-detalhe.html`).
- Nenhum erro na consola do browser.

- [ ] **Step 4: Commit**

```bash
git add public/login.html public/assets/css/sections.css
git commit -m "feat: adicionar estrutura e visual do ecra de login"
```

---

### Task 2: Alternar mostrar/ocultar senha + simulação de submissão do login

**Files:**
- Modify: `public/assets/js/main.js` (nova função `initLogin`, antes de `document.addEventListener("DOMContentLoaded", ...)` que está em `main.js:2145`; e um novo `executarInit(initLogin);` dentro desse listener)

**Interfaces:**
- Consumes: `#formulario-login`, `#login-senha`, `[data-alternar-senha]`, `.login__icone-olho`, `.login__icone-olho--fechado`, `.formulario__mensagem` — todos produzidos na Task 1 (`public/login.html`).
- Consumes: `executarInit(funcaoInit)` já definido em `main.js:2137-2143` (executa a função dentro de um `try/catch`, não precisa de alterações).
- Produces: função `initLogin()` — usada também pela Task 3, que lhe acrescenta a lógica da recuperação de senha dentro da mesma função.

- [ ] **Step 1: Adicionar `initLogin()` a `public/assets/js/main.js`, antes da linha `document.addEventListener("DOMContentLoaded", ...)` (atualmente `main.js:2145`)**

```javascript
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
```

- [ ] **Step 2: Registar `initLogin` no arranque, dentro do listener `DOMContentLoaded` (`main.js`, a seguir à linha `executarInit(initFavoritosCursos);`)**

```javascript
  executarInit(initFavoritosCursos);
  executarInit(initLogin);
});
```

- [ ] **Step 3: Verificar no browser**

Com o servidor local a correr (`cd public && python3 -m http.server 8080`), abrir `http://localhost:8080/login.html`:
- Clicar no ícone de olho no campo de senha: o texto fica visível/oculto e o ícone alterna. Verificar no DOM (devtools) que `aria-pressed` e `aria-label` mudam.
- Deixar o e-mail vazio e submeter: o browser mostra a validação nativa (balão "Preencha este campo"), sem avançar.
- Preencher e-mail e senha válidos e submeter: o botão muda para "A entrar…" e fica desativado por ~900ms, depois volta a "Entrar" e aparece a mensagem de sucesso verde.
- Nenhum erro na consola do browser.

- [ ] **Step 4: Commit**

```bash
git add public/assets/js/main.js
git commit -m "feat: adicionar alternancia de senha e submissao simulada ao login"
```

---

### Task 3: Fluxo "Esqueci-me da senha"

**Files:**
- Modify: `public/login.html` (acrescentar o segundo formulário dentro de `.login__cartao`, a seguir ao `</form>` do formulário de login)
- Modify: `public/assets/js/main.js` (estender `initLogin()`, criada na Task 2)

**Interfaces:**
- Consumes: `initLogin()` e `tratarSubmissaoSimulada()`, ambas definidas na Task 2 dentro de `main.js`.
- Produces: `id="formulario-recuperar"`, `id="recuperar-email"`, `[data-mostrar-recuperar]` (já presente no botão da Task 1) e `[data-mostrar-login]`.

- [ ] **Step 1: Acrescentar o formulário de recuperação em `public/login.html`, imediatamente a seguir ao `</form>` do `#formulario-login` (antes do `<p class="login__rodape">`)**

```html
      <form class="login__formulario" id="formulario-recuperar" novalidate hidden>
        <div class="login__cabecalho">
          <h2>Recuperar senha</h2>
          <p>Indique o seu e-mail e enviamos um link de recuperação.</p>
        </div>

        <div class="formulario__grupo">
          <label for="recuperar-email">E-mail</label>
          <input type="email" id="recuperar-email" name="email" autocomplete="email" required />
        </div>

        <button class="btn btn--primario btn--bloco efeito-brilho" type="submit">Enviar link de recuperação</button>
        <button type="button" class="login__esqueci-link" data-mostrar-login>Voltar ao login</button>

        <p class="formulario__mensagem" role="status"></p>
      </form>
```

- [ ] **Step 2: Estender `initLogin()` em `public/assets/js/main.js` para alternar entre os dois formulários e simular a recuperação**

Dentro de `initLogin()`, a seguir à linha `const botaoSenha = document.querySelector("[data-alternar-senha]");` (adicionada na Task 2), acrescentar:

```javascript
  const formularioRecuperar = document.querySelector("#formulario-recuperar");
  const linkEsqueci = document.querySelector("[data-mostrar-recuperar]");
  const linkVoltarLogin = document.querySelector("[data-mostrar-login]");

  if (linkEsqueci && formularioLogin && formularioRecuperar) {
    linkEsqueci.addEventListener("click", () => {
      formularioLogin.hidden = true;
      formularioRecuperar.hidden = false;
      formularioRecuperar.querySelector("input").focus();
    });
  }

  if (linkVoltarLogin && formularioLogin && formularioRecuperar) {
    linkVoltarLogin.addEventListener("click", () => {
      formularioRecuperar.hidden = true;
      formularioLogin.hidden = false;
      formularioLogin.querySelector("input").focus();
    });
  }
```

E, mais abaixo, a seguir à chamada existente `tratarSubmissaoSimulada(formularioLogin, {...});` (da Task 2), acrescentar a chamada para o formulário de recuperação:

```javascript
  tratarSubmissaoSimulada(formularioRecuperar, {
    aEnviar: "A enviar…",
    sucesso: "Se o e-mail estiver registado, vai receber um link de recuperação em breve.",
  });
```

- [ ] **Step 3: Verificar no browser**

Com o servidor local a correr, abrir `http://localhost:8080/login.html`:
- Clicar em "Esqueci-me da senha": o formulário de login desaparece e aparece o de recuperação, com foco no campo de e-mail.
- Clicar em "Voltar ao login": regressa ao formulário de login, com foco no campo de e-mail.
- Preencher o e-mail no formulário de recuperação e submeter: botão muda para "A enviar…", depois mostra a mensagem de confirmação.
- Navegar apenas com o teclado (tecla Tab, sem rato): confirmar que é possível alcançar e ativar, por ordem lógica, o campo de e-mail, o campo de senha, o botão de mostrar/ocultar senha, o checkbox "Lembrar-me", o link "Esqueci-me da senha", o botão "Entrar", e (depois de trocar para o formulário de recuperação) o campo de e-mail, o botão "Enviar link de recuperação" e "Voltar ao login" — com o foco sempre visível em cada elemento.
- Nenhum erro na consola do browser.

- [ ] **Step 4: Commit**

```bash
git add public/login.html public/assets/js/main.js
git commit -m "feat: adicionar fluxo de recuperacao de senha ao login"
```

---

### Task 4: Ligar "Login de membro" a `login.html` em todo o site

**Files:**
- Modify: `scripts/sync-layout.js:60` (`TOPBAR_HTML`, o modelo único do topbar)
- Modify: `public/curso-detalhe.html:52` (cópia própria do topbar, fora do alcance do script — ver comentário nas Global Constraints)
- Regenerated (via script, não editado à mão): `public/about.html`, `public/aconselhamento-juridico.html`, `public/banco-enfermeiros.html`, `public/congresso-nacional-2025.html`, `public/consultadoria-saude.html`, `public/contactos.html`, `public/cursos.html`, `public/estatutos.html`, `public/eventos-webinars.html`, `public/galeria.html`, `public/index.html`, `public/noticia.html`, `public/noticias.html`

**Interfaces:**
- Consumes: nenhuma (edição de marcação estática e execução de um script já existente).

- [ ] **Step 1: Editar `TOPBAR_HTML` em `scripts/sync-layout.js`**

Em `scripts/sync-layout.js:60`, mudar:

```javascript
        <a class="topbar__login" href="#">
```

para:

```javascript
        <a class="topbar__login" href="login.html">
```

- [ ] **Step 2: Confirmar em modo de verificação que apenas o topbar muda nas 13 páginas geridas pelo script**

```bash
node scripts/sync-layout.js --check
```

Esperado: a lista de ficheiros `[mudaria]` inclui as 13 páginas de `PAGINAS` em `scripts/sync-layout.js:288-306` (todas exceto `curso-detalhe.html`, que não está nessa lista).

- [ ] **Step 3: Aplicar a alteração às 13 páginas**

```bash
node scripts/sync-layout.js
```

Esperado: mensagem final `13 ficheiro(s) atualizados, 0 já estavam em sincronia.`

- [ ] **Step 4: Editar manualmente `public/curso-detalhe.html:52`**

Mudar:

```html
        <a class="topbar__login" href="#">
```

para:

```html
        <a class="topbar__login" href="login.html">
```

- [ ] **Step 5: Verificar que todas as 14 páginas apontam para `login.html`**

```bash
grep -rl 'topbar__login" href="login.html"' public/*.html | wc -l
```

Esperado: `14`.

- [ ] **Step 6: Verificar no browser**

Com o servidor local a correr, abrir `http://localhost:8080/index.html` e `http://localhost:8080/curso-detalhe.html`. Em ambas, clicar em "Login de membro" na topbar e confirmar que abre `login.html` corretamente. Confirmar que o resto da topbar/cabeçalho/rodapé dessas páginas continua igual (nenhuma outra alteração visual).

- [ ] **Step 7: Commit**

```bash
git add scripts/sync-layout.js public/curso-detalhe.html public/about.html public/aconselhamento-juridico.html public/banco-enfermeiros.html public/congresso-nacional-2025.html public/consultadoria-saude.html public/contactos.html public/cursos.html public/estatutos.html public/eventos-webinars.html public/galeria.html public/index.html public/noticia.html public/noticias.html
git commit -m "feat: ligar Login de membro a login.html em todo o site"
```
