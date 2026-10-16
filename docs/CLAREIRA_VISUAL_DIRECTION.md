# Direção visual permanente: Vila da Clareira

**Instrução do usuário para todos os agentes:** mantenha sempre a direção visual da primeira versão aprovada da Vila da Clareira e melhore-a. Essa escolha é permanente, não uma preferência apenas para a tarefa atual.

A referência original é `assets/jrpg-test/originals/Clareira.png`, junto com as referências aprovadas de personagens e batalha documentadas em `docs/CANONICAL_ART_STYLE.md` e `assets/jrpg-test/style-guide.json`. O projeto deve conservar sprites grandes e claros, cenários com profundidade e camadas, arquitetura e vegetação detalhadas, e animação de batalha fluida, coerente com essa vila. Melhorias devem elevar acabamento, escala e composição sem descaracterizar a Clareira.

Antes de integrar mudanças visuais, compare os assets e a cena executada com a referência aprovada. Se a arte ficar menor, mais simples, genérica, ou a batalha perder fluidez e legibilidade, considere isso uma regressão e corrija antes de entregar. Preserve arquivos e versões anteriores; não substitua assets existentes sem necessidade.

**Estado:** direção registrada e restauração central implementada/testada. `npm test` passou 152/152; testes preparados passaram 63/63; WebDriver Windows capturou editor, vila, comandos e golpe sem erros em `artifacts/clareira-restaurada-5z8mlD/`. O mapa mantém a placa visual central e exploração nativa ao redor; a placa não é pintável tile a tile. Executável local: `dist/Diana-RPG-Studio-Clareira-preview-2026-10-16/Diana.exe`. Revisão manual de cada interior ainda pendente.
