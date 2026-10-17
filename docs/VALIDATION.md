# Validação — 15/10/2026

Este relatório integra inspeção, implementação e execuções desta sessão.
Os JSONs em `artifacts/` são resultados locais ignorados pelo Git; arquivos com
estado `running` ou `failed` não representam aprovação. O build é identificado
por revisão, hashes de patches/bootstrap e lockfile em `build/diana/provenance.json`.

## Resultados

| Verificação | Resultado comprovado | Limite |
| --- | --- | --- |
| `npm test` | 37 testes aprovados | Bootstrap, preparo, animações, autoria visual e Unicode; usa fonte upstream com alterações locais |
| `npm run test:prepared` | 22 testes aprovados | Executa contratos de poses, autoria visual e traduções contra fontes do build produzido; Demo excluído |
| `npm run verify:prepared` | Duas exportações equivalentes, 2.212 arquivos iguais | Exclui timestamp da proveniência e link externo de dependências; não prova instalação limpa |
| Cinco suítes de batalha upstream | 92 testes aprovados | Regressões de sequência, poses fixas, apresentação e inimigos; não é teste de todos os comandos por GUI |
| `npm run smoke:windows` | Aprovado no Windows/NW.js 0.118.0 | Criar/abrir/salvar/reabrir, assets originais, duas camadas, ponteiro real, undo/redo, evento, parallax e jogo executado |
| Smoke de poses/batalha | Formulário real para ator/inimigo, persistência, recortes/âncoras no jogo e dano verificados | Ataque é disparado por API; cenário completo de comandos, derrota e efeitos ainda pendente |
| `npm run smoke:poses:windows` | Grade e arraste por ponteiro real, prévia avançando/pausada, seek, bounds e recortes iguais no runtime para ambos os lados | Timeline básica de pose; não cobre timeline de efeitos, comandos de combate por mouse ou derrota |
| NW.js SDK | Versão do executável e SHA-256 do ZIP confirmados contra manifest oficial | Não atesta todos os arquivos extraídos ou instalação em máquina limpa |
| `npm start` | Janela `Luae RPG` visível e respondendo, após corrigir o launcher | Perfil do workspace atual; instalação limpa pendente |
| Suíte `i18n.test.cjs` após correção | 25 testes aprovados | Catálogos e contratos de tradução; qualidade linguística de todos os idiomas não revisada por falantes nativos |
| `npm run test:upstream` | 7.016 testes: 6.950 aprovados, 40 falhas, 26 ignorados | Execução anterior à correção de tradução; não substituir por contagem inferida |

O smoke Windows aguarda a tela inicial desaparecer antes de interagir ou capturar
imagens. Usa PNGs sólidos gerados para o teste, sem arte externa. Pintura é feita
com ações de ponteiro WebDriver; criação de eventos e outros cenários usam APIs
reais do editor. O diálogo é iniciado pela API do evento no runtime, não por um
clique do jogador. Configuração de parallax é nativa upstream, sem plugin.

O cenário de batalha cria personagem, classe, habilidade, inimigo, tropa e estado
de nocaute ID 1 no projeto de teste. O projeto vazio não contém esses registros;
o autor ainda precisa configurá-los. A evidência de animação compara o retângulo
e a âncora dos sprites de ator e inimigo após gravar e iniciar outro processo.

## Falhas da suíte upstream

Log: `artifacts/upstream-tests-20261015.log`. Relatório:
`artifacts/upstream-test-report.json`, produzido por `scripts/report-upstream.cjs`.
A classificação é uma triagem, não prova automática da causa de todos os casos:

- 8 falhas de permissão ao criar symlinks no Windows.
- 9 falhas com `zip`/`unzip` ausentes.
- 1 teste de AppImage que exige Linux.
- 5 possíveis pressupostos de caminhos/capitalização, ainda sujeitos a revisão.
- 15 falhas sem causa concluída nesta execução.
- 2 regressões de catálogos de tradução causadas pelas novas poses, tratadas em
  incremento específico; os 25 testes de i18n passaram depois, e o build final voltou a passar nos smokes. A suíte completa não foi repetida após essa correção.

