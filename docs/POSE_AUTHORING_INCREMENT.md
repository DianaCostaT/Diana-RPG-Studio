# Incremento de autoria visual de poses

Estado final: **implementado e testado** por DOM simulado, ponteiro real Windows e execução de jogo. O worker entregou código/testes; o coordenador revisou e executou a integração nativa.

## Comportamento

O mesmo `rectanglePoseEditor` serve atores e inimigos. Quando a imagem está carregada, o canvas mostra a folha em pixels originais, com grade configurável. Clique acrescenta a célula à pose selecionada; a opção Retângulo livre permite arrastar em qualquer direção. Arraste cancelado não grava. Recortes vazios, negativos ou fora da imagem são rejeitados com mensagem traduzida, sem chamar `onChange`; a mesma validação de limites cobre formulário numérico e JSON. A criação inicial respeita imagens menores que 32×48. Âncoras, durações, formulário existente, JSON avançado e gráficos legados permanecem no contrato atual.

Reproduzir usa RAF com relógio absoluto de 60 ticks por segundo; `graphicFrame` continua decidindo o recorte e `graphicPoseDuration` decide a duração. Loop omitido equivale a true. A linha do tempo mostra a posição modular para loop. `false` conclui e mostra idle quando disponível; `once` mantém o último quadro. A reprodução pausa no fim das poses sem loop. Pausar conserva o tempo; reiniciar volta a zero; seek pausa. Nenhuma destas operações chama `onChange` ou altera as poses persistidas.

Fechar o detalhe ou seu ancestral, ocultar a página, remover o DOM e `dispose` interrompem RAF. Observers/listeners são removidos no descarte; resolução assíncrona antiga não recria controles. A prévia de ator/inimigo compartilha cache de promessa por URL, consulta o tick atual no callback e ignora gerações antigas. Descartar cancela imagens pendentes e limpa o cache. O canvas do inimigo é reutilizado durante playback.

## Integração Windows

- `details.rr-rectangle-poses`: abrir também `details.rr-battler-graphic-card` ancestral.
- `canvas.rr-pose-sheet-canvas`: aparece após carga da imagem e seleção/criação de pose. Dimensões intrínsecas são as da imagem; converter coordenadas usando `getBoundingClientRect()`.
- `[data-pose-control="cell-width"]` e `cell-height`: números inteiros positivos, aplicar `change`.
- `[data-pose-control="free-rectangle"]`: checkbox, aplicar `change` (não é select).
- `[data-pose-control="play"]`, `pause`, `reset`: botões.
- `[data-pose-control="timeline"]`: input range com ticks inteiros de zero à duração; aplicar `input`.
- `details.rr-rectangle-poses.posePreview`: `tick`, `playing`, `pause()`, `dispose()` para inspeção e cleanup. Não é API de persistência.
- `.rr-rectangle-poses [role="status"]`: erros traduzidos por `data-i18n-text-source`.

## Evidências

- `node --test tests/pose-authoring.test.cjs`: 8/8 testes passam; grade com escala CSS, células configuráveis, drag inverso/cancelado, limites de ponteiro/números/JSON, seek, reset, relógio, loop omitido, false/once, cleanup e cargas antigas. Cache e desenho são executados em ambos os lados.
- `npm test`: 37/37 na integração final, incluindo oito testes de autoria e dois de integridade Unicode.
- `node --test upstream/RPGReactor/editor/tests/i18n.test.cjs`: 25/25; 11 frases com traduções reais nos 17 idiomas não ingleses.
- `patches/zz-pose-authoring.patch` contém apenas os dois arquivos upstream atribuídos. Replay em diretório temporário, a partir da revisão fixada, após `held-poses.patch`, `animation-poses.patch`, `z-pose-localization.patch`: conteúdo idêntico para ambos os arquivos, normalizando CRLF/LF. Não foi usado `prepare`, instalação ou lançamento nativo.

O teste aceita `DIANA_BATTLE_SOURCE` para validação sobre a fonte exportada; 22 testes passaram contra o build final. `smoke:poses:windows` testou clique de grade, arraste, play/pause/seek e rejeição de limites para atores/inimigos, salvou e verificou os recortes em novo processo runtime. Evidência em `artifacts/pose-authoring-smoke.json` e imagens do mesmo diretório de execução.

A revisão visual detectou rótulos com caracteres perdidos. O patch adicional
`zzz-pose-authoring-localization.patch` corrige 149 entradas e aplica após este
patch. Dois testes impedem placeholders `?` e caracteres de substituição nas
11 frases novas dos 17 idiomas. A qualidade linguística não foi revisada por
falantes nativos de todos os idiomas.
