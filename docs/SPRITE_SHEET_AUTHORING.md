# Autoria de folhas de sprites

**Atualização:** o corretor completo agora fica em **Corrigir sprites**, na barra do editor. Ele recupera componentes dos originais antes de montar a grade e oferece inspeção quadro a quadro, direções e recortes manuais. Veja [correção de Liora e Brann e evidências](SPRITE_REPAIR_VALIDATION.md). O centralizador descrito abaixo continua disponível, mas sozinho não recupera arte já cortada.

Referência de produção adicional: [aprendizados do PhotoCraft](PHOTOCRAFT_ART_LEARNINGS.md),
estudados em 17/10/2026. Consultar para fontes editáveis, máscaras, escolha de escala,
transparência e revisão dentro do jogo. As melhorias de software desse estudo são
propostas planejadas; não alteram o estado das ferramentas descrito abaixo.

Estado em 2026-10-17: **seleção por clique, prévia, correção por transparência e gravação de cópia implementadas; testes automatizados e inspeção visual do compositor no host Tauri passaram**. A execução em uma partida continua pendente.

O compositor de Animações 2 serve aliados e inimigos; o seletor de personagens no mapa reutiliza o mesmo fluxo. Em vez de montar uma esteira, a pessoa clica nas células na ordem desejada. A folha mostra o número de cada clique, permite desfazer o último e limpa a seleção; a prévia reproduz os quadros nessa ordem.

**Centralizar sprites automaticamente** encontra os pixels visíveis de cada célula pela transparência, move o conjunto para o centro horizontal e alinha os pés perto da base. Só reduz sprites quando eles não cabem com a margem mínima. O processamento usa cópia de pixels sem suavização e coloca pelo menos dois pixels de margem, para impedir que o conteúdo ultrapasse a célula. Células sem conteúdo ficam vazias; uma célula ocupada até as quatro bordas é considerada sem limite confiável e permanece intocada.

Depois da correção, **Salvar folha corrigida no projeto** cria um novo PNG na pasta de assets correspondente (`img/sv_actors`, `img/enemies` ou `img/characters`), preserva o marcador inicial `$`/`!` do nome, escolhe um nome livre e evita sobrescrever o original. Na autoria de batalha, a cópia passa a ser o gráfico selecionado. No seletor de mapa, a cópia fica disponível para ser escolhida na lista de personagens.

A escolha de frames por clique se inspira no fluxo documentado pelo [QSprite Editor](https://github.com/quxios/QSpriteEditor/blob/master/app/HELP.md), cuja ajuda descreve clicar em uma célula para adicionar seu índice ao padrão. A implementação Diana é própria e mantém o contrato de grade compartilhado já usado pelo editor e runtime.

## Evidências e limites

- `node --test tests/sprite-sheet-tools.test.cjs tests/battle-poses-ui.test.cjs` valida centralização, alinhamento pela base, preservação de pixels, células opacas/vazias, sequência por clique, remoção de seleção, botão de correção, gravação da cópia, marcador de arquivo e prevenção de sobrescrita.
- `npm test` passou **184/184** após a integração.
- `npm run prepare:editor -- --out build/diana-sprite-sheet-tools-20261017` preparou uma cópia isolada; `node scripts/test-prepared.cjs build/diana-sprite-sheet-tools-20261017` passou **63/63**. A build compartilhada e o caminho do Tauri não foram substituídos.
- `npm run prepare:editor` também atualizou a build integrada em `build/diana/editor`; `npm run test:prepared` passou **63/63** e as regressões direcionadas passaram **18/18** com `DIANA_BATTLE_SOURCE=build/diana`.
- O host Tauri de desenvolvimento abriu com `npm start`. Na tela Animações 2, o compositor exibiu grade, prévia, botões de centralização/salvamento e ordem de cliques; um clique no segundo quadro atualizou a sequência de 1 para 2 quadros. Captura: `images/prints-editor/pose-grid-tauri-2026-10-17.png`.
- `npm test` passou **184/184** na segunda execução. Uma execução anterior concorrente reportou uma falha isolada no subprocesso `starter-experience.test.cjs`; esse arquivo passou sozinho e a repetição completa passou.
- `npm run smoke:windows` passou após corrigir a contagem do hunk de caminhada; relatório em `artifacts/windows-smoke.json`, fixture em `artifacts/windows-smoke-LmHvkE`. Esse smoke executa o host NW.js e não certifica nem invalida a interface Tauri.
- Validação dentro de uma partida e pacote Tauri continuam pendentes.
- O algoritmo depende de uma grade conhecida e de transparência para distinguir sprite de fundo. Folhas opacas, elementos que já atravessam fronteiras ou sprites em poses intencionais com bases diferentes precisam de revisão manual; elas não são alteradas quando a detecção não é confiável.

## Corretor de vazamentos ? 17/10/2026

Estado: **implementado e testado por API/DOM; revis?o visual da nova limpeza e execu??o com uma folha corrigida ainda pendentes**. No compositor de mapa ou de Anima??es 2, use **Centralizar e proteger quadros** e **Salvar folha corrigida no projeto**. O diagn?stico agora l? pixels pelo canvas; antes recebia uma imagem sem dados RGBA e impedia abrir a ferramenta com imagem real.

A op??o **Remover fragmentos pequenos e soltos nas bordas** remove apenas componentes desconectados que tocam a borda e t?m menos de 25% dos pixels do maior componente do quadro (conectividade de oito vizinhos). ? opcional porque armas e efeitos tamb?m podem ser separados. Partes conectadas cruzando divis?es continuam preservadas e sinalizadas: o algoritmo n?o reconstr?i desenhos j? cortados. Revise a pr?via; **Restaurar folha original** desfaz o processamento antes de salvar. O original n?o ? sobrescrito. Margens s?o limitadas ao tamanho real da c?lula para impedir escrita fora do frame em grades pequenas.

Evid?ncias: testes da ferramenta 9/9; runtime preparado 63/63; npm test 194/196 (falhas existentes em jrpg-polish: base 47 versus 46, e rtp-expansion: 28 versus 27 itens). Smoke Windows NW.js passou em artifacts/windows-smoke-b3d8tB; n?o certifica a limpeza visual nem o host Tauri. Logs: artifacts/sprite-tools-tests.log e artifacts/sprite-tools-smoke.log.
