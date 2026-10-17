# Luae RPG — estado do projeto

Revisão em 17/10/2026. Versão **0.2.6** (package.json e tauri.conf.json).
Este arquivo centraliza o estado atual; relatórios datados são evidências
históricas, não substituem a validação da revisão em uso.

## Arquitetura atual

RPGReactor 0.99.0, pin dc918245cbf8f10ae6eef4ed8cb54b850fed9caa em
upstream-lock.json, é a única engine provisória. Código Luae em src/; mudanças
upstream em patches/, aplicadas pelo preparo depois de held-poses.patch.
build/diana é gerado e a dependência upstream é local/ignorada. Não inclui Demo.

Editor principal: **Tauri v2**, Rust + WebView2 no Windows, iniciado por npm start.
Frontend mantém provisoriamente um espelho de arquivos para compatibilidade com
APIs síncronas upstream. Rust valida caminhos e persiste mudanças. Runtime do
jogo: o JavaScript RPGReactor copiado ao projeto; playtest usa protocolo local
diana-project e iframe. Standalone reutiliza o mesmo host em modo de jogo.
NW.js permanece fallback para importadores, ferramentas e pacote legado sem
paridade comprovada. Não é uma segunda engine. [Auditoria](docs/CONSOLIDATION_AUDIT.md).

## Implementado e testado

- Preparo pelo pin e patches; autoria de mapas, dados, eventos e poses existente.
- Contrato comum de sprites/poses de aliados e inimigos, direção e quadros fixos.
- Ponte Tauri: abrir/montar, criar, gravar e playtest cobertos por testes de API.
  Salvamentos concorrentes preservam edições posteriores e falhas são repetíveis.
- Exportação Tauri: snapshot salvo, diretório novo, host + game + manifesto,
  validação de entradas e relocação cobertos por testes JS/Rust.
- Smoke Tauri real criou, salvou, reabriu depois de remover artifacts da sandbox,
  executou playtest, retornou ao editor e abriu mapa no standalone relocado.
  Automatiza APIs do WebView2/Rust; não é aceite de ponteiro/teclado ou combate.
- Perfil NW legado copiado para dados do sistema sem remover origem. Tauri usa
  AppLocalData; jogos exportados usam games/gameId para separar saves e perfil.
- Auditoria UTF-8 dos textos versionados e regressões para mojibake, palavras
  corrompidas e operadores legítimos. [Encoding](docs/ENCODING.md).
- Recursos da Clareira lidos dos assets embutidos, sob demanda, sem artifacts.

## Parcial ou implementado sem aceite completo

- Tauri: abertura e renderização já têm evidências gráficas anteriores; o ciclo
  criar/editar/salvar/fechar/reabrir/jogar passou por APIs reais no pacote release.
  O aceite manual completo de autoria e combate ainda está pendente.
  A inspeção desta consolidação revelou e corrigiu perda do prefixo canônico
  Windows na criação; regressão de drive e UNC adicionada.
- Playtest chegou ao mapa ativo por Novo jogo no pacote release; combate completo
  Tauri pendente.
- Export standalone e empacotador portátil passaram no pacote release relocado;
  aceite completo por controles reais e máquina limpa pendentes. Cargo build não cria MSI.
- O lote de salvamento não é uma transação entre todos os arquivos. Falha pode
  deixar parte persistida; a remoção destrutiva no fallback de rename foi retirada.
- Autoria visual de recursos, captura e geradores com Node ainda exigem migração.
- Battle Studio já tem timeline, duração, simultaneidade, poses, projéteis e
  easing; preview e runtime usam BattleData, mas o preview não executa todos os
  efeitos de jogo. Os 15 atalhos visuais nativos foram acrescentados, com testes
  de paridade de timeline/evaluate. Aceite gráfico pendente.
  [Contrato e lacunas](docs/BATTLE_STUDIO_AUDIT.md).
- O smoke Tauri real confirma que remover artifacts da sandbox preserva perfil,
  projeto, alterações de mapa/dados e playtest; não equivale ao aceite manual completo.

## Exportação, distribuição e bloqueios

Export Tauri gera LuaeGame.exe + game/ + luae-export.json, sem exigir editor
instalado; precisa Windows/WebView2. O runtime vem do projeto salvo. Não remove
arquivos existentes; destino recebe sufixo se necessário. Cópias parciais ficam
identificadas como falha, sem manifesto válido. Links simbólicos não são copiados.
MSI/NSIS configurados, ainda sem validação de instalação em máquina limpa.

Licença do código Luae: MIT. Distribuição pública permanece **bloqueada pela
auditoria de licenças/notices**, incluindo base provisória e dependências do host.
[BASE_EVALUATION](docs/BASE_EVALUATION.md), [LICENSE_AUDIT](docs/LICENSE_AUDIT.md).
Catálogo de links não concede licença para importar plugins ou arte comercial.

artifacts contém logs/capturas/resultados regeneráveis. Não guardar projeto ou
perfil essencial ali. Projetos antigos encontrados ali devem ser copiados para
uma pasta escolhida pelo usuário antes de qualquer limpeza. Nenhuma limpeza
global foi executada nesta consolidação. Nomes internos Diana preservados por
compatibilidade: [classificação](docs/LEGACY_NAMES.md).

## Validação da consolidação

| Verificação | Resultado nesta etapa | Limite |
|---|---|---|
| npm test antes das mudanças | 210/210 | baseline 7db2919 |
| API Tauri após correção Windows | 17/17 | mocks + módulos reais de projeto |
| cargo test --offline | 6/6 | protocolo, caminhos, export e relocação de fixture |
| npm run test:prepared | 69/69 | contrato do build gerado |
| npm run smoke:windows | passou, windows-smoke-Q7zbYH | NW.js, não certifica Tauri |
| npm test após integração disponível no workspace | 229/229 | incluiu trabalho de biblioteca V2 preservado no workspace |
| npm run smoke:tauri:windows -- --executable dist/...r2/Luae RPG.exe | passou | pacote release real; PNG decodificado, mapa/dados persistidos, playtest e standalone até mapa ativo |
| Tauri gráfico desta etapa | inicialização, diálogo e mapa standalone inspecionados | teclado/combate e ciclo manual completo pendentes |

Logs locais em artifacts/consolidation-* podem ser regenerados. Não depender
de sua permanência para entender o estado: resultados e limites estão acima.

Pacote portátil local validado:
`dist/Luae-RPG-Tauri-0.2.6-20261017-r2/Luae RPG.exe`. Manter runtime e avisos ao lado.
O primeiro pacote de diagnóstico “consolidacao” falhou por copiar bytes Brotli
como PNG; não usar. O resolver agora descomprime os assets antes de copiá-los.
O smoke de release decodifica IconSet.png e espera título/mapa ativos, em vez de
aceitar somente a existência de arquivos ou de Scene_Boot. Essa diferença foi
encontrada em execução real, não pela suíte de mocks.

## Roadmap imediato

Completar aceite Tauri e standalone; consolidar Battle Studio no contrato nativo;
portar ferramentas restantes por subsistema; validar pacote/instalador e licenças.
[TASKS](TASKS.md) contém somente pendências; [ROADMAP](ROADMAP.md) organiza marcos.
O pedido Battle Studio termina em “suportar easing/m”; continuação solicitada.
