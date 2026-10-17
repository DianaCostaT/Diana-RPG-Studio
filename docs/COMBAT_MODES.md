# Modos de combate e combos

Estado: **implementado e testado por Node; montagem do combate no cenário validada no Windows** em 16/10/2026. O smoke confirma a criação da cena de batalha com o mapa de campo ativo; não valida qualidade audiovisual nem o combate tático completo.

`System.json` pode conter `dianaCombat`:

```json
{
  "version": 1,
  "mode": "side",
  "combos": [
    { "id": "corte-em-dupla", "skillIds": [4, 8], "resultSkillId": 11, "autoExecute": true }
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

`mode` é `side` ou `field`. A tela oferece seletor visual de modo, botão para
ativar a preparação, controles de grade/movimento/alcance, grade clicável de
obstáculos e prévia de rota com origem e alvo editáveis. A preparação tática
fica recolhida por padrão e identificada como experimental: ela guarda
parâmetros e calcula uma prévia de planejamento, mas ainda não inicia nem
controla uma batalha tática.

Cada combo tem ID curto unico e de 2 a 4 `skillIds` distintos, todos existentes; ha no maximo 24 regras. `resultSkillId`, quando presente, tambem precisa existir. Os controles permitem adicionar, editar e remover regras, escolher habilidades visualmente e ativar `autoExecute`. A sequencia e contada por combatente: um inimigo nao herda a sequencia de um aliado. Ao completar a sequencia, o resultado pode ficar disponivel para escolha ate o fim da batalha ou, com `autoExecute: true`, executar uma habilidade final uma vez depois do golpe atual. A habilidade final nao e contabilizada novamente como passo do combo.

No modo de campo, o cenário atual permanece visível. Aliados usam as posições
do jogador e seguidores, e o inimigo principal usa a posição do evento que
iniciou o encontro quando ela estiver disponível; os demais recebem uma formação
segura na tela. Apenas participantes do encontro são ocultados no cenário, de
forma persistente durante a batalha, preservando NPCs e veículos.

O patch `zzzzzzzzzzz-combat-modes.patch` carrega o módulo no runtime após as
camadas de batalha.

## Evidência Windows

`node scripts/smoke-field-combat-windows.cjs` passou usando a cena real de
batalha no projeto `artifacts/defense-sound-UtTvC1/Defesa e vozes`. O mapa
80×64, 28 sprites de personagens, enquadramento do aliado na posição do
jogador e ocultação dos fundos laterais foram confirmados; captura em
`artifacts/field-combat-wjw8RH/batalha-no-cenario.png`. Este resultado cobre
montagem/runtime da cena, sem homologar transições, som, combos ou tática.

## Golpe final automático — 16/10/2026

**Implementado e testado por API/DOM:** o editor permite marcar `Executar automaticamente` numa regra de combo. Depois da sequência configurada, a habilidade final é enfileirada uma vez após o golpe corrente; o próprio golpe final não volta a contar para a sequência. A opção é validada e opt-in, mantendo as regras antigas sem mudança. Cobertura em `tests/combat-modes.test.cjs` verifica enfileiramento, alvo, ordem e prevenção de recursão.

**Ainda não testado em jogo Windows:** uma batalha real usando a opção automática. O modo de campo e o modo tático também ainda não têm homologação audiovisual/jogável completa.
