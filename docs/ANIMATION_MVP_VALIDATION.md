# Validação do MVP de animações e sequências

Estado em 15/10/2026: implementado e testado por API/DOM e smoke nativo no escopo abaixo.

- Referências: renomear/remover uma pose usada por `motion`, `pose` ou mapeamentos `graphic.motions` é bloqueado, inclusive por Apply JSON. A mensagem identifica consumidores. O bloqueio é conservador para sequências compartilhadas: primeiro altere os consumidores; não existe migração automática global de nomes.
- Concurrent: checkbox visual no inspetor, usando a edição com undo/redo existente. Marcado permite que o próximo passo comece no mesmo quadro. Desmarcado restaura o avanço pela duração.
- Contrato auditado: `timeline`, `previewVisuals` e `Player` já compartilham viagem, salto, retorno, recuo como movimento do alvo, impactos e despacho de mídia. Não foi necessário alterar BattleData nem suas cópias de runtime/template.
- Runtime auditado: o adaptador de apresentação resolve impacto/dano, delega áudio para `gameCue`, usa elevação para salto e mantém camadas de efeitos. Esses caminhos existem; a inspeção de código não comprova qualidade visual ou audibilidade.

Os onze novos casos em `tests/animation-sequences.test.cjs` verificam bloqueios e ausência de mutação dos consumidores, mapeamentos aninhados/defaults, checkbox e cronologia de viagem/salto/recuo/impacto/som/flash sobrepostos. A sequência é exercitada igualmente para aliados e inimigos, espelhando contexto, no editor, runtime e cópia template. Impacto e som são despachados uma vez no quadro esperado; salto atinge o ápice e retorna ao chão; movimento retorna à origem.

`scripts/smoke-animation-sequences-windows.cjs` passou sobre build preparado. Usa NW.js e WebDriver locais e os formulários reais para os dois lados, testa rejeição visual/JSON e alternância de Concurrent, depois reutiliza o harness de salvar/reabrir e batalha com ataque forçado. Interação DOM automatizada não equivale a clique físico; cronologia é inspecionada por API. Não comprova som audível, trajetória renderizada quadro a quadro, efeitos gráficos completos, ataque inimigo por mouse ou toda combinação de comandos.

`patches/zzzz-animation-mvp.patch` contém somente o delta dos dois módulos frente aos baselines preservados e os três novos textos em português frente ao catálogo já patchado. `git apply --reverse --check` no upstream atual passou. A aplicação desde a revisão fixada e os cinco patches anteriores pertence ao prepare coordenado; não executar prepare em paralelo.

Evidências nativas: `artifacts/windows-smoke-brmlch` (smoke geral passou), `artifacts/pose-authoring-smoke-7SbqZv/animation-sequences.json` (controles ator/inimigo), `artifacts/pose-authoring-smoke.json` (status passed, dano e erros vazios), capturas `pose-editor.png` e `battle.png` na mesma pasta. O primeiro ensaio específico falhou porque o harness compartilhado preservava a habilidade 1 do starter; o smoke específico agora fixa dano 100 apenas no fixture temporário e salva antes da execução. Não altera o runtime nem projetos do usuário. A batalha por teclado tem cobertura separada em `STARTER_PROJECT.md`.
