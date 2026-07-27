# Página de Detalhe de Notícia — Design

Data: 2026-07-27

## Objetivo

Criar `public/noticia.html`, um template único e reutilizável que renderiza o artigo completo de uma notícia a partir de um parâmetro `?slug=` na URL, para o qual os botões "Ler mais" de `noticias.html` passam a apontar (excepto a notícia do Congresso, que mantém a ligação direta a `congresso-nacional-2025.html`, já muito mais completa).

## Arquitetura

- **Sem backend/CMS** — site 100% estático, tal como o resto do projeto.
- `public/assets/js/noticias-dados.js`: objeto `NOTICIAS_DADOS` com uma entrada por slug (título, categoria, data, imagem, alt, corpo em array de parágrafos, citação em destaque opcional). Carregado apenas em `noticia.html`, antes de `main.js`.
- `initPaginaNoticia()` em `main.js`: lê `new URLSearchParams(location.search).get("slug")`, procura em `NOTICIAS_DADOS`; se encontrado, preenche o DOM (título, categoria, data, imagem, parágrafos, citação, notícias relacionadas, partilha); se não encontrado (slug em falta ou inválido), mostra o estado `#noticia-nao-encontrada` e esconde o resto.
- Tempo de leitura calculado no cliente: `Math.max(1, Math.round(totalPalavras / 200))` minutos.

## Estrutura visual da página

1. **Hero editorial**: imagem em full-bleed (`background-image` inline definido por JS) com gradiente escuro, breadcrumb + "← Voltar às notícias", pastilha de categoria, título grande a branco, meta (data · X min de leitura).
2. **Corpo do artigo**: coluna centrada (~700px), primeiro parágrafo com estilo de "lead" (maior, mais forte), restantes parágrafos normais, um pull-quote a meio (aspas grandes, barra lateral verde, texto em itálico maior) — sem atribuição a uma pessoa específica (evita inventar citações de indivíduos reais), antes atribuído genericamente ("Nota da Direção da AESOA" ou apenas destacado como frase-chave do artigo sem atribuição pessoal).
3. **Barra de partilha**: WhatsApp / Facebook / LinkedIn / Email, com `href` gerado dinamicamente a partir do URL e título da página (`https://wa.me/?text=...`, `https://www.facebook.com/sharer/sharer.php?u=...`, `https://www.linkedin.com/sharing/share-offsite/?url=...`, `mailto:?subject=...&body=...`). Barra lateral fixa em desktop (`position: sticky`), linha horizontal acima do corpo em mobile.
4. **Notícias relacionadas**: grelha com as restantes notícias de `NOTICIAS_DADOS` (excluindo a atual), máx. 3, reaproveitando a classe `.cartao` já usada em `noticias.html`.
5. **CTA final**: "Torne-se Associado" / "Ver todas as notícias", mesmo padrão das outras páginas.
6. **Estado "não encontrado"**: se o slug não existir, mostra título "Notícia não encontrada", texto breve, e botão para `noticias.html`. O resto da página (hero, corpo, relacionadas) fica oculto.

## Conteúdo dos 4 artigos

### `parceria-hospitais`
- Título: AESOA reforça parceria com hospitais de Luanda para formação prática
- Categoria: Parcerias · Data: 11 de Julho de 2026 · Imagem: `assets/img/site/reforcaparceria.jpg`
- Corpo:
  1. A AESOA assinou um novo protocolo de colaboração com um conjunto de hospitais de Luanda, permitindo que associados em processo de certificação realizem estágios supervisionados em sala operatória.
  2. O protocolo nasce da constatação de que a formação teórica, por si só, não é suficiente para preparar enfermeiros perioperatórios para a realidade do bloco operatório. Os estágios vão decorrer sob supervisão direta de enfermeiros especialistas, com avaliação contínua do desempenho.
  3. Pull-quote: "Formar bem é também abrir portas para que os nossos associados pratiquem em segurança, acompanhados por quem já domina a técnica."
  4. Cada associado elegível poderá candidatar-se através da sede da AESOA, sendo as vagas atribuídas por ordem de inscrição e por prioridade a quem está mais próximo da conclusão do processo de certificação.
  5. Esta parceria é o primeiro passo de um plano mais amplo da AESOA para levar acordos semelhantes a outras províncias, à medida que novos hospitais manifestem interesse em colaborar com a formação prática dos enfermeiros perioperatórios.

