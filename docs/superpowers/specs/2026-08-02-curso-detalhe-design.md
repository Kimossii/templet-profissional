# Página de Detalhe de Curso (estilo Udemy) — Design

Data: 2026-08-02

## Objectivo

Criar `public/curso-detalhe.html`, um template único e reutilizável que renderiza a página completa de um curso a partir de `?slug=` na URL — inspirado na estrutura de página de curso da Udemy (udemy.com/course/...), adaptada à realidade da AESOA (formações presenciais/online/híbridas, não vídeo on-demand). Os 8 botões "Ver Curso" em `cursos.html` (hoje `href="#"`) passam a apontar para esta página.

## Arquitectura

- Sem backend — site 100% estático, mesmo padrão de `noticia.html`.
- `public/assets/js/cursos-dados.js`: objecto `CURSOS_DADOS` com uma entrada por slug. Carregado antes de `main.js`, apenas em `curso-detalhe.html`.
- `initPaginaCurso()` em `main.js`: lê o slug, procura em `CURSOS_DADOS`; se encontrado, preenche o DOM; se não, mostra estado `#curso-nao-encontrado` (mesmo padrão do `#noticia-nao-encontrada`).
- `cursos.html`: os 8 `<a class="cursos__cartao-cta">` passam de `href="#"` para `href="curso-detalhe.html?slug=<slug>"`.
- Reaproveita padrões já existentes: preenchimento de estrelas por `width:%`, preço com valor em negrito + moeda subtil, `efeito-brilho` nos CTAs, sistema de favoritos por `data-slug`.

## Modelo de dados por curso (`CURSOS_DADOS[slug]`)

```js
{
  categoria: "Enfermagem Perioperatória",   // etiqueta/pastilha
  categoriaSlug: "perioperatoria",          // para filtrar relacionados
  titulo: "...",
  subtitulo: "...",                          // 1 frase, usada no hero
  selo: "Mais Procurado" | "Últimas Vagas" | null,
  nivel: "Avançado" | "Básico" | "Intermediário" | "Todos os Níveis",
  modalidade: "Presencial" | "Online" | "Híbrido",
  duracao: "6 semanas · 40h",
  dataInicio: "14 de Setembro de 2026",
  local: "Sede AESOA, Luanda" | null,        // null se Online
  imagem: "assets/...",
  imagemAlt: "...",
  precoReal: 55000,
  precoSocio: 0,                             // 0 = "Grátis p/ Sócios"
  descontoSelo: "-45%" | null,
  avaliacaoMedia: 4.9,
  totalAvaliacoes: 86,
  distribuicaoEstrelas: [70, 20, 7, 2, 1],   // % para 5,4,3,2,1 estrelas
  descricao: ["parágrafo 1", "parágrafo 2", "parágrafo 3"],
  oQueVaiAprender: ["...", "...", "...", "...", "...", "..."],  // 6 itens
  requisitos: ["...", "...", "..."],
  publicoAlvo: ["...", "...", "..."],
  programa: [
    { titulo: "Módulo 1 — ...", duracao: "8h", licoes: [
      { titulo: "...", duracao: "45min", tipo: "aula" | "pratica" | "avaliacao" },
      ...
    ]},
    ...
  ],
  certificadoTexto: "...",
  formador: {
    nome: "Enf.º Chefe António Sacadura",
    credenciais: "...",
    bio: "...",
    nCursos: 4,
    nFormandos: 320,
    avaliacaoMedia: 4.8,
  },
  reviews: [
    { nome: "...", cargo: "...", avaliacao: 5, data: "...", texto: "..." },
    ...  // 3 por curso
  ],
  vagasLimitadas: true | false,
}
```

## Estrutura visual da página

1. **Breadcrumb**: Início › Cursos › [categoria] › [título curto].
2. **Hero** (fundo verde escuro em gradiente, mesmo tom do `noticia-hero`): pastilha de categoria + nível, título grande a branco, subtítulo, linha de estrelas + `avaliacaoMedia` + `(N avaliações)`, "Criado por [formador]", meta em ícones (modalidade, duração, dataInicio).
3. **Cartão de inscrição**: em desktop, `position: sticky` flutuando à direita ao lado das secções 4–9; em mobile, aparece logo após o hero e uma versão compacta fica fixa no fundo do ecrã ao fazer scroll. Contém: imagem do curso, preço (real risca-se se houver desconto; sócio em destaque), botão "Inscrever-se Agora" (`efeito-brilho`, aponta para `index.html#torne-se-membro`, mesmo destino usado pelos outros CTAs de inscrição do site), lista de selos de confiança (✓ Certificado reconhecido AESOA, ✓ Vagas limitadas — se `vagasLimitadas`, ✓ Acesso à comunidade de associados), ícones de partilhar/favoritar (reutiliza `.cursos__favorito`).
4. **"O Que Vai Aprender"**: grelha 2 colunas (1 em mobile) com ícone de visto + texto, dentro de caixa com borda subtil.
5. **"Programa do Curso"**: accordion por módulo — cabeçalho com título + duração + seta que roda ao abrir; conteúdo lista as lições com ícone por `tipo` (aula/prática/avaliação) + duração. Resumo no topo: "X módulos · Y horas de conteúdo".
6. **"Requisitos"**: lista simples com marcador.
7. **"Sobre Este Curso"**: parágrafos de `descricao`; se o texto ultrapassar ~3 parágrafos em altura, aplica-se clamp com gradiente de fade + botão "Mostrar mais" (JS toggle de classe, sem reload).
8. **"Para Quem É Este Curso"**: lista com marcador.
9. **Perfil do Formador**: avatar (iniciais sobre fundo verde, não há fotos reais dos formadores), nome, credenciais, bio, e três estatísticas (nº cursos, nº formandos, avaliação média).
10. **Avaliações**: número grande da média + estrelas + total; gráfico de barras horizontais por nota (5→1) usando `distribuicaoEstrelas`; três cartões de review (iniciais, nome, cargo, estrelas, data, texto).
11. **Cursos Relacionados**: até 3 cursos com a mesma `categoriaSlug` (excluindo o actual), reaproveitando o layout `.cartao` já usado em `cursos.html`.
12. **CTA final**: "Torne-se Associado" / "Ver Todos os Cursos" — mesmo padrão do fim de `noticia.html`.
13. **Estado "não encontrado"**: se o slug não existir, título "Curso não encontrado", texto breve, botão para `cursos.html`; resto da página oculto.

