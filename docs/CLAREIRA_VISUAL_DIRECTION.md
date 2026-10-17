# Direção visual permanente: Vila da Clareira

**Instrução do usuário para todos os agentes:** mantenha sempre a direção visual da primeira versão aprovada da Vila da Clareira e melhore-a. Essa escolha é permanente, não uma preferência apenas para a tarefa atual.

**Biblioteca V2 — 17/10/2026:** acrescentados Mercado da Clareira, Distrito Neon, dois exemplos em tiles nativos e 24 peças modulares medievais/cyberpunk. A linguagem de materiais, vegetação em camadas e telhados azul-petróleo deriva da referência aprovada. Brann ganhou fonte exclusiva de combate; Arqueira, Mensageira, Golem e Robô compartilham o contrato de seis estados. Capturas dos quatro mapas e combates foram inspecionadas no jogo NW.js. A cobertura de cada recurso e os limites (inclusive a revisão Tauri pendente e a renovação histórica ainda parcial) estão em [ART_LIBRARY_V2.md](ART_LIBRARY_V2.md). Originais e primeira referência permanecem preservados.

A referência original é `assets/jrpg-test/originals/Clareira.png`, junto com as referências aprovadas de personagens e batalha documentadas em `docs/CANONICAL_ART_STYLE.md` e `assets/jrpg-test/style-guide.json`. O projeto deve conservar sprites grandes e claros, cenários com profundidade e camadas, arquitetura e vegetação detalhadas, e animação de batalha fluida, coerente com essa vila. Melhorias devem elevar acabamento, escala e composição sem descaracterizar a Clareira.

Antes de integrar mudanças visuais, compare os assets e a cena executada com a referência aprovada. Se a arte ficar menor, mais simples, genérica, ou a batalha perder fluidez e legibilidade, considere isso uma regressão e corrija antes de entregar. Preserve arquivos e versões anteriores; não substitua assets existentes sem necessidade.

**Estado:** direção registrada e restauração central implementada/testada. `npm test` passou 152/152; testes preparados passaram 63/63; WebDriver Windows capturou editor, vila, comandos e golpe sem erros em `artifacts/clareira-restaurada-5z8mlD/`. O mapa mantém a placa visual central e exploração nativa ao redor; a placa não é pintável tile a tile. Executável local: `dist/Diana-RPG-Studio-Clareira-preview-2026-10-16/Diana.exe`. Revisão manual de cada interior ainda pendente.

## Atualização — praça de batalha e formação editável

`assets/jrpg-test/originals/ClareiraPracaBatalha.png` acrescenta um cenário de combate original na praça, com fonte, casas de telhado azul-petróleo, copa em camadas e um corredor aberto para personagens grandes. O mapa da vila passou a selecionar esse fundo para encontros; a arena mantém o bosque original. A prévia de batalha do editor agora mostra os sprites e o fundo selecionados e permite arrastar aliados para ajustar a formação, salvando as coordenadas de uso pelo jogo. A imagem canônica da vila e os tiles nativos continuam intactos.

Estado: **implementado e testado por API e importação determinística; inspeção interativa da tela Tauri/NW após esta alteração ainda pendente**. Os testes verificam a nova entrada do catálogo, o fundo escolhido no mapa e a persistência das coordenadas arrastadas na prévia. Veja `docs/JRPG_GENERATION_REVIEW.md` para a procedência da imagem.


## Acesso ao projeto inicial e poses — 2026-10-17

A tela sem projeto agora apresenta a Vila da Clareira como ponto de partida, com chamada de criação para mapa, moradores, itens, heróis e combate. O projeto só é gravado depois que a pessoa escolhe uma pasta no fluxo normal. A arte original da vila e o fundo da praça continuam preservados; a tela de batalha mantém seleção de fundo/grupo e arraste de formação.

Estado: **tela inicial e editor de poses implementados e testados por DOM; janela Tauri confirmou poses numeradas, pose selecionada, Áudio e prévia por Árvore acessível**. `npm test` passou 179/179 e `npm run test:prepared` passou 63/63. A execução do jogo gerado continua parcial: o smoke Windows esgotou 90 segundos aguardando `Scene_Title`.

## Validação jogável — 17/10/2026

Corrigido o patch de caminhada direcional: o cabeçalho do hunk declarava menos linhas do que o conteúdo, o que truncava `reactor_sprites.js` no jogo exportado. `node --check build/diana/runtime/reactor_sprites.js`, `npm test` (184/184), `npm run test:prepared` (63/63) e `npm run smoke:windows` passaram após o ajuste. O smoke do primeiro jogo passou por teclado real nas rotas de vitória, fuga e derrota; valida início acessível em (36,36), conversa com o guardião, seleção de ataque/alvo, recompensa de 20 XP, fuga e recuperação após derrota. Capturas novas estão em `images/prints-vila-clareira/`; os relatórios ficam em `artifacts/starter-smoke.json`, `artifacts/starter-escape-smoke.json` e `artifacts/starter-defeat-smoke.json`. O Tauri já valida o editor e compositor visualmente; playtest, exportação e pacote Tauri continuam pendentes.


## Correção de sprites — 17/10/2026

Recuperados os personagens inteiros antes de montar a grade: cabelo lateral de Liora e espadas/capas de Brann. A caminhada de Brann ganhou poses de passagem mantendo identidade, armadura e escudo. Originais e vila canônica preservados. Folhas e capturas dentro do jogo inspecionadas; veja [evidências e limites](SPRITE_REPAIR_VALIDATION.md).
