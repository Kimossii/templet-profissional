# Página de Detalhe de Curso (estilo Udemy) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `public/curso-detalhe.html`, a single dynamic template (`?slug=`) that renders a full Udemy-style course detail page for each of the 8 AESOA courses, and wire up the 8 "Ver Curso" buttons in `cursos.html` to it.

**Architecture:** 100% static site (no backend). A new data file `public/assets/js/cursos-dados.js` holds one entry per course slug in a `CURSOS_DADOS` object. A new `initPaginaCurso()` function in `public/assets/js/main.js` reads `?slug=` from the URL, looks up the course, and renders every section of the page into the DOM (hero, sticky enrolment card, learning outcomes, curriculum accordion, requirements, description, target audience, instructor profile, reviews, related courses). This mirrors the existing `noticia.html` / `NOTICIAS_DADOS` / `initPaginaNoticia()` pattern already used in this codebase. New CSS lives in `public/assets/css/sections.css`, appended at the end, following the same variable-driven, BEM-ish naming already used for `.noticia-*` and `.faq__*` (accordion via `grid-template-rows: 0fr → 1fr`).

**Tech Stack:** Plain HTML/CSS/JS, no build step. No test framework exists in this repo — verification is done by serving `public/` locally (`python3 -m http.server 8000` from inside `public/`) and checking rendered content/console in a browser, plus `node --check` for JS syntax and small `node -e` structural checks for the data file.

## Global Constraints

