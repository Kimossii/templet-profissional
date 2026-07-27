# Página de Notícias da AESOA — Design

Data: 2026-07-27

## Objetivo

Criar `public/noticias.html`, a página completa de notícias para a qual a secção "Notícias" da homepage (`index.html#noticias`) já aponta através do botão "Ver todas as notícias", seguindo a estrutura visual e técnica já estabelecida pelo projeto.

## Conteúdo

5 notícias, ordenadas da mais recente para a mais antiga:

1. **AESOA reforça parceria com hospitais de Luanda para formação prática** — 11 de Julho de 2026 — categoria "Parcerias" — conteúdo e imagem (`reforcaparceria.jpg`) reaproveitados tal como já existem em `index.html#noticias`.
2. **Novo referencial de boas práticas em instrumentação cirúrgica** — 2 de Julho de 2026 — categoria "Boas Práticas" — reaproveitado de `index.html#noticias` (`instrumentais.jpg`).
3. **Inscrições abertas para o Congresso Nacional de Enfermagem Perioperatória** — 20 de Junho de 2026 — categoria "Eventos" — reaproveitado de `index.html#noticias` (`congresso.jpeg`).
4. **Workshop de Instrumentação Cirúrgica chega a Benguela em Outubro** *(novo)* — 26 de Maio de 2026 — categoria "Eventos" — usa `Workshopinstrumentacao.jpg`; anuncia o mesmo workshop já fixado na secção "Eventos" da homepage (Outubro 2026 · Benguela), sem contradizer essa data/local.
5. **Inscrições abertas para o Curso de Enfermagem Perioperatória Avançada** *(novo)* — 5 de Junho de 2026 — categoria "Eventos" — usa `Gestao-Perioperatoria.jpg`; anuncia o mesmo curso já fixado na secção "Eventos" da homepage (Setembro 2026 · Luanda).

As duas notícias novas (4 e 5) foram escritas para serem consistentes com factos já estabelecidos noutras partes do site (datas/locais dos eventos), não introduzem informação nova nem contraditória.

## Estrutura da página

Esqueleto de ficheiro idêntico às restantes páginas (topbar, cabeçalho/nav com "Notícias" a receber `aria-current="page"`, `main`, rodapé, botão-topo, `assets/js/main.js`).

### 1. Hero (`pagina-hero`)
Sem vídeo/imagem de fundo (fundo sólido, como em `estatutos.html`/`contactos.html`). Breadcrumb Início › Notícias. H1 "Notícias". Parágrafo curto de enquadramento.

### 2. Filtro por categoria
Chips de filtro reutilizando o padrão visual de `.galeria__filtro` (`galeria.html`): "Todas", "Parcerias", "Boas Práticas", "Eventos". Nova função `initFiltroNoticias()` em `main.js`, análoga a `initFiltroGaleria()` — mostra/esconde `.noticia__cartao` conforme `data-categoria` coincide com o filtro ativo.

### 3. Grelha de notícias
`.noticias__grelha` (grid já existente em `sections.css`), cartões `.cartao` (mesmo estilo dos cartões de notícia da homepage) com: imagem, etiqueta de categoria (`.cartao__etiqueta`), data (`.cartao__data`), título, texto, e botão "Ler mais" (`href="#"`, placeholder — não existem páginas de artigo individual no site).

### 4. CTA final
Secção "Não perca as próximas novidades" com botões para `index.html#torne-se-membro` e `index.html#formacoes-eventos`, no mesmo padrão das outras páginas.

## Código a alterar/criar

- **Novo**: `public/noticias.html`.
- **`public/assets/js/main.js`**: nova função `initFiltroNoticias()` (mesmo padrão de `initFiltroGaleria()`), chamada adicionada ao `DOMContentLoaded`.
- **Atualização de navegação**: o link "Notícias" do menu principal (atualmente `href="#"` placeholder) passa a `href="noticias.html"` em `index.html`, `about.html`, `estatutos.html`, `contactos.html`, `congresso-nacional-2025.html` e `galeria.html`. Os links do rodapé já apontam corretamente para `noticias.html`.
- Sem CSS novo necessário — reutiliza `.cartao`, `.noticias__grelha`, `.galeria__filtro` (renomeado/reaproveitado conforme necessário) já existentes em `sections.css`.

## Fora de âmbito

- Páginas de artigo individual (o botão "Ler mais" fica como placeholder `href="#"`).
- CMS ou backend para gerir notícias dinamicamente — conteúdo estático, tal como o resto do site.
- Paginação (5 notícias cabem confortavelmente numa grelha sem paginação).
