# Migração do host desktop para Tauri

Estado em 17/10/2026: **host compilado; projeto Clareira aberto e renderizado no executável release; playtest abre a tela inicial no Tauri; migração parcial**. `npm start` inicia Tauri e `npm run start:nw` mantém o host NW.js como contingência. A interação completa do jogo, exportação e empacotamento ainda não têm paridade.

## O que funciona e foi verificado

- A janela Tauri v2 abre `build/diana/editor` com a interface Luae RPG.
- O comando Rust `read_app_resources` fornece os recursos empacotados do runtime; a barreira `ensureRuntime()` carrega pako e Pixi antes de qualquer renderização de projeto.
- O fluxo Abrir Projeto usa o seletor nativo, valida o marcador de projeto e monta os arquivos do diretório em um espelho em memória. Escritas são enviadas ao Rust em lote; gravação e remoção são limitadas à raiz validada.
- Em 16/10/2026, foi aberto visualmente `build/tauri-test-project-02ae3f39b9074a3589977a7b2b1c0286`: a interface exibiu o mapa inicial, a paleta de tiles e o mapa 17x13 desenhado no canvas. Isso reproduz e corrige o sintoma de tela vazia causado por `PIXI is not defined`.
- Em 17/10/2026, `npm start` abriu o host Tauri após `prepare:editor`; as telas de batalha, poses e compositor de grade foram inspecionadas. Um clique em quadro aumentou a sequência de 1 para 2 itens; captura em `images/prints-editor/pose-grid-tauri-2026-10-17.png`. Isso valida a interação do editor neste host de desenvolvimento, não uma partida nem o pacote.
- Em 17/10/2026, o executável release abriu `artifacts/clareira-restaurada-U2Dgui/Vila da Clareira` pelo seletor nativo e renderizou o mapa 80×64, oito mapas e os eventos/NPCs; captura em `images/prints-editor/clareira-tauri-open-project-2026-10-17.png`. A carga visual levou cerca de 30 segundos para o projeto de 168 arquivos e 32,1 MiB, sem indicador de progresso; melhorar a resposta durante a abertura continua pendente.
- Testes desta atualização: `npm test` 187/187, `npm run test:prepared` 63/63, `tests/tauri-project-host.test.cjs` 9/9 e `cargo test --manifest-path src-tauri/Cargo.toml` 3/3. `npm run tauri:build` compilou o executável release em `src-tauri/target/release/luae-rpg.exe`; isso ainda não gera um instalador.

O teste de projeto Tauri usou uma fixture local de Clareira, não valida gravação persistente nem todos os projetos de usuário. Em 17/10/2026, `cargo test --manifest-path src-tauri/Cargo.toml` passou 2/2; `npm test` passou 184/184 em validação anterior da mesma revisão preparada. `npm run smoke:windows` passou em `artifacts/windows-smoke-LmHvkE`, e `smoke:starter:windows` passou nos fluxos de vitória, fuga e derrota. Esses smokes continuam usando NW.js; seus resultados não certificam playtest nem pacote Tauri.

## Arquitetura e limites atuais

O frontend preparado mantém as APIs síncronas que o upstream espera através de um espelho compatível de `fs`, `path` e `Buffer`. O Rust lê e grava arquivos reais com caminhos relativos validados, ignora links simbólicos ao enumerar arquivos e limita o tamanho do projeto. O runtime empacotado fica separado e somente para leitura. Essa ponte é compatibilidade transitória: os 577 `require()` literais, 898 operações síncronas de filesystem, 116 referências `nw.*` e 137 acessos `process.*` encontrados no staging ainda precisam de migração por subsistema.

O playtest agora salva o projeto, registra a raiz validada no host Rust e abre index.html em um iframe integrado servido pelo protocolo local diana-project. No Windows, o endereço precisa ser http://diana-project.localhost/; a forma diana-project://localhost/ deixa o iframe em branco. A tela inicial ilustrada da Vila da Clareira foi carregada visualmente no Tauri. Ainda falta confirmar a interação de entrada no mapa pelo iframe e cobrir os fluxos completos de combate. Importadores, captura de cenas, geradores que dependem de Node, menus/processos, exportação e build também não têm paridade Tauri. O pipeline Windows de pacote continua NW.js. A compilação do executável Tauri não equivale à criação e validação do instalador.

No Windows, Tauri usa WebView2. Ele remove o Chromium/Node empacotados pelo NW.js, mas mantém WebView2 como dependência de plataforma baseada em Chromium. A auditoria de licenças e notices precisa cobrir o pacote Tauri antes de qualquer distribuição.

## Próximas etapas e critérios

