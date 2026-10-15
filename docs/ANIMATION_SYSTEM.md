# Sistema de animação

Estado: 15/10/2026. Há testes unitários e um cenário Windows de poses para aliados e inimigos. A validação visual completa continua parcial; consulte [VALIDATION.md](VALIDATION.md).

## Três conceitos distintos

| Conceito | Editor e dados | Runtime |
| --- | --- | --- |
| Efeito visual de habilidade/evento | `upstream/RPGReactor/editor/src/database/DatabaseAnimationEditor.js`; `data/Animations.json` | `upstream/RPGReactor/runtime/reactor_sprites.js` |
| Sequência de apresentação | `database/DatabaseActionSequenceEditor.js`, `battle/BattleData.js`; `data/ActionSequences.json` | `upstream/RPGReactor/runtime/reactor_battle_data.js`, `reactor_battle_presentation.js` |
| Movimento/pose do combatente | Vínculos e gráficos em `battle/BattlePresentationEditor.js`; passos `motion` | Seleção de quadro em `reactor_battle_data.js` e reprodução em `reactor_battle_presentation.js` |

Os caminhos abreviados de editor acima são relativos a `upstream/RPGReactor/editor/src/`. Uma animação visual não aplica dano por si; a sequência de batalha determina quando ocorre o impacto.

## Formatos observados

O editor existente diferencia animações de sprites pelo campo `frames` e efeitos Effekseer por `effectName`. O código manipula folhas `animation1Name`, quadros e `timings` no formato de sprites; efeitos possuem velocidade, sons e flashes em listas próprias. Há conversão de temporizações entre os formatos, mas mudar formato não assegura conservação integral da composição visual.

O carregador `RR_loadEffekseerEffectFromFile` lê o efeito via filesystem e passa um `ArrayBuffer` do contexto da página; resolve recursos relativos, incluindo texturas, por redirecionamento. Isso trata a separação de contextos Node/DOM do NW.js. O preview web pode exigir aquecimento assíncrono de arquivos; não constitui garantia de publicação web Diana.

`upstream/RPGReactor/editor/src/utils/AnimationPreviewLayer.js` fornece a camada de prévia. `database/ActionSequencePreview.js` apoia formação e manipulação da prévia de ações; `utils/SequencePreview.js` reproduz sequências de BGM com o código de áudio do jogo. Sons e flashes precisam ser comparados com o runtime, inclusive espera pelo término, descarte e repetição.

## Poses e quadros

`graphicFrame` em `battle/BattleData.js` e `runtime/reactor_battle_data.js` calcula recorte de folhas considerando movimento, velocidade e direção. O patch `patches/held-poses.patch` introduz seleção explícita de coluna para pose fixa, sem depender da velocidade do ciclo. Os testes em `tests/upstream/diana-battle-held-poses.test.cjs` descrevem coluna exata, limites do índice e retomada ao limpar a pose; são evidência de intenção verificável, não resultado de execução nesta tarefa.

Poses nomeadas por retângulos estão **implementadas e testadas** em `animation-poses.patch`. O formulário permite criar, renomear e remover poses; editar, adicionar, remover e ordenar quadros; configurar loop e âncoras; e inspecionar um tempo da prévia. Aliados e inimigos usam `graphicFrame` compartilhado no editor e runtime, com duração por quadro em ticks de 60 Hz. O formato existente de efeitos e rigs não foi substituído.

O smoke Windows grava duas poses iguais por meio dos controles reais de ator/inimigo, inicia outro processo e compara retângulos e âncoras de seus sprites. Detalhes e limites do formato estão em [ANIMATION_INCREMENT.md](ANIMATION_INCREMENT.md). Recorte por grade/arraste, reprodução automática e seek por linha do tempo básica estão **implementados e testados** por DOM simulado e ponteiro real Windows. A timeline avançada de efeitos/movimentos continua parcial. Consulte [POSE_AUTHORING_INCREMENT.md](POSE_AUTHORING_INCREMENT.md).

## Trabalho restante e aceite

Na retomada, referências de poses passaram a impedir rename/remove/JSON inválido,
e o inspetor ganhou controle Simultâneo. Onze testes exercitam referências e
cronologia compartilhada para aliados/inimigos, com smoke dos formulários reais.
Veja [ANIMATION_MVP_VALIDATION.md](ANIMATION_MVP_VALIDATION.md). A batalha do
projeto inicial cobre controles por teclado; a comparação audiovisual completa
abaixo continua pendente.

1. Confirmar o contrato final de movimento/pose e sua persistência após salvar/reabrir.
2. Executar regressões para ator e inimigo, quadro inicial/final, índice inválido e velocidade personalizada.
3. Comparar prévia e jogo para sprite, Effekseer, som e flash; verificar pausa, reinício e descarte.
4. Testar efeito ausente e referências inválidas sem travar nem aplicar dano em duplicidade.
5. Registrar uma batalha Windows completa com as animações; o smoke de projeto existente não cobre esse fluxo.

Geradores, 3D e modos de combate adicionais existentes upstream não ampliam o compromisso do MVP Diana. Novos editores avançados e exportação de animações ficam **planejados**, sujeitos a testes e requisitos próprios.


## Interface 2D — 0.2.0

Perfil 2D padrão, escolha 2D + 3D, grade Animações 2 e Tela de batalha integrados. Recursos verificados, contrato de posições no runtime e limites da reprodução clássica estão em [Interface 2D](2D_WORKSPACE.md).
