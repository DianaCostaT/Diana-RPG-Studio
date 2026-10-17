# Prompts originais ? Diana RTP 0.1.0

Estado: **planejado**. Nenhuma arte, fonte ou mapa foi gerado. Este documento corresponde um a um aos IDs do manifesto; cada seção ? uma solicitação independente.

## Contrato comum de execução

Para cada ID, concatenar este contrato, o texto de sua seção e o contrato referenciado em manifest.json. Criar somente conteúdo original: não usar personagens protegidos, RTP comercial, Demo upstream, screenshots, logos, marcas, assets de jogos ou imitação de franquias/artistas identificáveis. Estética JRPG ilustrada limpa, cores legíveis, contornos discretos, luz superior esquerda; manter identidade apenas entre entradas entityId iguais. Não misturar Medieval e Moderno. Sem palavras, assinatura ou marca-d’água.

Imagens: PNG RGBA8 sRGB nas dimensões exatas, células alinhadas sem margem, padding ou sangria. Fundo transparente exceto cenários; câmera ortográfica nos tiles e sprites. Nenhuma sombra ou membro pode vazar da célula. Células vazias devem ser RGBA zero. As fontes de arquitetura e props reservam posições distintas no mesmo B final; não são dois slots B concorrentes. IconSet final usa 16 colunas e os Índices declarados, copiando cada Ícone fonte individualmente. Revisão humana deve rejeitar grade/alinhamento incorretos; não confiar em dimensões declaradas pelo gerador.

Animações: caminhada 3 colunas ? 4 direções (baixo, esquerda, direita, cima), passada esquerda/neutro/passada direita. Combate: 6 colunas ? 6 linhas, idle/attack/damage/guard/victory/dead, cada linha com seis quadros distintos, raiz estável nos pés e silhueta consistente; inimigos recebem o mesmo contrato. Retrato somente na célula 0, expressão neutra. Efeito: 15 quadros em ordem row-major, começo pequeno, máximo no quadro 7, dissipação at? transparência no 14.

Mapas: produzir futuramente fonte JSON de receita, nunca bitmap. Reproduzir exatamente recipe do manifesto, sem improvisar coordenadas, RNG ou comandos novos; compilar para dados nativos Reactor. Prévia deve mostrar tiles selecionáveis e colisão editável.

Registrar criador, ferramenta/modelo/versão, seed (null com justificativa se não suportada), data, prompt efetivo, revisão de direitos e hashes das fontes/saídas antes de liberar sob MIT. Geração de imagens não ? determinística: builds posteriores usam fontes aprovadas imutáveis, versão do compilador e lock de dependências registrados. Não h? compilador ou adapter implementado neste escopo. Validar contratos de API, interação visual e execução de jogo separadamente antes de declarar suporte.

## medieval.walk.hero-1

Prompt ID: `medieval.walk.hero-1`. Módulo: medieval.

Gerar arte original: Alva, cartógrafa de capa ocre e trança curta.

Fonte planejada: `sources/medieval/Diana_Medieval_hero1_Walk.png`. Saída planejada: `pack/medieval/img/characters/Diana_Medieval_hero1_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.battle.hero-1

Prompt ID: `medieval.battle.hero-1`. Módulo: medieval.

Gerar arte original: Alva, cartógrafa de capa ocre e trança curta.

Fonte planejada: `sources/medieval/Diana_Medieval_hero1_Battle.png`. Saída planejada: `pack/medieval/img/pictures/Diana_Medieval_hero1_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.portrait.hero-1

Prompt ID: `medieval.portrait.hero-1`. Módulo: medieval.

Gerar arte original: Alva, cartógrafa de capa ocre e trança curta.

Fonte planejada: `sources/medieval/Diana_Medieval_hero1_Face.png`. Saída planejada: `pack/medieval/img/faces/Diana_Medieval_hero1_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.walk.hero-2

Prompt ID: `medieval.walk.hero-2`. Módulo: medieval.

Gerar arte original: Breno, herbalista de túnica verde e bolsa de couro.

Fonte planejada: `sources/medieval/Diana_Medieval_hero2_Walk.png`. Saída planejada: `pack/medieval/img/characters/Diana_Medieval_hero2_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.battle.hero-2

Prompt ID: `medieval.battle.hero-2`. Módulo: medieval.

Gerar arte original: Breno, herbalista de túnica verde e bolsa de couro.

