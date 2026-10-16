# Revisão de aliases de movimentos de sprites

Estado em 2026-10-16: **implementado e testado por API**; interação visual e execução de jogo **não testadas nesta tarefa**.

O contrato de poses já resolve `graphic.motions[motion].pose`, mas a grade Diana procurava apenas `spriteAnimation.animations[motion]` e depois `idle`. Assim, `swing` e `thrust` mapeados para `attack` exibiam repouso quando não existia uma chave literal para esses movimentos.

O patch aditivo `patches/zzzzzzzzz-sprite-motion-aliases.patch`, posterior aos patches existentes, aplica a mesma resolução em `editor/src/battle/BattleData.js` e `runtime/reactor_battle_data.js`. A ordem é chave explícita do movimento, chave indicada por `graphic.motions[motion].pose`, depois `idle`. A animação selecionada continua fornecendo quadros, velocidade e repetição; aliases não sobrescrevem essas propriedades. A validação da grade e o retorno `null` quando não há animação continuam existentes. Não há migração de dados nem encadeamento recursivo de aliases.

Evidências:

- Exportação isolada do commit fixado `dc918245cbf8f10ae6eef4ed8cb54b850fed9caa`, com `git archive`, sem copiar alterações locais do upstream. Todos os patches foram aplicados na ordem usada por `prepare-source.cjs`, começando por `held-poses.patch`; `git apply --check --whitespace=error` passou para o patch novo.
- Cópia validada: `C:\Users\lethe\AppData\Local\Temp\diana-motion-aliases-VPKFAY`.
- Antes do patch novo: 12 testes novos, 8 passaram e 4 falharam, detectando aliases de ataque nas quatro combinações editor/runtime e aliados/inimigos.
- Depois do patch: 41 testes selecionados passaram, sem falhas. A suíte nova cobre `swing`/`thrust` para `attack`, `guard` para `idle`, cadência e término da animação mapeada, prioridade de chave explícita, fallback para alias inexistente e movimento desconhecido, e ausência de `idle`, em editor/runtime e aliados/inimigos.
- Comando com `DIANA_BATTLE_SOURCE` apontando para a cópia isolada: `node --test tests/sprite-motion-aliases.test.cjs tests/diana-sprite-audio-contract.test.cjs tests/battle-poses.test.cjs tests/animation-sequences.test.cjs tests/upstream/diana-battle-held-poses.test.cjs tests/diana-battle-preparation.test.cjs`.

Não foram executados `prepare:editor`, o smoke global ou instalações, conforme divisão de trabalho. O upstream local não foi editado. A integração deve executar a suíte completa e `npm run smoke:windows`; os testes que aceitam `DIANA_BATTLE_SOURCE` devem apontar para fonte preparada contendo este patch. A atualização de `.diana-ai/` fica com o coordenador, fora da propriedade desta tarefa.
