# Auditoria de consolidação do Luae RPG

Início: 17/10/2026. Base de trabalho: commit `7db2919`, árvore limpa no início
desta auditoria. A versão declarada em package.json, Cargo.toml e tauri.conf.json
é 0.2.6. Este registro descreve o diagnóstico anterior às correções; o estado
consolidado será mantido em PROJECT_STATE.md.

## Fluxos e dependências reais

| Fluxo | Código responsável | Diagnóstico inicial e impacto |
| --- | --- | --- |
| Inicialização | scripts/launch-tauri.cjs; src-tauri/tauri.conf.json; scripts/prepare-source.cjs | npm start já aponta para Tauri, mas pressupõe preparo anterior. Frontend empacotado vem de build/diana/editor; build é regenerável, não dado do usuário. |
| Abrir | DianaTauriHost.mountProject; Rust read_project_files/read_project_file | Espelho de arquivos síncrono limitado à raiz. Projetos maiores exigem progresso e teste de falhas; não substituir o formato. |
| Criar | DianaBootstrap.createNewProject; DianaJRPGSample.installProject | A criação instala a Clareira mesmo com blank:true. Exige editor/diana-assets no filesystem virtual. read_app_resources inicialmente fornece apenas runtime e notices: lacuna funcional concreta. |
| Salvar | DianaTauriHost.createFileSystem.flush; Rust save_project_changes | Grava arquivos por lote, sem transação global. flush inicialmente atualiza a base usando o conteúdo atual, não o snapshot enviado: uma edição concorrente pode perder a indicação de pendência. Escritas e remoções precisam de testes de contenção e falhas. |
| Playtest | DianaTauriHost.openPlaytest; protocolo diana-project | Usa iframe e a raiz do projeto real, sem depender de cópia em artifacts. Precisa garantir salvamento, foco, fechamento e retomada do editor. |
| Exportar | upstream main.js; DeploymentDialog; scripts/export-windows.cjs | mode:web desativa o exportador upstream. O script local existente exporta com NW.js. Não há fluxo Tauri standalone comprovado no estado inicial. |
| Empacotar | scripts/package-windows.cjs; tauri.conf.json | Pacote legado usa NW.js; cargo build compila executável Tauri, não instalador. Os dois fluxos não podem ser anunciados como equivalentes. |
| Perfil | Tauri/WebView2; scripts/launch.cjs | Tauri usa diretórios padrão do host. O launcher NW.js usa artifacts/profile: dependência persistente incorreta. Separar configuração, cache, logs e projetos. |
| Recursos | read_app_resources; DianaStarterData/JRPGSample | Copiar apenas pacotes versionados preparados; preservar licenças, sem Demo upstream. Recursos do editor e do jogo não devem depender de artifacts. |
| Runtime existente | patches de refresh; ProjectManager | Atualização de runtime já existe; preservar dados, nomes internos e projetos legados. Registrar alteração de contrato em patch quando tocar upstream. |

## Decisões antes de alterar a arquitetura

- Manter RPGReactor e seus formatos como engine única. A ponte síncrona é um
  adaptador transitório exigido pelas APIs upstream, não uma segunda implementação
  do editor. Migrar subsistemas por contrato, sem reescrita geral.
- Manter Tauri como entrada oficial e NW.js explicitamente legado enquanto houver
  exportação ou funcionalidades sem paridade. Não remover os smokes NW.js existentes.
- Corrigir primeiro integridade de persistência e recursos antes de exportar.
- Avaliar standalone reutilizando o mesmo host Tauri em modo de jogo, servido pelo
  protocolo local existente. Isso exige isolamento do perfil, detecção explícita
  do pacote, cópia completa e não destrutiva, e execução real do resultado. Não
  anunciar como pronto com base apenas na existência do comando.
- Perfil/configuração/cache/logs devem usar diretórios do sistema. Projetos normais
  permanecem no destino escolhido pelo usuário. artifacts é reservado a diagnóstico
  e fixtures descartáveis. Testar sua ausência numa sandbox; não apagar evidências
  ou projetos do usuário para fazer o teste.
- Preservar classes Diana*, patches, chaves JSON diana e protocolo diana-project por
  compatibilidade. Atualizar nomes visíveis quando seguro; mudanças cosméticas não
  justificam quebrar arquivos e contratos.

## Encoding e documentação

Há mojibake reversível (UTF-8 interpretado como Windows-1252 e recodificado) e perda
irreversível de caracteres para pontos de interrogação. Tratar separadamente:
reverter apenas sequências comprovadas; corrigir perdas manualmente pelo contexto;
não substituir operadores JS `??`, padrões regex ou conteúdo estrangeiro legítimo.
Auditar arquivos versionados textuais, sem tocar binários ou upstream ignorado.
O teste precisa analisar bytes UTF-8 e detectar padrões suspeitos sem transformar
exemplos de diagnóstico ou expressões de teste em falsos positivos.

README/TASKS/ROADMAP repetem estados históricos incompatíveis. Consolidar o estado
atual em PROJECT_STATE.md; deixar instruções operacionais curtas no README, somente
tarefas abertas em TASKS e etapas futuras no ROADMAP. Resultados antigos não
substituem execução na revisão atual; arquivos locais em artifacts podem desaparecer.

## Battle Studio

Investigar primeiro os comandos, formatos, execução e preview já existentes em
editor/src/battle e runtime/reactor_battle*. Não criar outro sistema de batalha.
Unificar interpretação antes de ampliar a interface. A solicitação recebida
termina em “suportar easing/m”; continuação foi solicitada ao usuário e permanece
pendente. Requisitos recebidos incluem poses por combatente, infraestrutura comum
para aliados/inimigos, duração e passos simultâneos, e os comandos listados pelo usuário.

## Critérios de validação

Testes JS e Rust por grupo; npm test e smoke:windows após integração. Registrar
separadamente API, interação visual, jogo executado, Tauri e NW.js. Testar criação,
abrir/reabrir, edição e persistência, playtest/fechar/retomar e export standalone.
Nenhuma instalação, publicação ou alteração de configuração de segurança está
autorizada implicitamente. Commits pequenos e temáticos foram solicitados nesta
tarefa; não incorporar alterações alheias sem revisão.

## Incremento 1 — gravação concorrente e recursos da criação

Implementado e testado por API: o espelho serializa gravações, mantém como pendentes
as edições feitas durante o envio e não atualiza a base de outro projeto após uma
troca de raiz. Falhas preservam o conteúdo para nova tentativa. O teste de playtest
agora inclui uma alteração real no saveAll, em vez de exigir um lote vazio.

Implementado e compilado, validação visual ainda pendente: os recursos da Clareira
são lidos dos assets já embutidos no frontend Tauri, sob demanda na criação. Não
há segunda cópia física do pack nem dependência de artifacts ou do checkout.
O carregamento inicial do runtime continua separado para não pagar o custo dos PNGs
em toda abertura. Testes JS Tauri 17/17; cargo test --offline 3/3. Baseline geral
antes das alterações: npm test 210/210. Logs locais regeneráveis em artifacts/consolidation-*.