Fonte planejada: `sources/medieval/Diana_Medieval_hero2_Battle.png`. Saída planejada: `pack/medieval/img/pictures/Diana_Medieval_hero2_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.portrait.hero-2

Prompt ID: `medieval.portrait.hero-2`. Módulo: medieval.

Gerar arte original: Breno, herbalista de túnica verde e bolsa de couro.

Fonte planejada: `sources/medieval/Diana_Medieval_hero2_Face.png`. Saída planejada: `pack/medieval/img/faces/Diana_Medieval_hero2_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.walk.monster-1

Prompt ID: `medieval.walk.monster-1`. Módulo: medieval.

Gerar arte original: Musgoso, pequeno golem de argila coberto de musgo.

Fonte planejada: `sources/medieval/Diana_Medieval_monster1_Walk.png`. Saída planejada: `pack/medieval/img/characters/Diana_Medieval_monster1_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.battle.monster-1

Prompt ID: `medieval.battle.monster-1`. Módulo: medieval.

Gerar arte original: Musgoso, pequeno golem de argila coberto de musgo.

Fonte planejada: `sources/medieval/Diana_Medieval_monster1_Battle.png`. Saída planejada: `pack/medieval/img/pictures/Diana_Medieval_monster1_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.portrait.monster-1

Prompt ID: `medieval.portrait.monster-1`. Módulo: medieval.

Gerar arte original: Musgoso, pequeno golem de argila coberto de musgo.

Fonte planejada: `sources/medieval/Diana_Medieval_monster1_Face.png`. Saída planejada: `pack/medieval/img/faces/Diana_Medieval_monster1_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.walk.monster-2

Prompt ID: `medieval.walk.monster-2`. Módulo: medieval.

Gerar arte original: Mariposa Âmbar de seis patas e asas arredondadas.

Fonte planejada: `sources/medieval/Diana_Medieval_monster2_Walk.png`. Saída planejada: `pack/medieval/img/characters/Diana_Medieval_monster2_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.battle.monster-2

Prompt ID: `medieval.battle.monster-2`. Módulo: medieval.

Gerar arte original: Mariposa Âmbar de seis patas e asas arredondadas.

Fonte planejada: `sources/medieval/Diana_Medieval_monster2_Battle.png`. Saída planejada: `pack/medieval/img/pictures/Diana_Medieval_monster2_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.portrait.monster-2

Prompt ID: `medieval.portrait.monster-2`. Módulo: medieval.

Gerar arte original: Mariposa Âmbar de seis patas e asas arredondadas.

Fonte planejada: `sources/medieval/Diana_Medieval_monster2_Face.png`. Saída planejada: `pack/medieval/img/faces/Diana_Medieval_monster2_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.walk.monster-3

Prompt ID: `medieval.walk.monster-3`. Módulo: medieval.

Gerar arte original: Caranguejo de basalto com cristais foscos.

Fonte planejada: `sources/medieval/Diana_Medieval_monster3_Walk.png`. Saída planejada: `pack/medieval/img/characters/Diana_Medieval_monster3_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.battle.monster-3

Prompt ID: `medieval.battle.monster-3`. Módulo: medieval.

Gerar arte original: Caranguejo de basalto com cristais foscos.

Fonte planejada: `sources/medieval/Diana_Medieval_monster3_Battle.png`. Saída planejada: `pack/medieval/img/pictures/Diana_Medieval_monster3_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.portrait.monster-3

Prompt ID: `medieval.portrait.monster-3`. Módulo: medieval.

Gerar arte original: Caranguejo de basalto com cristais foscos.

