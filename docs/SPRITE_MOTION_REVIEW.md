# Revisão de aliases de movimentos de sprites

Estado em 2026-10-17: **implementado e testado por API em fonte isolada com patches**; interação visual e execução de jogo **não testadas nesta tarefa**.

`B.graphicPose` já consulta `graphic.motions[motion].pose`, mas `B.spriteGridFrame` não aplicava esse alias ao selecionar uma animação da grade. Por isso, movimentos como `swing` e `thrust`, mapeados para `attack`, podiam mostrar `idle` em vez da animação de ataque.

O patch aditivo `patches/zzzzzzzzz-sprite-motion-aliases.patch` aplica a mesma resolução em `editor/src/battle/BattleData.js` e `runtime/reactor_battle_data.js`: primeiro a chave exata do movimento, depois a pose de `graphic.motions[motion].pose` e, por fim, `idle`. Quadros, velocidade e repetição vêm da animação resolvida. A validação da grade e o retorno `null` quando não há animação válida permanecem preservados; não há migração de dados nem encadeamento de aliases.

`tests/sprite-motion-aliases.test.cjs` cobre `swing`/`thrust` → `attack`, `guard` → `idle`, cadência e término, prioridade da chave explícita sobre o alias, fallback para alias ausente ou desconhecido e ausência de `idle`. Cada cenário é executado para aliados e inimigos nos módulos do editor e runtime.

Evidências desta tarefa:

- O patch foi aplicado após os demais patches numa exportação temporária de `upstream-lock.json` (`dc918245cbf8f10ae6eef4ed8cb54b850fed9caa`). `git apply --check --whitespace=error` e aplicação de todos os patches passaram; o repositório upstream não foi modificado.
- Fonte isolada usada: `C:\Users\lethe\AppData\Local\Temp\diana-motion-aliases-5287c3e9daba479ba1cf334048da6170`.
- `node --test tests/sprite-motion-aliases.test.cjs` com `DIANA_BATTLE_SOURCE` apontado à fonte isolada: **12/12 passaram**.
- `node --test tests/diana-sprite-audio-contract.test.cjs tests/battle-poses.test.cjs tests/animation-sequences.test.cjs tests/upstream/diana-battle-held-poses.test.cjs tests/diana-battle-preparation.test.cjs` com a mesma fonte: **29/29 passaram**.
- O patch tem SHA-256 `bc116f0022de16a3023d1b0966ed40a0a06d6f81e0676d41dd885fe115f6de2c`, igual ao registrado em `build/diana/provenance.json`.

Esta verificação cobre API e seleção persistida da grade; não cobre interação visual nem execução de jogo. Conforme o limite de integração desta tarefa, não foram executados `prepare:editor`, `npm test` ou `npm run smoke:windows`; a integração deve executar os dois últimos checks.