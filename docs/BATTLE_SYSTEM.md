# Sistema de batalha

Estado: 15/10/2026. Um cenário lateral com ator/inimigo, poses persistidas e ataque com dano foi executado no Windows. O aceite completo de combate continua parcial; consulte [VALIDATION.md](VALIDATION.md).

## Camadas e arquivos

| Camada | Responsabilidade | Fonte |
| --- | --- | --- |
| Editor | Configurar apresentação e vínculos de tropas, atores, inimigos, classes, armas, habilidades e itens | `upstream/RPGReactor/editor/src/battle/BattlePresentationEditor.js` |
| Editor | Editar passos, linha do tempo, elenco de prévia, arma, alvos e histórico local | `upstream/RPGReactor/editor/src/database/DatabaseActionSequenceEditor.js` |
| Dados | Esquema, migrações, resolução de vínculos e avaliação de sequências | `upstream/RPGReactor/editor/src/battle/BattleData.js` e `upstream/RPGReactor/runtime/reactor_battle_data.js` |
| Runtime | Carregar dados, resolver a sequência da ação, coordenar sprites, modelos e efeitos | `upstream/RPGReactor/runtime/reactor_battle_presentation.js` |
| Runtime | Regras das ações e combatentes | `upstream/RPGReactor/runtime/reactor_objects_actions.js`, `reactor_objects_battlers.js` |
| Teste de jogo | Iniciar teste de batalha com modo `test&btest` | `upstream/RPGReactor/editor/src/PlaytestManager.js` |

O runtime canônico está em `upstream/RPGReactor/runtime/`. Arquivos homônimos em `template/Demo/js/` são cópias do projeto demonstrativo, não uma segunda engine Diana.

## Contrato existente

`data/ActionSequences.json` contém sequências; `data/BattlePresentation.json` guarda os vínculos. A versão de apresentação observada é 1. O carregador reconhece arquivos `Test_` em teste e o diário `data/.BattlePresentation.pending.json`; valida o conjunto e tenta recuperar os dados anteriores quando há diário pendente. Isso não substitui um ensaio de interrupção de gravação no Windows.

As fases são `prepare`, `movement`, `execute`, `return` e `finish`. As sequências podem representar ação, movimento/estado do combatente ou rotina reutilizável. A resolução usa habilidade/item, arma, classe e ator/inimigo, nesta prioridade; fases herdadas podem continuar fornecidas pelos níveis inferiores. A migração transforma sequências antigas de ação inteira em fases explícitas.

Os tipos básicos observados são `move`, `motion`, `sound`, `animation`, `projectile`, `weapon`, `impact`, `wait` e `camera`. O golpe padrão combina animação e `impact`; a aplicação do efeito deve permanecer no fluxo da ação, evitando dano duplicado. A política `once` delega repetições à habilidade; `authored` aplica um golpe por passo de impacto. O runtime verifica referências de animação e conserva o comportamento existente se a sequência não puder ser utilizada.

## Escopo Diana e pendências

- **Implementado na fonte upstream:** edição de sequências, prévia, vínculos e reprodução descritos acima.
- **Implementado e testado:** seleção de quadros fixos e poses nomeadas por retângulos para atores e inimigos. `held-poses.patch` e `animation-poses.patch` entram no build produzido e passam nos testes das fontes preparadas.
- **Implementado e testado no cenário limitado:** formulário visual, persistência em `BattlePresentation.json`, retângulo e âncora de ambos os sprites em novo processo de jogo, e ataque forçado aplicando dano até nocaute.
- **Implementado e testado:** projeto inicial original com batalha lateral por turnos, comandos por teclado até vitória, derrota permitida e fuga. Evidências e limites em [STARTER_PROJECT.md](STARTER_PROJECT.md). O smoke de poses continua usando ataque forçado e avanço explícito para o turno quando o runtime está aguardando entrada.
- **Parcial:** comparação completa prévia/jogo, alvos múltiplos, combinações de habilidades e sincronização audiovisual renderizada. Modos tático, ação e 3D ficam fora do aceite do MVP.

## Aceite ainda necessário

Criar uma tropa mínima e habilidades com animação, som, movimento, espera e impacto; salvar, reabrir e executar no jogo. Confirmar quantidade de dano, retorno ao estado ocioso e limpeza de efeitos após vitória/fuga. Repetir com ator e inimigo, velocidade personalizada e poses fixas/arbitrárias, registrando revisão, comando, saída e captura; somente então atualizar o estado de validação.

## Interface 2D — 0.2.0

Perfil 2D padrão, escolha 2D + 3D, grade Animações 2 e Tela de batalha integrados. Recursos verificados, contrato de posições no runtime e limites da reprodução clássica estão em [Interface 2D](2D_WORKSPACE.md).