Fonte planejada: `sources/medieval/Diana_Medieval_monster3_Face.png`. Saída planejada: `pack/medieval/img/faces/Diana_Medieval_monster3_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.tiles.terrain

Prompt ID: `medieval.tiles.terrain`. Módulo: medieval.

Gerar arte original: Terrenos de vila de pedra clara, madeira e pradaria: solo, caminho, Água, piso, ponte, borda, acento e terreno Áspero.

Fonte planejada: `sources/medieval/Diana_Medieval_Terrain_A5.png`. Saída planejada: `pack/medieval/img/tilesets/Diana_Medieval_Terrain_A5.png`. Pasta no editor: `img/tilesets`.

Contrato: `terrain`, 256 × 256 px; grade 8 × 8; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.tiles.architecture

Prompt ID: `medieval.tiles.architecture`. Módulo: medieval.

Gerar arte original: Kit de arquitetura de vila de pedra clara, madeira e pradaria: parede, telhado, porta, janela, escada, canto e soleira; módulos de 32 px.

Fonte planejada: `sources/medieval/Diana_Medieval_Architecture_Source.png`. Saída planejada: `pack/medieval/img/tilesets/Diana_Medieval_Architecture_Source.png`. Pasta no editor: `img/tilesets`.

Contrato: `objects`, 512 × 512 px; grade 16 × 16; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

Composição determinística: `{"target":"Diana_Medieval_Objects_B.png","cells":[1,63],"reservedTransparent":"0 e 64..255"}`; preservar posições reservadas transparentes.

## medieval.tiles.props

Prompt ID: `medieval.tiles.props`. Módulo: medieval.

Gerar arte original: Árvore modular, cerca, barril, banco, canteiro e placa sem texto.

Fonte planejada: `sources/medieval/Diana_Medieval_Props_Source.png`. Saída planejada: `pack/medieval/img/tilesets/Diana_Medieval_Props_Source.png`. Pasta no editor: `img/tilesets`.

Contrato: `objects`, 512 × 512 px; grade 16 × 16; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

Composição determinística: `{"target":"Diana_Medieval_Objects_B.png","cells":[64,127],"reservedTransparent":"0..63 e 128..255"}`; preservar posições reservadas transparentes.

## medieval.background.area-1

Prompt ID: `medieval.background.area-1`. Módulo: medieval.

Gerar arte original: vila de pedra clara, madeira e pradaria; praça externa ao amanhecer, chão livre na metade inferior, sem personagens.

Fonte planejada: `sources/medieval/Diana_Medieval_Area1_Background.png`. Saída planejada: `pack/medieval/img/battlebacks1/Diana_Medieval_Area1_Background.png`. Pasta no editor: `img/battlebacks1`.

Contrato: `background`, 1280 × 720 px; grade 1 × 1; célula 1280 × 720 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.background.area-2

Prompt ID: `medieval.background.area-2`. Módulo: medieval.

Gerar arte original: vila de pedra clara, madeira e pradaria; Área de confronto ao entardecer, chão livre na metade inferior, sem personagens.

Fonte planejada: `sources/medieval/Diana_Medieval_Area2_Background.png`. Saída planejada: `pack/medieval/img/battlebacks1/Diana_Medieval_Area2_Background.png`. Pasta no editor: `img/battlebacks1`.

Contrato: `background`, 1280 × 720 px; grade 1 × 1; célula 1280 × 720 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.weapons.set

Prompt ID: `medieval.weapons.set`. Módulo: medieval.

Gerar arte original: Oito armas originais: espada curta, bastão, arco, lança, maça, adaga, escudo e varinha.

Fonte planejada: `sources/medieval/Diana_Medieval_Weapons_Source.png`. Saída planejada: `pack/medieval/img/system/Diana_Medieval_Weapons_Source.png`. Pasta no editor: `img/system`.

Contrato: `icons`, 256 × 128 px; grade 8 × 4; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

Composição determinística: `{"target":"IconSet.png","indices":[0,7]}`; preservar posições reservadas transparentes.

## medieval.items.set

Prompt ID: `medieval.items.set`. Módulo: medieval.

Gerar arte original: Oito itens originais: frasco de cura, frasco de energia, antídoto, chave, lanterna, corda, alimento e cristal de recurso; coerentes com o módulo.

Fonte planejada: `sources/medieval/Diana_Medieval_Items_Source.png`. Saída planejada: `pack/medieval/img/system/Diana_Medieval_Items_Source.png`. Pasta no editor: `img/system`.

Contrato: `icons`, 256 × 128 px; grade 8 × 4; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

Composição determinística: `{"target":"IconSet.png","indices":[16,23]}`; preservar posições reservadas transparentes.

## medieval.effects.impact

Prompt ID: `medieval.effects.impact`. Módulo: medieval.

Gerar arte original: Impacto de faíscas douradas e folhas luminosas, expansão e dissipação.

Fonte planejada: `sources/medieval/Diana_Medieval_Impact.png`. Saída planejada: `pack/medieval/img/animations/Diana_Medieval_Impact.png`. Pasta no editor: `img/animations`.

Contrato: `effects`, 960 × 576 px; grade 5 × 3; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## medieval.map.area-1

Prompt ID: `medieval.map.area-1`. Módulo: medieval.

Especificar receita original de mapa nativo: Área inicial explorável de vila de pedra clara, madeira e pradaria.

Fonte planejada: `sources/medieval/Map001.recipe.json`. Saída planejada: `pack/medieval/data/Map001.json`. Pasta no editor: `data`.

Mapa 24 × 18 tiles de 32 px, seis camadas; copiar a recipe desta entrada e resolver somente dependências locais declaradas.

## medieval.map.area-2

Prompt ID: `medieval.map.area-2`. Módulo: medieval.

Especificar receita original de mapa nativo: Rota com arena de batalha de vila de pedra clara, madeira e pradaria.

Fonte planejada: `sources/medieval/Map002.recipe.json`. Saída planejada: `pack/medieval/data/Map002.json`. Pasta no editor: `data`.

Mapa 24 × 18 tiles de 32 px, seis camadas; copiar a recipe desta entrada e resolver somente dependências locais declaradas.

## moderno.walk.hero-1

Prompt ID: `moderno.walk.hero-1`. Módulo: moderno.

Gerar arte original: Cora, técnica de manutenção com macacão azul e cabelo crespo.

Fonte planejada: `sources/moderno/Diana_Moderno_hero1_Walk.png`. Saída planejada: `pack/moderno/img/characters/Diana_Moderno_hero1_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.battle.hero-1

