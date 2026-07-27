# Secção de Newsletter em Notícias — Design

Data: 2026-07-27

## Objetivo

Adicionar uma secção de subscrição de newsletter a `public/noticias.html`, para visitantes que querem acompanhar novidades da AESOA por email sem se tornarem associados pagantes (pedido distinto do CTA final já existente "Torne-se Associado").

## Posição

Entre a grelha de notícias (`#lista-noticias`) e o CTA final (`#noticias-cta`), como uma nova secção `#newsletter`.

## Design visual

- Painel em cartão largo (`max-width` ~760px, centrado), fundo em gradiente suave `--cor-primaria-suave` → branco, com selo circular grande contendo um ícone de envelope.
- Título: "Não Perca Nenhuma Novidade".
- Texto curto convidando à subscrição.
- Formulário compacto: campo de email + botão "Subscrever" fundidos numa única barra em pílula (visualmente um só elemento, sem duas caixas separadas).
- Nota de privacidade discreta por baixo do formulário ("Sem spam. Pode cancelar a qualquer momento.").

## Comportamento

Sem backend (consistente com o resto do site): ao submeter, com `preventDefault` + `checkValidity`, mostra uma mensagem de sucesso (reutilizando `.formulario__mensagem--sucesso`) e limpa o campo. Nova função `initFormularioNewsletter()` em `main.js`, mesmo padrão de `initFormularioMembro`/`initFormularioContacto`, chamada adicionada ao `DOMContentLoaded`.

## Código a alterar/criar

- `public/noticias.html`: nova secção `#newsletter`.
- `public/assets/css/sections.css`: novo bloco `.newsletter__*` (painel, selo, barra de email/botão fundida).
- `public/assets/js/main.js`: nova função `initFormularioNewsletter()`.

## Fora de âmbito

- Qualquer outra página do site (fica só em `noticias.html` por agora).
- Integração real com um serviço de email marketing.
