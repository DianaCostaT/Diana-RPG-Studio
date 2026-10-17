# Atlas de possibilidades RPG Maker para o Diana

Pesquisa de 17/10/2026. **Estado: extração das 30 abas concluída; estudo de fontes
selecionadas concluído; aplicação de recursos novos planejada.**

## Origem, extração e limites

Fonte: [Daily RPG Maker News Spreadsheet, de SigmaSuccour](https://docs.google.com/spreadsheets/d/1Xbevw96IUblD_OUsnoX7OqQIb7qRX8FW7NWR-Cw8s9c/edit#gid=944252944).
O link recebido abre Tileset, mas o documento tem 30 abas. Todas foram exportadas
por CSV público, sem login. Foram preservados 14.612 registros CSV incluindo
cabeçalhos e linhas vazias; o catálogo útil contém **13.859 registros**, dos quais
**8.225 têm links** e **5.634 não têm URL**. Há **7.814 URLs distintas por igualdade
textual**, sem normalizar parâmetros, fragmentos ou redirecionamentos.

A conferência adicional por XLSX encontrou **8.349 relações de hyperlink**, com
**104 URLs únicas adicionais** ausentes da extração textual CSV. A união alcança
**7.918 URLs únicas**. Isso preserva também destinos escondidos atrás de rótulos;
nenhum desses números significa que todos os sites foram visitados.

Catálogo durável: [rpgmaker-resources.ndjson](../.diana-ai/references/rpgmaker-resources.ndjson).
Cada linha JSON contém categoria, título, gid, linha CSV e URLs. Quando presentes
nos cabeçalhos, inclui data, Paid e Series como aparecem na fonte, sem atualizar
ou interpretar esses valores. A linha CSV é um registro lógico: campos podem
conter quebras de linha. Os CSVs completos, extrator e relatório com hashes por aba
estão localmente em `artifacts/rpgmaker-sheet-study/`; essa pasta é ignorada pelo Git.
O resumo persistente com hashes está em `.diana-ai/rpgmaker-sheet-study.json`.
Os hyperlinks adicionais ficam em
[rpgmaker-additional-hyperlinks.ndjson](../.diana-ai/references/rpgmaker-additional-hyperlinks.ndjson),
com aba e célula de origem. O snapshot XLSX também permanece na pasta de evidências.

Todos os títulos foram processados para indexação; isso não significa leitura
integral de todos os destinos. Foi aprofundada uma amostra de páginas oficiais e
de autores, identificada abaixo. Vídeos não foram assistidos, pacotes não foram
instalados e plugins não foram executados. Um link extraído pode estar quebrado,
apontar para tradução/pesquisa ou ser um download, e não documentação. Na aba MV,
milhares de registros são apenas nomes de arquivos: não inventar o autor ou URL.
A própria etiqueta “Complete” é o nome da aba, não uma garantia de catálogo universal.

A planilha mistura gerações, notícias históricas, ferramentas e produtos. Há
registros antigos e entradas MZ observadas com data até agosto de 2024; não usar
Paid, versão ou data da planilha como informação atual sem consultar o autor.
O estudo amplia o repertório disponível; não estabelece “tudo que existe” no RPG Maker.

## Como pensar as possibilidades

Separar quatro camadas ao planejar uma função:

1. **Ferramentas nativas:** mapas, dados, eventos e apresentação da geração escolhida.
2. **Sistemas construídos com eventos:** regras compostas a partir dessas ferramentas.
3. **Extensões:** plugins e ferramentas que mudam ou acrescentam comportamento.
4. **Pipeline de produção:** artes, áudio, localização, diagnóstico, testes e distribuição.

MV/MZ compartilham JavaScript, mas isso não prova compatibilidade entre seus plugins.
Plugins XP/VX/VX Ace pertencem a outra família técnica; formatos de 2000/2003 são
outra referência. No Diana, distinguir ainda RPGReactor, PixiJS 8 e host Tauri.
Um recurso disponível no ecossistema não está automaticamente disponível no Diana.

## Base nativa documentada

| Área | O que permite construir | Referência primária |
| --- | --- | --- |
| Mapas | Pintura, seleção de trechos, preenchimento, camadas, autotiles e sombras. | [Edição de mapas MZ](https://rpgmakerofficial.com/product/MZ_help-en/01_07_01.html) |
| Comportamento do terreno | Passagem por direção, oclusão, escadas, piso de dano, balcões e identificação de terreno. | [Tilesets](https://rpgmakerofficial.com/product/MZ_help-en/01_08_10.html) |
| Regras de personagens | Atores/classes, habilidades, itens, equipamentos, inimigos, tropas e estados. | [Banco de dados](https://rpgmakerofficial.com/product/MZ_help-en/01_08.html) |
| Narrativa | Eventos de mapa, eventos comuns reutilizáveis e acontecimentos na batalha. | [Eventos](https://rpgmakerofficial.com/product/MZ_help-en/01_09.html) |
| Estado e lógica | Switches, variáveis, condições e laços; base para regras compostas. | [Fluxo de controle](https://rpgmakerofficial.com/product/MZ_help-en/01_10_03.html) |
| Encenação | Rotas, transferências, câmera por rolagem e veículos. | [Movimento](https://rpgmakerofficial.com/product/MZ_help-en/01_10_06.html) |
| Processos reutilizáveis | Eventos comuns acionados conforme sua configuração. | [Eventos comuns](https://rpgmakerofficial.com/product/MZ_help-en/01_08_11.html) |
| Apresentação e interação | Imagens, áudio, efeitos de tela e comandos de batalha; combináveis com lógica. | [Catálogo de comandos](https://rpgmakerofficial.com/product/MZ_help-en/01_10.html) |
| Recursos próprios | Convenções de imagens, áudio, vídeos e organização dos arquivos. | [Padrões de assets](https://rpgmakerofficial.com/product/MZ_help-en/01_11_01.html) |
| Autoria e diagnóstico | Ferramentas auxiliares e playtest como parte do fluxo de criação. | [Ferramentas MZ](https://rpgmakerofficial.com/product/MZ_help-en/01_05.html) |

Essas referências descrevem MZ. Não transferir dimensões, limites ou convenções
automaticamente para os sprites grandes e os formatos configuráveis do Diana.

## Extensões estudadas diretamente

As descrições abaixo resumem o que os autores documentam. Nenhuma linha representa
homologação do plugin no Diana.

| Possibilidade | Fonte consultada | Aprendizado para autoria |
| --- | --- | --- |
| Animações e roupas em camadas | [AnimaX](https://kdworkshop.net/animax/) | Perfis para atores, eventos e inimigos; ações pontuais/loop, direções e camadas de equipamentos. Inspira controles compartilhados de animação e diagnóstico de imagens ausentes. |
| Equipamento visível | [Equip Construct](https://synrec.itch.io/rpg-maker-mz-equip-construct) | Aparência ligada a equipamento exige imagens alinhadas no mapa e na batalha. O autor restringe redistribuição fora de projeto MZ finalizado. |
| Combate tático | [Synrec TBS](https://synrec.itch.io/rpg-maker-mz-tactical-battle-system) | Posicionamento, alcance, área de efeito, terreno, IA e condições de vitória precisam de configuração e visualização próprias. Ter um mapa de batalha não implementa todas essas regras. |
| Movimento fora da grade | [Ignis Pixel Movement](https://raizen884.itch.io/ignis-pixel-movement) | Hitboxes, mouse/toque e controle analógico; validar interação, seguidores e gatilhos ao mudar o movimento. O autor reconhece limitações em comandos de evento. |
| Construção durante o jogo | [Drag’s Sandbox Map](https://drag-and-plug-in.itch.io/sandbox-map-for-mz) | Modificar tiles, autotiles e camadas durante a partida exige persistência; a demonstração descrita não conserva mudanças ao trocar de mapa/abrir menu. |
| Luz e sombras dinâmicas | [Shora Lighting](https://shoraaa.itch.io/shora-lighting-plugin) | Luz em eventos/itens, transições, pulsação e sombras por terreno/região. Separar efeito visual, custo de renderização e regra de visibilidade. |
| Câmera cinematográfica | [Hakuen Camera Manager](https://hakuenstudio.itch.io/hakuen-studio-camera-manager-for-rpg-maker) | Foco em evento/personagem, duração/easing, origem recuperável e callback de conclusão; evitar prender o controle após uma cena. |
| Agricultura e coleta | [CGMZ Gathering](https://casper-gaming.itch.io/cgmz-gathering) | Estágios de crescimento, sementes, colheita e avanço manual; é preciso definir o relógio e a persistência de cada nó. |
| Relógio e dia/noite | [Cookie Cutter Day/Night](https://cazwolf.itch.io/cookiecuttermz-daynight) | Um template de eventos pode produzir o sistema sem exigir uma nova engine. Relógio e tonalidade devem ser configuráveis e verificáveis. |
| Pesca | [Cookie Cutter Fishing](https://cazwolf.itch.io/cookiecuttermz-fishing) | Minijogo conectado a itens e eventos comuns; sua integração precisa remapear IDs reservados. |
| Localização | [Neoma Localization](https://neomastudio.itch.io/localizationmzmv) | Textos de menus/dados/diálogos e seleção de idioma. UTF-8 por si só não comprova fontes, diagramação e escrita complexa adequadas. |
| Opção de conforto visual | [Limit Screen Flash](https://nowis-337.itch.io/limitscreenflash) | Limitar intensidade dos flashes como preferência do jogador; testar efeitos em conjunto. Isso não certifica acessibilidade integral. |
| Ensino dentro do jogo | [MZ Academy](https://www.caspergaming.com/tutorials/mzacademy/) | Tutorial jogável como referência para apresentar eventos, dados e comandos gradualmente. |
| Apresentação 3D | [MZ3D](https://cutievirus.itch.io/mz3d) | Exemplo de extensão profunda do ecossistema. Serve para conhecer possibilidades; não será adicionado como outra engine ao Diana. |

## Produção artística e audiovisual

- [Mapping Forests, por Avery](https://www.rpgmakerweb.com/blog/mapping-forests):
  compor primeiro caminhos e massas, variar solo e copas, evitar repetição evidente
  e acrescentar pontos de interesse. Aplicação proposta: enriquecer expansões da
  Clareira mantendo caminhos claros, arquitetura, vegetação e profundidade aprovadas.
- [Tonbi: personagens mais altos](https://zenn.dev/tonbi/articles/6054d1eff8520f):
  referência de estudo para mudanças de proporção. No Diana, preservar silhueta,
  anatomia, pés, arma e direção ao longo dos quadros; não copiar os edits de RTP.
- [Effekseer](https://effekseer.github.io/en/): ferramenta de efeitos de partículas;
  considerar autorar efeitos e verificar sua reprodução no runtime. Aparência de
  partícula e animação corporal são contratos diferentes, com sincronização necessária.
- [Pixelpart](https://soeren-m.itch.io/pixelpart): documenta saída em folhas de
  sprites, sequências e vídeo. Exportação raster é uma possibilidade a avaliar,
  sem presumir a existência de plugin específico para RPGReactor.
- [Bitmapflow](https://bauxite.itch.io/bitmapflow): calcula quadros intermediários
  por fluxo óptico; o próprio autor prevê correção manual. Avaliar arma, mãos e
  silhueta: mais quadros não garantem melhor animação, e impacto/pausa devem permanecer.
- [Icon Machine](https://bmaczero.itch.io/icon-machine): ícones procedurais com
  semente e transparência. A página distingue saída CC0 de código GPLv3; não
  confundir a licença do resultado com a ferramenta. A estética precisa passar
  pela referência Clareira antes de qualquer uso.
- [ChipTone](https://sfbgames.itch.io/chiptone): criação de efeitos sonoros; os sons
  gerados são declarados CC0 pelo autor. É uma referência para sons de interface,
  interação e impacto; nada foi gerado ou importado nesta pesquisa.

Integrar esse aprendizado ao [guia PhotoCraft](PHOTOCRAFT_ART_LEARNINGS.md) e à
[autoria de sprites](SPRITE_SHEET_AUTHORING.md): preservar fontes, trabalhar em
cópias, evitar halos, manter pivô e escala, conferir no tamanho real e dentro do jogo.
Assets de vitrines comerciais e RTP edits permanecem apenas referências externas.

## Outras famílias descobertas no índice

Os exemplos a seguir foram encontrados nos títulos/URLs da planilha, mas seus
destinos não foram aprofundados nesta rodada. São pistas para pesquisa, não
confirmação técnica ou recomendação de adoção:

| Família | Exemplo localizado |
| --- | --- |
| Missões e diário | [QuestSystem](https://github.com/unagiootoro/RPGMZ/blob/master/QuestSystem.js) |
| Árvore de habilidades | [Rosedale Skill Tree](https://chaucer.itch.io/rosedale-skill-tree) |
| Crafting e receitas | [Simple Crafting](https://kdworkshop.net/plugins/simple-crafting/) |
| Combate de ação | [Alpha ABS Z](https://kdworkshop.net/plugins/alpha-abs-z/) |
| Névoa procedural | [WeatherFog](https://github.com/Nolonar/RM_Plugins-WeatherFog) |
| Retratos no diálogo | [BustDialog](https://github.com/Nolonar/RM_Plugins-BustDialog) |
| Minimapa | [Hakuen Minimap](https://hakuenstudio.itch.io/hakuen-studio-minimap) |
| Defesa de torres | [Tower defense](https://github.com/unwantedfriedchicken/rpgmakermz-plugins/tree/master/dev/towerdefense) |
| Loot e coleta visual | [Roguelike Loot Drop](https://castiger.itch.io/kotc-roguelike-loot-drop-system) |
| Reputação/facções | [Factions & Reputation](https://forums.rpgmakerweb.com/index.php?threads/konoras-factions-reputation-reloaded-plugin-for-rpg-maker-mz-ported-by-sixeightw0lf.143527/) |

O catálogo também permite investigar telas de título, inventário, HUD, menus,
save com miniatura, autosave, spawn/persistência de eventos, mensagens e escolhas,
áudio espacial, ferramentas de depuração e publicação. A profundidade de cada
implementação deve ser verificada no destino antes de entrar numa especificação.

## Receitas próprias para orientar o Diana

As receitas abaixo são propostas de composição, não implementações copiadas nem
funcionalidades acrescentadas ao projeto nesta tarefa.

**Missão de coleta:** representar progresso por estados (indisponível, aceita,
objetivo cumprido, recompensa entregue); conferir inventário e requisitos ao
conversar; entregar recompensa uma única vez. Separar contagem de itens possuídos
de itens coletados historicamente. Validar salvar/carregar e interações repetidas.

**Agricultura:** identificar cada canteiro por mapa/evento, armazenar espécie,
estágio e instante da atualização; avançar conforme um relógio explicitamente
escolhido. Definir se tempo continua em menu, batalha ou jogo fechado. Colheita
consome/gera recursos uma vez e restaura o estágio correto após reabrir o jogo.

**Dia/noite e rotina de NPCs:** um relógio central alimenta iluminação e condições
de eventos. Ao retornar ao mapa, aplicar o estado atual em vez de acumular processos
paralelos duplicados. Prever pausa em cenas, transição suave e opção de ajuste visual.

**Equipamento visual:** o equipamento resolve um conjunto de camadas por personagem,
direção e ação. Reutilizar grade/pivô e contrato para aliados e inimigos, com fallback
para camadas ausentes. Conferir ataque, dano, morte e troca de equipamento em jogo.

**Cena cinematográfica:** armazenar estado de câmera/controle, executar rota e
diálogo, aguardar conclusão e restaurar o estado inclusive se a cena for interrompida.
Não usar temporizações arbitrárias como substituto de conclusão de animação.

## Aplicação e prioridades no projeto

1. **Planejado:** usar o atlas como checklist de lacunas, cruzando cada item com
   evidências Diana existentes; não promover itens do catálogo a “implementados”.
2. **Planejado — prioridade próxima:** concluir controles visuais, diagnóstico de
   recursos, apresentação e animação compartilhada, com prévia fiel ao jogo.
3. **Planejado:** pequenas receitas demonstráveis de eventos (missão, relógio,
   coleta), com estados explícitos e persistência, preservando a Clareira aprovada.
4. **Planejado:** pesquisar por demanda as extensões profundas, após concluir os
   fluxos centrais de editor, playtest e exportação Tauri.

Compatibilidade deve ser registrada por recurso: versão do plugin, dependências,
ordem de carga, APIs internas, Pixi/DOM/áudio, acesso Node/NW, dados persistidos e
comportamento em Tauri. Referências comerciais ou públicas não autorizam incorporá-las
ao editor distribuído. Nenhum código proprietário, demo ou asset foi incorporado.

Validação desta entrega: exportação 30/30, leitura dos CSVs com aspas e campos
multilinha, conferência de hyperlinks XLSX, catálogo e contagens conciliadas, hashes dos snapshots e consulta
documental das fontes citadas. Não foram executados testes de aplicação porque
as alterações são documentais. Após implementação, executar `npm test` e
`npm run smoke:windows`, distinguindo API, interação visual e jogo; o smoke NW.js
não substitui homologação de editor/playtest/export no pacote Tauri.

## Consultar o catálogo

Busca rápida no terminal, por exemplo:

```powershell
rg -i 'quest|farming|lighting|animation' .diana-ai/references/
```

Uma correspondência é um resultado de pesquisa. Consultar a URL e a versão antes
de transformar o resultado em regra de produto. Para registros sem URL, pesquisar
o nome exato e verificar autoria; não baixar automaticamente arquivos homônimos.
