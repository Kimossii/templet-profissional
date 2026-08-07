# Redesign visual da página de login (`login.html`) — Design

## Contexto

`public/login.html` já existe e está funcional (formulário de login, recuperação
de senha simulada, alternância mostrar/ocultar senha — spec original em
`docs/superpowers/specs/2026-08-05-pagina-login-design.md`). O conceito visual
atual (faixa diagonal verde recortada + cartão flutuante com `clip-path`) foi
avaliado como visualmente fraco e sem identidade institucional forte o
suficiente para uma associação de saúde. Esta spec substitui **apenas a
composição visual** — a estrutura funcional do formulário, a validação e o
comportamento simulado de submissão mantêm-se inalterados.

Três propostas foram exploradas visualmente (companion de brainstorming) e a
Proposta A — "Split Editorial" — foi escolhida.

## Objetivo

Substituir o layout de `.login` em `public/login.html` e o bloco
`/* SECTION: login */` em `public/assets/css/sections.css` por um layout de
duas colunas: painel institucional (verde, com fotografia emoldurada) à
esquerda, formulário num painel branco à direita.

## Fora de âmbito

- Autenticação real, recuperação de senha real, área de sócio pós-login —
  continuam fora de âmbito (ver spec de 5 de agosto).
- Qualquer alteração a `main.js` — o comportamento (`initLogin()`) já
  implementado permanece sem alterações; a nova estrutura mantém os mesmos
  `id`/`name`/classes que o JS já consome.
- Estatísticas ou números de sócios/membros — não existe uma fonte
  confirmada para um número real, por isso o painel institucional usa uma
  frase qualitativa em vez de um valor numérico.

## Design visual

### Composição desktop (≥820px)

Duas colunas, altura mínima 100vh:

**Coluna esquerda — `.login__painel` (~44% da largura)**
Fundo com o gradiente verde institucional já usado no site
(`--cor-primaria-clara` → `--cor-primaria` → `--cor-primaria-escura`, mesmos
tokens de `variables.css`). Não é uma fotografia esticada — o painel é a cor
institucional sólida/gradiente, com a fotografia usada como elemento
editorial emoldurado (ver abaixo), não como fundo. Conteúdo, de cima para
baixo:

1. `.login__painel-topo` — logótipo (`logo-emblema-branco.png`) + texto
   "AESOA", link para `index.html` (equivalente ao `.login__voltar` atual,
   `aria-label="Voltar à página inicial da AESOA"`).
2. `.login__painel-linha` — barra de acento laranja (`--cor-acento`),
   44×4px, `border-radius` pequeno — assinatura de marca repetida também no
   lado do formulário.
3. Título: "A força da enfermagem de sala operatória, unida." (`h1`,
   `--fonte-titulo`, cor branca).
4. Frase institucional qualitativa (sem número): "Associação nacional que
   forma, representa e liga os enfermeiros de sala operatória em Angola."
5. `.login__painel-foto` — a fotografia `instrumentais.jpg` (instrumental
   cirúrgico sobre pano azul) num retângulo emoldurado: `border-radius`
   (`--raio-md`), borda fina translúcida, sombra subtil, largura máxima
   **~320px** (abaixo da largura nativa de 1000px, portanto sem upscaling
   em nenhum breakpoint desktop), altura proporcional ao aspect ratio
   nativo (2.5:1, ≈128px) — não preenche o painel inteiro, funciona como
   elemento editorial inserido no meio do texto. `alt=""` /
   `aria-hidden="true"` (decorativa).

**Coluna direita — `.login__conteudo` (restante largura, fundo branco)**
Centra `.login__cartao` (largura máx. ~380–400px, sem `clip-path`, sem
sombra de cartão — já está sobre fundo branco liso). Estrutura interna:

1. `.login__painel-linha` (variante no lado do formulário) — mesma barra de
   acento laranja, acima do título, ecoando o painel esquerdo.
2. Cabeçalho (`.login__cabecalho`) — inalterado: `<h1>`/`<h2>` + parágrafo.
3. Formulário — **estrutura HTML e classes inalteradas** face à versão
   atual (`.formulario__grupo`, `.login__campo-senha`,
   `.login__alternar-senha`, `.login__opcoes`, `.login__esqueci-link`,
   `.btn.btn--primario.btn--bloco.efeito-brilho`, `.formulario__mensagem`) —
   só o espaçamento/tipografia são refinados.
4. `.login__rodape` — inalterado.

### Responsivo (<820px)

`.login` passa a `flex-direction: column`. `.login__painel` deixa de ser
coluna lateral e passa a uma faixa superior compacta (mesmo gradiente verde,
altura reduzida, ~160–200px): mantém apenas `.login__painel-topo` (logo) e o
título institucional. `.login__painel-linha`, a frase de credibilidade e
`.login__painel-foto` ficam ocultos (`display: none`) nesta largura, para
poupar espaço vertical num ecrã pequeno. `.login__conteudo` ocupa a largura
total abaixo da faixa, como já acontece hoje com `.login__cartao`.

## Formulário, comportamento e acessibilidade

Sem alterações face à spec de 5 de agosto já implementada e testada:
- Campos e-mail/senha, alternância mostrar/ocultar senha, "lembrar-me".
- Fluxo "Esqueci-me da senha" inline (troca de estado dentro do mesmo
  cartão) e submissão simulada com estado de carregamento/sucesso.
- `aria-label`, `aria-pressed`, `role="status"`, foco visível — mantidos tal
  como já corrigido no commit `fa1a6c2`.

## Assets

- Reutiliza `public/assets/img/site/instrumentais.jpg` (373KB, 1000×400px)
  — copiado/servido a partir do caminho existente, sem necessidade de novo
  ficheiro (é pequeno o suficiente para não precisar de otimização adicional
  ao ser usado próximo do tamanho nativo).
- Reutiliza `logo-emblema-branco.png` já usado na página atual.

## Escopo técnico

- **`public/login.html`** — reestruturar o `<div class="login">`: novo
  `.login__painel` (substitui `.login__faixa`) e `.login__conteudo`
  (envolve o `.login__cartao` existente). IDs e `name` dos campos de
  formulário mantidos inalterados para compatibilidade com `main.js`.
- **`public/assets/css/sections.css`** — substituir o bloco
  `/* SECTION: login */` atual (incluindo os `clip-path` de
  `.login__faixa` e `.login__cartao`) pelo novo layout de duas colunas e
  pela media query de <820px descrita acima.
- **`public/assets/js/main.js`** — sem alterações.

## Testes / verificação

- Abrir `login.html` diretamente e a partir do link "Login de membro" na
  topbar de pelo menos duas páginas.
- Testar em viewport desktop (≥820px, painel lateral visível com foto
  emoldurada) e mobile (<820px, faixa superior compacta sem foto).
- Confirmar que a imagem `instrumentais.jpg` não aparece esticada/desfocada
  em nenhum breakpoint.
- Repetir os testes funcionais já cobertos pela spec de 5 de agosto (login
  simulado, recuperação de senha, alternância de senha, validação nativa,
  navegação por teclado, foco visível) — devem continuar a passar sem
  alteração de comportamento.
- Verificar consola sem erros.
