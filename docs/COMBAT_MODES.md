# Modos de combate e combos

Estado: **implementado e testado por Node** em 16/10/2026. A execução visual
Windows ainda depende da cópia/carregamento de `src/DianaCombatModes.js` pelo
preparo.

`System.json` pode conter `dianaCombat`:

```json
{
  "version": 1,
  "mode": "side",
  "combos": [
    { "id": "corte-em-dupla", "skillIds": [4, 8], "resultSkillId": 11 }
  ],
  "tacticalPreparation": {
    "enabled": true,
    "columns": 8,
    "rows": 6,
    "movementRange": 4,
    "attackRange": 1,
    "obstacles": [{ "x": 3, "y": 2 }]
  }
}
```

`mode` é `side` ou `field`. A tela de preparação oferece seletor visual de
modo, botão para ativar a preparação, controles de grade/movimento/alcance,
grade clicável de obstáculos e prévia de rota com origem e alvo editáveis.
Essa prévia ajuda a planejar posicionamento; não inicia uma batalha tática.

Cada combo tem ID curto único e de 2 a 4 `skillIds` distintos, todos existentes;
há no máximo 24 regras. `resultSkillId`, quando presente, também precisa existir.
Os controles permitem adicionar, editar e remover regras, informar os IDs da
sequência e escolher opcionalmente a habilidade liberada. O combo é contado por
combatente: uma sequência de inimigo não se mistura à de aliado. Ao completar uma
sequência, a habilidade de resultado passa a aparecer para o aliado até o fim
daquela batalha; ela não é executada automaticamente, não repete golpes e não
adiciona dano.

No modo de campo, o cenário atual permanece visível. Aliados usam as posições
do jogador e seguidores, e o inimigo principal usa a posição do evento que
iniciou o encontro quando ela estiver disponível; os demais recebem uma formação
segura na tela. Apenas participantes do encontro são ocultados no cenário, de
forma persistente durante a batalha, preservando NPCs e veículos.

O patch `zzzzzzzzzzz-combat-modes.patch` carrega o módulo no runtime após as
camadas de batalha.
