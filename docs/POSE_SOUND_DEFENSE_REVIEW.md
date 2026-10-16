# Revisao de som e defesa por pose

Estado em 16/10/2026: **testado por API na fonte isolada**; validacao de interacao visual e execucao de jogo permanece **nao testada** nesta revisao.

O contrato cobre `B.motionGraphic(graphic, motion, armors = [])`, `B.poseKey` e `B.poseSound` tanto no editor quanto no runtime. Para `guard`, a variante de escudo e escolhida quando ha uma armadura com `etypeId: 2`; sem ela, a variante de arma e usada. A composicao deve retornar um novo grafico e preservar o original, incluindo direcao, para que a selecao de defesa nao vire o battler de costas.

`P.updatePoseSound(sprite, graphic, motion)` usa a chave de pose resolvida como sentinela por sprite. Consequentemente, a mesma pose nao toca outra vez a cada quadro ou reinicio do loop, mas volta a tocar ao sair e entrar novamente; sons explicitamente configurados para status distintos conservam chaves distintas, mesmo quando compartilham o atlas de repouso. As configuracoes em `graphic.poseSounds[motion]` aceitam apenas nomes simples e normalizam volume, pitch e pan para os limites do runtime.

## Evidencia de API

Com `DIANA_BATTLE_SOURCE=C:\Users\lethe\AppData\Local\Temp\diana-motion-aliases-VPKFAY`, `tests/pose-sound-defense.test.cjs` verifica editor/runtime em paridade, aliados e inimigos, arma/escudo, preservacao do objeto original, aliases, sanitizacao de SE e entrada/sair/retornar de pose. O teste de runtime tambem exige que um `graphicMotion` de status para `guard` selecione a variante defensiva e seu SE.

## Evidencia visual

Nao executada nesta tarefa. O editor expoe por pose o seletor da biblioteca `audio/se`, teste unico, volume e tom; pan permanece no contrato JSON avancado. Ainda deve ser validado no jogo Windows que aliados e inimigos mantem a orientacao e reproduzem o SE uma unica vez ao entrar em cada pose/status.
