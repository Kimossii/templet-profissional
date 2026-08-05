# Guia de Migração — Template AESOA → Laravel + Vue 3

Este documento acompanha o template estático (HTML/CSS/JS puro, sem jQuery,
sem dependências de plataforma) e descreve como transportar cada parte do
site para Laravel (backend) + Vue 3 (frontend) quando a migração avançar.

**Estado em 2026-08-05:** o template cresceu de uma única página (`index.html`)
para 16 páginas, incluindo um catálogo de cursos e um mini-LMS (`cursos.html`,
`curso-detalhe.html`, `curso-estudar.html`). A Secção 1-5 abaixo cobre a
página inicial (conteúdo original deste documento); a **Secção 6** cobre o
catálogo/LMS; a **Secção 7** regista as decisões de arquitectura tomadas
numa auditoria completa ao código (2026-08-05) e o que foi corrigido versus
deixado deliberadamente para a migração — ler antes de começar a portar
qualquer página.

Cada secção do `index.html` está delimitada por comentários
`<!-- SECTION: nome --> ... <!-- /SECTION: nome -->`, o que permite localizar
e extrair o bloco correspondente directamente.

## Índice

1. [Mapa de secções → componentes Vue](#1-mapa-de-secções--componentes-vue) *(index.html)*
2. [Componentes transversais a extrair primeiro](#2-componentes-transversais-a-extrair-primeiro)
3. [Dependências a substituir](#3-dependências-a-substituir)
4. [Ordem sugerida de migração](#4-ordem-sugerida-de-migração)
5. [Notas adicionais](#5-notas-adicionais)
6. [Catálogo de cursos e mini-LMS](#6-catálogo-de-cursos-e-mini-lms-cursoshtml-curso-detalhehtml-curso-estudarhtml)
7. [Auditoria de 2026-08-05 — decisões de arquitectura](#7-auditoria-de-2026-08-05--decisões-de-arquitectura)

## 1. Mapa de secções → componentes Vue

| Secção (`index.html`) | Componente Vue proposto | Notas de migração |
|---|---|---|
| `cabecalho` | `layouts/AppHeader.vue` | Nav e dropdowns tornam-se estado reactivo (`ref` para menu aberto/fechado) em vez de classes `.esta-aberto` manipuladas via `main.js`. Os itens de menu podem vir de uma prop/`shared data` do Inertia (`$page.props.navegacao`) para serem geridos a partir do backend. |
| `hero` | `sections/HeroSection.vue` | Estático por agora; os números (`+500`, `18`, `+10`) tornam-se props vindas de uma tabela de estatísticas no backend. |
| `sobre` | `sections/SobreSection.vue` | Texto e imagem tornam-se props (`titulo`, `paragrafos`, `imagem`) alimentadas por um recurso "Página Sobre" no backend. |
| `missao-visao-valores` | `sections/MissaoVisaoValores.vue` | Os 3 cartões tornam-se um `v-for` sobre um array `[{ icone, titulo, texto }]`. Os ícones SVG inline podem migrar para um componente `IconeSelo.vue` com `slot`. |
| `formacoes-eventos` | `sections/FormacoesEventos.vue` + `components/CartaoFormacao.vue` | Cada cartão é hoje estático; passa a `v-for` sobre dados de um modelo `Formacao`/`Evento` (Eloquent) devolvido via Inertia. O `CartaoFormacao.vue` recebe `titulo`, `etiqueta`, `data`, `local`, `imagem`, `descricao` como props. |
| `torne-se-membro` | `sections/TorneSeMembro.vue` + `components/FormularioMembro.vue` | O formulário passa de "placeholder front-end" (ver `initFormularioMembro` em `main.js`) para um `<form>` Inertia com `useForm()`, `post(route('membros.store'))`, validação de erros do backend e estado de `processing`. |
| `noticias` | `sections/NoticiasSection.vue` + `components/CartaoNoticia.vue` | Torna-se `v-for` sobre um recurso `Noticia` paginado. O botão "Ver todas as notícias" passa a `<Link href="/noticias">` do Inertia. |
| `contactos` | `sections/ContactosSection.vue` | Dados de contacto (morada, telefone, email, horário) tornam-se props vindas de definições institucionais no backend, para serem editáveis sem alterar código. |
| `rodape` | `layouts/AppFooter.vue` | Reutiliza os mesmos dados de navegação do `AppHeader.vue` (extrair para um composable `useNavegacao()` ou prop partilhada do Inertia, evitando duplicar a lista de links como acontece hoje em HTML puro). |

## 2. Componentes transversais a extrair primeiro

Antes das secções, vale a pena isolar estes componentes de UI reutilizados
em várias secções — reduzem duplicação assim que a migração começa:

- `components/BaseButton.vue` — variantes `.btn--primario`, `.btn--contorno`, `.btn--contorno-primario`.
- `components/BaseCard.vue` — usado por `CartaoFormacao` e `CartaoNoticia` (`.cartao`, `.cartao__imagem`, `.cartao__corpo`).
- `components/SectionHeading.vue` — o padrão `.secao-eyebrow` + `<h2>` + `.secao-divisor` repete-se em quase todas as secções.
- `components/IconSvg.vue` — os SVGs inline (check, alvo, olho, coração, calendário, telefone, email, relógio, localização, redes sociais) devem passar a um único componente parametrizável por `name`, em vez de HTML repetido.

## 3. Dependências a substituir

| Dependência actual | Estado | Substituição na migração Vue |
|---|---|---|
| Google Fonts (`Montserrat`, `Open Sans`) via `<link>` no `<head>` | Mantido por agora | Continua válido em Vue; opcionalmente self-host via build (Vite) para melhor performance/CSP. |
| Imagens `placehold.co` (hero, sobre, cartões, mapa) | Placeholder temporário | Substituir por imagens reais nos campos `imagem` dos modelos correspondentes, ou por upload via backend (Laravel + Spatie Media Library, por exemplo). |
| `assets/js/main.js` (vanilla JS por secção) | A remover progressivamente | Cada função (`initMenuMobile`, `initSubmenusDropdown`, `initFormularioMembro`, `initRevelarAoScroll`, `initAnoRodape`, `initCabecalhoFixo`) mapeia 1:1 para lógica dentro do componente Vue correspondente (`ref`, `onMounted`, `IntersectionObserver` num composable `useRevelarAoScroll()`). |
| `assets/css/*.css` | Reaproveitável | As variáveis (`variables.css`) migram directamente para o tema Vue (ou Tailwind config, se adoptado). `components.css`/`sections.css` dividem-se por componente (`<style scoped>` ou CSS Modules), mantendo a mesma nomenclatura em português para consistência. |
| Formulário "Torne-se Membro" sem backend real | Placeholder front-end | Passa a usar `useForm()` do Inertia + rota `POST /membros` + validação Laravel + envio de email de confirmação. |
| Menu com `href` para páginas `.html` estáticas (`about.html`, `contactos.html`, etc.) | Mantido nesta fase (fora do âmbito desta tarefa) | Cada página estática migra para uma rota Inertia própria (`/sobre`, `/contactos`, `/estatutos`, ...) à medida que for reescrita; os `href` do `AppHeader.vue`/`AppFooter.vue` passam a `<Link :href="route('...')">`. |

Não há jQuery, Bootstrap nem scripts de terceiros (tracking, popups) a
substituir — foram removidos na reestruturação e não devem ser reintroduzidos.

## 4. Ordem sugerida de migração

1. **Layout base** — `AppHeader.vue`, `AppFooter.vue`, `BaseButton.vue`, `SectionHeading.vue`, `IconSvg.vue`. Estes são usados por todas as secções, por isso vêm primeiro.
2. **Secções estáticas/institucionais** — `HeroSection.vue`, `SobreSection.vue`, `MissaoVisaoValores.vue`. Não dependem de dados dinâmicos do backend; servem para validar o layout e o design system em Vue antes de ligar a APIs.
3. **Secções com dados dinâmicos** — `FormacoesEventos.vue` e `NoticiasSection.vue`, já ligadas aos modelos/recursos do backend (`Formacao`, `Evento`, `Noticia`), com paginação e estados de carregamento.
4. **Formulário com submissão real** — `FormularioMembro.vue`, incluindo validação de erros do Inertia e página/estado de confirmação.
5. **Contactos** — `ContactosSection.vue`, incluindo eventual mapa embutido (ex: iframe do Google Maps) a substituir o placeholder actual.
6. **Páginas internas** — só depois de validado o padrão acima, migrar as restantes páginas HTML (`about.html`, `estatutos.html`, `corpossociais.html`, `conselho-cientifico.html`, `seccoes.html`, `socios.html`, `noticias.html`, `contactos.html` e páginas de eventos) para rotas Inertia, reaproveitando os componentes já criados.

## 5. Notas adicionais

- Os IDs de secção (`#hero`, `#sobre`, `#missao-visao-valores`,
  `#formacoes-eventos`, `#torne-se-membro`, `#noticias`, `#contactos`)
  foram mantidos como âncoras de scroll (`scroll-behavior: smooth` +
  `scroll-padding-top`). Em Vue, preservar os mesmos `id`s nos elementos
  raiz de cada componente para não partir links existentes.
- O `index.html` em si não usa estilos inline nem manipulação de DOM
  dispersa — cada comportamento está isolado numa função nomeada por secção
  em `main.js`, o que torna a extracção 1:1 para `<script setup>` directa.
  As páginas adicionadas depois (catálogo de cursos, LMS) já têm alguns
  estilos inline pontuais e mais manipulação directa de DOM — ver Secção 7.

## 6. Catálogo de cursos e mini-LMS (`cursos.html`, `curso-detalhe.html`, `curso-estudar.html`)

Estas três páginas foram construídas depois do `index.html`, com o mesmo
princípio (HTML/CSS/JS puro), mas já a simular um produto com dados —
catálogo com filtros, ficha de curso, e um leitor de curso tipo LMS com
progresso guardado em `localStorage`. É a parte mais rica do site e a que
mais se aproxima da app Vue real.

| Página / bloco actual | Componente/rota Vue proposto | Notas de migração |
|---|---|---|
| `cursos.html` — grelha de cartões (`.cursos__cartao`, repetida 8×) | Rota `/cursos` + `components/CourseCard.vue` + `v-for` | **Maior ganho de todo o site**: ~780 das 1352 linhas do ficheiro são o mesmo cartão repetido à mão. Um `<CourseCard :curso="curso">` alimentado por `GET /api/cursos` colapsa isto para uma única definição de componente. Ver Secção 7.2 — deliberadamente não tocado nesta ronda de correcções (é dados/repetição, não um bug). |
| `cursos.html` — filtros (categoria, pesquisa, avançados) | `composables/useFiltrosCursos()` + estado reactivo | Hoje: `categoriaAtiva` é uma `let` de closure, valores lidos directamente dos `<select>`/`<input>` no momento do filtro (`main.js`, `initFiltroCursos`). Em Vue: um `reactive({ categoria, pesquisa, modalidade, preco })` único, com o filtro como `computed`. |
| `curso-detalhe.html` — hero + cartão de inscrição fixo | `pages/CursoDetalhe.vue` + `components/InscricaoCard.vue` | O hack `.curso-inscricao { margin-top: -460px; }` (sobrepor o cartão ao hero) deve ser ressolvido com layout Vue real (grid/flex), não replicado — ver Secção 7.2. |
| `curso-detalhe.html`/`curso-estudar.html` — acordeão de módulos/lições, estrelas de avaliação, cartões de review, iniciais do formador | `components/CourseProgramAccordion.vue`, `components/RatingStars.vue`, `components/ReviewCard.vue`, `components/Avatar.vue` | Hoje esta lógica de renderização está **duplicada** entre as duas páginas (`initPaginaCurso` vs. `renderizarVisaoGeralEstudo`/`renderizarAvaliacoesEstudo` em `main.js`) porque cada página tem o seu próprio HTML placeholder + função de render. Em Vue deixa de haver duplicação por construção — os mesmos componentes servem as duas rotas. |
| `curso-estudar.html` — leitor de vídeo, navegação anterior/seguinte, painel lateral expandir/fechar/reabrir, badge de progresso | `pages/CursoEstudar.vue` + `components/LessonSidebar.vue` + `components/VideoPlayer.vue` | Estado hoje em variáveis de closure (`aulaActual`, `modulosAbertos`, `ultimoEstadoAberto`) + `localStorage` — mapeiam directamente para `ref`/`reactive` num composable `useProgressoCurso(slug)`, com o `localStorage` a passar a chamadas à API (progresso deve ficar no backend, associado ao utilizador autenticado, não ao browser). |
| `assets/js/cursos-dados.js` (`CURSOS_DADOS`, 8 cursos hardcoded) | Modelo `Curso` (Eloquent) + `GET /api/cursos`, `GET /api/cursos/{slug}` | Ver Secção 7.4 para os "cheiros" no formato de dados a corrigir ao desenhar as tabelas (avaliações agregadas, formador, duração das lições). |
| `assets/js/noticias-dados.js` (`NOTICIAS_DADOS`) | Modelo `Noticia` + `GET /api/noticias` | Mesmo padrão do `Curso` — fixture estático a substituir por dados reais. |

## 7. Auditoria de 2026-08-05 — decisões de arquitectura

Antes de consolidar este template para a migração, foi feita uma auditoria
completa (visual + HTML + CSS + JS) às ~20 700 linhas do site. Esta secção
regista o que saiu dessa auditoria: o que foi corrigido de imediato no
template estático, e o que foi **deliberadamente deixado para a própria
migração Vue**, com a razão de cada decisão — para não se perder o
contexto entre agora e a altura de portar o código.

### 7.1 O que foi corrigido no template estático (2026-08-05)

Bugs concretos:
- **Breadcrumb a transbordar em mobile** (`.fio-migalha`, `sections.css`) — faltava `flex-wrap: wrap`; o último item (título do curso) saía do ecrã em ecrãs estreitos.
- **13 fotos da galeria sem texto alternativo** (`galeria.html`) — `alt=""` substituído pelo texto de `data-legenda` já existente em cada item.
- **Botão de voltar sem `aria-label`** em `curso-estudar.html` (só ícone, inconsistente com o resto do site).
- **Favoritos de curso sem protecção `try/catch`** no acesso a `localStorage` (`initFavoritosCursos`, `main.js`) — alinhado com o padrão já usado no progresso do curso e no estado do painel.

Consistência/tokens (sem alterar comportamento visual):
- Nova variável `--cor-acento: #f0a324` em `variables.css`; as 8 ocorrências do valor literal em `sections.css` passaram a usar o token.
- Nova escala de z-index documentada em `variables.css` (`--z-dropdown`, `--z-cabecalho`, `--z-sobreposicao`, etc.) para as camadas `position: fixed/sticky` que atravessam o documento; os ~10 valores literais correspondentes foram substituídos. Os valores locais pequenos (`0`, `1`, `2`, `3`, `-1`, `-2`) usados dentro de um único contexto de empilhamento (ex.: camadas decorativas de um cartão) foram **deixados como estão de propósito** — não fazem parte de uma escala global e não precisam de nome.
- Nomenclatura unificada: `esta-activo` → `esta-ativo` (aba "Visão geral" em `curso-estudar.html`); `is-activo` → `esta-ativo` (carrossel de palestrantes); `estudo-lateral__accao` → `estudo-lateral__acao` (grafia antiga introduzida numa sessão anterior, corrigida para alinhar com `estudo-lateral__acoes`, `hero__acoes`, etc.); `actualizarUrlAula` → `atualizarUrlAula` (alinhado com `atualizarContagemAvancados`/`atualizarUltimaColuna`).
- Estilos inline `style="justify-content:center;"` removidos de 8 páginas — eram redundantes com o valor já definido em `.hero__acoes` na folha de estilos (confirmado por leitura da regra antes de remover).

Robustez do JavaScript:
- **Pipeline de arranque blindado**: as ~30 chamadas `init*()` em `DOMContentLoaded` passaram a correr através de um wrapper `executarInit()` com `try/catch` — antes, um erro numa função de uma página (ex.: um id em falta) abortava todas as chamadas seguintes na fila, incluindo as de páginas completamente não relacionadas.
- **Estado dos módulos abertos deixou de ser lido do DOM**: `renderizarSidebar()` (leitor de curso) fazia `classList.contains("esta-aberto")` sobre os elementos antes de os apagar com `replaceChildren()`, só para restaurar esse estado a seguir. Passou a existir um `Set` real (`modulosAbertos`) mantido pelo próprio clique, sobrevivendo a qualquer re-renderização (ex.: ao marcar uma aula como concluída) sem depender do DOM anterior.
- **Duplicação de baixo risco eliminada**: `initSobreCursoExpandir`/`initSobreEstudoExpandir` (idênticas, 4 selectores diferentes) fundidas num único `initTextoExpandir(seletorTexto, seletorBotao)`; duas implementações de `criarSetaColapso` (uma por página) fundidas numa função só, ao nível do módulo; o cálculo de iniciais do avatar (repetido 4 vezes) extraído para `calcularIniciais(nome)`.

Tudo verificado com as 15 páginas do site carregadas sem erros de consola,
mais testes de interacção dirigidos (painel expandir/fechar/reabrir, troca
de separadores, acordeão de módulos a sobreviver a uma re-renderização,
lightbox da galeria, carrossel de palestrantes).

### 7.2 O que foi deixado deliberadamente para a migração — e porquê

Por pedido explícito: **repetição de dados e imagens não foi tocada** —
são fixtures estáticas para testar o design antes de tudo vir do backend.
Isto inclui:

- Os 8 cartões de curso em `cursos.html` (~780 linhas repetidas) e os
  respectivos dados hardcoded que já também existem em `cursos-dados.js`.
- O objecto `formador` duplicado por curso (mesma formadora, biografia
  copiada em vários cursos).
- Cabeçalho + rodapé duplicados ao byte em 14 das 16 páginas — o próprio
  utilizador fará a uniformização ao migrar para um layout Vue único.

Adiado por ser arquitectural (exige um sistema de componentes que não
existe em HTML/CSS/JS puro) ou por ter risco de regressão desproporcional
face ao benefício de o fazer já no template estático, sem suite de testes:

- **Selectores CSS que invadem outros componentes** (~10 sítios, ex.
  `.estudo-lateral__lista .curso-programa__modulo` em `sections.css`) — um
  bloco estiliza directamente classes internas de outro. Funciona hoje
  porque tudo partilha uma folha de estilos global; parte assim que cada
  bloco vira um SFC Vue com `<style scoped>`. Requer promover cada caso a
  componente partilhado com props (`CourseProgramAccordion`, `RatingStars`,
  `PriceTag`) — decisão de design, não uma correcção mecânica.
- **Padrão de acordeão copiado 5 vezes** (valores, FAQ, estatutos, módulos
  e lições do curso) — mesma mecânica (`grid-template-rows: 0fr → 1fr` +
  classe `esta-aberto` + seta a rodar) implementada de forma independente
  em CSS e/ou JS em cada sítio. Candidato claro a `components/Accordion.vue`
  na migração; fundir os 5 já no template exigiria tocar em 5 áreas de UI
  distintas sem uma suite de testes para apanhar regressões — risco maior
  que o benefício antes de o código ser reescrito de qualquer forma.
- **5 formulários quase idênticos** (congresso, membro, contacto,
  newsletter, banco: submeter → validar → mensagem estática → reset) —
  mesma razão do acordeão: mecanicamente unificável, mas mais seguro de
  fazer ao escrever o `useForm()`/composable Inertia real do que ao tentar
  preservar 5 comportamentos ligeiramente diferentes em vanilla JS.
- **`sections.css` como monólito** (5661 linhas, ~10 pacotes de
  página/funcionalidade concatenados) — dividir agora significa 16 páginas
  HTML a apontar para mais `<link>`s que serão todos apagados assim que a
  página for reescrita em Vue. Fica documentado o mapeamento recomendado
  (ver lista abaixo) para quando cada secção virar um SFC.
- **`.curso-inscricao { margin-top: -460px; }`** (`sections.css`) — hack de
  sobreposição visual que depende do comprimento actual do conteúdo do
  hero. Não está avariado hoje; fica anotado para ser resolvido com layout
  Vue real (grid/flex) em vez de replicado.

Mapeamento recomendado para dividir `sections.css` por página/componente
quando cada bloco for extraído para um SFC (por ordem de aparição no
ficheiro): herói da página inicial → galeria/lightbox → herói do congresso
(animação, agenda, carrossel de palestrantes, preços, FAQ) → estatutos →
contactos/notícias/artigo de notícia → catálogo de cursos (filtros,
cartões, brilho animado) → ficha de curso (hero, inscrição, programa,
formador, avaliações) → leitor de curso/LMS (topo, modal de partilha,
vídeo, painel lateral).

### 7.3 Convenção de nomenclatura para a migração

A auditoria encontrou três convenções de "estado" a coexistir: `esta-*`
(a mais usada), modificador BEM `--expandido`/`--fechado` (ex.
`.estudo-painel--expandido`, `.cursos__cartao--hover-aberto`), e um
`is-activo` isolado (já corrigido, ver 7.1). **Não foi feita uma
unificação forçada das duas que sobraram** porque não são intercambiáveis
sem risco: `esta-expandido` já tem um significado específico próprio
(expandir texto truncado em "Mostrar mais") e reutilizar esse nome para o
painel lateral do LMS (uma funcionalidade diferente, na mesma página)
teria criado uma colisão semântica em vez de a resolver.

**Recomendação para a migração:** em Vue, estado é `ref`/`reactive`, não
uma classe CSS — o problema desaparece por construção (`:class="{ ativo:
isOpen }"` local a cada componente, sem partilhar nome global nenhum). Não
vale a pena forçar uma convenção única no HTML/CSS estático só para a
deitar fora a seguir; usar este documento como registo de que o
`esta-expandido` de "mostrar mais" e o conceito de "painel aberto/fechado"
do LMS são coisas diferentes que aconteceram a ter nomes parecidos.

### 7.4 Cheiros no formato dos dados (`cursos-dados.js`) a corrigir no desenho da API

- `avaliacaoMedia`, `totalAvaliacoes` e `distribuicaoEstrelas` são
  constantes escritas à mão ao lado de um array `reviews` com só 3
  entradas — já estão dessincronizados (86 avaliações, 3 reviews). No
  backend devem ser calculados (`AVG`/`COUNT` sobre a tabela de reviews),
  nunca guardados como campos independentes.
- `categoria` (rótulo) + `categoriaSlug` guardados por curso em vez de uma
  relação — deve ser uma tabela `categorias` com chave estrangeira.
- `formador` é um objecto embutido duplicado por curso — deve ser uma
  tabela `formadores` relacional (a mesma formadora aparece em vários
  cursos com a bio copiada quase verbatim).
- `licoes[].duracao` mistura unidades em texto livre ("3min", "2h",
  "1h30") que `main.js` tenta converter com `parseInt()` — parte-se em
  "1h30" (só lê o "1"). Precisa de um campo numérico (minutos) para
  qualquer soma/cálculo de duração no backend.
- Caminhos de imagem misturam duas convenções de pasta
  (`assets/multimidia/galeria/otimizado/...` vs. `assets/img/site/...`) —
  normalizar antes/durante a migração para storage/CDN.
