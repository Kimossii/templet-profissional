# Página de Cursos — Design

Data: 2026-07-31

## Objetivo

Criar `public/cursos.html`, a página que liga o item "Cursos práticos" do
submenu "Serviços" (hoje `href="#"` em todas as páginas). É uma listagem
estilo Udemy — grelha de cursos filtrável e pesquisável — mas com a
identidade visual da AESOA (cores, tipografia, componentes já existentes).

**Âmbito desta fase: só a listagem.** As páginas de detalhe por curso
(`curso.html?slug=...`) e os formulários de inscrição ficam para depois,
após a migração para Vue.js.

## Estrutura da página

Segue o esqueleto padrão do site (topbar, cabeçalho/nav, `main`, rodapé,
`main.js`):

1. **Hero** (`pagina-hero`) — breadcrumb (Início › Cursos), H1 "Cursos e
   Formações", subtítulo curto, e uma barra de estatísticas rápidas
   reaproveitando `.estatisticas__grelha`/`.estatistica` (já usado em
   `about.html`): nº de cursos disponíveis, nº de áreas temáticas, nº de
   formadores certificados.
2. **Filtros + pesquisa** — pills de categoria (reaproveitando o padrão
   visual de `.galeria__filtro`, mas com classes próprias `.cursos__filtro`
   para não acoplar a `galeria.html`) + campo de texto que pesquisa por
   título e nome do formador. Os dois critérios combinam-se (E lógico).
3. **Grelha de cursos** (`.cursos__grelha`) — cards `.cursos__cartao`
   (baseados em `.cartao`) com: imagem, badge de categoria
   (`.cartao__etiqueta`), badges de nível/modalidade (`.etiquetas`), título,
   nome do formador, duração (ícone relógio), preço, botão "Ver Curso".
   Estado vazio (`#cursos-vazio`, oculto por omissão) mostrado quando o
   filtro não devolve nenhum resultado.
4. **CTA final** — "Não encontra o curso que precisa? Fale connosco" →
   `contactos.html` (mesmo padrão do CTA de `consultadoria-saude.html`).

## Conteúdo (dados estáticos, inline no HTML)

4 categorias, 8 cursos (2 por categoria). Fotos reais já existentes no
projeto (sem placeholders): `assets/multimidia/galeria/otimizado/*.jpg`,
`assets/img/site/instrumentais.jpg`,
`assets/img/site/Workshopinstrumentacao.jpg`,
`assets/img/site/Gestao-Perioperatoria.jpg`.

| # | Curso | Categoria | Nível | Modalidade | Duração | Formador | Preço |
|---|---|---|---|---|---|---|---|
| 1 | Enfermagem Perioperatória Avançada | Enfermagem Perioperatória | Avançado | Presencial (Luanda) | 6 semanas · 40h | Enf.º Chefe António Sacadura | Sócios: gratuito |
| 2 | Fundamentos da Enfermagem no Bloco Operatório | Enfermagem Perioperatória | Iniciante | Presencial | 3 dias · 24h | Enf.ª Ana Kiala | Sócios: gratuito |
| 3 | Segurança do Doente na Sala Operatória | Segurança do Doente | Intermédio | Online | 5 semanas · 20h | Dr. Manuel Domingos | Preço sob consulta |
| 4 | Prevenção de Eventos Adversos Cirúrgicos | Segurança do Doente | Intermédio | Híbrido | 4 semanas · 16h | Enf.ª Chefe Beatriz Neto | Sócios: gratuito |
| 5 | Instrumentação Cirúrgica Essencial | Instrumentação Cirúrgica | Iniciante | Presencial | 2 semanas · 16h | Enf.º João Mavinga | Sócios: gratuito |
| 6 | Workshop de Instrumentação Avançada | Instrumentação Cirúrgica | Avançado | Presencial (Benguela) | 1 semana · 30h | Enf.ª Chefe Beatriz Neto | Preço sob consulta |
| 7 | Gestão de Equipas em Bloco Operatório | Gestão & Liderança | Intermédio | Online | 6 semanas · 24h | Dr. Manuel Domingos | Preço sob consulta |
| 8 | Liderança e Comunicação em Enfermagem Perioperatória | Gestão & Liderança | Avançado | Híbrido | 4 semanas · 20h | Enf.º Chefe António Sacadura | Sócios: gratuito |

O botão "Ver Curso" de cada card aponta para `curso.html?slug=<slug-do-curso>`
(mesmo padrão de `noticia.html?slug=...`). Este ficheiro **não é criado
nesta fase** — o link fica preparado para a próxima etapa (páginas de
detalhe), tal como aconteceu com outros links do site apontando para
páginas ainda por construir.

## Filtro e pesquisa (JS)

Nova função `initFiltroCursos()` em `main.js`, seguindo o padrão de
`initFiltroGaleria()`:
- Pills de categoria com `data-filtro`, `esta-ativo`/`aria-selected` (só uma
  ativa de cada vez, "Todos" por omissão).
- Campo de pesquisa (`input` com `oninput`) que compara o texto digitado
  (lowercase, sem acentos não é necessário — conteúdo já vem sem acentos
  problemáticos) contra título e formador de cada card.
- Um card fica visível apenas se satisfizer os dois critérios em
  simultâneo (categoria E pesquisa).
- Contador de resultados e `#cursos-vazio` atualizados a cada filtragem.

## Código a alterar/criar

- **Novo**: `public/cursos.html`.
- **`scripts/sync-layout.js`**: no `HEADER_TEMPLATE`, mudar o item
  "Cursos práticos" (`href="#"`) do submenu Serviços para "Cursos"
  (`href="cursos.html"`); adicionar `"cursos.html": { navCurrent:
  "cursos.html", footerCurrent: null }` a `PAGINAS`; correr
  `node scripts/sync-layout.js` para propagar a mudança de menu a todas as
  páginas existentes.
- **`public/assets/css/sections.css`**: novos blocos `.cursos__filtros`,
  `.cursos__filtro`, `.cursos__grelha`, `.cursos__cartao` (badges de
  nível/modalidade/preço), `.cursos__vazio`.
- **`public/assets/js/main.js`**: nova função `initFiltroCursos()`,
  chamada no bloco de inicialização geral.

## Fora de âmbito

- Página(s) de detalhe por curso (`curso.html?slug=...`).
- Formulário/fluxo de inscrição em qualquer curso.
- Qualquer backend real ou persistência de dados.
- Alterar a ordem ou estrutura do menu "Serviços" além de ligar o link de
  Cursos.
