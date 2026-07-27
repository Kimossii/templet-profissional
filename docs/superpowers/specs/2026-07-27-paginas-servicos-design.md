# Páginas de Serviços da AESOA — Design

Data: 2026-07-27

## Objetivo

Criar as 4 páginas do submenu "Serviços" que ainda apontam para `href="#"` em todas as páginas do site: Consultadoria de Saúde, Eventos & Webinars, Banco com Enfermeiros e Aconselhamento Jurídico. "Cursos práticos" fica fora deste âmbito (a tratar depois, com mais calma).

## Template partilhado

As 4 páginas seguem o esqueleto padrão do site (topbar, cabeçalho/nav, `main`, rodapé, `main.js`) e a mesma sequência de secções, com conteúdo próprio em cada uma:

1. **Hero** (`pagina-hero`, sem vídeo) — selo circular com ícone temático, breadcrumb (Início › Serviços › X), H1, subtítulo curto.
2. **"O Que Oferecemos"** — grelha de 3 cartões (`.mvv__cartao` + `.selo`, já existentes) com ícone, título e texto por oferta concreta do serviço.
3. **"Como Funciona"** — lista de passos numerados (novo componente `.passos__lista`, círculo numerado + título + texto), à exceção de Eventos & Webinars, que usa antes uma grelha de "Próximos Eventos" (reaproveitando `.cartao`, tal como a homepage).
4. **CTA final** — secção com botão(ões) para `contactos.html` (mesmo padrão de outras páginas). No Banco com Enfermeiros, esta secção é substituída por um formulário de registo.

## Conteúdo por página

### Consultadoria de Saúde (`consultadoria-saude.html`)
Base: Art. 3º/2 i) dos Estatutos ("Emitir pareceres sobre planeamento, conceção e estruturação de blocos operatórios...").
- Oferecemos: Planeamento de Blocos Operatórios · Auditoria de Processos · Formação Institucional.
- Como funciona: Contacto inicial → Diagnóstico → Proposta e Execução.
- CTA: "Solicitar Consultadoria" → `contactos.html`.

### Eventos & Webinars (`eventos-webinars.html`)
Hub que reaproveita os 3 eventos já reais e existentes no site (secção "Eventos" de `index.html`): Curso de Enfermagem Perioperatória Avançada (Set., Luanda), Congresso Nacional de Enfermagem Perioperatória (Nov., Luanda — liga a `congresso-nacional-2025.html`), Workshop de Instrumentação Cirúrgica (Out., Benguela). Secção adicional "Webinars" com nota informativa sobre sessões online para associados.
- CTA: "Ver Todas as Notícias" → `noticias.html` · "Torne-se Associado" → `index.html#torne-se-membro`.

### Banco com Enfermeiros (`banco-enfermeiros.html`)
Bolsa de enfermeiros perioperatórios certificados, para hospitais/clínicas que procuram profissionais para turnos, substituições ou contratos temporários.
- Oferecemos: Para Hospitais e Clínicas · Para Enfermeiros Associados · Processo Transparente.
- Como funciona: duas colunas de passos (hospitais vs. enfermeiros).
- Em vez do CTA final padrão: **formulário de registo** ("Registar-me no Banco de Enfermeiros") — nome, email, telefone, província, anos de experiência, disponibilidade (select), mensagem opcional, consentimento. Sem backend (fake-submit, mesmo padrão dos outros formulários). Nova função `initFormularioBanco()` em `main.js`. Nota adicional para instituições: "É uma instituição de saúde? Contacte-nos" → `contactos.html`.

### Aconselhamento Jurídico (`aconselhamento-juridico.html`)
Base: Art. 10º b) (denúncia de assédio/discriminação) e Art. 3º/2 j) ("Emitir pareceres sobre problemas que digam respeito à carreira de Enfermagem").
- Oferecemos: Direitos Laborais · Questões de Carreira · Assédio e Discriminação.
- Como funciona: Exponha a sua situação → Análise Interna → Acompanhamento.
- CTA: "Falar com a Direção" → `contactos.html`.

## Código a alterar/criar

- **Novos**: `public/consultadoria-saude.html`, `public/eventos-webinars.html`, `public/banco-enfermeiros.html`, `public/aconselhamento-juridico.html`.
- **`public/assets/css/sections.css`**: novo bloco `.servico-hero__selo` (reaproveita `.selo` mas em contexto de hero), `.passos__lista`/`.passos__item` (passos numerados), ajustes ao formulário do Banco de Enfermeiros (reaproveita `.inscricao__formulario`/`.formulario__*`).
- **`public/assets/js/main.js`**: nova função `initFormularioBanco()` (mesmo padrão fake-submit).
- **Todas as 8 páginas existentes** (`index.html`, `about.html`, `estatutos.html`, `contactos.html`, `noticias.html`, `noticia.html`, `galeria.html`, `congresso-nacional-2025.html`): atualizar os 4 `href="#"` do submenu "Serviços" para os novos ficheiros, e corrigir a gralha "Aconselhamentos júridicos" → "Aconselhamento Jurídico".

## Fora de âmbito

- "Cursos práticos" (a tratar depois).
- Qualquer backend real (formulário do Banco de Enfermeiros permanece fake-submit).
- Alterar a ordem ou estrutura do menu "Serviços" além de ligar os links e corrigir a gralha.