## Conteúdo dos 8 cursos

Os dados base (título, categoria, formador, duração, data, preço, nível, modalidade, resumo, 3 pontos de aprendizagem) já existem nos cartões de `cursos.html` e serão reaproveitados tal como estão. O conteúdo adicional necessário só para esta página — parágrafos de descrição completa, requisitos, público-alvo, módulos do programa, bio/estatísticas do formador, e reviews — será escrito durante a implementação seguindo o schema acima, no mesmo tom profissional e o mesmo nível de detalhe demonstrado no exemplo completo abaixo, para os 8 slugs:

`enfermagem-perioperatoria-avancada`, `fundamentos-enfermagem-bloco-operatorio`, `seguranca-doente-sala-operatoria`, `prevencao-eventos-adversos-cirurgicos`, `instrumentacao-cirurgica-essencial`, `workshop-instrumentacao-avancada`, `gestao-equipas-bloco-operatorio`, `lideranca-comunicacao-enfermagem-perioperatoria`.

### Exemplo completo — `enfermagem-perioperatoria-avancada`

- categoria: Enfermagem Perioperatória · nível: Avançado · modalidade: Presencial · duração: 6 semanas · 40h · início: 14 de Setembro de 2026 · local: Sede AESOA, Luanda
- preço: 55.000 Kz · sócios: grátis · avaliação: 4.9 (86 avaliações) · distribuição: [70, 20, 7, 2, 1]
- descrição: 3 parágrafos que desenvolvem o resumo já existente ("Aprofunde competências técnicas e de liderança..."), cobrindo o contexto do curso, a abordagem prática/teórica e o perfil de quem já formou-se.
- programa: 4 módulos (ex.: "Fundamentos Avançados de Cuidados Perioperatórios", "Gestão de Complicações Intraoperatórias", "Trabalho em Equipa Cirúrgica", "Avaliação Final e Certificação"), cada um com 3–4 lições com tipo/duração.
- requisitos: registo activo como enfermeiro, experiência mínima em bloco operatório, formação em Fundamentos recomendada.
- público-alvo: enfermeiros perioperatórios com experiência que querem avançar para funções de maior autonomia/liderança.
- formador: Enf.º Chefe António Sacadura — credenciais e bio breve baseadas no que já existe nos cartões; estatísticas (nº cursos, nº formandos, avaliação).
- 3 reviews de participantes fictícios mas realistas (nome, cargo/hospital, nota, data, texto curto).

Os restantes 7 cursos seguem exactamente esta mesma profundidade de conteúdo (descrição em 3 parágrafos, 3–4 módulos com lições, requisitos, público-alvo, formador com bio+estatísticas, 3 reviews), coerente com o tema e o formador já indicados em `cursos.html` para cada um.

## Ficheiros a criar/alterar

- Novo `public/curso-detalhe.html`.
- Novo `public/assets/js/cursos-dados.js`.
- `public/assets/js/main.js`: nova função `initPaginaCurso()`.
- `public/assets/css/sections.css`: novo bloco para hero do curso, cartão de inscrição sticky, accordion do programa, gráfico de avaliações, cartões de review.
- `public/cursos.html`: os 8 `href="#"` dos CTAs "Ver Curso" passam a `curso-detalhe.html?slug=...`.

## Fora de âmbito

- Checkout/pagamento real — o botão "Inscrever-se Agora" aponta para `index.html#torne-se-membro` (mesmo destino dos outros CTAs de inscrição do site), sem integração de pagamento.
- Sistema de reviews dinâmico (submissão pelo utilizador) — as avaliações são conteúdo estático, tal como as notícias.
- Vídeo de preview do curso — a AESOA não tem vídeos de curso gravados; a imagem estática do curso substitui este elemento da Udemy.
