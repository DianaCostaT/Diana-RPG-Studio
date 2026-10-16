# Preparar combate

Estado: implementado e testado por Node em 16/10/2026. A validação visual no
editor Windows permanece pendente.

O botão existente de teste de batalha abre uma superfície em português chamada
**Preparar combate**. Ela reúne, antes da execução:

- o grupo de inimigos, com ID, nome e contagem;
- os fundos inferior e superior selecionáveis em `img/battlebacks1` e
  `img/battlebacks2`;
- os heróis, com ID, nível e estado do recurso;
- os inimigos do grupo, com ID, posição, estado oculto e estado do recurso.

O resumo é auditável: cada recurso é `válido`, `AUSENTE`, `não selecionado`,
`não verificado` (quando o host não disponibiliza a consulta de imagens) ou
`não aplicável` para um modelo 3D configurado. Um fundo explicitamente
selecionado e ausente, um grupo vazio/inexistente ou um ID de herói/inimigo
inexistente impede o teste e mostra o motivo.

Ao fechar ou testar, o editor persiste o artefato versionado
`System.json.dianaBattlePreparation`. Ele contém `version`, `troopId`,
`backgrounds`, `party`, `enemies`, `counts`, `valid` e `issues`, além dos
campos de teste já existentes `testBattlers` e `testTroopId`. Na execução,
os fundos continuam sendo gravados somente no `Test_System.json`, preservando
os fundos padrão do jogo.

Esta superfície usa `BattleTestConfigModal`, `Troops.json`, `Actors.json`,
`Enemies.json`, `BattlePresentation.json` e os campos de teste existentes do
RPGReactor; não cria outra engine nem outro formato de batalha.
