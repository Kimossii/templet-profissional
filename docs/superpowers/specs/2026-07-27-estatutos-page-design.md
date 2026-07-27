# Página de Estatutos da AESOA — Design

Data: 2026-07-27

## Objetivo

Criar `public/estatutos.html`, uma nova página estática que apresenta o articulado completo dos Estatutos da AESOA (fonte: "Estatutos da AESOA revistos[618].pdf"), seguindo a estrutura visual e técnica já estabelecida pelo projeto (`about.html`, `congresso-nacional-2025.html`) e usando `https://www.apcir.pt/estatutos` como referência de organização (acordeão por capítulo), elevada ao estilo visual mais rico já usado no site da AESOA (cartões com ícones, hero com breadcrumb, grelhas escalonadas).

## Estrutura da página

Esqueleto de ficheiro idêntico a `about.html`: `<head>` com os mesmos links de fontes/CSS, topbar, `<header class="cabecalho">` com a mesma navegação (o link "Estatutos" no submenu "Associação" recebe `aria-current="page"`), `<main id="conteudo-principal">`, rodapé idêntico, botão-topo, `assets/js/main.js`.

### 1. Hero (`pagina-hero`)
- Sem vídeo/imagem de fundo — apenas o fundo sólido institucional (`--cor-hero-fundo`), transmitindo um tom mais formal/documental.
- Breadcrumb: Início › Associação › Estatutos.
- H1: "Estatutos da AESOA".
- Parágrafo de enquadramento (associação sem fins lucrativos, sede em Luanda, regida por estes estatutos).
- Duas pastilhas informativas: "8 Capítulos" e "46 Artigos".
- Sem botão de download/impressão (decidido: não incluir por agora, não existe PDF real no repositório).

### 2. "Em Resumo" (secção com 5 cartões `.mvv__cartao` + `.selo`)
Factos extraídos diretamente do articulado, cada cartão com ícone SVG (inline, estilo já usado no site):
1. **Natureza jurídica** — associação sem fins lucrativos (Art. 1º).
2. **Sede** — Edifício Vitória, Andar 15, Letra B – Luanda (Art. 2º).
3. **Categorias de sócio** — 5 categorias: fundadores, efetivos, extraordinários, estudantes, honorários (Art. 4º).
4. **Jóia & quota** — jóia de inscrição de 2.000 Kwanzas (não reembolsável) + quota mensal de 500 Kwanzas (Art. 6º/3).
5. **Órgãos sociais** — Assembleia Geral, Conselho de Administração, Conselho Fiscal, Conselho Consultivo.

### 3. Índice rápido (grelha de 8 pastilhas/links)
Uma pastilha por Capítulo (I a VIII), com o título do capítulo; clique faz scroll suave até ao item correspondente do acordeão e abre-o automaticamente (via `location.hash` + JS).

### 4. Articulado completo (acordeão por Capítulo)
Reutiliza o padrão visual/interativo de `.faq__item` / `.faq__cabecalho` / `.faq__painel` (grid `0fr → 1fr` para abrir/fechar), mas com classes próprias: `.estatuto__capitulo`, `.estatuto__cabecalho`, `.estatuto__corpo`, `.estatuto__corpo-interior`. Cada item tem `id="capitulo-1"` … `id="capitulo-8"` para permitir deep-linking a partir do índice rápido.

Cada painel contém os artigos desse capítulo, cada um com: número ("Artigo Nº"), título, e o corpo do texto formatado com parágrafos/listas ordenadas (`1.`, `2.`, …) e listas alfabéticas (`a)`, `b)`, …) estilizadas com CSS (não HTML `<ol type="a">`, para poder preservar exatamente as letras/números tal como aparecem no documento, incluindo lacunas intencionais de lettering — ver secção "Fidelidade do texto").

**Agrupamento dos 46 artigos nos 8 capítulos** (conforme a estrutura literal do documento):