Prompt ID: `moderno.battle.hero-1`. Módulo: moderno.

Gerar arte original: Cora, técnica de manutenção com macacão azul e cabelo crespo.

Fonte planejada: `sources/moderno/Diana_Moderno_hero1_Battle.png`. Saída planejada: `pack/moderno/img/pictures/Diana_Moderno_hero1_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.portrait.hero-1

Prompt ID: `moderno.portrait.hero-1`. Módulo: moderno.

Gerar arte original: Cora, técnica de manutenção com macacão azul e cabelo crespo.

Fonte planejada: `sources/moderno/Diana_Moderno_hero1_Face.png`. Saída planejada: `pack/moderno/img/faces/Diana_Moderno_hero1_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.walk.hero-2

Prompt ID: `moderno.walk.hero-2`. Módulo: moderno.

Gerar arte original: Davi, mensageiro de jaqueta terracota e mochila refletiva.

Fonte planejada: `sources/moderno/Diana_Moderno_hero2_Walk.png`. Saída planejada: `pack/moderno/img/characters/Diana_Moderno_hero2_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.battle.hero-2

Prompt ID: `moderno.battle.hero-2`. Módulo: moderno.

Gerar arte original: Davi, mensageiro de jaqueta terracota e mochila refletiva.

Fonte planejada: `sources/moderno/Diana_Moderno_hero2_Battle.png`. Saída planejada: `pack/moderno/img/pictures/Diana_Moderno_hero2_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.portrait.hero-2

Prompt ID: `moderno.portrait.hero-2`. Módulo: moderno.

Gerar arte original: Davi, mensageiro de jaqueta terracota e mochila refletiva.

Fonte planejada: `sources/moderno/Diana_Moderno_hero2_Face.png`. Saída planejada: `pack/moderno/img/faces/Diana_Moderno_hero2_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.walk.monster-1

Prompt ID: `moderno.walk.monster-1`. Módulo: moderno.

Gerar arte original: Drone hexagonal de manutenção desgovernado sem marca.

Fonte planejada: `sources/moderno/Diana_Moderno_monster1_Walk.png`. Saída planejada: `pack/moderno/img/characters/Diana_Moderno_monster1_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.battle.monster-1

Prompt ID: `moderno.battle.monster-1`. Módulo: moderno.

Gerar arte original: Drone hexagonal de manutenção desgovernado sem marca.

Fonte planejada: `sources/moderno/Diana_Moderno_monster1_Battle.png`. Saída planejada: `pack/moderno/img/pictures/Diana_Moderno_monster1_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.portrait.monster-1

Prompt ID: `moderno.portrait.monster-1`. Módulo: moderno.

Gerar arte original: Drone hexagonal de manutenção desgovernado sem marca.

Fonte planejada: `sources/moderno/Diana_Moderno_monster1_Face.png`. Saída planejada: `pack/moderno/img/faces/Diana_Moderno_monster1_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.walk.monster-2

