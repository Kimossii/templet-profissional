# Correcções pós-auditoria pré-migração (2026-08-05)

**Contexto:** depois de uma auditoria completa ao template (visual + HTML + CSS + JS, ~20 700 linhas, 3 subagentes em paralelo + revisão visual própria), o utilizador pediu para corrigir tudo o que fosse identificado como problema — excepto repetição de dados/imagens (fixtures estáticas deliberadas, viram API no backend) e a duplicação de cabeçalho/rodapé entre páginas (uniformização fica para quando migrar para Vue). Trabalho feito directamente (sem plano formal nem subagentes), dada a natureza mecânica e já totalmente especificada pelas descobertas da auditoria.

Detalhe completo das decisões de arquitectura, do que foi corrigido e do que ficou deliberadamente por fazer (com a razão de cada escolha) está documentado em [`MIGRACAO-VUE.md`](../../../MIGRACAO-VUE.md), Secção 7 — este ficheiro é só o resumo de execução desta sessão.

## Ficheiros alterados

`public/assets/css/{variables,base,components,sections}.css`, `public/assets/js/{main,palestrantes-carousel}.js`, `public/{cursos,curso-detalhe,curso-estudar,galeria,animar,aconselhamento-juridico,consultadoria-saude,eventos-webinars,noticia}.html`, `MIGRACAO-VUE.md`.

## O que foi corrigido

**Bugs:**
- Breadcrumb a transbordar em mobile (`.fio-migalha` sem `flex-wrap`).
- 13 fotos da galeria com `alt=""` → texto de `data-legenda` copiado para o `alt`.
- Botão de voltar sem `aria-label` em `curso-estudar.html`.
- Favoritos de curso sem `try/catch` no `localStorage`.

**Tokens/consistência (zero alteração visual):**
- `--cor-acento: #f0a324` criado em `variables.css`; 8 literais em `sections.css` migrados.
- Escala de z-index documentada (`--z-dropdown`, `--z-cabecalho`, `--z-sobreposicao`, etc.); ~10 valores literais (fixed/sticky globais) migrados. Valores locais pequenos (0 a 3, -1, -2) deixados como estão de propósito.
- `esta-activo`→`esta-ativo`, `is-activo`→`esta-ativo`, `estudo-lateral__accao`→`__acao`, `actualizarUrlAula`→`atualizarUrlAula`.
- `style="justify-content:center;"` removido de 8 páginas (redundante com a regra CSS já existente).

**JavaScript:**
- Pipeline `DOMContentLoaded` blindado com `executarInit()` (try/catch por chamada) — evita que um erro numa página aborte a inicialização de outras.
- `modulosAbertos` no leitor de curso deixou de ser lido do DOM (`classList.contains` antes de apagar) — passou a `Set` real, mantido pelo clique, sobrevive a re-renderizações.
- Deduplicações de baixo risco: `initSobreCursoExpandir`/`initSobreEstudoExpandir` fundidas via `initTextoExpandir()`; duas cópias de `criarSetaColapso` fundidas numa; cálculo de iniciais do avatar (4 sítios) extraído para `calcularIniciais()`.

## Verificação

15 páginas carregadas com Playwright (Chromium) sem erros de consola. Testes de interacção dirigidos: painel do LMS expandir/fechar/reabrir (com as classes renomeadas), troca de separadores (`esta-ativo` renomeado), acordeão de módulos a manter-se aberto depois de marcar uma aula como concluída (o fix do `modulosAbertos`), lightbox da galeria com o novo `alt`, carrossel de palestrantes (`esta-ativo` renomeado). `node --check` sobre `main.js` depois de cada refactor.

## Deliberadamente não tocado nesta ronda

Ver `MIGRACAO-VUE.md` §7.2 para a lista completa com razão de cada item — resumo: repetição de dados/imagens (cartões de curso, formador), cabeçalho/rodapé duplicado, selectores CSS entre componentes (~10 sítios), padrão de acordeão copiado 5×, 5 formulários quase idênticos, `sections.css` como monólito, hack de margem negativa no cartão de inscrição. Todos são candidatos claros a resolver *durante* a própria migração Vue (viram componentes/composables), não antes — o risco de os refazer agora em vanilla JS sem suite de testes supera o benefício, dado que este código vai ser reescrito de qualquer forma.

## Não commitado

Como sempre neste projecto, todas as alterações ficaram `git add`ado (staged), sem commit — decisão do utilizador quando/como commitar.
