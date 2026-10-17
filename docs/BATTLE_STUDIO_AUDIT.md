# Battle Studio — contrato existente e evolução

Estado: auditoria do código real; ampliação completa da autoria ainda parcial.
Não adicionar outro sistema de batalha nem outro interpretador de sequências.

Fontes upstream fixadas: editor/src/battle/BattleData.js e sua cópia
runtime/reactor_battle_data.js; editor/src/database/DatabaseActionSequenceEditor.js;
editor/src/database/ActionSequencePreview.js; runtime/reactor_battle_presentation.js;
runtime/reactor_fight_stage.js. Alterações entram em patches versionados.

BattleData.step cria comandos com role/duration/easing; timeline calcula start,
end, advance e total, incluindo concurrent e espera por movimento. evaluate
interpreta movimento/câmera/poses; previewVisuals acrescenta os efeitos visuais
da prévia. Player despacha cues e compartilha evaluate com o runtime. O runtime
possui adapters para efeitos reais; não é correto afirmar equivalência de dano,
script, som e estado só porque o canvas do preview desenhou a pose.

| Pedido | Equivalente nativo | Estado/limite |
|---|---|---|
| POSE | pose hold/clear e motion | poses próprias por graphic, mesma infraestrutura ator/inimigo |
| MOVE | move, moveMode e anchor | duração, speed, arc, easing linear/smooth |
| WAIT | wait e waitFor | frames, viagem e mídia; concurrent já existe |
| ATTACK | motion + weapon + impact | coreografia não deve aplicar dano duas vezes |
| PROJECTILE | projectile | trajetória e arma/asset no contrato existente |
| EFFECT | animation, picture, tint, whiten | distinguir apresentação de efeito de gameplay |
| DAMAGE | impact | aplica ação com fórmula e regras atuais; hp é alteração explícita |
| CAMERA | camera | existe no avaliador; aceite de cada modo de cena pendente |
| SOUND | sound/se/bgm/bgs | adapters reais; prévia não prova reprodução completa |
| SHAKE | shake | comando nativo, feedback de tela |
| FLASH | flash | comando nativo RGBA/duração |
| RETURN | move anchor home e preset Return Home | usar posição de origem do combatente |
| STATE | state | alteração no runtime, não confundir com estado de animação |
| VICTORY | motion victory / binding de estado | animação própria, não encerra batalha sozinha |
| DEATH | motion dead / binding de estado | animação própria, não define HP sozinha |

Primeiro incremento seguro: expor presets/nomes amigáveis no editor existente,
compilando para esses mesmos passos, sem mudar arquivos ActionSequences antigos.
Não transformar ATTACK/DAMAGE em aliases independentes que dupliquem impact.
Edição deve conservar preview, validação de referências e undo/redo existentes.

Regressões necessárias: comparar timeline/evaluate do editor preparado e runtime
em vários frames, com aliados e inimigos, interrupção de movimento simultâneo,
retorno à origem e duração. Os comandos com efeitos precisam também de adapter
e jogo executado; testes de dados não substituem isso. Condicionais, scripts,
espera por mídia e múltiplos alvos impedem prometer replay idêntico sem contexto.

O requisito recebido termina em “suportar easing/m”. Não assumir requisitos
adicionais além dos já recebidos enquanto a continuação não estiver disponível.