1. **Implementado e testado:** host Rust, seleção/abertura de projeto, espelho inicial, carregamento de pako/Pixi e renderização no executável release. **Parcial:** projeto maior ainda não mostra progresso e falta validar fechar/reabrir após edição persistida.
2. **Parcial:** persistência assíncrona em lote. Testar edição, salvar, fechar e reabrir projeto real; cobrir falhas, arquivos grandes e caminhos de Windows.
3. **Planejado:** portar acesso a assets e importadores por API segura; substituir progressivamente a ponte síncrona.
4. **Parcial, implementado e testado até a tela inicial:** playtest integrado Tauri salva antes de abrir e serve o projeto pela raiz aprovada; interação de jogo, captura de cenas, processos auxiliares, exportação e geradores ainda precisam de paridade.
5. **Planejado:** migrar empacotamento e notices/licenças, gerar instaladores e validar instalação relocada.
6. Executar testes de API, interação visual e jogo separadamente. Só remover o launcher/pipeline NW.js depois de todos os fluxos de autoria, playtest e exportação passarem no pacote Tauri.

## Salvamento Tauri — 17/10/2026

Corrigido o bloqueio que impedia salvar metadados e a lista de mapas: o espelho síncrono anunciava `renameSync` sem implementar a API de descritores exigida pelo gravador atômico Node. O adaptador agora deixa o upstream usar a escrita compatível no espelho; `host.flush()` persiste o lote atomicamente pelo Rust. A regressão integrada em `tests/tauri-project-host.test.cjs` percorre `ProjectManager.saveProject()` e confirma que `project.rpgreactor` e `data/MapInfos.json` chegam ao flush. Teste de API passou nessa etapa; a validação visual e de abertura do playtest foi concluída depois e está registrada na seção seguinte. A cópia de diagnóstico está em `artifacts/tauri-save-test-00ce8fbb/Projeto`; o projeto original não foi alterado.

Atualização: `npm start` abriu o host Tauri de desenvolvimento com a correção. No projeto de teste copiado, Salvar atualizou `project.rpgreactor` e `data/MapInfos.json` (17/10/2026 12:41 UTC); as versões do projeto original conservaram seus horários de 16/10. Clicar Playtest também executou a etapa de salvamento (o horário de `project.rpgreactor` avançou para 12:41:22 UTC) sem mostrar o erro anterior. Naquele teste inicial a partida ainda não abriu porque `PlaytestManager.playtest()` dependia de NW.js; a implementação e validação posterior do playtest integrado estão registradas na seção seguinte.

## Playtest integrado Tauri — 17/10/2026

O playtest do editor Tauri não usa mais PlaytestManager (que depende de nw). DianaTauriHost.openPlaytest() salva e descarrega o espelho primeiro, registra a raiz no Rust e então abre o index.html do projeto num iframe. O protocolo restringe caminhos à raiz canônica, rejeita traversal e links externos e limita arquivos servidos a 256 MiB. No Windows, Tauri converte o protocolo registrado em http://diana-project.localhost/; usar a URL bruta diana-project:// deixava a moldura em branco, então o host agora usa a origem Windows correta.

Validação: npm test 187/187, npm run test:prepared 63/63, testes específicos do host 9/9 e cargo test --manifest-path src-tauri/Cargo.toml 3/3. npm run prepare:editor foi executado e o Tauri de desenvolvimento carregou a tela inicial ilustrada da Vila da Clareira na moldura de playtest. O botão Fechar teste remove o iframe e retoma o editor. Estado: implementado e testado por API/Rust e abertura visual da tela inicial; interação com o mapa dentro do iframe e fluxo completo da partida ainda não verificados. Os smokes Windows existentes continuam usando NW.js e não foram executados nesta integração parcial.

## Atualização do runtime de projetos Tauri existentes — 17/10/2026

Ao abrir projetos antigos no Tauri, `ProjectManager` pulava a renovação do runtime por tratar o host como navegador e `getRuntimePath()` dependia de `process.cwd()`, ausente no WebView. O host agora informa o diretório empacotado e o patch versionado renova os arquivos de grade/direção quando diferem do runtime atual. Teste integrado `tests/tauri-project-host.test.cjs` cobre uma Clareira salva com os arquivos antigos; testes Tauri: 11/11 e runtime preparado: 63/63. `npm run smoke:windows` passou. O smoke jogável `npm run smoke:starter:windows` percorreu caminho transitável até o guardião, confirmou direção direita e recorte da linha correta e concluiu diálogo/vitória; captura `artifacts/starter-smoke-7JW7qo/facing-right.png`. `npm test` ainda tem cinco falhas fora deste fluxo: alinhamento de asset, contagem do catálogo RTP e três casos de mocks da ferramenta de sprites.


## Corretor de sprites — 17/10/2026

**Implementado; controles inspecionados na janela Tauri de desenvolvimento.** A barra oferece **Corrigir sprites**, com originais, recortes e prévia. O corretor resolve nomes em minúsculas do espelho contra os nomes lógicos do banco sem diferenciar caixa. O comparador de runtime inclui reactor_battle_data.js para portar a correção de poses fixadas a projetos existentes. Persistência e execução das três folhas corrigidas passaram no smoke NW.js; validar esse fluxo completo no Tauri continua pendente. Veja [evidências](SPRITE_REPAIR_VALIDATION.md).