- No backend, no CMS, no payment integration — matches the rest of the site (spec: "Fora de âmbito").
- All new markup/classes go in Portuguese, matching existing naming conventions (`curso-*` prefix for this page's new classes, mirroring `noticia-*`).
- Reuse existing CSS variables only (`--cor-primaria`, `--espaco-*`, `--raio-*`, `--fs-*`, etc. from `public/assets/css/variables.css`) — no new hard-coded colors/spacing.
- The "Inscrever-se Agora" CTA always links to `index.html#torne-se-membro` (same destination as every other enrolment CTA on the site).
- Reuse existing shared behaviours instead of duplicating: star-fill via `style.width = "<pct>%"` on a `.cursos__estrelas-preenchimento`-style element, `.efeito-brilho` on primary CTA buttons, `.cursos__favorito` + `data-slug` for the favourite button (already wired globally by `initFavoritosCursos()` in `main.js` — no changes needed to that function), the `grid-template-rows: 0fr/1fr` accordion pattern used by `.faq__item` / `.estatuto__capitulo`.
- The 8 course slugs (fixed, must match `cursos.html` exactly): `enfermagem-perioperatoria-avancada`, `fundamentos-enfermagem-bloco-operatorio`, `seguranca-doente-sala-operatoria`, `prevencao-eventos-adversos-cirurgicos`, `instrumentacao-cirurgica-essencial`, `workshop-instrumentacao-avancada`, `gestao-equipas-bloco-operatorio`, `lideranca-comunicacao-enfermagem-perioperatoria`.

---

## File Structure

- **Create** `public/assets/js/cursos-dados.js` — `CURSOS_DADOS` object, one entry per slug (Tasks 1–2).
- **Create** `public/curso-detalhe.html` — page shell: topbar/header/footer copied from `noticia.html`, breadcrumb, hero, not-found state, and empty containers for every section that `initPaginaCurso()` will fill in (Task 3).
- **Modify** `public/assets/js/main.js` — add `initPaginaCurso()`, `initAcordeaoProgramaCurso()`, `initSobreCursoExpandir()`; register all three (plus reuse of existing `initFavoritosCursos()`) in the `DOMContentLoaded` listener (Tasks 4, 7, 8).
- **Modify** `public/assets/css/sections.css` — append one new block, `/* ===== Página Curso — Detalhe ===== */`, with all `.curso-*` rules (Tasks 3–11).
- **Modify** `public/cursos.html` — the 8 `<a class="cursos__cartao-cta" href="#">Ver Curso</a>` become `href="curso-detalhe.html?slug=<slug>"` (Task 12).

---

### Task 1: `cursos-dados.js` — schema + first course (`enfermagem-perioperatoria-avancada`)

**Files:**
- Create: `public/assets/js/cursos-dados.js`

**Interfaces:**
- Produces: global `const CURSOS_DADOS` (object keyed by slug). Every later task that reads course data uses `CURSOS_DADOS[slug]` with the fields shown below — this task locks the exact field names.

- [ ] **Step 1: Create the file with the schema comment and the first course**

```js
/*
 * AESOA — Dados dos cursos para a página de detalhe (curso-detalhe.html?slug=...)
 * Carregado apenas em curso-detalhe.html, antes de main.js.
 */

const CURSOS_DADOS = {
  "enfermagem-perioperatoria-avancada": {
    categoria: "Enfermagem Perioperatória",
    categoriaSlug: "perioperatoria",
    titulo: "Enfermagem Perioperatória Avançada",
    subtitulo:
      "Aprofunde competências técnicas e de liderança para actuar com autonomia em cirurgias complexas, da preparação à alta do doente.",
    selo: "Mais Procurado",
    nivel: "Avançado",
    modalidade: "Presencial",
    duracao: "6 semanas · 40h",
    dataInicio: "14 de Setembro de 2026",
    local: "Sede AESOA, Luanda",
    imagem: "assets/multimidia/galeria/otimizado/foto-equipa-cirurgica.jpg",
    imagemAlt: "Equipa de enfermagem em sala operatória durante o curso de Enfermagem Perioperatória Avançada",
    precoReal: 55000,
    precoSocio: 0,
    descontoSelo: null,
    avaliacaoMedia: 4.9,
    totalAvaliacoes: 86,
    distribuicaoEstrelas: [70, 20, 7, 2, 1],
    descricao: [
      "O Curso de Enfermagem Perioperatória Avançada foi concebido para enfermeiros que já dominam os fundamentos da sala operatória e querem dar o próximo passo: actuar com autonomia em cirurgias de maior complexidade, da preparação do doente à sua recuperação inicial.",
      "Ao longo de seis semanas, o programa combina sessões teóricas com prática orientada e simulação de cenários reais, permitindo consolidar conhecimento técnico avançado e desenvolver a capacidade de resposta rápida perante complicações intraoperatórias.",
      "O curso dá também particular atenção ao trabalho em equipa cirúrgica, preparando os formandos para comunicar com eficácia sob pressão e para, no futuro, assumir papéis de maior responsabilidade dentro do bloco operatório.",
    ],
    oQueVaiAprender: [
      "Cuidados Perioperatórios Avançados: aplicação de protocolos avançados de cuidado ao doente antes, durante e depois da cirurgia.",
      "Gestão de Complicações Intraoperatórias: identificação precoce e resposta eficaz a complicações durante o acto cirúrgico.",
      "Trabalho em Equipa Cirúrgica: coordenação eficaz com cirurgiões, anestesistas e restante equipa da sala operatória.",
      "Comunicação Sob Pressão: técnicas de comunicação clara e assertiva em momentos críticos da cirurgia.",
      "Protocolos de Recuperação Pós-Operatória: acompanhamento do doente na fase imediata após a cirurgia, com foco na prevenção de complicações.",
      "Preparação para Funções de Coordenação: bases para assumir, no futuro, papéis de maior responsabilidade dentro da equipa cirúrgica.",
    ],
    requisitos: [
      "Registo activo como enfermeiro(a) em Angola.",
      "Experiência mínima de 2 anos em sala operatória.",
      "Recomendado: conclusão prévia do curso \"Fundamentos da Enfermagem no Bloco Operatório\" ou experiência equivalente.",
    ],
    publicoAlvo: [
      "Enfermeiros perioperatórios com experiência que querem assumir maior autonomia clínica.",
      "Profissionais a preparar-se para funções de coordenação em bloco operatório.",
      "Enfermeiros que pretendem actualizar-se face a protocolos cirúrgicos mais recentes.",
    ],
    programa: [
      {
        titulo: "Módulo 1 — Fundamentos Avançados de Cuidados Perioperatórios",
        duracao: "10h",
        licoes: [
          { titulo: "Reavaliação do doente cirúrgico de alto risco", duracao: "2h", tipo: "aula" },
          { titulo: "Protocolos avançados de preparação pré-operatória", duracao: "2h", tipo: "aula" },
          { titulo: "Prática orientada: preparação de doente cirúrgico complexo", duracao: "5h", tipo: "pratica" },
          { titulo: "Avaliação do módulo", duracao: "1h", tipo: "avaliacao" },
        ],
      },
      {
        titulo: "Módulo 2 — Gestão de Complicações Intraoperatórias",
        duracao: "10h",
        licoes: [
          { titulo: "Identificação precoce de complicações intraoperatórias", duracao: "2h", tipo: "aula" },
          { titulo: "Resposta a emergências na sala operatória", duracao: "2h", tipo: "aula" },
          { titulo: "Simulação prática de cenários de complicação", duracao: "5h", tipo: "pratica" },
          { titulo: "Avaliação do módulo", duracao: "1h", tipo: "avaliacao" },
        ],
      },
      {
        titulo: "Módulo 3 — Trabalho em Equipa Cirúrgica",
        duracao: "10h",
        licoes: [
          { titulo: "Comunicação eficaz com a equipa cirúrgica", duracao: "2h", tipo: "aula" },
          { titulo: "Coordenação de papéis em cirurgias complexas", duracao: "2h", tipo: "aula" },
          { titulo: "Estudo de caso: gestão de equipa em cirurgia de grande porte", duracao: "5h", tipo: "pratica" },
          { titulo: "Avaliação do módulo", duracao: "1h", tipo: "avaliacao" },
        ],
      },
      {
        titulo: "Módulo 4 — Avaliação Final e Certificação",
        duracao: "10h",
        licoes: [
          { titulo: "Revisão integrada de competências avançadas", duracao: "2h", tipo: "aula" },
          { titulo: "Simulação final supervisionada", duracao: "6h", tipo: "pratica" },
          { titulo: "Avaliação final e entrega de certificados", duracao: "2h", tipo: "avaliacao" },
        ],
      },
    ],
    certificadoTexto:
      "Certificado de participação emitido pela AESOA, reconhecido pelas instituições de saúde parceiras da associação.",
    formador: {
      nome: "Enf.º Chefe António Sacadura",
      credenciais: "Enfermeiro Especialista em Enfermagem Perioperatória · Chefe de Equipa no Hospital Geral de Luanda",
      bio: "Com mais de 15 anos de experiência em salas operatórias de referência em Angola, o Enf.º Chefe António Sacadura lidera equipas de enfermagem perioperatória e é formador regular da AESOA em temas de cuidados avançados e liderança clínica.",
      nCursos: 3,
      nFormandos: 210,
      avaliacaoMedia: 4.9,
    },
    reviews: [
      {
        nome: "Enf.ª Cristina Bumba",
        cargo: "Enfermeira Perioperatória, Hospital Josina Machel",
        avaliacao: 5,
        data: "Julho de 2026",
        texto: "Curso muito completo. Senti a diferença na forma como reajo a complicações durante a cirurgia logo nas primeiras semanas depois de terminar.",
      },
      {
        nome: "Enf.º Job Sassuange",
        cargo: "Enfermeiro de Bloco Operatório, Clínica Sagrada Esperança",
        avaliacao: 5,
        data: "Junho de 2026",
        texto: "O equilíbrio entre teoria e prática foi excelente. O módulo de simulação de complicações foi o que mais me marcou.",
      },
      {
        nome: "Enf.ª Domingas Capingala",
        cargo: "Enfermeira Perioperatória, Hospital Provincial do Huambo",
        avaliacao: 4,
        data: "Maio de 2026",
        texto: "Formação exigente mas muito bem estruturada. Gostaria apenas de mais tempo prático no módulo de trabalho em equipa.",
      },
    ],
    vagasLimitadas: false,
  },
};
```

- [ ] **Step 2: Verify the file is valid JavaScript**

Run: `node --check "public/assets/js/cursos-dados.js"`
Expected: no output, exit code 0.

- [ ] **Step 3: Verify the object structure loads correctly**

Run:
```bash
node -e "
$(cat 'public/assets/js/cursos-dados.js')
const c = CURSOS_DADOS['enfermagem-perioperatoria-avancada'];
console.log(Object.keys(CURSOS_DADOS).length, 'curso(s)');
console.log(c.titulo, '-', c.programa.length, 'módulos -', c.reviews.length, 'reviews');
console.log('soma horas programa:', c.programa.reduce((h, m) => h + parseInt(m.duracao), 0));
"
```
Expected: `1 curso(s)`, `Enfermagem Perioperatória Avançada - 4 módulos - 3 reviews`, `soma horas programa: 40`.

- [ ] **Step 4: Commit**

```bash
git add public/assets/js/cursos-dados.js
git commit -m "feat: add cursos-dados.js with schema and first course"
```

---

### Task 2: `cursos-dados.js` — remaining 7 courses

**Files:**
- Modify: `public/assets/js/cursos-dados.js`

**Interfaces:**
- Consumes: the `CURSOS_DADOS = { ... }` object literal opened in Task 1.
- Produces: `CURSOS_DADOS` with all 8 slugs populated, same field shape as Task 1.

- [ ] **Step 1: Insert the remaining 7 course entries**

Add each object below as a new top-level key inside `CURSOS_DADOS`, right after the `"enfermagem-perioperatoria-avancada"` entry (before the closing `};` of the object).

```js
  "fundamentos-enfermagem-bloco-operatorio": {
    categoria: "Enfermagem Perioperatória",
    categoriaSlug: "perioperatoria",
    titulo: "Fundamentos da Enfermagem no Bloco Operatório",
    subtitulo:
      "Uma base sólida para quem está a iniciar a carreira em enfermagem perioperatória, dos fluxos do bloco à instrumentação básica.",
    selo: null,
    nivel: "Básico",
    modalidade: "Presencial",
    duracao: "3 dias · 24h",
    dataInicio: "5 de Outubro de 2026",
    local: "Sede AESOA, Luanda",
    imagem: "assets/multimidia/galeria/otimizado/foto-preparacao.jpg",
    imagemAlt: "Enfermeira em preparação para cirurgia durante curso de fundamentos de enfermagem perioperatória",
    precoReal: 30000,
    precoSocio: 0,
    descontoSelo: null,
    avaliacaoMedia: 4.7,
    totalAvaliacoes: 54,
    distribuicaoEstrelas: [55, 30, 10, 4, 1],
    descricao: [
      "O Curso de Fundamentos da Enfermagem no Bloco Operatório foi pensado para enfermeiros que estão a dar os primeiros passos na sala operatória e precisam de uma base sólida antes de avançar para funções mais especializadas.",
      "Em três dias intensivos, os formandos são introduzidos à organização do bloco operatório, aos fluxos de trabalho entre as diferentes áreas e aos princípios essenciais de assepsia e antissepsia que sustentam toda a prática perioperatória.",
      "O curso combina exposição teórica com demonstrações práticas, garantindo que cada formando termina com confiança suficiente para integrar uma equipa de sala operatória em segurança.",
    ],
    oQueVaiAprender: [
      "Fundamentos da Sala Operatória: compreensão da organização, fluxos e papéis dentro do bloco operatório.",
      "Técnicas de Assepsia e Antissepsia: princípios essenciais de esterilização e prevenção de infeções cirúrgicas.",
      "Preparação do Doente Cirúrgico: passos fundamentais na preparação física e emocional do doente para a cirurgia.",
      "Circulação e Instrumentação Básica: introdução aos papéis de enfermeiro circulante e instrumentista.",
      "Normas de Vestuário e Higiene Cirúrgica: regras de fardamento, lavagem cirúrgica e circulação dentro das áreas restritas.",
      "Documentação Perioperatória: registo correcto dos cuidados prestados antes, durante e depois da cirurgia.",
    ],
    requisitos: [
      "Registo activo como enfermeiro(a) ou estudante finalista de Enfermagem.",
      "Não é exigida experiência prévia em sala operatória.",
      "Disponibilidade para as três sessões presenciais consecutivas.",
    ],
    publicoAlvo: [
      "Enfermeiros recém-formados que querem iniciar carreira em enfermagem perioperatória.",
      "Enfermeiros de outras áreas em processo de transição para o bloco operatório.",
      "Estudantes finalistas de Enfermagem interessados na especialidade.",
    ],
    programa: [
      {
        titulo: "Módulo 1 — Organização e Fluxos do Bloco Operatório",
        duracao: "8h",
        licoes: [
          { titulo: "Estrutura física e áreas do bloco operatório", duracao: "2h", tipo: "aula" },
          { titulo: "Papéis da equipa cirúrgica", duracao: "2h", tipo: "aula" },
          { titulo: "Normas de vestuário e higiene cirúrgica", duracao: "3h", tipo: "pratica" },
          { titulo: "Avaliação do módulo", duracao: "1h", tipo: "avaliacao" },
        ],
      },
      {
        titulo: "Módulo 2 — Assepsia, Antissepsia e Preparação do Doente",
        duracao: "8h",
        licoes: [
          { titulo: "Princípios de esterilização e controlo de infeção", duracao: "2h", tipo: "aula" },
          { titulo: "Preparação física e emocional do doente cirúrgico", duracao: "2h", tipo: "aula" },
          { titulo: "Prática de técnica asséptica", duracao: "3h", tipo: "pratica" },
          { titulo: "Avaliação do módulo", duracao: "1h", tipo: "avaliacao" },
        ],
      },
      {
        titulo: "Módulo 3 — Circulação, Instrumentação e Documentação",
        duracao: "8h",
        licoes: [
          { titulo: "Papel do enfermeiro circulante e instrumentista", duracao: "2h", tipo: "aula" },
          { titulo: "Introdução à instrumentação básica", duracao: "3h", tipo: "pratica" },
          { titulo: "Registo e documentação perioperatória", duracao: "2h", tipo: "aula" },
          { titulo: "Avaliação final", duracao: "1h", tipo: "avaliacao" },
        ],
      },
    ],
    certificadoTexto: "Certificado de participação emitido pela AESOA, válido como formação de base em enfermagem perioperatória.",
    formador: {
      nome: "Enf.ª Ana Kiala",
      credenciais: "Enfermeira Perioperatória · Formadora de base na AESOA",
      bio: "A Enf.ª Ana Kiala dedica-se há mais de 8 anos à formação de enfermeiros que iniciam carreira em sala operatória, com particular atenção à construção de bases técnicas sólidas e seguras.",
      nCursos: 5,
      nFormandos: 180,
      avaliacaoMedia: 4.7,
    },
    reviews: [
      { nome: "Enf.º Miguel Tavares", cargo: "Enfermeiro recém-formado, Hospital Américo Boavida", avaliacao: 5, data: "Julho de 2026", texto: "Entrei sem nunca ter pisado uma sala operatória e saí a perceber exactamente como tudo funciona. Explicação muito clara." },
      { nome: "Enf.ª Suzete Mbala", cargo: "Enfermeira em transição para o bloco operatório", avaliacao: 5, data: "Junho de 2026", texto: "Recomendo a quem está a começar. A parte prática de técnica asséptica foi particularmente útil." },
      { nome: "Enf.º Alberto Neto", cargo: "Estudante finalista de Enfermagem", avaliacao: 4, data: "Maio de 2026", texto: "Muito bom curso introdutório. Só gostaria de mais um dia dedicado só à instrumentação." },
    ],
    vagasLimitadas: false,
  },

  "seguranca-doente-sala-operatoria": {
    categoria: "Segurança do Doente",
    categoriaSlug: "seguranca",
    titulo: "Segurança do Doente na Sala Operatória",
    subtitulo: "Um programa focado em reduzir riscos e prevenir erros evitáveis durante todas as fases do acto cirúrgico.",
    selo: null,
    nivel: "Todos os Níveis",
    modalidade: "Online",
    duracao: "5 semanas · 20h",
    dataInicio: "1 de Setembro de 2026 (turmas mensais)",
    local: null,
    imagem: "assets/multimidia/galeria/otimizado/foto-mascara.jpg",
    imagemAlt: "Enfermeiro com máscara cirúrgica durante formação em segurança do doente",
    precoReal: 40000,
    precoSocio: 22000,
    descontoSelo: "-45%",
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 41,
    distribuicaoEstrelas: [65, 25, 7, 2, 1],
    descricao: [
      "O Curso de Segurança do Doente na Sala Operatória aborda um dos temas mais críticos da enfermagem perioperatória: a prevenção de erros evitáveis em cada fase do acto cirúrgico.",
      "Ao longo de cinco semanas, em formato 100% online e com turmas mensais, os formandos exploram a cultura de segurança, o checklist cirúrgico da OMS e as principais causas de eventos adversos evitáveis, com casos práticos discutidos em cada sessão.",
      "É um curso transversal, adequado a enfermeiros de qualquer nível de experiência que queiram reforçar a segurança do doente na sua prática diária.",
    ],
    oQueVaiAprender: [
      "Cultura de Segurança do Doente: princípios que sustentam uma cultura organizacional orientada para a segurança.",
      "Checklist Cirúrgico da OMS: aplicação correta do checklist de segurança cirúrgica em todas as fases da cirurgia.",
      "Prevenção de Erros Cirúrgicos: identificação de riscos comuns e estratégias práticas para os eliminar.",
      "Comunicação Estruturada em Equipa: uso de protocolos de comunicação para reduzir falhas de informação.",
      "Gestão de Incidentes de Segurança: como reportar e aprender com quase-erros e eventos adversos.",
      "Indicadores de Segurança Cirúrgica: introdução a métricas usadas para monitorizar a segurança do doente.",
    ],
    requisitos: [
      "Registo activo como enfermeiro(a).",
      "Acesso a computador ou smartphone com ligação à internet.",
      "Não é necessária experiência prévia específica em segurança do doente.",
    ],
    publicoAlvo: [
      "Enfermeiros de qualquer nível que queiram reforçar práticas de segurança.",
      "Responsáveis por qualidade e segurança em unidades cirúrgicas.",
      "Enfermeiros que preparam certificação ou auditoria de serviço.",
    ],
    programa: [
      {
        titulo: "Módulo 1 — Cultura de Segurança do Doente",
        duracao: "5h",
        licoes: [
          { titulo: "Fundamentos da cultura de segurança", duracao: "2h", tipo: "aula" },
          { titulo: "Discussão de casos reais", duracao: "2h", tipo: "pratica" },
          { titulo: "Avaliação do módulo", duracao: "1h", tipo: "avaliacao" },
        ],
      },
      {
        titulo: "Módulo 2 — Checklist Cirúrgico da OMS",
        duracao: "5h",
        licoes: [
          { titulo: "As três fases do checklist cirúrgico", duracao: "2h", tipo: "aula" },
          { titulo: "Aplicação prática do checklist em simulação", duracao: "2h", tipo: "pratica" },
          { titulo: "Avaliação do módulo", duracao: "1h", tipo: "avaliacao" },
        ],
      },
      {
        titulo: "Módulo 3 — Prevenção de Erros e Comunicação em Equipa",
        duracao: "5h",
        licoes: [
          { titulo: "Causas comuns de erros cirúrgicos", duracao: "2h", tipo: "aula" },
          { titulo: "Protocolos de comunicação estruturada", duracao: "2h", tipo: "pratica" },
          { titulo: "Avaliação do módulo", duracao: "1h", tipo: "avaliacao" },
        ],
      },
      {
        titulo: "Módulo 4 — Gestão de Incidentes e Indicadores",
        duracao: "5h",
        licoes: [
          { titulo: "Reporte e aprendizagem com incidentes", duracao: "2h", tipo: "aula" },
          { titulo: "Indicadores de segurança cirúrgica", duracao: "2h", tipo: "aula" },
          { titulo: "Avaliação final", duracao: "1h", tipo: "avaliacao" },
        ],
      },
    ],
    certificadoTexto: "Certificado de participação emitido pela AESOA, com validade para efeitos de formação contínua.",
    formador: {
      nome: "Dr. Manuel Domingos",
      credenciais: "Médico especialista em Segurança do Doente · Consultor da AESOA",
      bio: "O Dr. Manuel Domingos tem trabalhado de perto com equipas cirúrgicas angolanas na implementação de práticas de segurança do doente, sendo um dos formadores mais procurados da AESOA nesta área.",
      nCursos: 2,
      nFormandos: 95,
      avaliacaoMedia: 4.8,
    },
    reviews: [
      { nome: "Enf.ª Isabel Muteka", cargo: "Enfermeira de bloco operatório, Clínica Girassol", avaliacao: 5, data: "Julho de 2026", texto: "Curso muito bem estruturado, mesmo sendo online. O checklist da OMS ficou muito mais claro depois desta formação." },
      { nome: "Enf.º Paulo Sumbo", cargo: "Responsável de qualidade, Hospital Provincial de Malanje", avaliacao: 5, data: "Junho de 2026", texto: "Uso o que aprendi aqui todas as semanas no meu serviço. Recomendo a qualquer equipa cirúrgica." },
      { nome: "Enf.ª Rosa Chindondo", cargo: "Enfermeira perioperatória", avaliacao: 4, data: "Maio de 2026", texto: "Muito conteúdo relevante. Gostaria de ter mais tempo de discussão de casos em grupo." },
    ],
    vagasLimitadas: false,
  },

  "prevencao-eventos-adversos-cirurgicos": {
    categoria: "Segurança do Doente",
    categoriaSlug: "seguranca",
    titulo: "Prevenção de Eventos Adversos Cirúrgicos",
    subtitulo: "Ferramentas práticas para identificar, analisar e prevenir eventos adversos no ambiente cirúrgico.",
    selo: null,
    nivel: "Básico",
    modalidade: "Híbrido",
    duracao: "4 semanas · 16h",
    dataInicio: "21 de Setembro de 2026",
    local: "Sede AESOA, Luanda (sessões presenciais) + online",
    imagem: "assets/multimidia/galeria/otimizado/foto-centro-cirurgico.jpg",
    imagemAlt: "Centro cirúrgico durante formação em prevenção de eventos adversos",
    precoReal: 35000,
    precoSocio: 0,
    descontoSelo: null,
    avaliacaoMedia: 4.6,
    totalAvaliacoes: 29,
    distribuicaoEstrelas: [55, 28, 12, 4, 1],
    descricao: [
      "O Curso de Prevenção de Eventos Adversos Cirúrgicos dá continuidade ao trabalho da AESOA na área da segurança do doente, com foco específico na identificação e análise de eventos adversos dentro do bloco operatório.",
      "Num formato híbrido, com sessões presenciais na sede da AESOA e conteúdo complementar online, os formandos aprendem a reconhecer sinais precoces de eventos adversos e a aplicar métodos de análise de causa-raiz para evitar a sua repetição.",
      "O curso termina com a elaboração de um plano de ação corretiva simples, aplicável à realidade do serviço de cada formando.",
    ],
    oQueVaiAprender: [
      "Identificação de Eventos Adversos: reconhecimento precoce de sinais de eventos adversos cirúrgicos.",
      "Análise de Causa-Raiz: métodos para investigar e compreender a origem de incidentes cirúrgicos.",
      "Planos de Ação Corretiva: elaboração de planos práticos para prevenir a repetição de eventos adversos.",
      "Cultura de Reporte Não Punitiva: como incentivar o reporte honesto de incidentes dentro da equipa.",
      "Análise de Casos Reais: estudo de casos anonimizados de eventos adversos em contexto cirúrgico.",
      "Comunicação de Incidentes: boas práticas na comunicação de eventos adversos ao doente e à família.",
    ],
    requisitos: [
      "Registo activo como enfermeiro(a) ou profissional de saúde na área cirúrgica.",
      "Experiência mínima de 1 ano em ambiente hospitalar.",
      "Disponibilidade para as sessões presenciais na sede da AESOA.",
    ],
    publicoAlvo: [
      "Enfermeiros perioperatórios responsáveis por segurança dentro da equipa.",
      "Profissionais envolvidos em auditorias e comissões de qualidade.",
      "Enfermeiros que já concluíram o curso de Segurança do Doente na Sala Operatória.",
    ],
    programa: [
      {
        titulo: "Módulo 1 — Identificação de Eventos Adversos",
        duracao: "4h",
        licoes: [
          { titulo: "Tipos e gravidade de eventos adversos cirúrgicos", duracao: "2h", tipo: "aula" },
          { titulo: "Sinais precoces de alerta", duracao: "2h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 2 — Análise de Causa-Raiz",
        duracao: "4h",
        licoes: [
          { titulo: "Métodos de análise de causa-raiz", duracao: "2h", tipo: "aula" },
          { titulo: "Aplicação a casos reais anonimizados", duracao: "2h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 3 — Cultura de Reporte e Comunicação",
        duracao: "4h",
        licoes: [
          { titulo: "Cultura de reporte não punitiva", duracao: "2h", tipo: "aula" },
          { titulo: "Comunicação de incidentes ao doente e família", duracao: "2h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 4 — Planos de Ação Corretiva",
        duracao: "4h",
        licoes: [
          { titulo: "Elaboração de planos de ação corretiva", duracao: "2h", tipo: "aula" },
          { titulo: "Avaliação final e apresentação de planos", duracao: "2h", tipo: "avaliacao" },
        ],
      },
    ],
    certificadoTexto: "Certificado de participação emitido pela AESOA, reconhecido como formação avançada em segurança do doente.",
    formador: {
      nome: "Enf.ª Chefe Beatriz Neto",
      credenciais: "Enfermeira Chefe de Bloco Operatório · Especialista em Gestão de Risco Cirúrgico",
      bio: "A Enf.ª Chefe Beatriz Neto lidera processos de melhoria contínua em blocos operatórios angolanos há mais de 10 anos, com foco na análise e prevenção de eventos adversos cirúrgicos.",
      nCursos: 2,
      nFormandos: 70,
      avaliacaoMedia: 4.7,
    },
    reviews: [
      { nome: "Enf.º Domingos Kiluanje", cargo: "Enfermeiro de bloco operatório, Hospital Geral de Luanda", avaliacao: 5, data: "Junho de 2026", texto: "Curso muito prático. A análise de causa-raiz mudou a forma como olho para os incidentes no meu serviço." },
      { nome: "Enf.ª Marta Sozinho", cargo: "Membro de comissão de qualidade hospitalar", avaliacao: 4, data: "Maio de 2026", texto: "Muito útil para quem trabalha com auditorias. Gostaria de mais exemplos de planos de ação já implementados." },
      { nome: "Enf.º Ricardo Bento", cargo: "Enfermeiro perioperatório", avaliacao: 5, data: "Abril de 2026", texto: "As sessões presenciais fizeram toda a diferença na discussão de casos reais." },
    ],
    vagasLimitadas: false,
  },

  "instrumentacao-cirurgica-essencial": {
    categoria: "Instrumentação Cirúrgica",
    categoriaSlug: "instrumentacao",
    titulo: "Instrumentação Cirúrgica Essencial",
    subtitulo: "Domine o reconhecimento, montagem e cuidado dos instrumentos cirúrgicos mais usados em cirurgia geral.",
    selo: "Últimas Vagas",
    nivel: "Básico",
    modalidade: "Presencial",
    duracao: "2 semanas · 16h",
    dataInicio: "12 de Outubro de 2026",
    local: "Sede AESOA, Luanda",
    imagem: "assets/img/site/instrumentais.jpg",
    imagemAlt: "Instrumentos cirúrgicos organizados durante curso de instrumentação cirúrgica essencial",
    precoReal: 28000,
    precoSocio: 0,
    descontoSelo: null,
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 63,
    distribuicaoEstrelas: [68, 22, 7, 2, 1],
    descricao: [
      "O Curso de Instrumentação Cirúrgica Essencial responde a uma das maiores procuras dos enfermeiros perioperatórios: dominar com confiança o instrumental usado nas cirurgias mais comuns.",
      "Em duas semanas intensivas e presenciais, os formandos aprendem a reconhecer, organizar e cuidar dos principais instrumentos cirúrgicos, com prática directa em montagem de mesas de instrumentos por tipo de intervenção.",
      "Com vagas limitadas para garantir acompanhamento próximo, este é um dos cursos mais procurados da AESOA e enche rapidamente em cada edição.",
    ],
    oQueVaiAprender: [
      "Reconhecimento de Instrumentos: identificação dos principais instrumentos usados em cirurgia geral.",
      "Montagem de Mesas Cirúrgicas: organização correta das mesas de instrumentos por tipo de cirurgia.",
      "Cuidados com Material Cirúrgico: boas práticas de limpeza, acondicionamento e esterilização de instrumentos.",
      "Contagem de Instrumentos e Compressas: procedimentos de contagem para prevenir esquecimento de material.",
      "Manuseamento Seguro de Instrumental Cortante: técnicas de passagem e manuseamento seguro em campo cirúrgico.",
      "Organização de Kits por Especialidade: preparação de kits de instrumentos para diferentes tipos de cirurgia geral.",
    ],
    requisitos: [
      "Registo activo como enfermeiro(a) com experiência em sala operatória.",
      "Recomendado ter concluído o curso de Fundamentos da Enfermagem no Bloco Operatório.",
      "Disponibilidade para as duas semanas presenciais consecutivas.",
    ],
    publicoAlvo: [
      "Enfermeiros que já actuam na sala operatória e querem especializar-se em instrumentação.",
      "Enfermeiros circulantes que pretendem transitar para funções de instrumentista.",
      "Equipas que precisam de uniformizar critérios de montagem de mesas cirúrgicas.",
    ],
    programa: [
      {
        titulo: "Módulo 1 — Reconhecimento de Instrumentos Cirúrgicos",
        duracao: "4h",
        licoes: [
          { titulo: "Categorias de instrumentos em cirurgia geral", duracao: "2h", tipo: "aula" },
          { titulo: "Prática de identificação de instrumentos", duracao: "2h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 2 — Montagem de Mesas Cirúrgicas",
        duracao: "4h",
        licoes: [
          { titulo: "Organização de mesas por tipo de cirurgia", duracao: "1h30", tipo: "aula" },
          { titulo: "Prática de montagem de mesa cirúrgica", duracao: "2h30", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 3 — Contagem e Manuseamento Seguro",
        duracao: "4h",
        licoes: [
          { titulo: "Procedimentos de contagem de instrumentos e compressas", duracao: "1h30", tipo: "aula" },
          { titulo: "Manuseamento seguro de instrumental cortante", duracao: "2h30", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 4 — Cuidados, Kits e Avaliação Final",
        duracao: "4h",
        licoes: [
          { titulo: "Limpeza, acondicionamento e esterilização", duracao: "1h", tipo: "aula" },
          { titulo: "Organização de kits por especialidade", duracao: "1h30", tipo: "pratica" },
          { titulo: "Avaliação final prática", duracao: "1h30", tipo: "avaliacao" },
        ],
      },
    ],
    certificadoTexto: "Certificado de participação emitido pela AESOA, com destaque para competências práticas de instrumentação.",
    formador: {
      nome: "Enf.º João Mavinga",
      credenciais: "Enfermeiro Instrumentista Sénior · Formador de instrumentação cirúrgica da AESOA",
      bio: "Com mais de 12 anos como instrumentista em cirurgia geral, o Enf.º João Mavinga é um dos formadores mais requisitados da AESOA, conhecido pela abordagem prática e directa das suas sessões.",
      nCursos: 4,
      nFormandos: 260,
      avaliacaoMedia: 4.8,
    },
    reviews: [
      { nome: "Enf.ª Fátima Neto", cargo: "Enfermeira circulante, Hospital Josina Machel", avaliacao: 5, data: "Julho de 2026", texto: "Finalmente consigo montar uma mesa de instrumentos sem hesitar. Curso muito prático e bem ritmado." },
      { nome: "Enf.º Carlos Bumba", cargo: "Enfermeiro de bloco operatório", avaliacao: 5, data: "Junho de 2026", texto: "As duas semanas passaram rápido de tanta prática. Recomendo vivamente, mas inscrevam-se cedo, esgota sempre." },
      { nome: "Enf.ª Teresa Muginga", cargo: "Enfermeira perioperatória, Clínica Sagrada Esperança", avaliacao: 4, data: "Maio de 2026", texto: "Muito bom curso. Só senti falta de mais tempo dedicado a instrumentos de especialidades específicas." },
    ],
    vagasLimitadas: true,
  },

  "workshop-instrumentacao-avancada": {
    categoria: "Instrumentação Cirúrgica",
    categoriaSlug: "instrumentacao",
    titulo: "Workshop de Instrumentação Avançada",
    subtitulo: "Um workshop intensivo para enfermeiros experientes que querem dominar instrumentação em cirurgias de maior complexidade.",
    selo: null,
    nivel: "Avançado",
    modalidade: "Presencial",
    duracao: "1 semana · 30h",
    dataInicio: "9 de Novembro de 2026",
    local: "Sede AESOA, Luanda",
    imagem: "assets/img/site/Workshopinstrumentacao.jpg",
    imagemAlt: "Workshop de instrumentação cirúrgica avançada em Benguela",
    precoReal: 65000,
    precoSocio: 38000,
    descontoSelo: "-42%",
    avaliacaoMedia: 4.9,
    totalAvaliacoes: 22,
    distribuicaoEstrelas: [75, 18, 5, 2, 0],
    descricao: [
      "O Workshop de Instrumentação Avançada é o passo seguinte para enfermeiros que já dominam a instrumentação essencial e querem enfrentar cirurgias de maior complexidade técnica.",
      "Numa semana intensiva e totalmente presencial, o workshop foca-se em instrumentação para especialidades cirúrgicas avançadas e no manuseamento de tecnologia laparoscópica, com muito tempo dedicado à prática em pequenos grupos.",
      "É um workshop exigente, pensado para quem já tem experiência sólida em sala operatória e quer diferenciar-se tecnicamente dentro da sua equipa.",
    ],
    oQueVaiAprender: [
      "Instrumentação em Cirurgias Complexas: domínio de instrumentos específicos para especialidades cirúrgicas avançadas.",
      "Gestão de Novas Tecnologias: utilização de equipamento cirúrgico avançado e tecnologia laparoscópica.",
      "Resolução de Imprevistos: estratégias práticas para lidar com falhas técnicas durante a cirurgia.",
      "Instrumentação Laparoscópica: reconhecimento e manuseamento de instrumental específico de cirurgia minimamente invasiva.",
      "Optimização do Tempo Cirúrgico: organização do instrumental para reduzir tempos mortos durante a cirurgia.",
      "Mentoria de Equipas Juniores: introdução a técnicas de acompanhamento de instrumentistas menos experientes.",
    ],
    requisitos: [
      "Conclusão prévia do curso de Instrumentação Cirúrgica Essencial ou experiência equivalente comprovada.",
      "Experiência mínima de 3 anos em sala operatória.",
      "Disponibilidade para a semana presencial intensiva.",
    ],
    publicoAlvo: [
      "Enfermeiros instrumentistas experientes que querem especializar-se em cirurgias complexas.",
      "Enfermeiros que trabalham ou vão trabalhar com tecnologia laparoscópica.",
      "Profissionais que pretendem, no futuro, orientar instrumentistas juniores.",
    ],
    programa: [
      {
        titulo: "Módulo 1 — Instrumentação em Especialidades Avançadas",
        duracao: "6h",
        licoes: [
          { titulo: "Instrumental de especialidades cirúrgicas avançadas", duracao: "2h", tipo: "aula" },
          { titulo: "Prática de reconhecimento e organização", duracao: "4h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 2 — Tecnologia Laparoscópica",
        duracao: "6h",
        licoes: [
          { titulo: "Fundamentos da cirurgia minimamente invasiva", duracao: "2h", tipo: "aula" },
          { titulo: "Manuseamento de instrumental laparoscópico", duracao: "4h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 3 — Gestão de Novas Tecnologias",
        duracao: "6h",
        licoes: [
          { titulo: "Equipamento cirúrgico avançado", duracao: "2h", tipo: "aula" },
          { titulo: "Prática com equipamento em simulação", duracao: "4h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 4 — Resolução de Imprevistos e Optimização",
        duracao: "6h",
        licoes: [
          { titulo: "Estratégias para falhas técnicas durante a cirurgia", duracao: "2h", tipo: "aula" },
          { titulo: "Simulação de cenários de imprevisto", duracao: "4h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 5 — Mentoria e Avaliação Final",
        duracao: "6h",
        licoes: [
          { titulo: "Introdução à mentoria de equipas juniores", duracao: "2h", tipo: "aula" },
          { titulo: "Avaliação final prática", duracao: "4h", tipo: "avaliacao" },
        ],
      },
    ],
    certificadoTexto: "Certificado de participação emitido pela AESOA, com menção a competências avançadas em instrumentação cirúrgica.",
    formador: {
      nome: "Enf.ª Chefe Beatriz Neto",
      credenciais: "Enfermeira Chefe de Bloco Operatório · Especialista em Instrumentação Avançada",
      bio: "Além da sua experiência em gestão de risco cirúrgico, a Enf.ª Chefe Beatriz Neto acumula mais de 10 anos de prática directa em instrumentação para cirurgias de alta complexidade, incluindo cirurgia laparoscópica.",
      nCursos: 2,
      nFormandos: 70,
      avaliacaoMedia: 4.9,
    },
    reviews: [
      { nome: "Enf.º Sérgio Wanga", cargo: "Enfermeiro instrumentista sénior, Hospital Militar Central", avaliacao: 5, data: "Junho de 2026", texto: "O workshop mais exigente que já fiz na AESOA, mas também o mais recompensador. Aprendi muito sobre instrumental laparoscópico." },
      { nome: "Enf.ª Helena Vunge", cargo: "Enfermeira de bloco operatório, Clínica Multiperfil", avaliacao: 5, data: "Maio de 2026", texto: "Grupo pequeno, muito acompanhamento individual. Exactamente o que precisava depois de anos de experiência." },
      { nome: "Enf.º Nelson Capemba", cargo: "Enfermeiro instrumentista", avaliacao: 4, data: "Abril de 2026", texto: "Excelente conteúdo técnico. O ritmo é intenso, é preciso chegar já com boa base." },
    ],
    vagasLimitadas: false,
  },

  "gestao-equipas-bloco-operatorio": {
    categoria: "Gestão & Liderança",
    categoriaSlug: "gestao",
    titulo: "Gestão de Equipas em Bloco Operatório",
    subtitulo: "Desenvolva competências de gestão para liderar equipas de enfermagem perioperatória com eficiência e confiança.",
    selo: null,
    nivel: "Intermediário",
    modalidade: "Online",
    duracao: "6 semanas · 24h",
    dataInicio: "1 de Setembro de 2026 (turmas mensais)",
    local: null,
    imagem: "assets/img/site/Gestao-Perioperatoria.jpg",
    imagemAlt: "Reunião de equipa durante curso de gestão de equipas em bloco operatório",
    precoReal: 50000,
    precoSocio: 28000,
    descontoSelo: "-44%",
    avaliacaoMedia: 4.7,
    totalAvaliacoes: 35,
    distribuicaoEstrelas: [58, 27, 10, 4, 1],
    descricao: [
      "O Curso de Gestão de Equipas em Bloco Operatório foi criado para enfermeiros que já assumem, ou estão prestes a assumir, responsabilidades de coordenação dentro da sala operatória.",
      "Em formato totalmente online, com turmas mensais, o programa combina princípios de liderança com ferramentas práticas de planeamento de escalas, gestão de recursos humanos e materiais, e resolução de conflitos dentro de equipas multidisciplinares.",
      "É um curso orientado para a prática de gestão do dia-a-dia, útil tanto para quem já lidera uma equipa como para quem se está a preparar para o fazer.",
    ],
    oQueVaiAprender: [
      "Liderança de Equipas Cirúrgicas: princípios de liderança aplicados ao contexto do bloco operatório.",
      "Gestão de Conflitos: técnicas para resolver tensões e conflitos dentro da equipa multidisciplinar.",
      "Planeamento de Escalas e Recursos: organização eficiente de turnos, recursos humanos e materiais.",
      "Gestão de Desempenho: acompanhamento e desenvolvimento contínuo dos membros da equipa.",
      "Comunicação com Outras Especialidades: coordenação eficaz com cirurgia, anestesiologia e outros serviços.",
      "Indicadores de Gestão de Bloco Operatório: introdução a métricas usadas para avaliar a eficiência do serviço.",
    ],
    requisitos: [
      "Registo activo como enfermeiro(a) com experiência em sala operatória.",
      "Experiência mínima de 3 anos, preferencialmente com alguma responsabilidade de coordenação.",
      "Acesso a computador ou smartphone com ligação à internet.",
    ],
    publicoAlvo: [
      "Enfermeiros chefes ou coordenadores de bloco operatório.",
      "Enfermeiros que se preparam para assumir funções de gestão.",
      "Profissionais responsáveis pelo planeamento de escalas e recursos.",
    ],
    programa: [
      {
        titulo: "Módulo 1 — Liderança de Equipas Cirúrgicas",
        duracao: "6h",
        licoes: [
          { titulo: "Princípios de liderança no bloco operatório", duracao: "3h", tipo: "aula" },
          { titulo: "Estudo de casos de liderança", duracao: "3h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 2 — Gestão de Conflitos",
        duracao: "6h",
        licoes: [
          { titulo: "Origem e gestão de conflitos em equipas multidisciplinares", duracao: "3h", tipo: "aula" },
          { titulo: "Simulação de resolução de conflitos", duracao: "3h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 3 — Planeamento de Escalas e Recursos",
        duracao: "6h",
        licoes: [
          { titulo: "Organização de turnos e recursos humanos", duracao: "3h", tipo: "aula" },
          { titulo: "Prática de planeamento de escala", duracao: "3h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 4 — Gestão de Desempenho e Indicadores",
        duracao: "6h",
        licoes: [
          { titulo: "Acompanhamento e desenvolvimento da equipa", duracao: "3h", tipo: "aula" },
          { titulo: "Indicadores de gestão e avaliação final", duracao: "3h", tipo: "avaliacao" },
        ],
      },
    ],
    certificadoTexto: "Certificado de participação emitido pela AESOA, reconhecido como formação em gestão de serviços de saúde.",
    formador: {
      nome: "Dr. Manuel Domingos",
      credenciais: "Médico especialista em Gestão de Serviços de Saúde · Consultor da AESOA",
      bio: "O Dr. Manuel Domingos apoia hospitais angolanos na melhoria da gestão de blocos operatórios, combinando formação clínica com ferramentas práticas de gestão de equipas.",
      nCursos: 2,
      nFormandos: 95,
      avaliacaoMedia: 4.7,
    },
    reviews: [
      { nome: "Enf.º Chefe Óscar Bumba", cargo: "Enfermeiro Chefe de Bloco Operatório, Hospital Geral de Benguela", avaliacao: 5, data: "Junho de 2026", texto: "Mudou a forma como organizo as escalas da minha equipa. Conteúdo muito aplicável ao dia-a-dia." },
      { nome: "Enf.ª Lurdes Sacramento", cargo: "Coordenadora de sala operatória", avaliacao: 4, data: "Maio de 2026", texto: "Muito útil para quem está a começar a liderar. Gostaria de mais exemplos práticos de gestão de conflitos." },
      { nome: "Enf.º Vasco Kiezi", cargo: "Enfermeiro perioperatório em transição para gestão", avaliacao: 5, data: "Abril de 2026", texto: "Excelente curso online, bem organizado e fácil de conciliar com o trabalho." },
    ],
    vagasLimitadas: false,
  },

  "lideranca-comunicacao-enfermagem-perioperatoria": {
    categoria: "Gestão & Liderança",
    categoriaSlug: "gestao",
    titulo: "Liderança e Comunicação em Enfermagem Perioperatória",
    subtitulo: "Fortaleça a sua capacidade de comunicar, liderar e apoiar equipas sob pressão na sala operatória.",
    selo: null,
    nivel: "Intermediário",
    modalidade: "Híbrido",
    duracao: "4 semanas · 20h",
    dataInicio: "26 de Outubro de 2026",
    local: "Sede AESOA, Luanda (sessões presenciais) + online",
    imagem: "assets/multimidia/galeria/otimizado/foto-equipa-multicultural.jpg",
    imagemAlt: "Equipa multicultural de enfermagem durante curso de liderança e comunicação",
    precoReal: 45000,
    precoSocio: 0,
    descontoSelo: null,
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 18,
    distribuicaoEstrelas: [70, 20, 7, 3, 0],
    descricao: [
      "O Curso de Liderança e Comunicação em Enfermagem Perioperatória foca-se numa competência muitas vezes esquecida na formação técnica: a capacidade de comunicar e liderar com eficácia sob pressão.",
      "Em formato híbrido, com sessões presenciais na sede da AESOA complementadas por conteúdo online, os formandos desenvolvem técnicas de comunicação assertiva, liderança situacional e gestão do stress, aplicadas ao contexto exigente da sala operatória.",
      "O curso é particularmente valorizado por enfermeiros que já assumem, informalmente, papéis de referência dentro das suas equipas e querem formalizar essas competências.",
    ],
    oQueVaiAprender: [
      "Comunicação Assertiva: técnicas de comunicação clara e assertiva em contextos de alta pressão.",
      "Liderança Situacional: adaptação do estilo de liderança conforme o contexto e a equipa.",
      "Gestão de Stress em Sala Operatória: estratégias para manter o desempenho sob pressão.",
      "Feedback Construtivo: como dar e receber feedback de forma eficaz dentro da equipa cirúrgica.",
      "Comunicação em Situações Críticas: protocolos de comunicação para momentos de emergência cirúrgica.",
      "Inteligência Emocional em Contexto Clínico: gestão das próprias emoções e das da equipa em momentos de tensão.",
    ],
    requisitos: [
      "Registo activo como enfermeiro(a) com experiência em sala operatória.",
      "Experiência mínima de 2 anos em contexto cirúrgico.",
      "Disponibilidade para as sessões presenciais na sede da AESOA.",
    ],
    publicoAlvo: [
      "Enfermeiros que assumem informalmente papéis de referência na equipa.",
      "Enfermeiros que querem preparar-se para funções futuras de liderança.",
      "Profissionais que lidam regularmente com situações de alta pressão em sala operatória.",
    ],
    programa: [
      {
        titulo: "Módulo 1 — Comunicação Assertiva",
        duracao: "5h",
        licoes: [
          { titulo: "Fundamentos da comunicação assertiva", duracao: "2h", tipo: "aula" },
          { titulo: "Prática de comunicação em cenários simulados", duracao: "3h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 2 — Liderança Situacional",
        duracao: "5h",
        licoes: [
          { titulo: "Estilos de liderança e quando aplicá-los", duracao: "2h", tipo: "aula" },
          { titulo: "Estudo de casos de liderança situacional", duracao: "3h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 3 — Gestão de Stress e Inteligência Emocional",
        duracao: "5h",
        licoes: [
          { titulo: "Estratégias de gestão de stress em sala operatória", duracao: "2h", tipo: "aula" },
          { titulo: "Prática de regulação emocional em situações de tensão", duracao: "3h", tipo: "pratica" },
        ],
      },
      {
        titulo: "Módulo 4 — Comunicação em Situações Críticas",
        duracao: "5h",
        licoes: [
          { titulo: "Protocolos de comunicação em emergências cirúrgicas", duracao: "2h", tipo: "aula" },
          { titulo: "Simulação final e avaliação", duracao: "3h", tipo: "avaliacao" },
        ],
      },
    ],
    certificadoTexto: "Certificado de participação emitido pela AESOA, com destaque para competências de liderança e comunicação.",
    formador: {
      nome: "Enf.º Chefe António Sacadura",
      credenciais: "Enfermeiro Especialista em Enfermagem Perioperatória · Chefe de Equipa no Hospital Geral de Luanda",
      bio: "Para além da sua experiência técnica em cirurgias complexas, o Enf.º Chefe António Sacadura tem-se dedicado ao desenvolvimento de competências de liderança e comunicação em equipas de enfermagem perioperatória.",
      nCursos: 3,
      nFormandos: 210,
      avaliacaoMedia: 4.8,
    },
    reviews: [
      { nome: "Enf.ª Gabriela Muteka", cargo: "Enfermeira perioperatória, Hospital Josina Machel", avaliacao: 5, data: "Junho de 2026", texto: "Curso transformador. A parte de gestão de stress ajudou-me imenso em situações de emergência." },
      { nome: "Enf.º Ivo Sapalo", cargo: "Enfermeiro de bloco operatório", avaliacao: 5, data: "Maio de 2026", texto: "Finalmente um curso que fala de comunicação e não só de técnica. Muito bem estruturado." },
      { nome: "Enf.ª Custódia Wanga", cargo: "Enfermeira perioperatória, Clínica Sagrada Esperança", avaliacao: 4, data: "Abril de 2026", texto: "Muito bom. Gostaria de mais tempo de prática nas sessões presenciais." },
    ],
    vagasLimitadas: false,
  },
```

- [ ] **Step 2: Verify the file is still valid JavaScript**

Run: `node --check "public/assets/js/cursos-dados.js"`
Expected: no output, exit code 0.

- [ ] **Step 3: Verify all 8 slugs are present with the right shape**

Run:
```bash
node -e "
$(cat 'public/assets/js/cursos-dados.js')
const slugs = Object.keys(CURSOS_DADOS);
console.log(slugs.length, 'cursos');
slugs.forEach((s) => {
  const c = CURSOS_DADOS[s];
  const somaProgramaModulos = c.programa.length;
  const somaReviews = c.reviews.length;
  const somaDistribuicao = c.distribuicaoEstrelas.reduce((a, b) => a + b, 0);
  console.log(s, '-', somaProgramaModulos, 'módulos -', somaReviews, 'reviews - distribuição soma', somaDistribuicao);
});
"
```
Expected: `8 cursos`, followed by 8 lines, each with 3 reviews, and each "distribuição soma" equal to 100 (or 99–100 due to rounding — every course above sums to exactly 100).

- [ ] **Step 4: Commit**

```bash
git add public/assets/js/cursos-dados.js
git commit -m "feat: add remaining 7 courses to cursos-dados.js"
```

---

### Task 3: `curso-detalhe.html` — page skeleton (shell + hero + not-found state)

**Files:**
- Create: `public/curso-detalhe.html`

**Interfaces:**
- Consumes: nothing (static shell). Section containers below define the IDs/classes that Tasks 4–11's JS will target and Tasks 3–11's CSS will style.
- Produces: DOM structure with these IDs for later tasks to hook into: `#curso-nao-encontrado`, `#curso-conteudo`, `#curso-breadcrumb-categoria`, `#curso-breadcrumb-titulo`, `#curso-hero`, `#curso-categoria-pastilha`, `#curso-nivel-pastilha`, `#curso-selo`, `#curso-titulo`, `#curso-subtitulo`, `#curso-estrelas-preenchimento`, `#curso-avaliacao-numero`, `#curso-avaliacao-total`, `#curso-formador-hero-nome`, `#curso-meta-modalidade`, `#curso-meta-duracao`, `#curso-meta-data`.

- [ ] **Step 1: Create `public/curso-detalhe.html`**

Copy `public/noticia.html` in full, then apply these changes:

1. `<title>` → `Detalhe do Curso | AESOA — Associação dos Enfermeiros da Sala Operatória de Angola`
2. `<meta name="description">` → `content="Veja o programa completo, requisitos, formador e avaliações deste curso da AESOA."`
3. In the nav, change the Cursos link (inside the "Serviços" submenu) from `<li><a class="nav__link" href="cursos.html">Cursos</a></li>` to `<li><a class="nav__link" href="cursos.html" aria-current="page">Cursos</a></li>`
4. Replace everything between `<main id="conteudo-principal">` and `</main>` with:

```html
  <main id="conteudo-principal">
    <!-- SECTION: curso nao encontrado -->
    <section id="curso-nao-encontrado" class="secao" hidden>
      <div class="container">
        <div class="secao-cabecalho secao-cabecalho--centro">
          <span class="secao-eyebrow">Ups</span>
          <h1>Curso não encontrado</h1>
          <div class="secao-divisor"></div>
          <p>O link pode estar incorrecto ou o curso já não está disponível.</p>
        </div>
        <div class="hero__acoes" style="justify-content:center;">
          <a class="btn btn--primario" href="cursos.html">Ver Todos os Cursos</a>
        </div>
      </div>
    </section>
    <!-- /SECTION: curso nao encontrado -->

    <div id="curso-conteudo" hidden>
      <!-- SECTION: breadcrumb -->
      <div class="container" style="padding-top: var(--espaco-md);">
        <nav class="fio-migalha" aria-label="Localização atual">
          <a href="index.html">Início</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <a href="cursos.html">Cursos</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span id="curso-breadcrumb-categoria"></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span aria-current="page" id="curso-breadcrumb-titulo"></span>
        </nav>
      </div>
      <!-- /SECTION: breadcrumb -->

      <!-- SECTION: hero do curso -->
      <section class="curso-hero" id="curso-hero" aria-label="Detalhe do curso">
        <div class="curso-hero__sobreposicao"></div>
        <div class="container curso-hero__conteudo">
          <div class="curso-hero__pastilhas">
            <span class="cartao__etiqueta" id="curso-categoria-pastilha"></span>
            <span class="cursos__cartao-nivel" id="curso-nivel-pastilha"></span>
            <span class="cursos__cartao-selo" id="curso-selo" hidden></span>
          </div>
          <h1 id="curso-titulo"></h1>
          <p class="curso-hero__subtitulo" id="curso-subtitulo"></p>
          <div class="curso-hero__avaliacao">
            <span class="cursos__estrelas"><span class="cursos__estrelas-preenchimento" id="curso-estrelas-preenchimento"></span></span>
            <span class="cursos__cartao-avaliacao-numero" id="curso-avaliacao-numero"></span>
            <span id="curso-avaliacao-total"></span>
          </div>
          <p class="curso-hero__formador">Criado por <strong id="curso-formador-hero-nome"></strong></p>
          <ul class="curso-hero__meta">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span id="curso-meta-duracao"></span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span id="curso-meta-data"></span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span id="curso-meta-modalidade"></span>
            </li>
          </ul>
        </div>
      </section>
      <!-- /SECTION: hero do curso -->

      <!-- Restantes secções (cartão de inscrição, conteúdo principal, avaliações, relacionados, CTA) adicionadas nas Tasks 5-12 -->
    </div>
  </main>
```

- [ ] **Step 2: Add the `<script>` includes**

Right before `<script src="assets/js/main.js" defer></script>` at the bottom of the file, add:

```html
  <script src="assets/js/cursos-dados.js"></script>
```

(Same pattern as `noticia.html`: data file loaded first, without `defer`, then `main.js` with `defer`.)

- [ ] **Step 3: Verify the page loads without errors**

Run: `python3 -m http.server 8000 --directory public` (leave running)

Open `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada` in a browser.

Expected: page loads with the AESOA header/topbar/footer, no visible hero content yet (since `initPaginaCurso()` doesn't exist until Task 4 — the whole `#curso-conteudo` div stays `hidden` and `#curso-nao-encontrado` stays `hidden` too, so the page shows only header + footer). Browser console must show **zero errors** (in particular no "CURSOS_DADOS is not defined" — confirms the script tag was added correctly).

- [ ] **Step 4: Commit**

```bash
git add public/curso-detalhe.html
git commit -m "feat: add curso-detalhe.html page skeleton with hero and not-found state"
```

---

### Task 4: `initPaginaCurso()` — slug lookup, not-found state, hero rendering

**Files:**
- Modify: `public/assets/js/main.js`

**Interfaces:**
- Consumes: `CURSOS_DADOS` (global, from Task 1–2), DOM IDs from Task 3.
- Produces: `function initPaginaCurso()` — called with no arguments, no return value. Registers nothing new globally; later tasks (5–11) will extend this same function to render their sections, so it must remain the single place that resolves `dados` for the current slug.

- [ ] **Step 1: Add the function**

Insert this function immediately after `initPaginaNoticia()` (which ends around line 502) in `public/assets/js/main.js`:

```js
function initPaginaCurso() {
  const container = document.querySelector("#curso-conteudo");
  const naoEncontrado = document.querySelector("#curso-nao-encontrado");
  if (!container || !naoEncontrado) return;

  const slug = new URLSearchParams(location.search).get("slug");
  const dados =
    typeof CURSOS_DADOS !== "undefined" && slug && Object.hasOwn(CURSOS_DADOS, slug) ? CURSOS_DADOS[slug] : null;

  if (!dados) {
    naoEncontrado.hidden = false;
    container.hidden = true;
    return;
  }

  document.title = `${dados.titulo} | AESOA`;

  document.querySelector("#curso-breadcrumb-categoria").textContent = dados.categoria;
  document.querySelector("#curso-breadcrumb-titulo").textContent = dados.titulo;

  document.querySelector("#curso-categoria-pastilha").textContent = dados.categoria;

  const nivelEl = document.querySelector("#curso-nivel-pastilha");
  nivelEl.textContent = dados.nivel;
  nivelEl.className = "cursos__cartao-nivel";
  const nivelModificador = {
    Básico: "cursos__cartao-nivel--basico",
    Intermediário: "cursos__cartao-nivel--intermediario",
    Avançado: "cursos__cartao-nivel--avancado",
    "Todos os Níveis": "cursos__cartao-nivel--todos",
  }[dados.nivel];
  if (nivelModificador) nivelEl.classList.add(nivelModificador);

  const seloEl = document.querySelector("#curso-selo");
  if (dados.selo) {
    seloEl.textContent = dados.selo;
    seloEl.hidden = false;
  } else {
    seloEl.hidden = true;
  }

  document.querySelector("#curso-titulo").textContent = dados.titulo;
  document.querySelector("#curso-subtitulo").textContent = dados.subtitulo;

  document.querySelector("#curso-estrelas-preenchimento").style.width = `${(dados.avaliacaoMedia / 5) * 100}%`;
  document.querySelector("#curso-avaliacao-numero").textContent = dados.avaliacaoMedia.toFixed(1);
  document.querySelector("#curso-avaliacao-total").textContent = `(${dados.totalAvaliacoes} avaliações)`;

  document.querySelector("#curso-formador-hero-nome").textContent = dados.formador.nome;

  document.querySelector("#curso-meta-duracao").textContent = dados.duracao;
  document.querySelector("#curso-meta-data").textContent = `Início: ${dados.dataInicio}`;
  document.querySelector("#curso-meta-modalidade").textContent = dados.local
    ? `${dados.modalidade} · ${dados.local}`
    : dados.modalidade;

  container.hidden = false;
}
```

- [ ] **Step 2: Register the function in `DOMContentLoaded`**

In the `document.addEventListener("DOMContentLoaded", () => { ... })` block (around line 936), add `initPaginaCurso();` right after the existing `initPaginaNoticia();` line:

```js
  initPaginaNoticia();
  initPaginaCurso();
```

- [ ] **Step 3: Verify JS syntax**

Run: `node --check "public/assets/js/main.js"`
Expected: no output, exit code 0.

- [ ] **Step 4: Verify in the browser — valid slug**

With the server from Task 3 still running, open `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`.

Expected:
- Page title (browser tab) reads "Enfermagem Perioperatória Avançada | AESOA".
- Breadcrumb shows "Início › Cursos › Enfermagem Perioperatória › Enfermagem Perioperatória Avançada".
- Hero shows the pastilhas "Enfermagem Perioperatória", "Avançado", "Mais Procurado", the H1 "Enfermagem Perioperatória Avançada", the subtitle, filled stars at ~98%, "4.9", "(86 avaliações)", "Criado por Enf.º Chefe António Sacadura", and meta line "6 semanas · 40h", "Início: 14 de Setembro de 2026", "Presencial · Sede AESOA, Luanda".
- No console errors.

- [ ] **Step 5: Verify in the browser — invalid/missing slug**

Open `http://localhost:8000/curso-detalhe.html` (no `?slug=`) and `http://localhost:8000/curso-detalhe.html?slug=nao-existe`.

Expected: both show the "Curso não encontrado" heading and a "Ver Todos os Cursos" button linking to `cursos.html`; the hero/breadcrumb are not visible. No console errors.

- [ ] **Step 6: Commit**

```bash
git add public/assets/js/main.js
git commit -m "feat: render course hero and not-found state in initPaginaCurso"
```

---

### Task 5: Sticky enrolment card (HTML + CSS + render logic)

**Files:**
- Modify: `public/curso-detalhe.html`
- Modify: `public/assets/js/main.js`
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: `dados` object inside `initPaginaCurso()` (Task 4); `.cursos__favorito` + `initFavoritosCursos()` (existing, unchanged).
- Produces: DOM IDs `#curso-inscricao-imagem`, `#curso-inscricao-preco-real`, `#curso-inscricao-preco-socio`, `#curso-inscricao-selo-vagas`, `#curso-inscricao-favorito`, `#curso-inscricao-whatsapp`, `#curso-inscricao-facebook`, `#curso-inscricao-email`, and their mobile-fixed-bar counterparts `#curso-inscricao-fixa-preco`, `#curso-inscricao-fixa-cta`.

- [ ] **Step 1: Add the markup**

In `public/curso-detalhe.html`, right after the closing `</section>` of `<!-- /SECTION: hero do curso -->` and before the `<!-- Restantes secções -->` comment, add:

```html
      <!-- SECTION: corpo do curso (conteúdo + cartão de inscrição) -->
      <section class="secao">
        <div class="container curso-layout">
          <div class="curso-principal" id="curso-principal">
            <!-- Secções "O Que Vai Aprender", "Programa", "Requisitos", "Sobre", "Público-Alvo" e "Formador" são adicionadas aqui nas Tasks 6-9 -->
          </div>

          <aside class="curso-inscricao" id="curso-inscricao" aria-label="Inscrição no curso">
            <img class="curso-inscricao__imagem" id="curso-inscricao-imagem" src="" alt="" width="400" height="240" loading="lazy" />
            <div class="curso-inscricao__corpo">
              <div class="curso-inscricao__preco">
                <span class="cursos__cartao-preco-real" id="curso-inscricao-preco-real"></span>
                <span class="cursos__cartao-preco-socio" id="curso-inscricao-preco-socio"></span>
              </div>
              <a class="btn btn--primario efeito-brilho curso-inscricao__cta" href="index.html#torne-se-membro">Inscrever-se Agora</a>
              <ul class="curso-inscricao__selos">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 17.01" />
                  </svg>
                  Certificado reconhecido AESOA
                </li>
                <li id="curso-inscricao-selo-vagas" hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Vagas limitadas
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Acesso à comunidade de associados AESOA
                </li>
              </ul>
              <div class="curso-inscricao__acoes">
                <button type="button" class="cursos__favorito" id="curso-inscricao-favorito" aria-pressed="false" aria-label="Adicionar aos favoritos">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                </button>
                <a id="curso-inscricao-whatsapp" target="_blank" rel="noopener" aria-label="Partilhar no WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.4-1.8-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.1.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 3 4.7 4.1.7.3 1.2.4 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
                  </svg>
                </a>
                <a id="curso-inscricao-facebook" target="_blank" rel="noopener" aria-label="Partilhar no Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.6-1.5h1.6V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.4H7.7v3H10V21h3.5z" />
                  </svg>
                </a>
                <a id="curso-inscricao-email" aria-label="Partilhar por email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m3 6 9 7 9-7" />
                  </svg>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <!-- /SECTION: corpo do curso -->
```

Then add the mobile fixed bar as the **last child inside `#curso-conteudo`**, right before that div's closing `</div>` (i.e. after the "corpo do curso" `<section>` you just added, still inside `#curso-conteudo`). Placing it inside `#curso-conteudo` means it automatically stays hidden together with the rest of the page when the slug is invalid (Task 4's not-found handling), with no extra JS needed; the CSS media query added in Step 3 below is what further restricts it to small screens only:

```html
      <div class="curso-inscricao-fixa" id="curso-inscricao-fixa">
        <div class="curso-inscricao-fixa__preco" id="curso-inscricao-fixa-preco"></div>
        <a class="btn btn--primario curso-inscricao-fixa__cta" id="curso-inscricao-fixa-cta" href="index.html#torne-se-membro">Inscrever-se</a>
      </div>
```

- [ ] **Step 2: Extend `initPaginaCurso()` to render the enrolment card**

In `public/assets/js/main.js`, inside `initPaginaCurso()`, right before the final `container.hidden = false;` line, add:

```js
  document.querySelector("#curso-inscricao-imagem").src = dados.imagem;
  document.querySelector("#curso-inscricao-imagem").alt = dados.imagemAlt;

  const precoRealEl = document.querySelector("#curso-inscricao-preco-real");
  const precoSocioEl = document.querySelector("#curso-inscricao-preco-socio");
  const precoRealFormatado = `${dados.precoReal.toLocaleString("pt-PT")} Kz`;
  precoRealEl.textContent = precoRealFormatado;
  if (dados.precoSocio === 0) {
    precoSocioEl.textContent = "Grátis para Sócios";
  } else {
    precoSocioEl.textContent = `Sócios: ${dados.precoSocio.toLocaleString("pt-PT")} Kz`;
    if (dados.descontoSelo) {
      const selo = document.createElement("span");
      selo.className = "cursos__cartao-preco-selo";
      selo.textContent = dados.descontoSelo;
      precoSocioEl.appendChild(selo);
    }
  }

  document.querySelector("#curso-inscricao-selo-vagas").hidden = !dados.vagasLimitadas;

  const favoritoBotao = document.querySelector("#curso-inscricao-favorito");
  favoritoBotao.dataset.slug = slug;

  const urlAtual = encodeURIComponent(location.href);
  const tituloAtual = encodeURIComponent(dados.titulo);
  document.querySelector("#curso-inscricao-whatsapp").href = `https://wa.me/?text=${tituloAtual}%20${urlAtual}`;
  document.querySelector("#curso-inscricao-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${urlAtual}`;
  document.querySelector("#curso-inscricao-email").href = `mailto:?subject=${tituloAtual}&body=${urlAtual}`;

  document.querySelector("#curso-inscricao-fixa-preco").textContent =
    dados.precoSocio === 0 ? `${precoRealFormatado} · Grátis p/ Sócios` : precoRealFormatado;
```

Also add `const slug = ...` reference reuse: the `slug` variable is already declared earlier in the function (Task 4's `const slug = new URLSearchParams(...)`), so no redeclaration needed — just confirm the favourite button line uses that existing `slug` constant.

- [ ] **Step 3: Add the CSS**

Append to `public/assets/css/sections.css`:

```css
/* ===== Página Curso — Detalhe ===== */

.curso-hero {
  position: relative;
  padding-block: var(--espaco-2xl) var(--espaco-lg);
  overflow: hidden;
  color: var(--cor-texto-claro);
  background-color: var(--cor-hero-fundo);
}

.curso-hero__sobreposicao {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(120deg, var(--cor-primaria-escura) 0%, var(--cor-cabecalho) 100%);
}

.curso-hero__conteudo {
  position: relative;
  z-index: 1;
  max-width: 760px;
}

.curso-hero__pastilhas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: var(--espaco-sm);
}

.curso-hero h1 {
  color: var(--cor-texto-claro);
  font-size: clamp(1.8rem, 1.3rem + 2.2vw, 2.75rem);
  margin: 0 0 var(--espaco-xs);
}

.curso-hero__subtitulo {
  color: rgba(255, 255, 255, 0.88);
  font-size: var(--fs-md);
  margin-bottom: var(--espaco-sm);
  max-width: 620px;
}

.curso-hero__avaliacao {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: var(--espaco-xs);
  color: rgba(255, 255, 255, 0.9);
}

.curso-hero__avaliacao .cursos__estrelas::before {
  color: rgba(255, 255, 255, 0.35);
}

.curso-hero__avaliacao .cursos__cartao-avaliacao-numero {
  color: var(--cor-texto-claro);
}

.curso-hero__formador {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--espaco-sm);
}

