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
  novo completo criar/editar/salvar/fechar/reabrir/jogar ainda está em validação.
  A inspeção desta consolidação revelou e corrigiu perda do prefixo canônico
  Windows na criação; regressão de drive e UNC adicionada.
- Playtest tem API e tela inicial verificadas; partida completa Tauri pendente.
- Export standalone e empacotador portátil implementados; execução relocada do
  pacote Tauri por controles reais ainda não certificada. Cargo build não cria MSI.
- O lote de salvamento não é uma transação entre todos os arquivos. Falha pode
  deixar parte persistida; a remoção destrutiva no fallback de rename foi retirada.
- Autoria visual de recursos, captura e geradores com Node ainda exigem migração.
- Battle Studio já tem timeline, duração, simultaneidade, poses, projéteis e
  easing; preview e runtime usam BattleData, mas o preview não executa todos os
  efeitos de jogo. Os 15 atalhos visuais nativos foram acrescentados, com testes
  de paridade de timeline/evaluate. Aceite gráfico pendente.
  [Contrato e lacunas](docs/BATTLE_STUDIO_AUDIT.md).
- O teste de perfil comprova em sandbox que remover artifacts preserva perfil e
  projeto; não equivale ao ciclo gráfico Tauri solicitado.

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
| npm run smoke:windows | passou, windows-smoke-UcO6vz | NW.js, não certifica Tauri |
| npm test após integração disponível no workspace | 228/228 | incluiu biblioteca V2; falha temporária anterior resolvida |
| node scripts/smoke-tauri-windows.cjs | passou | WebView2/Rust reais; APIs e mapa standalone, sem teclado/combate |
| Tauri gráfico desta etapa | inicialização e diálogo de criação inspecionados | ciclo completo pendente |

Logs locais em artifacts/consolidation-* podem ser regenerados. Não depender
de sua permanência para entender o estado: resultados e limites estão acima.

## Roadmap imediato

Completar aceite Tauri e standalone; consolidar Battle Studio no contrato nativo;
portar ferramentas restantes por subsistema; validar pacote/instalador e licenças.
[TASKS](TASKS.md) contém somente pendências; [ROADMAP](ROADMAP.md) organiza marcos.
O pedido Battle Studio termina em “suportar easing/m”; continuação solicitada.
