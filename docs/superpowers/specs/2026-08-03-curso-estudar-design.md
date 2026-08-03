# Página de Estudo do Curso (estilo player da Udemy) — Design

Data: 2026-08-03

## Objectivo

Criar `public/curso-estudar.html`, um template único e reutilizável (via `?slug=`) que simula a experiência de "estudar o curso" da Udemy — player de vídeo + separadores de conteúdo + barra lateral com o programa do curso — adaptado à realidade actual da AESOA: site 100% estático, sem contas de utilizador nem vídeo real. Fecha o ciclo iniciado com `curso-detalhe.html`: o aluno já pode ver o curso, inscrever-se, e agora também "entrar" na sala de aula.

Referência visual: prints fornecidos pelo utilizador da interface de aluno da Udemy (player + "Conteúdo do curso" lateral + separadores "Visão geral"/"Avaliações" por baixo do vídeo).

## Arquitectura

- Sem backend — mesmo padrão estático de `curso-detalhe.html`.
- Reaproveita `CURSOS_DADOS` de `public/assets/js/cursos-dados.js` (nenhum campo novo é obrigatório; usa `programa`, `descricao`, `oQueVaiAprender`, `requisitos`, `publicoAlvo`, `formador`, `reviews`, `avaliacaoMedia`, `distribuicaoEstrelas`).
- Nova função `initPaginaEstudo()` em `main.js`, seguindo o mesmo padrão de `initPaginaCurso()`: lê `slug` da query string, procura em `CURSOS_DADOS`; se não encontrado, mostra o mesmo estado "curso não encontrado".
- **Navegação interna sem reload**: trocar de aula na barra lateral não recarrega a página — uma função `renderAula(indiceModulo, indiceLicao)` actualiza apenas o título da aula, o botão de "concluída" e o estado activo na barra lateral, e sincroniza a URL via `history.replaceState` (`?slug=...&modulo=X&licao=Y`) para que a aula actual seja partilhável/persista num refresh. Isto isola a lógica em funções pequenas e independentes, preparando o terreno para uma futura migração para componentes Vue.
- Progresso do aluno guardado em `localStorage`, mesma técnica já usada em `initFavoritosCursos()`:
  ```js
  // chave: "aesoa-cursos-progresso"
  { "<slug>": ["0-0", "0-1", "1-2", ...] }  // "moduloIndex-licaoIndex" de aulas concluídas
  ```
- Ponto de entrada: em `curso-detalhe.html`, novo botão secundário no cartão de inscrição — "Já é aluno? Continuar Curso" — com `href="curso-estudar.html?slug=<slug>"`, colocado imediatamente a seguir ao botão "Inscrever-se Agora".

## Modelo de dados usado (sem alterações ao schema existente)

Nenhum campo novo em `CURSOS_DADOS`. A página usa o `programa` (módulos/lições, já com `titulo`, `duracao`, `tipo`, `descricao`, e `preview` opcional) tal como está hoje.

Estado de progresso (novo, só em `localStorage`, não em `CURSOS_DADOS`):
```js
{
  "enfermagem-perioperatoria-avancada": ["0-0", "0-1", "0-2"]
}
```

## Estrutura visual da página

1. **Barra superior fixa** (fundo escuro, ~64px): logótipo AESOA pequeno + link "Voltar ao curso" (para `curso-detalhe.html?slug=...`) à esquerda; título do curso (truncado com ellipsis) ao centro/esquerda; à direita, "Seu progresso: X/Y aulas concluídas" (calculado a partir do localStorage e do total de lições) + botão "Partilhar" (reaproveita o mesmo menu de ícones WhatsApp/Facebook/email do cartão de inscrição).
2. **Coluna principal (esquerda, ~70%)**:
   - Placeholder de vídeo, proporção 16:9, fundo escuro com gradiente sutil, ícone de play centrado, texto "Vídeo desta aula em breve".
   - Por baixo: título da aula actual + botão toggle "Marcar como concluída" / "Concluída ✓" (estado visual muda ao clicar, grava no localStorage).
   - Separadores: **Visão geral** (activo por padrão) e **Avaliações**.
     - *Visão geral*: parágrafos de `descricao`, grelha "O Que Vai Aprender" (`oQueVaiAprender`), lista de `requisitos`, cartão do formador (`formador`) — reaproveitando os blocos visuais já existentes em `curso-detalhe.html`.
     - *Avaliações*: média + estrelas + total, barras de distribuição (`distribuicaoEstrelas`), 3 cartões de review (`reviews`) — reaproveitando o bloco visual já existente em `curso-detalhe.html`.
3. **Barra lateral (direita, ~30%, `position: sticky`)**: título "Conteúdo do curso" + resumo "X módulos · Y aulas concluídas de Z"; acordeão por módulo (reaproveita o padrão visual de `curso-programa__modulo` já existente), cada cabeçalho de módulo mostra "concluídas/total · duração"; cada aula é uma linha clicável com: caixa de verificação (estado concluída/não concluída, clicável independentemente de abrir a aula), tipo (pastilha Aula/Prática/Avaliação), título, duração; a aula actualmente seleccionada fica destacada (fundo suave, como já fazemos para a aula de pré-visualização).
4. **Estado "não encontrado"**: mesmo padrão de `curso-detalhe.html` (`#curso-nao-encontrado`), com link para `cursos.html`.

### Aula inicial

Ao abrir a página: se existir progresso guardado para o slug, selecciona a primeira aula **não concluída** (percorrendo módulos/lições em ordem); caso não exista progresso nenhum, selecciona a primeira aula do Módulo 1 (a aula de boas-vindas, já marcada como `preview`). Se a URL já tiver `&modulo=X&licao=Y`, esse par tem prioridade sobre ambos.

## Responsivo (mobile)

Coluna única, por esta ordem: barra superior (mais compacta, sem o texto completo de progresso — só "X/Y"), placeholder de vídeo, título + botão concluir, separadores, e por fim a barra lateral "Conteúdo do curso" (deixa de ser sticky, passa a acordeão normal no fluxo da página) — mesmo espírito do que já foi feito para o cartão de inscrição em `curso-detalhe.html`.

## Ficheiros a criar/alterar

- Novo `public/curso-estudar.html`.
- `public/assets/js/main.js`: nova função `initPaginaEstudo()` + helpers de progresso (`obterProgresso`, `guardarProgresso`, `alternarAulaConcluida`) + chamada no `DOMContentLoaded`.
- `public/assets/css/sections.css`: novo bloco para a barra superior do player, placeholder de vídeo, separadores (tabs), e adaptação do acordeão lateral (checkboxes de conclusão, contagens actualizadas).
- `public/curso-detalhe.html`: novo botão "Já é aluno? Continuar Curso" no cartão de inscrição.

## Fora de âmbito

- Vídeo real, upload/streaming de vídeo.
- Perguntas e respostas, Anotações, Ferramentas de aprendizado, AI Assistant — nenhum destes separadores/painéis é criado, nem como placeholder "em breve", para não sugerir funcionalidade inexistente.
- Classificação do curso pelo próprio aluno, menu de opções (⋮), notas/timestamps dentro do vídeo.
- Autenticação/contas de utilizador — "aluno" é apenas um estado local (localStorage) por navegador, sem qualquer verificação de inscrição real.
- Ordem/bloqueio de aulas (ex.: impedir avançar sem concluir a anterior) — todas as aulas ficam sempre acessíveis, tal como no cartão de pré-visualização já implementado.
