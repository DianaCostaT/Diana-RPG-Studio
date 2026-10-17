# Expansão da Vila da Clareira

Estado em 16/10/2026: **restauração implementada, testes de API aprovados e tela principal capturada no Windows; inspeção de interiores parcial**. `DianaVillageExpansion.completeStarter(data, B)` roda depois da configuração do projeto inicial e antes do catálogo de veículos.

## Contrato

- Amplia a Vila da Clareira de 48 × 40 para 80 × 64. O mapa original, seis camadas, personagens e eventos são preservados no deslocamento `(16,12)`.
- Atualiza o início do jogador, eventos e transferências que retornam ao mapa da vila.
- As quatro portas novas usam prioridade normal para responder ao comando de ação quando o jogador está adjacente; uma regressão protege esse contrato.
- Mantém os cinco mapas anteriores e acrescenta quatro interiores editáveis: Boticário das Folhas, Forja do Vale, Biblioteca das Caminhadas e Salão do Mirante, nos mapas 6 a 9.
- Restaura a primeira composição aprovada como uma placa ilustrada de 32 × 32 tiles, alinhada à grade nativa em `(20,16)` dentro do mapa expandido. O PNG transparente de 2560 × 2048 mantém as regiões adicionais visíveis e editáveis.
- Aplica colisão invisível sobre a placa; portas, NPCs e destinos continuam sendo eventos reais. O editor abre enquadrado no centro da vila, enquanto o ponto inicial fica no caminho principal.

## Vila e exploração

A composição central recupera a clareira original com casas azul-petróleo, rio, ponte, ruínas e caminhos sinuosos. O entorno mantém a praça conectada a jardins, mercado, caminhos e mirante. As páginas B e C contêm objetos de cenário; a página E traz fachadas autorais em camadas. O compilador registra origem, licença e hashes nos manifestos dos assets.

NPCs conversam e cada interior oferece uma atividade: a boticária recupera o grupo, a forja abre a loja, a biblioteca tem leituras contextuais e o salão entrega um baú uma única vez. A placa central preserva a composição aprovada como ilustração; o entorno e os interiores usam mapas nativos. A área ilustrada central não pode ser pintada tile a tile.

## Verificação

`npm test` passou 154/154 e `npm run test:prepared -- build/diana-village-final` passou 63/63. O smoke anterior capturou editor, mapa em execução, comandos e golpe em `artifacts/clareira-restaurada-5z8mlD/`; não houve erros de runtime. O executável `dist/Diana-RPG-Studio-Clareira-preview-2026-10-16/Diana.exe` passou `scripts/smoke-ready-windows.cjs`.

Em `scripts/smoke-village-navigation-windows.cjs`, navegação por seis passos de seta e conversa com a jardineira passaram. A tecla de ação transferiu para Map006 depois da correção de prioridade. A captura `artifacts/village-navigation-windows-lnzYd4/falha.png` mostra o interior carregado após limpar o sprite de fade, mas escurecido; o loop do jogo não avançou e o harness não confirmou a conversa seguinte nem as saídas. As posições de preparação dentro dos cômodos são injetadas pelo teste, portanto o fluxo completo de caminhada ainda não foi homologado. O smoke de combate no cenário foi validado separadamente em `docs/COMBAT_MODES.md`.