### `boas-praticas-instrumentacao`
- Título: Novo referencial de boas práticas em instrumentação cirúrgica
- Categoria: Boas Práticas · Data: 2 de Julho de 2026 · Imagem: `assets/img/site/instrumentais.jpg`
- Corpo:
  1. O Conselho Fiscal da AESOA concluiu a elaboração de um referencial nacional de boas práticas em instrumentação cirúrgica, com o objectivo de uniformizar critérios entre hospitais e províncias.
  2. O documento cobre áreas como a contagem de instrumentos e compressas, os protocolos de esterilização, as listas de verificação de segurança cirúrgica e a organização da mesa de instrumentação por tipo de intervenção.
  3. Pull-quote: "Um referencial comum protege o doente e dá a cada enfermeiro perioperatório uma base clara sobre o que se espera do seu trabalho, seja qual for o hospital onde exerce."
  4. A implementação será gradual: nos próximos meses, a AESOA vai promover sessões de esclarecimento para associados, com o documento disponível para consulta na sede e no portal online.
  5. O referencial será revisto periodicamente pelo Conselho Fiscal, incorporando sugestões dos associados e as boas práticas mais recentes reconhecidas internacionalmente na enfermagem perioperatória.

### `workshop-benguela`
- Título: Workshop de Instrumentação Cirúrgica chega a Benguela em Outubro
- Categoria: Eventos · Data: 26 de Maio de 2026 · Imagem: `assets/img/site/Workshopinstrumentacao.jpg`
- Corpo:
  1. Depois de sessões bem-sucedidas em Luanda, o Workshop de Instrumentação Cirúrgica da AESOA chega pela primeira vez a Benguela em Outubro de 2026, aproximando a formação prática dos enfermeiros fora da capital.
  2. O workshop é inteiramente prático, organizado em pequenos grupos, e cobre a preparação de mesas de instrumentação para os tipos de cirurgia mais comuns, além de técnicas de manuseamento seguro do instrumental.
  3. Pull-quote: "Levar esta formação a Benguela é um passo concreto para que a excelência técnica não dependa do código postal de quem cuida."
  4. Estão especialmente convidados enfermeiros de Benguela e das províncias vizinhas, com condições de inscrição facilitadas para associados da AESOA.
  5. As inscrições já estão abertas junto da AESOA, com vagas limitadas para garantir o acompanhamento próximo de cada participante ao longo do workshop.

### `curso-perioperatoria`
- Título: Inscrições abertas para o Curso de Enfermagem Perioperatória Avançada
- Categoria: Eventos · Data: 5 de Junho de 2026 · Imagem: `assets/img/site/Gestao-Perioperatoria.jpg`
- Corpo:
  1. Estão abertas as inscrições para o Curso de Enfermagem Perioperatória Avançada, com início em Setembro de 2026 em Luanda, dirigido a enfermeiros que querem aprofundar competências técnicas e de liderança na sala operatória.
  2. O programa é intensivo e combina técnicas cirúrgicas actuais, segurança do doente e gestão de equipas, numa lógica que vai além do domínio técnico individual para preparar também futuros responsáveis de equipa em bloco operatório.
  3. Pull-quote: "Um enfermeiro perioperatório avançado não domina só a técnica — sabe também liderar a equipa que protege o doente em cada cirurgia."
  4. As aulas vão decorrer em regime misto, combinando sessões teóricas com prática orientada, e serão ministradas por profissionais com experiência reconhecida na área.
  5. Associados da AESOA têm condições especiais de inscrição; os interessados podem candidatar-se através dos canais habituais de contacto da associação.

## Ficheiros a criar/alterar

- Novo `public/noticia.html`.
- Novo `public/assets/js/noticias-dados.js`.
- `public/assets/js/main.js`: nova função `initPaginaNoticia()`.
- `public/assets/css/sections.css`: novo bloco para hero editorial, pull-quote, barra de partilha, estado "não encontrado".
- `public/noticias.html`: os 4 links "Ler mais" (excepto Congresso) passam a `noticia.html?slug=...`.

## Fora de âmbito

- Backend real, CMS, ou API de partilha autenticada.
- Comentários ou qualquer interacção social além dos links de partilha.
- Alterar a notícia/link do Congresso Nacional.