Não foram alteradas permissões do sistema nem instaladas ferramentas para mascarar
esses resultados. Não se afirma que as demais falhas existiam antes das mudanças:
esta execução não é uma comparação completa contra o upstream intacto.

## Pendências

Timeline avançada de efeitos e movimentos; referências após renomear pose;
foreground/parallax composto; colisão e oclusão; recursos ausentes;
comandos de batalha por GUI; vitória/derrota/fuga e efeitos/som; exportação portátil
e inventário completo de licenças. Instalação limpa Windows continua pendente.

## Atualização integrada — 17/10/2026

- Corrigido `patches/zzzzzzzzzzzzzz-diana-directional-walk.patch`: a contagem do hunk agora inclui todas as linhas, evitando truncamento e erro de sintaxe no runtime exportado. `tests/directional-map-sprites.test.cjs` protege a contagem e a lógica por direção; `node --check build/diana/runtime/reactor_sprites.js` passou.
- `npm test`: **184/184**; `npm run test:prepared`: **63/63**; regressões direcionadas no editor preparado: **18/18**.
- `npm run smoke:windows`: **passou**, incluindo exportação, abertura da tela de título e execução do mapa e diálogo (`artifacts/windows-smoke-LmHvkE`).
- `npm run smoke:starter:windows` e as variantes `escape` e `defeat`: **passaram** por teclado WebDriver real, cobrindo exploração, conversa, batalha, vitória/XP, fuga e derrota com recuperação. Capturas: `images/prints-vila-clareira/06-dialogo-2026-10-17.png` a `10-derrota-2026-10-17.png`.
- Inspeção visual Tauri: editor de batalha, poses e compositor de grade visíveis; seleção do segundo quadro verificada na árvore de acessibilidade. Captura: `images/prints-editor/pose-grid-tauri-2026-10-17.png`. O smoke de jogo ainda é NW.js; migração de playtest/exportação/instalador Tauri permanece parcial.

## Incremento de autoria visual

`zz-pose-authoring.patch` acrescenta grade configurável, arraste livre, validação
de limites, reprodução automática a 60 ticks/s e seek. Preview pausa ao fechar
o painel, ocultar a página ou descartar o registro. Imagens e canvas são
reutilizados durante a reprodução. Dados persistidos e runtime mantêm o esquema.

Na revisão visual foram encontrados caracteres perdidos nos novos rótulos.
`zzz-pose-authoring-localization.patch` corrige 149 entradas; dois testes novos
verificam os 17 catálogos e os acentos brasileiros. O smoke atual registra
recortes (32,64,32,32) por grade e (5,7,20,20) por arraste, iguais para atores e
inimigos em novo processo. Evidência: `artifacts/pose-authoring-smoke.json`.
Detalhes de implementação: [POSE_AUTHORING_INCREMENT.md](POSE_AUTHORING_INCREMENT.md).
# Retomada integrada — 15/10/2026

Esta seção atualiza os resultados históricos anteriores. `npm test`: **60/60**;
`npm run test:prepared`: **31/31**; duas preparações equivalentes:
**2214 arquivos**. O smoke Windows final de integração passou.

- Projeto inicial original com dados essenciais, mapa transitável e recursos MIT;
  texto da janela corrigido e captura de batalha inspecionada.
- Novo jogo, diálogo e batalha por teclado real até vitória, derrota permitida
  e fuga; sem forçar ações por API no runtime. Prévia do editor exibe aviso
  para classe inválida. [Detalhes e limites](STARTER_PROJECT.md).
- Pintura/apagamento por ponteiro, salvar/reabrir, colisão por seta, tile32 e
  sprite48x60, parallax foreground/drift e diálogo/condições/transferência.
  A autoria do fixture usa API. [Mapas](MAP_EVENT_VALIDATION.md).