Prompt ID: `moderno.walk.monster-2`. Módulo: moderno.

Gerar arte original: Criatura de espuma azul com olhos geométricos.

Fonte planejada: `sources/moderno/Diana_Moderno_monster2_Walk.png`. Saída planejada: `pack/moderno/img/characters/Diana_Moderno_monster2_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.battle.monster-2

Prompt ID: `moderno.battle.monster-2`. Módulo: moderno.

Gerar arte original: Criatura de espuma azul com olhos geométricos.

Fonte planejada: `sources/moderno/Diana_Moderno_monster2_Battle.png`. Saída planejada: `pack/moderno/img/pictures/Diana_Moderno_monster2_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.portrait.monster-2

Prompt ID: `moderno.portrait.monster-2`. Módulo: moderno.

Gerar arte original: Criatura de espuma azul com olhos geométricos.

Fonte planejada: `sources/moderno/Diana_Moderno_monster2_Face.png`. Saída planejada: `pack/moderno/img/faces/Diana_Moderno_monster2_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.walk.monster-3

Prompt ID: `moderno.walk.monster-3`. Módulo: moderno.

Gerar arte original: Rob? coletor sobre três rodas e carcaça amarela.

Fonte planejada: `sources/moderno/Diana_Moderno_monster3_Walk.png`. Saída planejada: `pack/moderno/img/characters/Diana_Moderno_monster3_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 × 256 px; grade 3 × 4; célula 64 × 64 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.battle.monster-3

Prompt ID: `moderno.battle.monster-3`. Módulo: moderno.

Gerar arte original: Rob? coletor sobre três rodas e carcaça amarela.

Fonte planejada: `sources/moderno/Diana_Moderno_monster3_Battle.png`. Saída planejada: `pack/moderno/img/pictures/Diana_Moderno_monster3_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 × 1152 px; grade 6 × 6; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.portrait.monster-3

Prompt ID: `moderno.portrait.monster-3`. Módulo: moderno.

Gerar arte original: Rob? coletor sobre três rodas e carcaça amarela.

Fonte planejada: `sources/moderno/Diana_Moderno_monster3_Face.png`. Saída planejada: `pack/moderno/img/faces/Diana_Moderno_monster3_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 × 288 px; grade 4 × 2; célula 144 × 144 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.tiles.terrain

Prompt ID: `moderno.tiles.terrain`. Módulo: moderno.

Gerar arte original: Terrenos de bairro urbano de tijolo, concreto e jardim comunitário: solo, caminho, Água, piso, ponte, borda, acento e terreno Áspero.

Fonte planejada: `sources/moderno/Diana_Moderno_Terrain_A5.png`. Saída planejada: `pack/moderno/img/tilesets/Diana_Moderno_Terrain_A5.png`. Pasta no editor: `img/tilesets`.

Contrato: `terrain`, 256 × 256 px; grade 8 × 8; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.tiles.architecture

Prompt ID: `moderno.tiles.architecture`. Módulo: moderno.

Gerar arte original: Kit de arquitetura de bairro urbano de tijolo, concreto e jardim comunitário: parede, telhado, porta, janela, escada, canto e soleira; módulos de 32 px.

Fonte planejada: `sources/moderno/Diana_Moderno_Architecture_Source.png`. Saída planejada: `pack/moderno/img/tilesets/Diana_Moderno_Architecture_Source.png`. Pasta no editor: `img/tilesets`.

Contrato: `objects`, 512 × 512 px; grade 16 × 16; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

Composição determinística: `{"target":"Diana_Moderno_Objects_B.png","cells":[1,63],"reservedTransparent":"0 e 64..255"}`; preservar posições reservadas transparentes.

## moderno.tiles.props

Prompt ID: `moderno.tiles.props`. Módulo: moderno.

Gerar arte original: Poste, lixeira, banco, bicicleta genérica, canteiro e caixa de serviço sem marcas.

Fonte planejada: `sources/moderno/Diana_Moderno_Props_Source.png`. Saída planejada: `pack/moderno/img/tilesets/Diana_Moderno_Props_Source.png`. Pasta no editor: `img/tilesets`.

Contrato: `objects`, 512 × 512 px; grade 16 × 16; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

