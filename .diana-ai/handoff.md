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

