# Página de Login (`login.html`) — Design

## Contexto

O site AESOA já tem, em todas as páginas, um link "Login de membro" na topbar
(`href="#"`, ainda não ligado a nada). O site não tem backend de autenticação
(é servido como assets estáticos via Cloudflare, `wrangler.jsonc` sem
Workers/API). Esta spec cobre a criação de uma página de login autónoma,
simples e visualmente distinta, que sirva como ecrã de entrada para a futura
"Área de Sócio" — com comportamento simulado no front-end, pronto para ligar
a uma API real mais tarde.

## Objetivo

Criar `public/login.html`: uma página de ecrã inteiro, sem o cabeçalho/rodapé
do site, com um formulário de login profissional e uma identidade visual
diferenciada (bloco diagonal de marca), e ligar os links "Login de membro"
já existentes nas 14 páginas do site a este novo ficheiro.

## Fora de âmbito

- Autenticação real (API, sessões, tokens) — apenas simulação front-end.
- Recuperação de password real (envio de e-mail) — apenas um estado de UI
  simulado.
- Área de sócio / dashboard pós-login — fica para uma spec futura.
- Página de "criar conta" dedicada — o link aponta para a secção de adesão
  já existente em `index.html#torne-se-membro`.

## Arquitetura

- **Ficheiro novo:** `public/login.html`, seguindo o `<head>` padrão das
  outras páginas (meta tags, favicon, Google Fonts, os 4 CSS partilhados:
  `variables.css`, `base.css`, `components.css`, `sections.css`). Sem
  `<header class="cabecalho">` nem `<footer class="rodape">` — a página é
  self-contained.
- **CSS:** novo bloco `/* SECTION: login */` no fim de `sections.css`,
  seguindo a convenção de comentários de secção já usada no ficheiro.
  Reutiliza tokens existentes (`--cor-primaria`, `--sombra-lg`, `--raio-lg`,
  `--espaco-*`) e classes existentes (`.btn`, `.btn--primario`,
  `.efeito-brilho`, `.formulario__grupo`, `.formulario__mensagem`).
- **JS:** nova função `initLogin()` no fim de `main.js`, chamada a partir da
  função de arranque existente (mesmo padrão dos outros `init*` do
  ficheiro, com isolamento de erro conforme já estabelecido na auditoria de
  5 de agosto).

## Design visual

**Composição:** fundo branco. Uma faixa verde institucional
(`--cor-primaria` → `--cor-primaria-escura`, via `clip-path: polygon(...)`)
atravessa o ecrã na diagonal, ocupando a zona esquerda/inferior. Sobre a
faixa: o emblema da AESOA em marca d'água grande (opacidade baixa,
`logo-emblema-branco.png`) e uma frase institucional curta (ex.: "Formação e
representação da enfermagem de sala operatória"). O cartão de login flutua
por cima da faixa, deslocado para a direita, com `--sombra-lg` e
`--raio-lg`, no mesmo espírito visual dos cartões `mvv__cartao` já
existentes no site.

**Responsivo:** abaixo de ~768px, a diagonal deixa de ser legível como
elemento de fundo — recolhe para um bloco superior sólido (sem
`clip-path`), com o logótipo e a frase institucional, e o cartão de login
ocupa a largura disponível abaixo.

**Link "Voltar ao site":** discreto, canto superior esquerdo, sobre a faixa
verde, com o logótipo AESOA a fazer duplo papel de link de regresso a
`index.html`.

## Formulário

Campos (usando `.formulario__grupo` existente):
- **E-mail** — `type="email"`, `autocomplete="email"`, obrigatório.
- **Senha** — `type="password"`, `autocomplete="current-password"`,
  obrigatório, com botão de alternância mostrar/ocultar (ícone de olho,
  `aria-pressed` a refletir o estado, `aria-label` dinâmico).
- **Checkbox "Lembrar-me"** — usa o padrão de `.formulario__consentimento`
  já existente.

Botão de submeter: `.btn .btn--primario .btn--bloco .efeito-brilho`, texto
"Entrar".

## Links de apoio

- **"Esqueci-me da senha"** — não cria uma segunda página. Ao clicar,
  o cartão troca (via `hidden`/toggle de classe) para um segundo estado
  inline no mesmo cartão: campo de e-mail + botão "Enviar link de
  recuperação", e depois uma mensagem de confirmação simulada
  (`formulario__mensagem--sucesso`). Um link "Voltar ao login" regressa ao
  primeiro estado.
- **"Ainda não é sócio? Torne-se sócio"** → `index.html#torne-se-membro`.

## Comportamento (simulação front-end)

Ao submeter o formulário de login:
1. `preventDefault`, validação nativa (`required`, `type=email`).
2. Botão entra em estado de carregamento (texto "A entrar…", desativado)
   durante ~900ms simulados (`setTimeout`), sem chamada de rede real.
3. Mostra `.formulario__mensagem--sucesso` com uma mensagem indicando que a
   área de sócio ainda está em preparação (não existe dashboard real para
   redirecionar) — evita prometer um destino que não existe.

O mesmo padrão de estado de carregamento/sucesso aplica-se ao formulário de
recuperação de senha.

## Acessibilidade

- `<label>` associado a cada campo (já é o padrão do projeto).
- Botão de mostrar/ocultar senha com `aria-label` e `aria-pressed`.
- Mensagens de estado com `role="status"` (padrão já usado em
  `.formulario__mensagem`).
- Faixa diagonal e emblema de marca d'água marcados `aria-hidden="true"`
  (decorativos).
- Contraste do texto sobre a faixa verde verificado com os tokens
  `--cor-texto-claro` existentes.

## Integração no site

Nas 14 páginas que já têm o link "Login de membro" na topbar
(`about.html`, `aconselhamento-juridico.html`, `banco-enfermeiros.html`,
`congresso-nacional-2025.html`, `consultadoria-saude.html`,
`contactos.html`, `curso-detalhe.html`, `cursos.html`, `estatutos.html`,
`eventos-webinars.html`, `galeria.html`, `index.html`, `noticia.html`,
`noticias.html`), o `href="#"` desse link passa a `href="login.html"`.

## Testes / verificação

- Abrir `login.html` diretamente e a partir do link na topbar de pelo menos
  duas páginas.
- Testar em viewport desktop e mobile (sem overflow horizontal, diagonal
  legível/recolhida corretamente).
- Testar fluxo: submeter login válido → estado de carregamento → mensagem
  de sucesso; submeter vazio → validação nativa impede envio.
- Testar alternância mostrar/ocultar senha.
- Testar fluxo "Esqueci-me da senha" → envio → confirmação → voltar ao
  login.
- Verificar consola sem erros nas páginas tocadas (topbar).
- Verificar navegação por teclado (tab order, foco visível) em todos os
  campos e botões.