.curso-hero__formador strong {
  color: var(--cor-texto-claro);
}

.curso-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaco-md);
  list-style: none;
  margin: 0;
  padding: 0;
}

.curso-hero__meta li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--fs-sm);
  color: rgba(255, 255, 255, 0.9);
}

.curso-hero__meta svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* ===== Página Curso — layout de duas colunas + cartão de inscrição ===== */

.curso-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: var(--espaco-lg);
  align-items: start;
}

.curso-principal {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-xl);
  min-width: 0;
}

.curso-inscricao {
  position: sticky;
  top: calc(var(--altura-cabecalho) + var(--espaco-md));
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-lg);
  background-color: var(--cor-fundo);
  box-shadow: var(--sombra-md);
  overflow: hidden;
}

.curso-inscricao__imagem {
  width: 100%;
  aspect-ratio: 5 / 3;
  object-fit: cover;
}

.curso-inscricao__corpo {
  padding: var(--espaco-md);
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}

.curso-inscricao__preco {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.curso-inscricao__preco .cursos__cartao-preco-real {
  font-size: 1.6rem;
}

.curso-inscricao__cta {
  width: 100%;
  text-align: center;
  justify-content: center;
}

.curso-inscricao__selos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.curso-inscricao__selos li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-xs);
  color: var(--cor-texto-suave);
}

