# Referências Quxios para o Diana

Data: 17/10/2026. Origem: https://github.com/quxios (perfil, não arquivo).
Estado: **pesquisa documental concluída; aplicação das propostas planejada**.
Foram consultados a lista pública de 13 repositórios, oito READMEs e os arquivos
indicados abaixo. Não foram instaladas dependências, executados os projetos externos,
copiados código/assets nem alterados editor, formato ou runtime Diana.

## Aprendizados prioritários

### Poses visuais e contrato de animação

[QSpriteEditor](https://github.com/quxios/QSpriteEditor/tree/d2ab429daef7afe059713615bdfa8c601f179362),
especialmente `app/HELP.md`, `app/js/manager/JSONConfig.js`, `JSONPose.js` e
`app/js/display/animated.js`, separa grade/âncora da imagem, poses nomeadas e
sequências de índices. Permite clicar em quadros, reordenar a sequência e visualizar
a animação. Documenta poses de movimento, corrida e repouso por direção, com fallback.

Aplicação proposta: evoluir os controles de poses já existentes no Diana com âncora
visível, seleção de quadros e prévia que use o mesmo contrato do jogo, tanto para
aliados quanto para inimigos. Antes de importar qualquer formato, definir conversão
explícita de índices, direção e unidade temporal. O código externo avança por ticks
de atualização; isso não comprova velocidade estável em diferentes taxas de tela.
Validar dimensões da grade, índices, duração positiva e fallback; conferir dentro
do jogo a fluidez e a escala da Clareira. Não adotar convenções de nome de arquivo
externas como requisito para os recursos Diana.

### Mapas com objetos e camadas

[QMapEditor](https://github.com/quxios/QMapEditor/tree/040c03411edc638417b410fc7cb084fb6a1c3ff0),
`app/HELP.md` e `app/js/renderer/store/JSONMapObj.js`, oferece seleção no mapa e
lista, arraste, encaixe na grade com suspensão temporária por Alt, bloqueio,
ocultação só no editor, âncora, escala, rotação, sprites animados e condições.
A ajuda descreve ordenação por Z e depois Y; a implementação dessa ordenação no
runtime não foi auditada. Escala/rotação visuais não alteram a camada de dados.

Aplicação proposta: melhorar a composição de vegetação, fachadas e elementos
animados mantendo a riqueza da Clareira. Separar visibilidade de edição das
condições de jogo; mostrar colisão explicitamente, sem inferi-la da imagem.
Qualquer novo objeto precisa de serialização, undo/redo, renderização no runtime
e persistência pelo host Tauri. Não há compatibilidade QMap demonstrada no Diana.

### Diálogos, entrada e persistência

- [DialogueFlow](https://github.com/quxios/DialogueFlow/tree/70987ceeb2f04e4acb526ce344489459c85309d7):
  README e `Assets/Scripts/DialogueNode.cs` apresentam nós Start/Message/Choice/Event
  e conexões por identificadores. O autor recomenda melhorar os eventos, hoje
  representados por mensagem textual. Para Diana, um grafo visual deve compilar
  para comandos de evento existentes e validados, com prévia e undo/redo.
- [QInput](https://github.com/quxios/QInput/tree/2f3411673d80e6bd180c34a7942b49d942428c42):
  README descreve ações, remapeamento em execução, salvar/carregar e restaurar
  padrões. Aplicação proposta: ações semânticas compartilhadas entre jogo e prévia,
  com tela visual de configuração e indicação de conflitos. Implementação não auditada.
- [QData](https://github.com/quxios/QData/tree/85a008f11b39750163940d4201e6a8d2ba51eec4):
  README descreve participantes de persistência identificados por UID e captura
  de estado ao mudar de cena. Lição: preservar identidade estável de eventos e
  testar transições/save/load; não substituir o sistema de saves do RPGReactor.
  Atomicidade, migração e resistência a corrupção não foram verificadas.

### Geração por salas autorais

[RandomMapGenerator](https://github.com/quxios/RandomMapGenerator/tree/e86027a0b4d05ab011dfb1013f454a05210893d0),
README e `Assets/Scripts/MapGenerator.cs`, combina salas prontas por conectores,
rejeita sobreposição por bounds e recebe semente explícita. O código calcula
distâncias por conexões; pode terminar ao esgotar salas abertas antes da quantidade
alvo. O limite superior de `Random.Next(minRooms, maxRooms)` é exclusivo.

Aplicação proposta: montar masmorras com módulos desenhados no padrão da Clareira,
com semente, prévia e confirmação antes da gravação. Testar conectividade, saídas,
limites de tentativas, colisões e reprodução por semente; não pressupor que apenas
usar uma semente torna resultados idênticos entre linguagens e versões.

### Host e catálogo de plugins

[ElectronMV](https://github.com/quxios/ElectronMV/tree/85e5a6d03833785d6deec6ebef58d112da34a170)
documenta restauração de tamanho/posição/tela cheia e a diferença entre playtest
e build do host. Essa distinção é útil para a migração Tauri; Electron não será
adotado. O README inclui termos de uso, mas não foi localizada licença raiz na
árvore consultada; não classificar automaticamente como MIT.

[QPluginLibrary](https://github.com/quxios/QPluginLibrary/tree/910c48c8a7440249fbc77bd09208341bd019a22c)
é um aplicativo separado de catálogo; não confundir com o código dos plugins
QMovement/QABS/QSprite. Seu README e o do QMapEditor declaram descontinuação.
Os demos QMV/Quasi não foram baixados nem auditados e não autorizam incorporar
runtime ou assets proprietários. Não foi demonstrada compatibilidade desses
plugins com RPGReactor/PixiJS 8/Tauri.

## Licenças e alcance

Metadados da API GitHub identificaram MIT para QMapEditor, QPluginLibrary,
RandomMapGenerator, DialogueFlow, QData e QInput; as árvores contêm LICENSE.
Isso é uma triagem, não auditoria de dependências ou autorização de todos os assets.
QSpriteEditor não apresentou licença raiz na árvore consultada; a licença da fonte
Roboto é específica desse componente. Nesta pesquisa só foram registradas ideias
e referências, sem incorporação de implementação ou recursos externos.

## Ordem sugerida e validação

1. **Planejado:** comparar lacunas dos controles atuais de poses com as referências;
   priorizar âncora, sequência e consistência da prévia com o jogo.
2. **Planejado:** objetos/camadas com bloqueio e ocultação de edição.
3. **Planejado:** grafo de diálogo e remapeamento visual de ações.
4. **Planejado:** gerador opcional por salas autorais, após estabilizar os formatos.

Esta entrega é documental: não houve integração que exigisse executar testes da
aplicação. Numa implementação futura, executar `npm test` e `npm run smoke:windows`,
separando testes de API, interação visual e jogo. O smoke NW.js não certifica Tauri;
validar editor, salvamento/reabertura, playtest e export no pacote Tauri conforme
`docs/TAURI_MIGRATION.md`. Preservar `docs/CLAREIRA_VISUAL_DIRECTION.md`.
