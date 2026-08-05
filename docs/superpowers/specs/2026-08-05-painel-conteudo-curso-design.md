# Design: Botões de expandir/fechar do painel "Conteúdo do curso"

**Página:** `public/curso-estudar.html`
**Data:** 2026-08-05

## Objetivo

Adicionar dois botões ao lado do título "Conteúdo do curso" (cabeçalho do `aside.estudo-lateral`): um para **expandir** o painel (aumentar a sua largura) e outro para **fechar** o painel (escondê-lo por completo, dando toda a largura à área principal).

## Componentes

### Cabeçalho reestruturado

`.estudo-lateral__cabecalho` passa a ter uma linha superior em flex (`.estudo-lateral__cabecalho-topo`) com o `<h2>` à esquerda e um grupo de ações (`.estudo-lateral__acoes`) à direita. O `<p class="estudo-lateral__resumo">` mantém-se por baixo, sem alterações.

### Botão Expandir (`#estudo-painel-expandir`)

- Botão circular (32px), ícone SVG de setas horizontais opostas (↔), estilo visual alinhado com `.estudo-video__nav` (fundo translúcido, tooltip escuro `-dica` a subir no hover/focus).
- Alterna a largura do painel entre `420px` (normal) e `~640px` (expandido), aplicando/removendo a classe `estudo-painel--expandido` em `.estudo-corpo`.
- Estado ativo (expandido) recebe destaque visual (fundo preenchido) e o `aria-label`/tooltip mudam para "Reduzir painel".
- Escondido em ecrãs ≤900px (o painel já ocupa 100% da largura no layout empilhado; expandir não tem efeito útil aí).

### Botão Fechar (`#estudo-painel-fechar`)

- Botão circular (32px), ícone "recolher para a borda" (seta a entrar num traço vertical à direita).
- Aplica a classe `estudo-painel--fechado` em `.estudo-corpo`, que esconde `.estudo-lateral` (`display: none`) e faz a coluna principal ocupar 100% da largura (`grid-template-columns: 1fr`).
- Funciona a partir de qualquer estado (normal ou expandido).

### Aba flutuante "Reabrir" (`#estudo-painel-reabrir`)

- Pequena aba fixa encostada à borda direita da área `.estudo-corpo`, visível apenas quando `estudo-painel--fechado` está ativo (`hidden` toggled via JS).
- Ícone espelhado do botão fechar; tooltip "Mostrar conteúdo do curso".
- Ao clicar, remove `estudo-painel--fechado` e restaura o último estado não-fechado (`normal` ou `expandido`).

## Comportamento / estado

- Estado único: `normal` | `expandido` | `fechado`, guardado numa variável JS e persistido em `localStorage` (chave `aesoa-estudo-painel-estado`), seguindo o mesmo padrão try/catch usado em `obterAulasConcluidas`/`guardarAulasConcluidas` (falha silenciosa se `localStorage` estiver indisponível — o painel arranca sempre em `normal`).
- Transições suaves via `transition` no `grid-template-columns` de `.estudo-corpo` e na entrada/saída da aba flutuante.
- Lógica isolada numa função `initPainelEstudo()` (ou secção equivalente dentro de `initPaginaEstudo`) em `main.js`, seguindo o padrão de funções `init*` já usado no ficheiro.

## Responsivo (≤900px)

- Botão "Expandir" escondido via CSS (`display: none` dentro do media query existente em `sections.css`).
- "Fechar"/"Reabrir" continuam ativos, permitindo encurtar a página em mobile.

## Erros / edge cases

- `localStorage` indisponível ou corrompido → estado não persiste, sem erro visível ao utilizador.
- Nenhum outro caso de erro aplicável — todos os elementos são estáticos no template HTML.

## Verificação

- Capturas de ecrã em desktop (1440px) nos três estados (normal, expandido, fechado).
- Captura em mobile (375px) confirmando botão expandir escondido e fechar/reabrir funcionais.
- Confirmar persistência do estado após reload da página.