.curso-inscricao__selos svg {
  width: 16px;
  height: 16px;
  color: var(--cor-primaria);
  flex-shrink: 0;
}

.curso-inscricao__acoes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: var(--espaco-xs);
  border-top: 1px solid var(--cor-borda);
}

.curso-inscricao__acoes a,
.curso-inscricao__acoes .cursos__favorito {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: var(--cor-primaria-suave);
  color: var(--cor-primaria);
  border: none;
  cursor: pointer;
  transition: background-color var(--transicao-base), color var(--transicao-base);
}

.curso-inscricao__acoes a:hover,
.curso-inscricao__acoes .cursos__favorito:hover {
  background-color: var(--cor-primaria);
  color: var(--cor-texto-claro);
}

.curso-inscricao__acoes .cursos__favorito.esta-favorito {
  background-color: var(--cor-primaria);
  color: var(--cor-texto-claro);
}

.curso-inscricao__acoes svg {
  width: 18px;
  height: 18px;
}

/* Barra fixa de inscrição — só visível em ecrãs estreitos */
.curso-inscricao-fixa {
  display: none;
}

@media (max-width: 900px) {
  .curso-layout {
    grid-template-columns: 1fr;
  }

  .curso-inscricao {
    position: static;
  }

  .curso-inscricao-fixa {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--espaco-sm);
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    padding: var(--espaco-xs) var(--espaco-sm);
    background-color: var(--cor-fundo);
    border-top: 1px solid var(--cor-borda);
    box-shadow: 0 -4px 16px rgba(18, 61, 44, 0.12);
  }

  .curso-inscricao-fixa__preco {
    font-family: var(--fonte-titulo);
    font-weight: 700;
    font-size: var(--fs-sm);
    color: var(--cor-texto);
  }

  .curso-inscricao-fixa__cta {
    flex-shrink: 0;
  }

  body:has(#curso-conteudo:not([hidden])) {
    padding-bottom: 64px;
  }
}
```

- [ ] **Step 4: Verify JS and CSS syntax**

Run: `node --check "public/assets/js/main.js"`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify in the browser**

With the local server running, reload `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`.

Expected:
- A white card floats to the right of the (still-empty) main column, showing the course image, "55.000 Kz", a green "Grátis para Sócios" pill, an "Inscrever-se Agora" button, three trust badges (certificate, community; "Vagas limitadas" hidden since this course's `vagasLimitadas` is `false`), a heart button and 3 share icons.
- Clicking the heart toggles its filled/active state and persists after reload (uses existing `initFavoritosCursos()` + `localStorage`).
- Resize the browser to under 900px width: the card becomes full-width and stacks above where the main column will be, and a slim fixed bar appears at the bottom of the screen showing "55.000 Kz · Grátis p/ Sócios" and an "Inscrever-se" button.
- Open `?slug=instrumentacao-cirurgica-essencial` (which has `vagasLimitadas: true`): the "Vagas limitadas" badge is now visible.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add public/curso-detalhe.html public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: add sticky enrolment card with pricing, badges, favourite and share"
```

