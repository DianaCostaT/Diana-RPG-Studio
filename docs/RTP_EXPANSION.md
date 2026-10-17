# Expansão RTP nativa

**Estado: implementado e testado por API; biblioteca em janela própria verificada por DOM.** `DianaRTPExpansion.populate(data)` complementa o projeto inicial sem sobrescrever Liora, Brann ou seus atlas. O catálogo editável é persistido em `System.dianaRtpCatalog`; a janela **Recursos e biblioteca de exemplos** mostra os recursos instalados e abre as tabelas correspondentes. O catálogo não ocupa mais a tela de batalha.

## Seguidores

`System.optFollowers` é verdadeiro por padrão. O controle visual oferece “Visíveis, seguindo o herói” ou “Todos recolhidos no herói”, ligado aos comandos nativos `show`, `hide` e `gather`; o jogo usa o sistema de seguidores existente.

## Veículos

O pacote `assets/vehicles/originals/` contém os sprites autorais imutáveis de bote, navio e aeronave. `npm run assets:compile:vehicles` (quando integrado ao `package.json`) ou `node scripts/compile-vehicle-assets.cjs` copia somente essas fontes para `assets/vehicles/pack/`, valida a grade 3x4 de 48 px e registra hashes em `manifest.json`.

Os campos nativos `System.boat`, `System.ship` e `System.airship` recebem sprites e pontos de início independentes. O rio da `Map001` inclui margem e água para bote e navio; a aeronave inicia em solo transitável. As flags nativas de colisão impedem navegar em terra ou pousar sobre a água.

## Validação

- **API:** `node --test tests/rtp-expansion.test.cjs` valida catálogo, preferência de seguidores, comandos nativos, posições e passagem dos veículos, sprites e manifesto.
- **Visual:** o seletor de seguidores permanece na tela de batalha e a biblioteca abre em Recursos. O teste DOM confirma que os cartões são exibidos e encaminham a tabela do item selecionado; revisão visual no NW.js pendente.
- **Execução de jogo:** defesa, novo jogo, dois heróis, suprimentos e combate de campo são verificados nos smokes Windows; embarque e navegação dos três veículos ainda precisam de teste manual de interação.