| Capítulo | Título | Artigos | Nota |
|---|---|---|---|
| I | Da Natureza Jurídica, Denominação, Sede e Duração da Associação | 1º–2º | — |
| II | Fins e Atribuições | 3º | — |
| III | Dos Sócios | 4º–29º | Inclui sub-cabeçalhos internos (não são "capítulos" novos, apenas âncoras de leitura): "Secção — Da Assembleia Geral" (Art. 18º–26º, título já existe no documento) e "Secção — Do Conselho de Administração" (Art. 27º–29º, título adicionado por nós para navegabilidade, pois o documento não tem cabeçalho próprio aqui) |
| IV | Do Conselho Fiscal | 30º–32º | — |
| V | Do Conselho Consultivo | 33º–43º | Inclui sub-cabeçalho interno adicionado: "Recursos Financeiros e Património" antes do Art. 35º (Receitas), pois o documento não abre capítulo próprio para estas matérias |
| VI | Da Liquidação da Associação | 44º | — |
| VII | Designações Transitórias | 45º | — |
| VIII | Disposições Gerais e Finais | 46º | — |

### 5. CTA final
Secção "Tem dúvidas sobre os Estatutos?" com botões para `index.html#torne-se-membro` ("Torne-se Associado") e `corpossociais.html` ("Conhecer os Órgãos Sociais"), no mesmo padrão da secção `sobre-cta` de `about.html`.

## Fidelidade do texto (decisão do utilizador: corrigir erros óbvios)

- **Corrigir**: título do Art. 17º de "Destruição dos órgãos sociais" para "Destituição dos Órgãos Sociais" (erro de digitação claro, dado o conteúdo do artigo — eleição para lugares vagos).
- **Corrigir**: alínea duplicada no Art. 3º/2 — a segunda alínea "d) Defender a efetiva e adequada formação..." passa a "e)", eliminando a duplicação (torna a sequência a–j contígua, sem lacuna).
- **Normalizar formatação, sem alterar conteúdo**: Art. 12º mistura "1. 2. 3. 4." com "5) 6) 7)…" — uniformizar para numeração `1.`–`11.` consistente.
- **Não alterar**: lacunas de lettering que são convenção legítima de revisão legislativa (ex.: Art. 7º salta de g) para i), e de j) para l); Art. 29º salta de j) para l|) — preservar exatamente, sem renumerar, porque tudo indica que são alíneas removidas em revisões anteriores e mantidas como lacuna deliberada (citações cruzadas no próprio documento, ex. Art. 36º/1 remete para "artigo 29º alínea b)", confirmando que a lettering original é uma referência estável).
- Todo o resto do articulado é transcrito literalmente (incluindo linguagem, pontuação e numeração dos 46 artigos), com pequenas normalizações ortográficas apenas onde não alteram o sentido (ex. maiúsculas de títulos de artigo).

## Código a alterar/criar

- **Novo**: `public/estatutos.html`.
- **`public/assets/css/sections.css`**: novo bloco de estilos `.estatuto__*` — cartões-resumo (reutiliza `.mvv__cartao`/`.selo` existentes, sem novo CSS necessário para estes), grelha do índice rápido, acordeão por capítulo (variante do `.faq__*` com identificadores próprios), listas legais (`a)`, `1.`) estilizadas.
- **`public/assets/js/main.js`**: nova função `initAcordeaoEstatutos()` — mesmo toggle da FAQ (`classList.toggle("esta-aberto")`), mais suporte para abrir automaticamente o capítulo indicado por `location.hash` ao carregar a página ou ao clicar numa pastilha do índice rápido. Chamada adicionada ao bloco `DOMContentLoaded` já existente.

## Fora de âmbito

- Botão de impressão/download de PDF (decidido não incluir agora).
- Criação de `corpossociais.html` ou `socios.html` (já referenciados no nav mas não fazem parte deste pedido; os links continuam a apontar para eles tal como já acontece nas outras páginas).
- Alterações ao rodapé ou nav de outras páginas existentes.