---

### Task 6: "O Que Vai Aprender" section

**Files:**
- Modify: `public/curso-detalhe.html`
- Modify: `public/assets/js/main.js`
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: `dados.oQueVaiAprender` (array of strings, Task 1–2), `#curso-principal` container (Task 5).
- Produces: `#curso-aprender-lista` (populated `<ul>`).

- [ ] **Step 1: Add the markup**

Inside `<div class="curso-principal" id="curso-principal">` in `public/curso-detalhe.html`, add:

```html
            <section class="curso-bloco" aria-labelledby="curso-aprender-titulo">
              <h2 class="curso-bloco__titulo" id="curso-aprender-titulo">O Que Vai Aprender</h2>
              <ul class="curso-aprender__grelha" id="curso-aprender-lista"></ul>
            </section>
```

- [ ] **Step 2: Extend `initPaginaCurso()`**

In `public/assets/js/main.js`, inside `initPaginaCurso()`, before `container.hidden = false;`, add:

```js
  const aprenderEl = document.querySelector("#curso-aprender-lista");
  aprenderEl.replaceChildren();
  dados.oQueVaiAprender.forEach((item) => {
    const li = document.createElement("li");
    li.className = "curso-aprender__item";

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    const polyline = document.createElementNS(svgNS, "polyline");
    polyline.setAttribute("points", "20 6 9 17 4 12");
    svg.appendChild(polyline);
    li.appendChild(svg);

    const texto = document.createElement("span");
    texto.textContent = item;
    li.appendChild(texto);

    aprenderEl.appendChild(li);
  });
```