- Proteção de referências de poses e controle Simultâneo; contratos espelhados
  dos dois lados e smoke DOM. [Animações](ANIMATION_MVP_VALIDATION.md).
- Pacote e export Windows relocados sem junction, com controles do jogo.
  Distribuição pública bloqueada por notices oficiais SDK e revisão de terceiros.
  [Pacote](WINDOWS_PACKAGE.md).

Não constitui aceite integral do MVP: autoria visual completa, comparação
renderizada de efeitos/trajetórias, som audível, colisão customizada e instalação
limpa continuam pendentes. A suíte upstream completa não foi repetida nesta rodada.

## Incremento posterior: autoria visual

`npm test`: **61/61**, build preparado **31/31**, smoke Windows de integração
aprovado. Novo smoke `npm run smoke:authoring:windows` aprovado: criação e
configuração de camadas, seleção de imagem, edição de diálogo e confirmação
por ponteiro/teclado reais; persistência e execução comparadas. Prévia identifica
imagens ausentes e cancela com orientação em português. Capturas inspecionadas e
limites em [UI_AUTHORING_VALIDATION.md](UI_AUTHORING_VALIDATION.md).


## Implementação da auditoria RPG Maker — 16/10/2026

**Implementado e testado:** busca visual em todos os mapas por nome do evento, ID de switch ou ID de variável. Selecionar o resultado carrega o mapa e seleciona o evento no editor. Coberto por `tests/event-search.test.cjs` e smoke NW.js em `artifacts/project-ui-smoke.json`.

**Implementado e testado:** validação pré-playtest de referências cruzadas de grupo, classe, equipamento, habilidade de inimigo, animação e recompensa; checagem de retratos, battlers, poses, eventos, tilesets, parallax e camadas de imagem em todos os mapas. A validação é somente leitura. Cobertura em `tests/project-validation.test.cjs`.

`npm test`: **163/163**. `npm run test:prepared -- build/diana`: **63/63**. `node scripts/smoke-project-ui-windows.cjs build/diana/editor`: aprovado; criou projeto, pesquisou e abriu evento e manteve playtest executando.

**Parcial:** `npm run smoke:windows` continua falhando antes da pintura porque a verificação de hit-target não reconhece o canvas em `scripts/smoke-windows.cjs:100`. O smoke dedicado de projeto passou. Combate tático jogável, combos que executam ações, fluxo de batalha homologado por teclado/áudio e tutorial integrado continuam pendentes conforme a auditoria comparativa.

## Correção do smoke de pintura — 16/10/2026

O smoke geral foi atualizado para mapas grandes: agora calcula uma célula que está no centro visível da câmera em vez de clicar em coordenadas fixas fora da Vila da Clareira, e verifica que a pintura altera a célula selecionada sem assumir um ID de tile antigo. `npm run smoke:windows` passou em `artifacts/windows-smoke-Ggzf0h`, incluindo edição por ponteiro, undo/redo, gravação, eventos, parallax e execução do jogo.

## Validação final da tranche — 16/10/2026

`npm test`: **164/164**. `npm run test:prepared -- build/diana`: **63/63**. `npm run smoke:windows` passou em `artifacts/windows-smoke-W3P38M`; `node scripts/smoke-project-ui-windows.cjs build/diana/editor` passou em `artifacts/project-ui-0r7RQa`, cobrindo busca e seleção de evento; `npm run smoke:battle:windows` passou em `artifacts/battle-smoke-F3oD1I`, cobrindo batalha lateral existente, poses e dano.

O combo com golpe final automático está **implementado e testado por API**, incluindo sequência, enfileiramento após a ação, alvo e bloqueio de recursão. O smoke de batalha acima não configurou `autoExecute`; a validação dessa opção dentro de uma partida real permanece pendente. Combate tático jogável e combate de campo completo também permanecem pendentes.
