# Handoff — 15/10/2026

Base RPGReactor fixada; sete patches aplicados por prepare. Código Diana em src, patches em patches; upstream/build/tools/artifacts ignorados. Preserve todos os arquivos sem commit. Branch diana/phase-0-1. Não instalar, publicar ou fazer commit sem autorização.

Retomada: três workers Orca (run_610451af9442) revisados e liberados. Mapas: smoke real de pintar/apagar, reabrir, colisão por seta, tile32/sprite48x60, foreground/drift e eventos com switch/variável/transferência por Enter. Animações: proteção de referências inclusive JSON e controle Simultâneo; onze testes de cronologia/contratos e smoke DOM dos dois lados. Pacote: editor e export relocados sem junction; controles do jogo aprovados; distribuição pública bloqueada por notices SDK e auditoria de terceiros.

Root integrou projeto inicial original com dados essenciais, progressão e assets geométricos MIT. Novo jogo, diálogo, vitória, derrota permitida e fuga passaram por teclado WebDriver. Janela inicial tinha texto escuro; paleta corrigida e screenshot inspecionada. Prévia do editor verifica dados essenciais e mostra aviso em português sem modificar dados. Não migra projetos existentes.

60 testes Diana e 31 contra build preparado passam. Smokes e detalhes em docs/STARTER_PROJECT.md, docs/MAP_EVENT_VALIDATION.md, docs/ANIMATION_MVP_VALIDATION.md, docs/WINDOWS_PACKAGE.md e artifacts/*-smoke.json. Suíte upstream histórica segue com falhas registradas; não foi homologada integralmente.

Próximo: autoria visual integral de eventos/database/import/parallax; comparar movimentos/efeitos renderizados e som audível. Ainda faltam colisão customizada e aceites Windows limpo. IA e modos futuros continuam planejados. MVP não declarado concluído.

## Incremento posterior: autoria visual e recursos ausentes

61 testes Diana e 31 contra build passam. npm run smoke:authoring:windows passou: parallax e diálogo editados por ponteiro/teclado reais; save/reopen via API e execução por Enter. Evidência artifacts/parallax-ui-smoke.json; captura de diálogo inspecionada. Prévia verifica imagens do grupo e mapa aberto por RRAssetFiles.findImage, agrupa ausências e orienta em português, sem alterar dados. Não cobre todos os mapas, áudio, modelos ou gráficos de batalha. Documentado em docs/UI_AUTHORING_VALIDATION.md. Próximo: importação visual, novo evento/condições e database. Sem upstream novo, instalações ou commits.

## Entrega solicitada: executável hoje e nova interface

Executável pronto: dist/Diana-RPG-Studio-Windows/Diana.exe. Bundle completo, sem depender de Node/Git externos. Launcher original C# compilado com csc local, sem instalação. Smoke do pacote criou/salvou projeto e resolveu runtime/dependências internos; abertura direta teve exit0 e janela respondendo (artifacts/direct-exe-launch.json). Aplicação deixada aberta para o usuário. Novo workspace original em src/DianaWorkspace.js/css: navegação Mapas/Eventos/Dados/Inimigos/Sequências/Recursos/Parallax/Testar, paleta azul e sidebar compacta. Teste de autoria visual passou, incluindo botões do workspace. 61 testes e 31 contra build passaram. O MVP segue parcial e a distribuição pública segue bloqueada pelos notices pendentes; pacote é para teste local. Nenhum commit ou instalação. Próximo: feedback da interface/exe, importação visual, novo evento e database completo.

## Prioridade do usuário: minimamente utilizável — 0.1.1

Executável atual dist/Diana-RPG-Studio-Windows-0.1.1/Diana.exe, pacote separado para preservar versão anterior aberta/arquivos do usuário. Novos projetos: tiles originais, caminho/lago, obstáculos com colisão, aba B visível em vez de A vazia e orientação na paleta. Diálogo Novo projeto descreve conteúdo real e remove opção Demo indisponível. 63 testes e 31 contra build passaram; smoke uso básico escolhe tile/pinta/undo/redo/salva por controles e verifica colisão e caminho no jogo. Smoke do pacote 0.1.1 passou. Veja docs/USAR_AGORA.md e artifacts/basic-use-smoke.json. Criação de fixture via API; seletor nativo de pasta ainda não automatizado. Sem instalação ou commit. Próximo foco continua uso básico: seletor/criação, novo diálogo e dados do personagem, sem expandir modos avançados.
## Versionamento autorizado

O usuário autorizou commit e push. Fontes, patches, testes e documentação entram
na branch `diana/phase-0-1`; builds, executáveis, dependências e evidências locais
permanecem ignorados. O repositório não tinha remoto configurado; URL solicitada
para concluir o push. As observações anteriores de ausência de autorização são históricas.


## Correção crítica 0.1.2: fechar ao criar projeto

Usuário reportou encerramento. Log real da 0.1.1: FATAL file_chooser_impl.cc:35, !base_dir.empty(), dois dumps preservados. Testes anteriores API não cobriam a seleção nativa. Nova src/DianaWindowsFolders.js substitui criar/abrir Windows por navegador interno assíncrono e campo de destino na janela Novo projeto. Sem seletor nativo, helper adicional, instalação ou alteração de segurança. Criação usa métodos existentes, captura erros e bloqueia reentrada. Fluxo real pela interface passou no pacote dist/Diana-RPG-Studio-Windows-0.1.2/Diana.exe: criar, destino ocupado, cancelar, abrir/cancelar e reabrir; arquivos e editor preservados. 70 testes e 31 contra build passam; smoke Windows aprovado. docs/PROJECT_CREATION_FIX.md e artifacts/project-ui-smoke.json contêm evidências. Outros seletores avançados ainda não migrados.

Validação adicional: smoke project-ui-ulHSw4 cobre botão Testar real e filho ativo por 12s, editor responde após fechar filho. npm test 70/70 e smoke Windows windows-smoke-akyLwv passaram. Diana.exe 0.1.2 aberto diretamente; janela Meu jogo com mapa carregado deixada aberta. Não interferir na interação do usuário.

## Interface 2D 0.2.0

Prioridade explícita: separar 2D/3D e aproximar Animações 2 e Battle Screen do RM2003. Perfil persistido; legado preservado; seletor no topo. DianaProjectMode filtra controles e DianaBattle2D reutiliza o banco, snapshots, recortes e runtime. Oito poses por página, aliados/inimigos e rascunho cancelável. Tela de batalha configura apresentação, turnos, mensagens, comandos e posições dos quatro primeiros aliados; runtime patch com revisão diana-0.2.0. Não é réplica pixel a pixel: HUD A/B/C, ranks/comandos por ator e abas Armas/Tipos clássicas continuam parciais. Ver docs/2D_WORKSPACE.md. Executável dist/Diana-RPG-Studio-Windows-0.2.0/Diana.exe. Versões anteriores preservadas; não fechar janelas do usuário.

## Aparência 0.2.1

Marca e ícones Diana originais; launcher com ICO próprio e NW com PNG. Aparência no topo escolhe seis paletas e persiste em rr-settings.theme; tokens substituem cores fixas. Smoke do pacote confirmou todas as paletas, inspeção de mapa/poses e persistência após reiniciar (artifacts/appearance-sh6q8k). 75 testes e 31 contra preparado passaram. Build padrão bloqueado por EPERM desconhecido: usar npm run prepare:editor -- --out build/diana-0.2.1 e empacotar --prepared nesse diretório. Pacote final dist/Diana-RPG-Studio-Windows-0.2.1/Diana.exe, versões anteriores preservadas. Ver docs/APPEARANCE.md. Auditoria de todas as superfícies avançadas permanece parcial.

## Recursos JRPG 0.2.2

Seis PNGs originais imagegen, sete PNGs importados em assets/jrpg-test. Prompts completos, manifesto e licença preservados. Modelo opcional Vila da Clareira no Novo projeto integra parallax/colisão, caminhada, rostos, NPC e combate com poses simétricas; estados mapeados para não renderizar atlas inteiro. Smoke do pacote confirmou quatro recortes reais de ataque de cada lado, dano e ausência de erros (artifacts/jrpg-assets-hdYll2). 78 testes e 31 preparados passaram. Projeto pronto dist/Projetos/Vila da Clareira; pacote dist/Diana-RPG-Studio-Windows-0.2.2/Diana.exe. Usar build/diana-0.2.2 no preparo/empacotamento. Ver docs/JRPG_ASSETS.md. Não substituir projetos existentes.

## Incremento 0.2.3 — autoria clássica e otimização

Executável dist/Diana-RPG-Studio-Windows-0.2.3/Diana.exe. Novo NPC reutiliza commitQuickEvent, valida posição e oferece personagem/retrato/diálogo. Teste do pacote passou por criar, desfazer/refazer, salvar e conversar no runtime. Barra 2D recolhe ferramentas avançadas; híbrido mantém conjunto completo. Cache das oito miniaturas: 968 contra 60 drawImage em ~2s nas versões 0.2.2/0.2.3, sem mutação de dados; não representa desempenho global. 81 testes Diana e 31 preparados aprovados. Ver docs/CLASSIC_AUTHORING.md. MVP permanece parcial, distribuição pública e Windows limpo pendentes. Sem instalações.

## 0.2.5 — tiles editáveis e animação ampliada

Vila da Clareira substitui o parallax achatado por terrenos e objetos nativos
editáveis, mantendo o formato de mapa e a colisão do runtime. Liora tem seis
quadros de caminhada em `$Liora[f6]`; o patch
`zzzzzz-multiframe-cadence.patch` conserva a duração total do ciclo de modo
opt-in, enquanto o sprite de três quadros permanece compatível. Combate ganhou
seis quadros de vitória para aliado e inimigo. `npm test` passou 86/86,
`test:prepared -- build/diana-0.2.5` passou 31/31 e `npm run smoke:windows`
passou em `artifacts/windows-smoke-Kqb6Dg`. Sem instalação, pacote novo ou
commit. Próximo: autoria visual pendente e comparação audiovisual completa.

Atualização de assets: `DianaTileKit` fixa páginas A5/B de 32 px, IDs, flags e
três fixtures nativas: Vila, `Map002` (rota de navegação) e `Map003` (arena de
animação/batalha). `npm run assets:compile` e 10 testes Node focados passaram.
Não houve smoke Windows específico das duas novas fixtures. Elas reutilizam
Liora e Guardião; arte final de personagens distintos continua pendente.

## 0.2.4 — gráficos padrão e dano

Pedido do usuário: substituir gráficos provisórios pelos ilustrados e expressão de dano. Criação padrão passa a usar Vila da Clareira (checkbox marcado; API opt-out false preservado para testes/legado). Não copia $Diana/$Treinador/DianaChao no padrão. Dano.png original gerado com imagegen, compilado nas linhas 4/5 de ClareiraCombate (768×1152), poses damage de 32 ticks sem loop para ambos. Smoke real do pacote renderizou os quatro quadros de dano e ataque de cada lado, com PV reduzido e nenhum erro JS. Projeto pronto dist/Projetos/Vila da Clareira 0.2.4. Executável dist/Diana-RPG-Studio-Windows-0.2.4/Diana.exe. 81+31 testes passaram. Projetos anteriores preservados. Sem instalações.


## Incremento sprites/BGM 16/10/2026

Contrato versionado `dianaSpriteAnimations` em System.json remove a dependencia do novo projeto em `[fN]`; Vila da Clareira usa `$Liora` por grade. O patch `zzzzzzz-diana-sprite-audio-contract.patch`, depois de `held-poses.patch`, reproduz listas arbitrarias no mapa e em ator/inimigo, mantendo legado. A tela de batalha ganhou Grade de animacao Diana compartilhada, com celulas clicaveis, listas, remocao/reordem e duracao/loop; seletor existente escolhe a imagem. `dianaAudioLoops` permite intervalo BGM por segundos e erro para configuracao invalida. `node --test tests/diana-sprite-audio-contract.test.cjs` passou 4/4. Nao foi executado smoke Windows nem audio audivel. Falta encaixe visual da grade no inspetor de personagem do mapa.

## Correção sprites/BGM 16/10/2026

O patch de contrato foi limpo: `actorHomes` permanece no runtime e não há
alterações de BOM/mojibake em `reactor_managers.js`. Loops BGM agora são
instalados no decode WebAudio antes dos ouvintes de reprodução. O compositor
original de grade está conectado a Animações 2 (aliados/inimigos) e ao seletor
de sprites de mapa, com persistência, ordem de quadros e prévia. Testes Node
contra `build/diana-sprite-audio` e `test:prepared` passaram; áudio audível e
smoke visual Windows continuam pendentes.

## Incremento: Preparar combate

Implementado: o modal de teste de batalha agora oferece **Preparar combate** em português brasileiro. Seleciona grupo/tropa e fundos, mantém seleção visual de heróis existente e mostra resumo auditável com IDs, contagens e estados de assets. Persiste `System.json.dianaBattlePreparation` sem substituir fundos padrão; recursos nomeados ausentes e dados inválidos bloqueiam o teste. Patch upstream: `patches/zzzzzzzz-battle-preparation.patch`. Node: `node --test tests/diana-battle-preparation.test.cjs` (3/3). Smoke visual Windows ainda não executado.
# RTP Medieval nativo

Estado: **implementado e testado em Node**. `scripts/compile-native-rtp.cjs` gera 16 PNGs pixel-art determinísticos em `assets/rtp/medieval/pack`; o manifesto contém SHA-256, dimensões, licença MIT e origem exclusivamente project-owned. O pack é copiado para cada novo projeto junto da Vila da Clareira. Efeitos têm contratos em `BattlePresentation.json`; a inspeção visual Windows dedicada continua pendente.

## Clareira restaurada e prévia Windows — 16/10/2026

A regra permanente do usuário está em `AGENTS.md`, `.github/copilot-instructions.md` e `docs/CLAREIRA_VISUAL_DIRECTION.md`: sempre preservar e melhorar a primeira Vila da Clareira, com sprites grandes, cena em camadas e combate fluido. A composição original voltou como placa ilustrada central alinhada à grade dentro do mapa 80×64; o entorno, colisões, NPCs, portas e interiores continuam funcionais. O ponto inicial foi alinhado ao caminho, o pescador fica na ponte com sprite humano e os dois heróis foram espaçados no campo de batalha.

`npm test`: 152/152. `npm run test:prepared -- build/diana-clareira-preview`: 63/63. Smoke WebDriver Windows capturou telas reais sem erros em `artifacts/clareira-restaurada-5z8mlD/`. Executável local `dist/Diana-RPG-Studio-Clareira-preview-2026-10-16/Diana.exe`; `scripts/smoke-ready-windows.cjs` passou. A placa central é ilustrada e não pintável tile a tile; o entorno e interiores são editáveis. Interação manual com cada NPC/interior ainda pendente; distribuição pública segue bloqueada pelos notices/auditoria documentados em `docs/WINDOWS_PACKAGE.md`.

## Navegação da vila e auditoria de quadros — 16/10/2026

Corrigida a prioridade das quatro portas novas para permitir ação adjacente; regressão em `tests/village-expansion.test.cjs`. Suíte completa 153/153; testes do build isolado `build/diana-village-final` 63/63. Smoke Windows percorreu seis passos e acionou a jardineira; confirmou transferência para Map006. No destino, o viewport ficou preto/fade sem avançar de forma confiável, sem erros JS; diálogo e saídas internas seguem pendentes.

`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/audit-sprite-alignment-windows.ps1`: 32 linhas examinadas; moradores e `ClareiraCombate.png` passam centro ±0,5 px e base constante. `$Guardiao.png` foi realinhado pelo compilador sem alterar o original; 12/12 células agora passam centro ±0,5 px e base constante. Próximo trabalho, após homologar interiores: avançar estruturas editor/runtime para personagens, armas e itens com contratos e prévias alinhados.

## Continuação do projeto — validação de combate no cenário (16/10/2026)

`node scripts/smoke-field-combat-windows.cjs` passou no runtime Windows: o combate criou a cena com o mapa de campo 80×64, 28 personagens, aliado enquadrado na posição do jogador e fundos laterais ocultos. Captura: `artifacts/field-combat-wjw8RH/batalha-no-cenario.png`; relatório: `artifacts/field-combat-smoke.json`. O smoke cobre a montagem da cena, sem certificar áudio, combos ou combate tático.

Os testes focados de vila, preparação de combate e modos de combate passaram 18/18. A validação interativa dos interiores segue parcial: Map006 carregou sem erros JS, mas a janela NW.js em segundo plano parou o loop depois da transferência; a captura está escurecida e não comprova conversa/saída. Ver `docs/VILLAGE_EXPANSION.md` e `docs/COMBAT_MODES.md`.

## Simplificação da interface (16/10/2026)

Aplicadas as recomendações de reduzir duplicação visual sem excluir capacidades: seis destinos principais (Mapas, Eventos, Banco de dados, Batalha, Recursos e Testar), mantendo o atalho contextual de Novo NPC; catálogo separado em Recursos com ação de importação; preparação tática recolhida e rotulada como planejamento experimental; perfil 2D + 3D sob opções avançadas. Projeto novo continua 2D e projetos existentes mantêm seus dados/perfil. `npm test` passou 157/157. O smoke de projeto NW.js com build isolado `build/diana-ui-clean` validou criação, biblioteca de 26 cartões, seletor de perfil, tela de batalha e playtest; captura `artifacts/project-ui-Sqrzfj/resource-library.png`. O smoke geral falhou na checagem de hit-target do canvas antes da pintura e requer investigação separada.

## Implementação das recomendações da auditoria RPG Maker — 16/10/2026

A busca de eventos está disponível na navegação Eventos: permite consultar o projeto por nome, switch ou variável e abrir o resultado no mapa correspondente. O bloqueio de playtest agora também percorre todos os mapas e valida referências cruzadas e imagens de atores, inimigos, tropas, eventos, tilesets e camadas, sem gravar alterações. Evidências: `artifacts/project-ui-smoke.json`, `tests/event-search.test.cjs` e `tests/project-validation.test.cjs`; suíte 163/163 e suíte preparada 63/63 passaram. O smoke geral ainda para no hit-target do canvas antes de pintar (`scripts/smoke-windows.cjs:100`); o smoke dedicado de interface, busca e playtest passou. Próximas entregas: combate lateral homologado integralmente, combate de campo jogável, combos que executam ações e modo tático real; distribuição pública segue bloqueada pela auditoria de licenças.

## Atualização de smoke geral — 16/10/2026

O smoke de pintura geral foi corrigido para calcular uma célula visível em mapas grandes e verificar a pintura contra o tile selecionado, sem coordenada/ID fixos da configuração antiga. `npm run smoke:windows` passou em `artifacts/windows-smoke-Ggzf0h` e executou o jogo.

## Estado depois da tranche de implementação

Build preparado e smokes atuais: `npm test` 164/164, testes preparados 63/63, smoke geral Windows `artifacts/windows-smoke-W3P38M`, smoke de busca/interface `artifacts/project-ui-0r7RQa` e smoke de batalha lateral `artifacts/battle-smoke-F3oD1I`. Busca e validação do projeto estão implementadas e testadas. O combo com golpe final automático é opt-in e testado por API; falta uma partida Windows que use a opção. Campo e tático ainda precisam de combate jogável completo.


## Remoção de lamejs — 2026-10-16

`patches/zzzzzzzz-remove-lamejs-dependency.patch` retira lamejs LGPL-3.0 e `use-strict` exclusivo de `editor/package.json` e `package-lock.json` no staging Diana. O upstream fixado não foi alterado. `tests/remove-lamejs-patch.test.cjs` passa; o empacotador agora recusa um manifest preparado que volte a declarar lamejs. O prepare isolado `build/diana-license-clean` confirma que os dois manifests não contêm lamejs nem o transitivo. A revisão ainda marca distribuição pública bloqueada por notices NW.js/Chromium/Node, licença de `@pixi/colord` e revisão WASM/terceiros.


## Auditoria do bloqueio de distribuicao (2026-10-16)

O empacotador agora acrescenta o texto MIT ausente de `@pixi/colord` 2.9.6 a partir de `licenses/pixi-colord-MIT.txt`; os testes de pacote e `npm test` passaram (168/168). Uma sessao WebDriver real no NW.js 0.118.0 confirmou que `chrome://credits` ainda mostra a pagina de amostra, por isso o pacote continua `blocked-license-review`. Evidencias: `artifacts/nw-credits-runtime-check.json` e `artifacts/publication-audit-f92009e870134a0b90e4890249bccf86/diana-package.json`. Restam os notices completos que correspondam ao runtime exato e a revisao de WASM/decoders.


## Decisao de migracao Tauri (2026-10-16)

O usuario pediu substituir NW.js por Tauri. Auditoria do staging: 577 `require()` literais em 121 arquivos, 898 usos sincronicos de filesystem em 110 arquivos, 116 referencias `nw.*` em 15 arquivos e 137 acessos `process.*` em 27 arquivos. Tauri e viavel como host, mas exige port async incremental. Rust MSVC e Visual Studio 18 Build Tools agora estao instalados pelo usuario; `docs/TAURI_MIGRATION.md` tem a auditoria e estado atual.

## Inicio da migracao Tauri (2026-10-16)

`npm start` agora usa `scripts/launch-tauri.cjs`; `npm run start:nw` mantém contingência temporária. `src-tauri/` contém o host Tauri v2. `cargo check` e `cargo build --release` passaram; `src-tauri/target/release/luae-rpg.exe` abriu a janela `Luae RPG`. Isso valida o host inicial, não os fluxos do editor: as APIs Node/NW.js ainda não foram portadas ao WebView. `tests/tauri-host.test.cjs` cobre configuração e launcher; `docs/TAURI_MIGRATION.md` registra os bloqueios seguintes, incluindo bridge async, playtest, export e pacote.

Após a instalação do usuário, `cargo check` e build release passaram. `npm test` passou 171/171. `npm run smoke:windows` falhou na asserção de título do NW.js (`scripts/smoke-windows.cjs:90`: esperado Luae RPG, encontrado Diana RPG Studio | Vila da Clareira) antes dos fluxos de jogo; não certifica nem invalida o host Tauri. O pacote/exportador Windows continuam NW.js até o editor ter bridge e paridade Tauri.





## Verificacao Tauri de abertura de projeto (2026-10-16)

Pixi now loads before project map initialization. The local fixture `build/tauri-test-project-02ae3f39b9074a3589977a7b2b1c0286` opened in Tauri with its tileset and 17x13 map drawn. `npm test` passed 177/177; `cargo test --manifest-path src-tauri/Cargo.toml` passed 2/2; `npm run tauri:build` produced the release executable. Playtest, import, export and packaging still need porting; see `docs/TAURI_MIGRATION.md`.


## Clareira and pose editor update — 2026-10-16

The battle database UI now has ally/enemy records and separate pose and animation tabs, with sound-on-entry controls. The running Tauri window exposed those controls in its accessibility tree. The battle preview displays the chosen background/troop and supports drag-to-place ally formation. An original plaza battle backdrop is compiled into the sample pack and selected for Map001; existing village art remains preserved. Validation: npm test 178/178 and npm run test:prepared 63/63. The NW smoke reached game launch but timed out after 90 seconds waiting for Scene_Title; Tauri editor inspection is separate and does not certify gameplay, export or package migration. See docs/CLAREIRA_VISUAL_DIRECTION.md and docs/JRPG_GENERATION_REVIEW.md.


## Clareira e poses — 2026-10-17

Pose database: numbered pose rows, selected-pose preview, and contextual crop/frame and sound controls. Startup welcome calls out Vila da Clareira; the normal new-project flow still asks the user where to create it. Tauri accessibility tree confirmed both views. `npm test` 179/179; `prepare:editor` succeeded; prepared tests 63/63. Legacy Windows smoke reached export but generated game timed out waiting for `Scene_Title` (90s). See `docs/DIANA_STUDIO_UI.md`, `docs/CLAREIRA_VISUAL_DIRECTION.md`.

## Autoria de sprites — 2026-10-17

Seleção de quadros por clique, numeração da ordem, prévia animada, centralização por transparência e salvamento de PNG corrigido em nova cópia foram implementados no compositor compartilhado para batalha e mapa. `npm test` passou 184/184; `npm run test:prepared` passou 63/63; regressões direcionadas na build integrada passaram 18/18. `npm start` abriu o host Tauri e a tela do compositor confirmou visualmente que clicar no segundo quadro atualiza a sequência de 1 para 2 quadros; captura em `images/prints-editor/pose-grid-tauri-2026-10-17.png`. Estado: **implementado e testado por API/DOM e fluxo visual Tauri**; playtest e pacote Tauri permanecem pendentes. Folhas opacas ou com células que preenchem toda a área são preservadas por segurança. Veja `docs/SPRITE_SHEET_AUTHORING.md`.

## Runtime exportado e jogo inicial da Clareira — 17/10/2026

O smoke anterior falhava porque `patches/zzzzzzzzzzzzzz-diana-directional-walk.patch` declarava um hunk menor que suas linhas adicionadas; o runtime preparado era truncado no fim de `reactor_sprites.js`. Corrigi o tamanho do hunk e acrescentei uma verificação de contagem em `tests/directional-map-sprites.test.cjs`. Após `prepare:editor`, `node --check build/diana/runtime/reactor_sprites.js`, `npm test` 184/184, `npm run test:prepared` 63/63 e `npm run smoke:windows` passaram. O smoke `scripts/smoke-starter-windows.cjs` agora confere o ponto inicial e o herói contra os dados do projeto, alcança o guardião com teclado real e calcula XP esperado a partir da tropa; vitória, fuga e derrota passaram. Capturas: `images/prints-vila-clareira/`; relatórios: `artifacts/windows-smoke.json`, `artifacts/starter-smoke.json`, `artifacts/starter-escape-smoke.json`, `artifacts/starter-defeat-smoke.json`. Tauri segue parcial para playtest, exportação e pacote.

## Abertura da Clareira no Tauri release — 17/10/2026

Verifiquei o executável release Tauri pelo fluxo real: o seletor de pasta abre, aceita `artifacts/clareira-restaurada-U2Dgui/Vila da Clareira` e carrega o mapa 80×64, oito mapas e NPCs/eventos. A carga observada levou cerca de 30 segundos para 168 arquivos/32,1 MiB, sem indicador de progresso; a limitação está registrada em `docs/TAURI_MIGRATION.md`. Captura: `images/prints-editor/clareira-tauri-open-project-2026-10-17.png`. `cargo test --manifest-path src-tauri/Cargo.toml` passou 2/2; playtest, persistência por edição, exportação e empacotamento Tauri continuam pendentes.
# Estado Tauri — salvamento e playtest

Em 17/10/2026, corrigido o bloqueio do salvamento Tauri: o adaptador não anuncia mais renameSync sem suporte aos descritores que o gravador atômico exige. A regressão percorre ProjectManager.saveProject() e verifica que project.rpgreactor e data/MapInfos.json chegam ao flush. O jogo agora também abre no playtest integrado: salva primeiro, monta a raiz aprovada no host Rust e serve o index.html do projeto por iframe usando http://diana-project.localhost no Windows. A tela inicial da Vila da Clareira carregou visualmente; fechar o teste remove o iframe e retoma o editor.

Validação atual: npm test 187/187; npm run test:prepared 63/63; tests/tauri-project-host.test.cjs 9/9; cargo test --manifest-path src-tauri/Cargo.toml 3/3. O arquivo original permaneceu intacto; o teste de salvamento usou artifacts/tauri-save-test-00ce8fbb/Projeto. Ainda falta validar interação no mapa e combate dentro do iframe, e portar exportação/empacotamento. Os smokes Windows existentes usam NW.js e não foram executados nesta integração Tauri parcial. Consulte docs/TAURI_MIGRATION.md.

## Direção e escala dos sprites — 2026-10-17

Ajustada a caminhada da Liora, Brann e moradores para mapear explicitamente os quadros das quatro direções. O retrato pixel art original de Brann ocupa `ClareiraRostos`, Índice 6, e seu ataque agora usa investida com retorno ao ponto de origem. As folhas de mapa usam o espaço completo de 48×48 px com centro e linha dos pés comuns; as folhas de batalha alinham todas as poses do Brann por uma escala e base compartilhadas. Regressões direcionadas passaram 14/14; build preparada 63/63; `smoke:windows` passou; partida inicial venceu com teclado real em `artifacts/starter-smoke-uRfPIs/`. `npm test` integral teve 4 falhas existentes fora desta alteração (catálogo de recursos: 28/27; três falhas nos mocks de `sprite-sheet-tools.test.cjs`). Estado: implementado e testado por API, contrato preparado e partida Windows; a revisão estética final é visual.

## Correção de sprites direcionais e runtime salvo — 17/10/2026

A troca visual durante caminhada foi validada no runtime em jogo: `smoke-starter:windows` chegou ao guardião por busca de caminho em tiles transitáveis; a captura `artifacts/starter-smoke-7JW7qo/facing-right.png` mostra o herói de perfil para a direita. O teste confirmou `$gamePlayer.direction() === 6`, `characterPatternY() === 2` e recorte vertical na terceira linha da folha. O caminho do smoke foi corrigido para contornar obstáculos reais da Clareira.

Projetos Tauri existentes também renovam agora sua cópia antiga do runtime ao abrir. O host fornece o caminho dos recursos empacotados e o patch versionado compara os arquivos de sprite/direção antes de pular a atualização. API Tauri 11/11, runtime preparado 63/63, smoke Windows do editor e smoke jogável de vitória passaram. `npm test` total ficou em 189/194; cinco falhas de alinhamento/catalogação/mocks permanecem fora desta correção. Estado: implementado e testado por API, jogo real e inspeção de captura.

## Corretor de vazamentos — 17/10/2026

Estado: **implementado e testado por API/DOM; revisão visual da nova limpeza e execução com uma folha corrigida ainda pendentes**. No compositor de mapa ou de Animações 2, use **Centralizar e proteger quadros** e **Salvar folha corrigida no projeto**. O diagnóstico agora lê pixels pelo canvas; antes recebia uma imagem sem dados RGBA e impedia abrir a ferramenta com imagem real.

A opção **Remover fragmentos pequenos e soltos nas bordas** remove apenas componentes desconectados que tocam a borda e têm menos de 25% dos pixels do maior componente do quadro (conectividade de oito vizinhos). É opcional porque armas e efeitos também podem ser separados. Partes conectadas cruzando divisões continuam preservadas e sinalizadas: o algoritmo não reconstrói desenhos j? cortados. Revise a prévia; **Restaurar folha original** desfaz o processamento antes de salvar. O original não ? sobrescrito. Margens são limitadas ao tamanho real da célula para impedir escrita fora do frame em grades pequenas.

Evidências: testes da ferramenta 9/9; runtime preparado 63/63; npm test 194/196 (falhas existentes em jrpg-polish: base 47 versus 46, e rtp-expansion: 28 versus 27 itens). Smoke Windows NW.js passou em artifacts/windows-smoke-b3d8tB; não certifica a limpeza visual nem o host Tauri. Logs: artifacts/sprite-tools-tests.log e artifacts/sprite-tools-smoke.log.

## Atlas de possibilidades RPG Maker — 17/10/2026

Estado: extração documental concluída; melhorias planejadas. Consultar docs/RPG_MAKER_RESOURCE_ATLAS.md e .diana-ai/rpgmaker-sheet-study.json. Catálogo pesquisável em .diana-ai/references/: 13.859 registros CSV e hyperlinks adicionais XLSX, total de 7.918 URLs únicas nas 30 abas da planilha SigmaSuccour. Fontes oficiais e autores selecionados foram estudados; destinos restantes estão indexados, sem compatibilidade comprovada Diana. Nenhum plugin, demo, asset ou dependência foi incorporado; testes de aplicação não foram executados nesta entrega documental. Preservar RPGReactor, Tauri e direção visual Clareira.


## Corretor de sprites — 17/10/2026

Implementado e testado por pixels, DOM e jogo NW.js: recuperação de componentes completos da caminhada Liora/Brann e combate Brann; BrannCaminhada-v2.png com repouso neutro e passadas; grade respeita poses fixadas para aliados/inimigos. Acesso: Corrigir sprites na barra. Originais preservados. Evidências: docs/SPRITE_REPAIR_VALIDATION.md e artifacts/sprite-repair-smoke-cH8cUG (84 células de origem, 48 recortes no mapa, teclado líder/seguidor, 36 recortes de combate). Tauri: controles inspecionados; persistência e playtest destas folhas ainda pendentes. Sem instalações nem commits.