- [ ] **Step 3: Add the CSS**

Append to `public/assets/css/sections.css` (inside the "Página Curso — Detalhe" block started in Task 5):

```css
.curso-bloco__titulo {
  margin-bottom: var(--espaco-sm);
}

.curso-aprender__grelha {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--espaco-sm) var(--espaco-md);
  list-style: none;
  margin: 0;
  padding: var(--espaco-md);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-md);
  background-color: var(--cor-fundo-alt);
}

.curso-aprender__item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: var(--fs-sm);
  color: var(--cor-texto);
}

.curso-aprender__item svg {
  width: 18px;
  height: 18px;
  margin-top: 0.15rem;
  color: var(--cor-primaria);
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .curso-aprender__grelha {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Verify JS syntax**

Run: `node --check "public/assets/js/main.js"`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify in the browser**

Reload `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`.

Expected: below the hero/enrolment row, a bordered box titled "O Que Vai Aprender" with a 2-column grid of 6 checkmarked items (2 columns on desktop, 1 on narrow screens). No console errors.

- [ ] **Step 6: Commit**

```bash
git add public/curso-detalhe.html public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: render O Que Vai Aprender checklist section"
```

---

### Task 7: "Programa do Curso" accordion

**Files:**
- Modify: `public/curso-detalhe.html`
- Modify: `public/assets/js/main.js`
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: `dados.programa` (array of `{ titulo, duracao, licoes: [{ titulo, duracao, tipo }] }`, Task 1–2).
- Produces: `initAcordeaoProgramaCurso()` — reusable, generic accordion toggler for any `.curso-programa__modulo` element (matches the existing `.faq__item` pattern), called once per page load from `initPaginaCurso()` after the modules are inserted into the DOM.

- [ ] **Step 1: Add the markup**

Inside `<div class="curso-principal" id="curso-principal">`, after the "O Que Vai Aprender" `<section>`, add:

```html
            <section class="curso-bloco" aria-labelledby="curso-programa-titulo">
              <h2 class="curso-bloco__titulo" id="curso-programa-titulo">Programa do Curso</h2>
              <p class="curso-programa__resumo" id="curso-programa-resumo"></p>
              <div class="curso-programa__lista" id="curso-programa-lista"></div>
            </section>
```

- [ ] **Step 2: Add `initAcordeaoProgramaCurso()` and extend `initPaginaCurso()`**

In `public/assets/js/main.js`, add this new function right after `initAcordeaoEstatutos()` (which ends around line 197):

```js
function initAcordeaoProgramaCurso() {
  document.querySelectorAll(".curso-programa__modulo").forEach((item) => {
    const botao = item.querySelector(".curso-programa__cabecalho");
    if (!botao) return;

    botao.addEventListener("click", () => {
      const aberto = item.classList.toggle("esta-aberto");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  });
}
```

Then, inside `initPaginaCurso()`, before `container.hidden = false;`, add:

```js
  const totalHoras = dados.programa.reduce((soma, modulo) => soma + parseInt(modulo.duracao, 10), 0);
  document.querySelector("#curso-programa-resumo").textContent =
    `${dados.programa.length} módulos · ${totalHoras} horas de conteúdo`;

  const TIPO_ROTULO = { aula: "Aula", pratica: "Prática", avaliacao: "Avaliação" };
  const programaEl = document.querySelector("#curso-programa-lista");
  programaEl.replaceChildren();

  dados.programa.forEach((modulo, indiceModulo) => {
    const item = document.createElement("div");
    item.className = "curso-programa__modulo";

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "curso-programa__cabecalho";
    botao.setAttribute("aria-expanded", "false");
    botao.id = `curso-programa-cabecalho-${indiceModulo}`;

    const tituloModulo = document.createElement("span");
    tituloModulo.textContent = modulo.titulo;
    botao.appendChild(tituloModulo);

    const duracaoModulo = document.createElement("span");
    duracaoModulo.className = "curso-programa__duracao";
    duracaoModulo.textContent = modulo.duracao;
    botao.appendChild(duracaoModulo);

    const svgNS = "http://www.w3.org/2000/svg";
    const seta = document.createElementNS(svgNS, "svg");
    seta.setAttribute("class", "curso-programa__seta");
    seta.setAttribute("viewBox", "0 0 24 24");
    seta.setAttribute("fill", "none");
    seta.setAttribute("stroke", "currentColor");
    seta.setAttribute("stroke-width", "2");
    seta.setAttribute("stroke-linecap", "round");
    seta.setAttribute("stroke-linejoin", "round");
    seta.setAttribute("aria-hidden", "true");
    const setaPath = document.createElementNS(svgNS, "path");
    setaPath.setAttribute("d", "m6 9 6 6 6-6");
    seta.appendChild(setaPath);
    botao.appendChild(seta);

    item.appendChild(botao);

    const painel = document.createElement("div");
    painel.className = "curso-programa__painel";
    const painelInterior = document.createElement("div");
    painelInterior.className = "curso-programa__painel-interior";

    const licoesEl = document.createElement("ul");
    licoesEl.className = "curso-programa__licoes";
    modulo.licoes.forEach((licao) => {
      const li = document.createElement("li");
      li.className = "curso-programa__licao";

      const tipoEl = document.createElement("span");
      tipoEl.className = `curso-programa__licao-tipo curso-programa__licao-tipo--${licao.tipo}`;
      tipoEl.textContent = TIPO_ROTULO[licao.tipo];
      li.appendChild(tipoEl);

      const tituloLicao = document.createElement("span");
      tituloLicao.className = "curso-programa__licao-titulo";
      tituloLicao.textContent = licao.titulo;
      li.appendChild(tituloLicao);

      const duracaoLicao = document.createElement("span");
      duracaoLicao.className = "curso-programa__licao-duracao";
      duracaoLicao.textContent = licao.duracao;
      li.appendChild(duracaoLicao);

      licoesEl.appendChild(li);
    });

    painelInterior.appendChild(licoesEl);
    painel.appendChild(painelInterior);
    item.appendChild(painel);

    programaEl.appendChild(item);
  });
```

Finally, register the new accordion initializer in `DOMContentLoaded`, right after `initPaginaCurso();`:

```js
  initPaginaCurso();
  initAcordeaoProgramaCurso();
```

(This must run after `initPaginaCurso()` populates the modules, since it attaches listeners to `.curso-programa__modulo` elements that don't exist until then.)

- [ ] **Step 3: Add the CSS**

Append to `public/assets/css/sections.css`:

```css
.curso-programa__resumo {
  font-size: var(--fs-sm);
  color: var(--cor-texto-suave);
  margin-bottom: var(--espaco-sm);
}

.curso-programa__lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.curso-programa__modulo {
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-md);
  background-color: var(--cor-fundo);
  overflow: hidden;
  transition: border-color var(--transicao-base);
}

.curso-programa__modulo.esta-aberto {
  border-color: var(--cor-primaria-clara);
}

.curso-programa__cabecalho {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  width: 100%;
  padding: var(--espaco-sm) var(--espaco-md);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: var(--fs-sm);
  color: var(--cor-primaria-escura);
}

.curso-programa__duracao {
  margin-left: auto;
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--cor-texto-suave);
}

.curso-programa__seta {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--cor-primaria);
  transition: transform var(--transicao-base);
}

.curso-programa__modulo.esta-aberto .curso-programa__seta {
  transform: rotate(180deg);
}

.curso-programa__painel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--transicao-base);
}

.curso-programa__modulo.esta-aberto .curso-programa__painel {
  grid-template-rows: 1fr;
}

.curso-programa__painel-interior {
  overflow: hidden;
}