Composição determinística: `{"target":"Diana_Moderno_Objects_B.png","cells":[64,127],"reservedTransparent":"0..63 e 128..255"}`; preservar posições reservadas transparentes.

## moderno.background.area-1

Prompt ID: `moderno.background.area-1`. Módulo: moderno.

Gerar arte original: bairro urbano de tijolo, concreto e jardim comunitário; praça externa ao amanhecer, chão livre na metade inferior, sem personagens.

Fonte planejada: `sources/moderno/Diana_Moderno_Area1_Background.png`. Saída planejada: `pack/moderno/img/battlebacks1/Diana_Moderno_Area1_Background.png`. Pasta no editor: `img/battlebacks1`.

Contrato: `background`, 1280 × 720 px; grade 1 × 1; célula 1280 × 720 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.background.area-2

Prompt ID: `moderno.background.area-2`. Módulo: moderno.

Gerar arte original: bairro urbano de tijolo, concreto e jardim comunitário; Área de confronto ao entardecer, chão livre na metade inferior, sem personagens.

Fonte planejada: `sources/moderno/Diana_Moderno_Area2_Background.png`. Saída planejada: `pack/moderno/img/battlebacks1/Diana_Moderno_Area2_Background.png`. Pasta no editor: `img/battlebacks1`.

Contrato: `background`, 1280 × 720 px; grade 1 × 1; célula 1280 × 720 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.weapons.set

Prompt ID: `moderno.weapons.set`. Módulo: moderno.

Gerar arte original: Oito equipamentos originais: chave de manutenção, bastão elétrico, lançador de pulsos abstrato, escudo, pinça, martelo, emissor e luvas.

Fonte planejada: `sources/moderno/Diana_Moderno_Weapons_Source.png`. Saída planejada: `pack/moderno/img/system/Diana_Moderno_Weapons_Source.png`. Pasta no editor: `img/system`.

Contrato: `icons`, 256 × 128 px; grade 8 × 4; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

Composição determinística: `{"target":"IconSet.png","indices":[0,7]}`; preservar posições reservadas transparentes.

## moderno.items.set

Prompt ID: `moderno.items.set`. Módulo: moderno.

Gerar arte original: Oito itens originais: frasco de cura, frasco de energia, antídoto, chave, lanterna, corda, alimento e cristal de recurso; coerentes com o módulo.

Fonte planejada: `sources/moderno/Diana_Moderno_Items_Source.png`. Saída planejada: `pack/moderno/img/system/Diana_Moderno_Items_Source.png`. Pasta no editor: `img/system`.

Contrato: `icons`, 256 × 128 px; grade 8 × 4; célula 32 × 32 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

Composição determinística: `{"target":"IconSet.png","indices":[16,23]}`; preservar posições reservadas transparentes.

## moderno.effects.impact

Prompt ID: `moderno.effects.impact`. Módulo: moderno.

Gerar arte original: Impacto de anéis ciano e partículas quadradas, expansão e dissipação.

Fonte planejada: `sources/moderno/Diana_Moderno_Impact.png`. Saída planejada: `pack/moderno/img/animations/Diana_Moderno_Impact.png`. Pasta no editor: `img/animations`.

Contrato: `effects`, 960 × 576 px; grade 5 × 3; célula 192 × 192 px. Seguir integralmente as células ocupadas, vazias, Âncoras, direção e tempos do manifesto.

## moderno.map.area-1

Prompt ID: `moderno.map.area-1`. Módulo: moderno.

Especificar receita original de mapa nativo: Área inicial explorável de bairro urbano de tijolo, concreto e jardim comunitário.

Fonte planejada: `sources/moderno/Map001.recipe.json`. Saída planejada: `pack/moderno/data/Map001.json`. Pasta no editor: `data`.

Mapa 24 × 18 tiles de 32 px, seis camadas; copiar a recipe desta entrada e resolver somente dependências locais declaradas.

## moderno.map.area-2

Prompt ID: `moderno.map.area-2`. Módulo: moderno.

Especificar receita original de mapa nativo: Rota com arena de batalha de bairro urbano de tijolo, concreto e jardim comunitário.

Fonte planejada: `sources/moderno/Map002.recipe.json`. Saída planejada: `pack/moderno/data/Map002.json`. Pasta no editor: `data`.

Mapa 24 × 18 tiles de 32 px, seis camadas; copiar a recipe desta entrada e resolver somente dependências locais declaradas.

