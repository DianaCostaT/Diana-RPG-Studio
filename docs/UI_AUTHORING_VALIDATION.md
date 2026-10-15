# Autoria visual de parallax e diálogo

Estado: **implementado e testado** no escopo abaixo, em Windows/NW.js local.

`npm run smoke:authoring:windows` passou. Resumo: `artifacts/parallax-ui-smoke.json`.
Rodada integrada: `artifacts/parallax-ui-o3m3Em/`, incluindo projeto salvo e capturas
`empty-folder.png`, `authored.png`, `missing-image.png`, `runtime.png`, `dialogue.png`.
A captura de diálogo foi inspecionada e mostra o texto editado legível no jogo.

## Controles exercitados

O teste usa ponteiro WebDriver sobre controles visíveis e descobertos pelo DOM;
confirma que o alvo não está coberto. Digitação, seleção e slider usam teclado
WebDriver, sem atribuir valores diretamente aos campos ou camadas.

- Abrir o painel pela barra de ferramentas, escolher adicionar névoa sem imagens
  e confirmar a orientação em português sobre `img/parallaxes`.
- Adicionar fundo distante e névoa pelo menu e pela grade de seleção de imagem.
- Digitar acompanhamento de 35%, rolagem horizontal 24 e vertical −6 px/s;
  ajustar opacidade para 75% (191/255) pelo teclado.
- Fechar painel, abrir o NPC existente com duplo clique na lista de eventos,
  renomear, abrir Mostrar texto, substituir diálogo e confirmar pelo botão OK.
- Salvar/reabrir e comparar camadas e comando persistido. Iniciar Novo jogo por
  Enter, confirmar profundidade, opacidade e deslocamento no runtime, e conversar
  com o NPC por Enter. Texto exibido: “Diálogo criado pela interface.”

Preparação do projeto e da imagem original usa cópia de fixture/API; salvar e
reabrir usam API. A autoria das camadas e a edição do evento usam os controles
reais. Não cobre importação pelo seletor de arquivos, criação de evento do zero,
autoria de condições, database inteiro ou todas as opções do parallax.

## Imagens ausentes antes da prévia

`DianaProjectValidation.validateAssets` consulta o resolvedor `RRAssetFiles.findImage`
existente. Verifica imagens de personagem/face do grupo inicial, personagens das
páginas de eventos, tileset e parallax/camadas do mapa atualmente aberto.
Referências vazias são opcionais e avisos repetidos são agrupados. A verificação
não altera arquivos ou referências e aceita os formatos/nomenclatura do resolvedor.

Se houver ausência, a prévia é cancelada com caminho lógico e orientação para
importar ou corrigir a referência. O teste nativo remove temporariamente somente
a imagem do fixture, confirma o diálogo, verifica retorno `false` e restaura a
imagem antes de executar o jogo. O teste Node cobre deduplicação, preservação de
dados e aceitação quando o recurso existe.

Cobertura parcial: não percorre todos os mapas, comandos dinâmicos, animações,
áudio, modelos ou gráficos de batalha. Não substitui auditoria de exportação.
Nenhuma dependência instalada, engine adicionada ou fonte upstream modificada.
