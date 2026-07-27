# Página de Contactos da AESOA — Design

Data: 2026-07-27

## Objetivo

Criar `public/contactos.html`, seguindo a estrutura visual e técnica já estabelecida pelo projeto (`about.html`, `estatutos.html`, `congresso-nacional-2025.html`), para que os visitantes encontrem os contactos da AESOA e possam enviar uma mensagem.

## Estrutura da página

Esqueleto de ficheiro idêntico às restantes páginas: `<head>` com os mesmos links de fontes/CSS, topbar, `<header class="cabecalho">` com a mesma navegação (o link "Contactos" do menu principal recebe `aria-current="page"`), `<main id="conteudo-principal">`, rodapé idêntico, botão-topo, `assets/js/main.js`.

### 1. Hero (`pagina-hero`)
- Sem vídeo/imagem de fundo (fundo sólido institucional, como em `estatutos.html`).
- Breadcrumb: Início › Contactos.
- H1: "Contactos".
- Parágrafo curto de boas-vindas, convidando o visitante a contactar a AESOA.

### 2. Cartões de contacto (3 cartões `.mvv__cartao` + `.selo`)
Reutiliza exatamente os dados já usados no rodapé do site (fonte única, sem duplicar informação divergente):
1. **Telefone** — +244 923 000 000 (link `tel:`).
2. **E-mail** — geral@aesoa.ao (link `mailto:`).
3. **Morada** — Rua Amílcar Cabral, Bairro Maianga, Luanda, Angola.

Sem cartão de horário e sem mapa (decidido).

### 3. Formulário de contacto
Cartão centrado, reutilizando o padrão visual de `.inscricao__formulario` (`congresso-nacional-2025.html`):
- Nome completo (obrigatório)
- E-mail (obrigatório)
- Telefone (opcional)
- Assunto — `<select>`: Informação Geral, Adesão de Sócio, Parcerias e Patrocínios, Imprensa, Outro (obrigatório)
- Mensagem — `<textarea>` (obrigatório)
- Consentimento (checkbox obrigatório, mesmo texto/estilo dos outros formulários)
- Botão "Enviar Mensagem"

Sem backend por agora: ao submeter (com `preventDefault` + `checkValidity`), mostra uma mensagem de sucesso (`.formulario__mensagem--sucesso`) e limpa o formulário — mesmo padrão de `initFormularioMembro`/`initFormularioCongresso` em `main.js`. Nova função `initFormularioContacto()` no mesmo ficheiro, chamada no bloco `DOMContentLoaded` existente.

### 4. CTA final — Redes sociais
Secção final com os 4 canais confirmados pelo utilizador: **LinkedIn, Facebook, Instagram e WhatsApp**. Reutiliza o grupo de ícones `.rodape__redes` (mesmos ícones SVG de Facebook/LinkedIn/Instagram já usados no rodapé, `href="#"` como as restantes redes do site, que ainda não têm URL real definida) e adiciona um ícone/link do WhatsApp (`https://wa.me/244923000000`, a partir do mesmo número de telefone já usado em todo o site) — o único link funcional desta secção, os restantes ficam como placeholder `href="#"` tal como já acontece no rodapé.

## Código a alterar/criar

- **Novo**: `public/contactos.html`.
- **`public/assets/js/main.js`**: nova função `initFormularioContacto()` (mesmo padrão fake-submit dos outros formulários), chamada adicionada ao `DOMContentLoaded`.
- **Atualização de navegação**: o link "Contactos" do menu principal (atualmente `href="#"` placeholder) passa a `href="contactos.html"` em `index.html`, `about.html`, `estatutos.html`, `congresso-nacional-2025.html` e `galeria.html`. Os links do rodapé nessas páginas já apontam corretamente para `contactos.html` e não precisam de alteração.
- Sem novo CSS necessário — reutiliza `.mvv__cartao`, `.selo`, `.inscricao__formulario`, `.formulario__*`, `.rodape__redes` já existentes. Pode ser preciso um pequeno ajuste de CSS para o ícone do WhatsApp reutilizando o mesmo estilo circular dos outros ícones sociais.

## Fora de âmbito

- Ligação real a um serviço de envio de email/backend para o formulário.
- URLs reais das páginas de Facebook/LinkedIn/Instagram da AESOA (mantidos como placeholder `href="#"`, tal como já acontece no rodapé de todas as páginas existentes).
- Mapa incorporado (decidido não incluir).