.curso-programa__licoes {
  list-style: none;
  margin: 0;
  padding: 0 var(--espaco-md) var(--espaco-md);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.curso-programa__licao {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: var(--fs-sm);
  color: var(--cor-texto);
}

.curso-programa__licao-titulo {
  flex: 1;
}

.curso-programa__licao-duracao {
  font-size: var(--fs-xs);
  color: var(--cor-texto-suave);
}

.curso-programa__licao-tipo {
  flex-shrink: 0;
  font-family: var(--fonte-titulo);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.2rem 0.5rem;
  border-radius: var(--raio-pill);
  color: var(--cor-texto-claro);
}

.curso-programa__licao-tipo--aula {
  background-color: var(--cor-primaria-clara);
}

.curso-programa__licao-tipo--pratica {
  background-color: #f0a324;
}

.curso-programa__licao-tipo--avaliacao {
  background-color: var(--cor-primaria-escura);
}
```

- [ ] **Step 4: Verify JS syntax**

Run: `node --check "public/assets/js/main.js"`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify in the browser**

Reload `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`.

Expected: "Programa do Curso" section shows "4 módulos · 40 horas de conteúdo", followed by 4 collapsed module rows. Clicking a module header expands it smoothly (grid-rows transition), rotates the chevron, and shows its lessons with a colored type pill (Aula/Prática/Avaliação), title, and duration. Clicking again collapses it. No console errors.

- [ ] **Step 6: Commit**

```bash
git add public/curso-detalhe.html public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: render Programa do Curso as an accordion of modules and lessons"
```

---

### Task 8: "Requisitos", "Sobre Este Curso" (with show-more) and "Para Quem É Este Curso"

**Files:**
- Modify: `public/curso-detalhe.html`
- Modify: `public/assets/js/main.js`
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: `dados.requisitos`, `dados.descricao`, `dados.publicoAlvo` (Task 1–2).
- Produces: `initSobreCursoExpandir()` — toggles a `.esta-expandido` class on `#curso-sobre-texto` when `#curso-sobre-mostrar-mais` is clicked.

- [ ] **Step 1: Add the markup**

Inside `<div class="curso-principal" id="curso-principal">`, after the "Programa do Curso" `<section>`, add:

```html
            <section class="curso-bloco" aria-labelledby="curso-requisitos-titulo">
              <h2 class="curso-bloco__titulo" id="curso-requisitos-titulo">Requisitos</h2>
              <ul class="curso-lista" id="curso-requisitos-lista"></ul>
            </section>

            <section class="curso-bloco" aria-labelledby="curso-sobre-titulo">
              <h2 class="curso-bloco__titulo" id="curso-sobre-titulo">Sobre Este Curso</h2>
              <div class="curso-sobre__texto" id="curso-sobre-texto"></div>
              <button type="button" class="curso-sobre__mostrar-mais" id="curso-sobre-mostrar-mais">Mostrar mais</button>
            </section>

            <section class="curso-bloco" aria-labelledby="curso-publico-titulo">
              <h2 class="curso-bloco__titulo" id="curso-publico-titulo">Para Quem É Este Curso</h2>
              <ul class="curso-lista" id="curso-publico-lista"></ul>
            </section>
```

- [ ] **Step 2: Add `initSobreCursoExpandir()` and extend `initPaginaCurso()`**

In `public/assets/js/main.js`, add this function right after `initAcordeaoProgramaCurso()`:

```js
function initSobreCursoExpandir() {
  const texto = document.querySelector("#curso-sobre-texto");
  const botao = document.querySelector("#curso-sobre-mostrar-mais");
  if (!texto || !botao) return;

  botao.addEventListener("click", () => {
    const expandido = texto.classList.toggle("esta-expandido");
    botao.textContent = expandido ? "Mostrar menos" : "Mostrar mais";
  });
}
```

Inside `initPaginaCurso()`, before `container.hidden = false;`, add:

```js
  const requisitosEl = document.querySelector("#curso-requisitos-lista");
  requisitosEl.replaceChildren();
  dados.requisitos.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    requisitosEl.appendChild(li);
  });

  const sobreEl = document.querySelector("#curso-sobre-texto");
  sobreEl.replaceChildren();
  dados.descricao.forEach((paragrafo) => {
    const p = document.createElement("p");
    p.textContent = paragrafo;
    sobreEl.appendChild(p);
  });
  sobreEl.classList.remove("esta-expandido");
  document.querySelector("#curso-sobre-mostrar-mais").textContent = "Mostrar mais";

  const publicoEl = document.querySelector("#curso-publico-lista");
  publicoEl.replaceChildren();
  dados.publicoAlvo.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    publicoEl.appendChild(li);
  });
```

Register `initSobreCursoExpandir()` in `DOMContentLoaded`, right after `initAcordeaoProgramaCurso();`:

```js
  initAcordeaoProgramaCurso();
  initSobreCursoExpandir();
```

- [ ] **Step 3: Add the CSS**

Append to `public/assets/css/sections.css`:

```css
.curso-lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.curso-lista li {
  position: relative;
  padding-left: 1.4rem;
  font-size: var(--fs-sm);
  color: var(--cor-texto);
  line-height: var(--lh-corpo);
}

.curso-lista li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--cor-primaria);
}

.curso-sobre__texto {
  position: relative;
  max-height: 8.5rem;
  overflow: hidden;
}

.curso-sobre__texto::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 3rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, var(--cor-fundo) 90%);
}

.curso-sobre__texto.esta-expandido {
  max-height: none;
}

.curso-sobre__texto.esta-expandido::after {
  display: none;
}

.curso-sobre__texto p {
  font-size: var(--fs-base);
  line-height: var(--lh-corpo);
  color: var(--cor-texto);
  margin: 0 0 var(--espaco-md);
}

.curso-sobre__mostrar-mais {
  margin-top: var(--espaco-xs);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: var(--fs-sm);
  color: var(--cor-primaria);
}

.curso-sobre__mostrar-mais:hover {
  text-decoration: underline;
}
```

- [ ] **Step 4: Verify JS syntax**

Run: `node --check "public/assets/js/main.js"`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify in the browser**

Reload `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`.

Expected: "Requisitos" shows 3 bulleted items. "Sobre Este Curso" shows the 3 description paragraphs clamped to ~8.5rem height with a fade-out at the bottom and a "Mostrar mais" link; clicking it removes the clamp, shows full text, and the button changes to "Mostrar menos"; clicking again re-clamps. "Para Quem É Este Curso" shows 3 bulleted items. No console errors.

- [ ] **Step 6: Commit**

```bash
git add public/curso-detalhe.html public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: render Requisitos, Sobre Este Curso (com mostrar mais) e Publico-Alvo"
```

---

### Task 9: Perfil do Formador

**Files:**
- Modify: `public/curso-detalhe.html`
- Modify: `public/assets/js/main.js`
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: `dados.formador` (`{ nome, credenciais, bio, nCursos, nFormandos, avaliacaoMedia }`, Task 1–2).
- Produces: DOM IDs `#curso-formador-iniciais`, `#curso-formador-nome`, `#curso-formador-credenciais`, `#curso-formador-bio`, `#curso-formador-stat-cursos`, `#curso-formador-stat-formandos`, `#curso-formador-stat-avaliacao`.

- [ ] **Step 1: Add the markup**

Inside `<div class="curso-principal" id="curso-principal">`, after the "Para Quem É Este Curso" `<section>`, add:

```html
            <section class="curso-formador" aria-labelledby="curso-formador-titulo">
              <h2 class="curso-bloco__titulo" id="curso-formador-titulo">Formador</h2>
              <div class="curso-formador__cartao">
                <div class="curso-formador__avatar" id="curso-formador-iniciais"></div>
                <div class="curso-formador__info">
                  <h3 id="curso-formador-nome"></h3>
                  <p class="curso-formador__credenciais" id="curso-formador-credenciais"></p>
                  <p class="curso-formador__bio" id="curso-formador-bio"></p>
                  <div class="curso-formador__stats">
                    <div class="curso-formador__stat">
                      <strong id="curso-formador-stat-cursos"></strong>
                      <span>cursos na AESOA</span>
                    </div>
                    <div class="curso-formador__stat">
                      <strong id="curso-formador-stat-formandos"></strong>
                      <span>formandos</span>
                    </div>
                    <div class="curso-formador__stat">
                      <strong id="curso-formador-stat-avaliacao"></strong>
                      <span>avaliação média</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
```

- [ ] **Step 2: Extend `initPaginaCurso()`**

Before `container.hidden = false;`, add:

```js
  const iniciais = dados.formador.nome
    .replace(/Enf\.º|Enf\.ª|Chefe|Dr\./g, "")
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  document.querySelector("#curso-formador-iniciais").textContent = iniciais;
  document.querySelector("#curso-formador-nome").textContent = dados.formador.nome;
  document.querySelector("#curso-formador-credenciais").textContent = dados.formador.credenciais;
  document.querySelector("#curso-formador-bio").textContent = dados.formador.bio;
  document.querySelector("#curso-formador-stat-cursos").textContent = dados.formador.nCursos;
  document.querySelector("#curso-formador-stat-formandos").textContent = `${dados.formador.nFormandos}+`;
  document.querySelector("#curso-formador-stat-avaliacao").textContent = dados.formador.avaliacaoMedia.toFixed(1);
```

- [ ] **Step 3: Add the CSS**

Append to `public/assets/css/sections.css`:

```css
.curso-formador__cartao {
  display: flex;
  gap: var(--espaco-md);
  padding: var(--espaco-md);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-md);
  background-color: var(--cor-fundo);
}

.curso-formador__avatar {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--cor-primaria);
  color: var(--cor-texto-claro);
  font-family: var(--fonte-titulo);
  font-weight: 800;
  font-size: 1.3rem;
}

.curso-formador__info h3 {
  margin: 0 0 0.2rem;
}

.curso-formador__credenciais {
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--cor-primaria);
  margin: 0 0 var(--espaco-xs);
}

.curso-formador__bio {
  font-size: var(--fs-sm);
  color: var(--cor-texto-suave);
  line-height: var(--lh-corpo);
  margin: 0 0 var(--espaco-sm);
}

.curso-formador__stats {
  display: flex;
  gap: var(--espaco-lg);
}

.curso-formador__stat {
  display: flex;
  flex-direction: column;
}

.curso-formador__stat strong {
  font-family: var(--fonte-titulo);
  font-size: var(--fs-lg);
  color: var(--cor-texto);
}

.curso-formador__stat span {
  font-size: var(--fs-xs);
  color: var(--cor-texto-suave);
}

@media (max-width: 500px) {
  .curso-formador__cartao {
    flex-direction: column;
  }
}
```

- [ ] **Step 4: Verify JS syntax**

Run: `node --check "public/assets/js/main.js"`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify in the browser**

Reload `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`.

Expected: "Formador" section shows a green circular avatar with initials "AS" (from "António Sacadura"), name "Enf.º Chefe António Sacadura", credentials line, bio paragraph, and 3 stats: "3 cursos na AESOA", "210+ formandos", "4.9 avaliação média". No console errors.

- [ ] **Step 6: Commit**

```bash
git add public/curso-detalhe.html public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: render instructor profile with avatar initials, bio and stats"
```

---

### Task 10: Avaliações (rating breakdown + review cards)

**Files:**
- Modify: `public/curso-detalhe.html`
- Modify: `public/assets/js/main.js`
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: `dados.avaliacaoMedia`, `dados.totalAvaliacoes`, `dados.distribuicaoEstrelas` (array `[pct5, pct4, pct3, pct2, pct1]`), `dados.reviews` (Task 1–2).
- Produces: `#curso-avaliacoes-lista` (populated review cards), `#curso-avaliacoes-barras` (populated bar chart).

- [ ] **Step 1: Add the markup**

Right after the closing `</section>` of `<!-- /SECTION: corpo do curso -->` in `public/curso-detalhe.html` (i.e. as a new full-width section, sibling of it, still inside `#curso-conteudo`), add:

```html
      <!-- SECTION: avaliações -->
      <section class="secao secao--alt" aria-labelledby="curso-avaliacoes-titulo">
        <div class="container">
          <div class="secao-cabecalho secao-cabecalho--centro">
            <span class="secao-eyebrow">Opiniões</span>
            <h2 id="curso-avaliacoes-titulo">Avaliações de Quem Já Fez Este Curso</h2>
            <div class="secao-divisor"></div>
          </div>

          <div class="curso-avaliacoes__resumo">
            <div class="curso-avaliacoes__media">
              <strong id="curso-avaliacoes-media-numero"></strong>
              <span class="cursos__estrelas"><span class="cursos__estrelas-preenchimento" id="curso-avaliacoes-media-estrelas"></span></span>
              <span id="curso-avaliacoes-media-total"></span>
            </div>
            <div class="curso-avaliacoes__barras" id="curso-avaliacoes-barras"></div>
          </div>

          <div class="curso-avaliacoes__lista" id="curso-avaliacoes-lista"></div>
        </div>
      </section>
      <!-- /SECTION: avaliações -->
```

- [ ] **Step 2: Extend `initPaginaCurso()`**

Before `container.hidden = false;`, add:

```js
  document.querySelector("#curso-avaliacoes-media-numero").textContent = dados.avaliacaoMedia.toFixed(1);
  document.querySelector("#curso-avaliacoes-media-estrelas").style.width = `${(dados.avaliacaoMedia / 5) * 100}%`;
  document.querySelector("#curso-avaliacoes-media-total").textContent = `${dados.totalAvaliacoes} avaliações`;

  const barrasEl = document.querySelector("#curso-avaliacoes-barras");
  barrasEl.replaceChildren();
  dados.distribuicaoEstrelas.forEach((percentagem, indice) => {
    const estrelas = 5 - indice;
    const linha = document.createElement("div");
    linha.className = "curso-avaliacoes__barra";

    const rotulo = document.createElement("span");
    rotulo.textContent = `${estrelas} ★`;
    linha.appendChild(rotulo);

    const trilho = document.createElement("div");
    trilho.className = "curso-avaliacoes__barra-trilho";
    const preenchimento = document.createElement("div");
    preenchimento.className = "curso-avaliacoes__barra-preenchimento";
    preenchimento.style.width = `${percentagem}%`;
    trilho.appendChild(preenchimento);
    linha.appendChild(trilho);

    const valor = document.createElement("span");
    valor.textContent = `${percentagem}%`;
    linha.appendChild(valor);

    barrasEl.appendChild(linha);
  });

  const reviewsEl = document.querySelector("#curso-avaliacoes-lista");
  reviewsEl.replaceChildren();
  dados.reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "curso-avaliacao-card";

    const avatar = document.createElement("div");
    avatar.className = "curso-avaliacao-card__avatar";
    avatar.textContent = review.nome
      .replace(/Enf\.º|Enf\.ª|Chefe|Dr\./g, "")
      .trim()
      .split(/\s+/)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    card.appendChild(avatar);

    const corpo = document.createElement("div");
    corpo.className = "curso-avaliacao-card__corpo";

    const cabecalho = document.createElement("div");
    cabecalho.className = "curso-avaliacao-card__cabecalho";
    const nome = document.createElement("strong");
    nome.textContent = review.nome;
    cabecalho.appendChild(nome);
    const data = document.createElement("span");
    data.textContent = review.data;
    cabecalho.appendChild(data);
    corpo.appendChild(cabecalho);

    const cargo = document.createElement("p");
    cargo.className = "curso-avaliacao-card__cargo";
    cargo.textContent = review.cargo;
    corpo.appendChild(cargo);

    const estrelas = document.createElement("span");
    estrelas.className = "cursos__estrelas";
    const preenchimentoEstrelas = document.createElement("span");
    preenchimentoEstrelas.className = "cursos__estrelas-preenchimento";
    preenchimentoEstrelas.style.width = `${(review.avaliacao / 5) * 100}%`;
    estrelas.appendChild(preenchimentoEstrelas);
    corpo.appendChild(estrelas);

    const texto = document.createElement("p");
    texto.className = "curso-avaliacao-card__texto";
    texto.textContent = review.texto;
    corpo.appendChild(texto);

    card.appendChild(corpo);
    reviewsEl.appendChild(card);
  });
```

- [ ] **Step 3: Add the CSS**

Append to `public/assets/css/sections.css`:

```css
.curso-avaliacoes__resumo {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: var(--espaco-lg);
  align-items: center;
  max-width: 760px;
  margin: 0 auto var(--espaco-lg);
}

.curso-avaliacoes__media {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.curso-avaliacoes__media strong {
  font-family: var(--fonte-titulo);
  font-size: 2.5rem;
  color: var(--cor-primaria-escura);
}

.curso-avaliacoes__media span:last-child {
  font-size: var(--fs-xs);
  color: var(--cor-texto-suave);
}

.curso-avaliacoes__barras {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.curso-avaliacoes__barra {
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;
  align-items: center;
  gap: 0.6rem;
  font-size: var(--fs-xs);
  color: var(--cor-texto-suave);
}

.curso-avaliacoes__barra-trilho {
  height: 8px;
  border-radius: var(--raio-pill);
  background-color: var(--cor-borda);
  overflow: hidden;
}

.curso-avaliacoes__barra-preenchimento {
  height: 100%;
  background-color: #f0a324;
}

.curso-avaliacoes__lista {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--espaco-md);
  max-width: var(--largura-conteudo);
  margin: 0 auto;
}

.curso-avaliacao-card {
  display: flex;
  gap: var(--espaco-sm);
  padding: var(--espaco-md);
  border-radius: var(--raio-md);
  background-color: var(--cor-fundo);
  box-shadow: var(--sombra-sm);
}

.curso-avaliacao-card__avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--cor-primaria-suave);
  color: var(--cor-primaria-escura);
  font-family: var(--fonte-titulo);
  font-weight: 800;
  font-size: 0.9rem;
}

.curso-avaliacao-card__cabecalho {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.curso-avaliacao-card__cabecalho strong {
  font-size: var(--fs-sm);
  color: var(--cor-texto);
}

.curso-avaliacao-card__cabecalho span {
  font-size: var(--fs-xs);
  color: var(--cor-texto-suave);
  flex-shrink: 0;
}

.curso-avaliacao-card__cargo {
  font-size: var(--fs-xs);
  color: var(--cor-texto-suave);
  margin: 0 0 0.4rem;
}

.curso-avaliacao-card__texto {
  font-size: var(--fs-sm);
  color: var(--cor-texto);
  line-height: var(--lh-corpo);
  margin: 0.4rem 0 0;
}

@media (max-width: 700px) {
  .curso-avaliacoes__resumo {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Verify JS syntax**

Run: `node --check "public/assets/js/main.js"`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify in the browser**

Reload `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`.

Expected: a full-width, alternate-background "Avaliações de Quem Já Fez Este Curso" section with "4.9" + filled stars + "86 avaliações" on the left, 5 horizontal bars (5★ 70%, 4★ 20%, 3★ 7%, 2★ 2%, 1★ 1%) on the right, and 3 review cards below with initials avatars, name, date, role, stars, and review text. No console errors.

- [ ] **Step 6: Commit**

```bash
git add public/curso-detalhe.html public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: render Avaliacoes section with rating breakdown and review cards"
```

---

### Task 11: Cursos Relacionados

**Files:**
- Modify: `public/curso-detalhe.html`
- Modify: `public/assets/js/main.js`
- Modify: `public/assets/css/sections.css`

**Interfaces:**
- Consumes: `CURSOS_DADOS`, `dados.categoriaSlug`, `slug` (current) — all available inside `initPaginaCurso()`.
- Produces: `#curso-relacionados-grelha` (populated), `#curso-relacionados-secao` (hidden if no related courses exist).

- [ ] **Step 1: Add the markup**

Right after the closing `</section>` of `<!-- /SECTION: avaliações -->`, add:

```html
      <!-- SECTION: cursos relacionados -->
      <section class="secao" id="curso-relacionados-secao">
        <div class="container">
          <div class="secao-cabecalho secao-cabecalho--centro">
            <span class="secao-eyebrow">Continue a explorar</span>
            <h2>Cursos Relacionados</h2>
            <div class="secao-divisor"></div>
          </div>
          <div class="curso-relacionados__grelha" id="curso-relacionados-grelha"></div>
        </div>
      </section>
      <!-- /SECTION: cursos relacionados -->

      <!-- SECTION: curso-cta -->
      <section class="secao secao--alt" aria-labelledby="curso-cta-titulo">
        <div class="container">
          <div class="secao-cabecalho secao-cabecalho--centro">
            <span class="secao-eyebrow">Junte-se a nós</span>
            <h2 id="curso-cta-titulo">Faça Parte da Comunidade AESOA</h2>
            <div class="secao-divisor"></div>
            <p>Torne-se associado e tenha acesso a condições especiais em todos os cursos e formações da AESOA.</p>
          </div>
          <div class="hero__acoes" style="justify-content:center;">
            <a class="btn btn--primario" href="index.html#torne-se-membro">Torne-se Associado</a>
            <a class="btn btn--contorno-primario" href="cursos.html">Ver Todos os Cursos</a>
          </div>
        </div>
      </section>
      <!-- /SECTION: curso-cta -->
```

- [ ] **Step 2: Extend `initPaginaCurso()`**

Before `container.hidden = false;`, add:

```js
  const relacionadosEl = document.querySelector("#curso-relacionados-grelha");
  relacionadosEl.replaceChildren();
  const relacionados = Object.entries(CURSOS_DADOS)
    .filter(([outroSlug, outroCurso]) => outroSlug !== slug && outroCurso.categoriaSlug === dados.categoriaSlug)
    .slice(0, 3);

  relacionados.forEach(([outroSlug, outroCurso]) => {
    const artigo = document.createElement("article");
    artigo.className = "cartao";

    const imagem = document.createElement("img");
    imagem.className = "cartao__imagem";
    imagem.src = outroCurso.imagem;
    imagem.alt = outroCurso.imagemAlt;
    imagem.width = 480;
    imagem.height = 320;
    imagem.loading = "lazy";
    artigo.appendChild(imagem);

    const corpo = document.createElement("div");
    corpo.className = "cartao__corpo";

    const etiqueta = document.createElement("span");
    etiqueta.className = "cartao__etiqueta";
    etiqueta.textContent = outroCurso.categoria;
    corpo.appendChild(etiqueta);

    const titulo = document.createElement("h3");
    titulo.className = "cartao__titulo";
    titulo.textContent = outroCurso.titulo;
    corpo.appendChild(titulo);

    const texto = document.createElement("p");
    texto.className = "cartao__texto";
    texto.textContent = outroCurso.subtitulo;
    corpo.appendChild(texto);

    const link = document.createElement("a");
    link.className = "cartao__leiamais";
    link.href = `curso-detalhe.html?slug=${encodeURIComponent(outroSlug)}`;
    link.append("Ver curso ");

    const svgNS = "http://www.w3.org/2000/svg";
    const seta = document.createElementNS(svgNS, "svg");
    seta.setAttribute("viewBox", "0 0 24 24");
    seta.setAttribute("fill", "none");
    seta.setAttribute("stroke", "currentColor");
    seta.setAttribute("stroke-width", "2");
    seta.setAttribute("stroke-linecap", "round");
    seta.setAttribute("stroke-linejoin", "round");
    seta.setAttribute("aria-hidden", "true");
    const setaPath = document.createElementNS(svgNS, "path");
    setaPath.setAttribute("d", "M5 12h14M13 6l6 6-6 6");
    seta.appendChild(setaPath);
    link.appendChild(seta);

    corpo.appendChild(link);
    artigo.appendChild(corpo);
    relacionadosEl.appendChild(artigo);
  });

  document.querySelector("#curso-relacionados-secao").hidden = relacionados.length === 0;
```

- [ ] **Step 3: Add the CSS**

Append to `public/assets/css/sections.css`:

```css
.curso-relacionados__grelha {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--espaco-lg);
}
```

- [ ] **Step 4: Verify JS syntax**

Run: `node --check "public/assets/js/main.js"`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify in the browser**

Reload `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`.

Expected: "Cursos Relacionados" shows up to 3 cards from the same `categoriaSlug` ("perioperatoria") — in this case only `fundamentos-enfermagem-bloco-operatorio` shares that category, so exactly 1 card appears, linking to `curso-detalhe.html?slug=fundamentos-enfermagem-bloco-operatorio`. Below it, the "Faça Parte da Comunidade AESOA" CTA section appears with two buttons. Click the related course card link and confirm it navigates to and correctly renders that course's page. No console errors.

- [ ] **Step 6: Commit**

```bash
git add public/curso-detalhe.html public/assets/js/main.js public/assets/css/sections.css
git commit -m "feat: render Cursos Relacionados and final membership CTA section"
```

---

### Task 12: Wire up `cursos.html` "Ver Curso" links

**Files:**
- Modify: `public/cursos.html`

**Interfaces:**
- Consumes: the 8 slugs already present as `data-slug` on each course card's `.cursos__favorito` button (existing markup) — used only as a reference list, not read programmatically.
- Produces: none (pure content edit).

- [ ] **Step 1: Replace the 8 placeholder hrefs**

In `public/cursos.html`, each course card has a line `<a class="cursos__cartao-cta efeito-brilho" href="#">Ver Curso</a>`. There are 8 occurrences (one per course, matching the 8 slugs listed in Global Constraints). For each one, replace `href="#"` with `href="curso-detalhe.html?slug=<slug>"`, using the same slug already present in that card's `.cursos__favorito[data-slug]` a few lines below it. Concretely, make these 8 replacements in order of appearance in the file:

1. `href="#"` → `href="curso-detalhe.html?slug=enfermagem-perioperatoria-avancada"`
2. `href="#"` → `href="curso-detalhe.html?slug=fundamentos-enfermagem-bloco-operatorio"`
3. `href="#"` → `href="curso-detalhe.html?slug=seguranca-doente-sala-operatoria"`
4. `href="#"` → `href="curso-detalhe.html?slug=prevencao-eventos-adversos-cirurgicos"`
5. `href="#"` → `href="curso-detalhe.html?slug=instrumentacao-cirurgica-essencial"`
6. `href="#"` → `href="curso-detalhe.html?slug=workshop-instrumentacao-avancada"`
7. `href="#"` → `href="curso-detalhe.html?slug=gestao-equipas-bloco-operatorio"`
8. `href="#"` → `href="curso-detalhe.html?slug=lideranca-comunicacao-enfermagem-perioperatoria"`

**Do not** touch the `href="#"` on the `<a class="btn btn--contorno-primario efeito-brilho" href="#">Mostrar mais</a>` links inside each card's hover-detail panel — those are a separate, unrelated "expand panel" affordance and stay out of scope for this plan.

- [ ] **Step 2: Verify with a diff**

Run: `git diff public/cursos.html`
Expected: exactly 8 changed lines, each changing only the `cursos__cartao-cta` anchor's `href` attribute (confirm no `Mostrar mais` link was touched).

- [ ] **Step 3: Verify in the browser**

With the local server running, open `http://localhost:8000/cursos.html`, and for each of the 8 "Ver Curso" buttons, click it (or check its `href` via hover/inspect) and confirm it opens `curso-detalhe.html?slug=<correct-slug>` and that page renders that course's title correctly.

- [ ] **Step 4: Commit**

```bash
git add public/cursos.html
git commit -m "feat: link Ver Curso buttons to the new curso-detalhe page"
```

---

### Task 13: Full regression pass across all 8 courses

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: everything built in Tasks 1–12.
- Produces: none — this task only confirms the feature works end-to-end before considering it done.

- [ ] **Step 1: Verify every slug renders without errors**

With the local server running, open each of the following URLs in turn and confirm: the page title updates, hero/pastilhas/stars/meta render, the sticky/mobile enrolment card shows the correct price (and "Vagas limitadas" badge only for `instrumentacao-cirurgica-essencial`), "O Que Vai Aprender" shows 6 items, "Programa do Curso" shows the right module count with total hours matching the `duracao` field, requisitos/sobre/público-alvo render, formador section shows correct initials/stats, avaliações show the right average/total and 3 reviews, cursos relacionados shows courses from the same category (or hides the whole section if none — should not happen for any of the 8, since every `categoriaSlug` has at least 2 courses), and the browser console shows **zero errors** on every page:

- `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada`
- `http://localhost:8000/curso-detalhe.html?slug=fundamentos-enfermagem-bloco-operatorio`
- `http://localhost:8000/curso-detalhe.html?slug=seguranca-doente-sala-operatoria`
- `http://localhost:8000/curso-detalhe.html?slug=prevencao-eventos-adversos-cirurgicos`
- `http://localhost:8000/curso-detalhe.html?slug=instrumentacao-cirurgica-essencial`
- `http://localhost:8000/curso-detalhe.html?slug=workshop-instrumentacao-avancada`
- `http://localhost:8000/curso-detalhe.html?slug=gestao-equipas-bloco-operatorio`
- `http://localhost:8000/curso-detalhe.html?slug=lideranca-comunicacao-enfermagem-perioperatoria`

- [ ] **Step 2: Verify mobile layout**

Using the browser's responsive/device-emulation mode at a width under 900px, reload `http://localhost:8000/curso-detalhe.html?slug=enfermagem-perioperatoria-avancada` and confirm: the enrolment card appears full-width right after the hero (not floating), the fixed bottom bar with price + "Inscrever-se" is visible and does not overlap page content (page has bottom padding), and all sections (accordion, description clamp, reviews grid) remain usable/readable at this width.

- [ ] **Step 3: Verify the not-found state one more time end-to-end**

Open `http://localhost:8000/curso-detalhe.html?slug=curso-que-nao-existe`. Confirm "Curso não encontrado" shows and the "Ver Todos os Cursos" button returns to `cursos.html`.

- [ ] **Step 4: Verify the entry point from `cursos.html`**

Open `http://localhost:8000/cursos.html`, click "Ver Curso" on 2–3 different cards (including at least one filtered/favourited card), and confirm each lands on the correct, fully-rendered `curso-detalhe.html` page.

- [ ] **Step 5: Stop the local server**

Run: `kill %1` (or Ctrl+C in the terminal running `python3 -m http.server`).

This task has no commit — it's a verification-only pass. If any issue is found during Steps 1–4, fix it in the relevant task's files and re-run that task's own verification before returning here.

---

## Self-Review Notes

- **Spec coverage:** all 13 sections from the design spec (`docs/superpowers/specs/2026-08-02-curso-detalhe-design.md`) map to a task: breadcrumb/hero → Task 3–4; sticky card → Task 5; aprender → Task 6; programa → Task 7; requisitos/sobre/público → Task 8; formador → Task 9; avaliações → Task 10; relacionados/CTA → Task 11; not-found → Tasks 3–4; link wiring → Task 12; full regression → Task 13.
- **Type/name consistency checked:** `dados.categoriaSlug` (Task 1/2) matches the property read in Task 11's related-courses filter; `dados.formador.{nome,credenciais,bio,nCursos,nFormandos,avaliacaoMedia}` (Task 1/2) matches every property read in Task 4 (hero) and Task 9 (profile); `licao.tipo` values (`aula`/`pratica`/`avaliacao`, Task 1/2) match the `TIPO_ROTULO` keys and CSS modifier classes in Task 7; the `slug` constant declared in Task 4 is reused (not redeclared) in Tasks 5, 9, and 11.
- **No placeholders:** every task ships literal, final Portuguese content and complete code — no `TBD`, no "similar to Task N", no hand-wavy "add styling".
