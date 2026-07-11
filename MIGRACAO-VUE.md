# Guia de Migração — `index.html` → Vue 3 + Inertia.js

Este documento acompanha o `index.html` reestruturado (HTML/CSS/JS puro, sem
jQuery, sem dependências de plataforma) e descreve como transportar cada
secção para componentes Vue quando a migração avançar.

Cada secção do `index.html` está delimitada por comentários
`<!-- SECTION: nome --> ... <!-- /SECTION: nome -->`, o que permite localizar
e extrair o bloco correspondente directamente.

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
- O código actual não usa estilos inline nem manipulação de DOM dispersa —
  cada comportamento está isolado numa função nomeada por secção em
  `main.js`, o que torna a extracção 1:1 para `<script setup>` directa.
