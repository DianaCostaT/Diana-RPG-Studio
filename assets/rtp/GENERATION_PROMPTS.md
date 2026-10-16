# Prompts originais ? Diana RTP 0.1.0

Estado: **planejado**. Nenhuma arte, fonte ou mapa foi gerado. Este documento corresponde um a um aos IDs do manifesto; cada se??o ? uma solicita??o independente.

## Contrato comum de execu??o

Para cada ID, concatenar este contrato, o texto de sua se??o e o contrato referenciado em manifest.json. Criar somente conte?do original: n?o usar personagens protegidos, RTP comercial, Demo upstream, screenshots, logos, marcas, assets de jogos ou imita??o de franquias/artistas identific?veis. Est?tica JRPG ilustrada limpa, cores leg?veis, contornos discretos, luz superior esquerda; manter identidade apenas entre entradas entityId iguais. N?o misturar Medieval e Moderno. Sem palavras, assinatura ou marca-d??gua.

Imagens: PNG RGBA8 sRGB nas dimens?es exatas, c?lulas alinhadas sem margem, padding ou sangria. Fundo transparente exceto cen?rios; c?mera ortogr?fica nos tiles e sprites. Nenhuma sombra ou membro pode vazar da c?lula. C?lulas vazias devem ser RGBA zero. As fontes de arquitetura e props reservam posi??es distintas no mesmo B final; n?o s?o dois slots B concorrentes. IconSet final usa 16 colunas e os ?ndices declarados, copiando cada ?cone fonte individualmente. Revis?o humana deve rejeitar grade/alinhamento incorretos; n?o confiar em dimens?es declaradas pelo gerador.

Anima??es: caminhada 3 colunas ? 4 dire??es (baixo, esquerda, direita, cima), passada esquerda/neutro/passada direita. Combate: 6 colunas ? 6 linhas, idle/attack/damage/guard/victory/dead, cada linha com seis quadros distintos, raiz est?vel nos p?s e silhueta consistente; inimigos recebem o mesmo contrato. Retrato somente na c?lula 0, express?o neutra. Efeito: 15 quadros em ordem row-major, come?o pequeno, m?ximo no quadro 7, dissipa??o at? transpar?ncia no 14.

Mapas: produzir futuramente fonte JSON de receita, nunca bitmap. Reproduzir exatamente recipe do manifesto, sem improvisar coordenadas, RNG ou comandos novos; compilar para dados nativos Reactor. Pr?via deve mostrar tiles selecion?veis e colis?o edit?vel.

Registrar criador, ferramenta/modelo/vers?o, seed (null com justificativa se n?o suportada), data, prompt efetivo, revis?o de direitos e hashes das fontes/sa?das antes de liberar sob MIT. Gera??o de imagens n?o ? determin?stica: builds posteriores usam fontes aprovadas imut?veis, vers?o do compilador e lock de depend?ncias registrados. N?o h? compilador ou adapter implementado neste escopo. Validar contratos de API, intera??o visual e execu??o de jogo separadamente antes de declarar suporte.

## medieval.walk.hero-1

Prompt ID: `medieval.walk.hero-1`. M?dulo: medieval.

Gerar arte original: Alva, cart?grafa de capa ocre e tran?a curta.

Fonte planejada: `sources/medieval/Diana_Medieval_hero1_Walk.png`. Sa?da planejada: `pack/medieval/img/characters/Diana_Medieval_hero1_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.battle.hero-1

Prompt ID: `medieval.battle.hero-1`. M?dulo: medieval.

Gerar arte original: Alva, cart?grafa de capa ocre e tran?a curta.

Fonte planejada: `sources/medieval/Diana_Medieval_hero1_Battle.png`. Sa?da planejada: `pack/medieval/img/pictures/Diana_Medieval_hero1_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.portrait.hero-1

Prompt ID: `medieval.portrait.hero-1`. M?dulo: medieval.

Gerar arte original: Alva, cart?grafa de capa ocre e tran?a curta.

Fonte planejada: `sources/medieval/Diana_Medieval_hero1_Face.png`. Sa?da planejada: `pack/medieval/img/faces/Diana_Medieval_hero1_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.walk.hero-2

Prompt ID: `medieval.walk.hero-2`. M?dulo: medieval.

Gerar arte original: Breno, herbalista de t?nica verde e bolsa de couro.

Fonte planejada: `sources/medieval/Diana_Medieval_hero2_Walk.png`. Sa?da planejada: `pack/medieval/img/characters/Diana_Medieval_hero2_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.battle.hero-2

Prompt ID: `medieval.battle.hero-2`. M?dulo: medieval.

Gerar arte original: Breno, herbalista de t?nica verde e bolsa de couro.

Fonte planejada: `sources/medieval/Diana_Medieval_hero2_Battle.png`. Sa?da planejada: `pack/medieval/img/pictures/Diana_Medieval_hero2_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.portrait.hero-2

Prompt ID: `medieval.portrait.hero-2`. M?dulo: medieval.

Gerar arte original: Breno, herbalista de t?nica verde e bolsa de couro.

Fonte planejada: `sources/medieval/Diana_Medieval_hero2_Face.png`. Sa?da planejada: `pack/medieval/img/faces/Diana_Medieval_hero2_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.walk.monster-1

Prompt ID: `medieval.walk.monster-1`. M?dulo: medieval.

Gerar arte original: Musgoso, pequeno golem de argila coberto de musgo.

Fonte planejada: `sources/medieval/Diana_Medieval_monster1_Walk.png`. Sa?da planejada: `pack/medieval/img/characters/Diana_Medieval_monster1_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.battle.monster-1

Prompt ID: `medieval.battle.monster-1`. M?dulo: medieval.

Gerar arte original: Musgoso, pequeno golem de argila coberto de musgo.

Fonte planejada: `sources/medieval/Diana_Medieval_monster1_Battle.png`. Sa?da planejada: `pack/medieval/img/pictures/Diana_Medieval_monster1_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.portrait.monster-1

Prompt ID: `medieval.portrait.monster-1`. M?dulo: medieval.

Gerar arte original: Musgoso, pequeno golem de argila coberto de musgo.

Fonte planejada: `sources/medieval/Diana_Medieval_monster1_Face.png`. Sa?da planejada: `pack/medieval/img/faces/Diana_Medieval_monster1_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.walk.monster-2

Prompt ID: `medieval.walk.monster-2`. M?dulo: medieval.

Gerar arte original: Mariposa ?mbar de seis patas e asas arredondadas.

Fonte planejada: `sources/medieval/Diana_Medieval_monster2_Walk.png`. Sa?da planejada: `pack/medieval/img/characters/Diana_Medieval_monster2_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.battle.monster-2

Prompt ID: `medieval.battle.monster-2`. M?dulo: medieval.

Gerar arte original: Mariposa ?mbar de seis patas e asas arredondadas.

Fonte planejada: `sources/medieval/Diana_Medieval_monster2_Battle.png`. Sa?da planejada: `pack/medieval/img/pictures/Diana_Medieval_monster2_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.portrait.monster-2

Prompt ID: `medieval.portrait.monster-2`. M?dulo: medieval.

Gerar arte original: Mariposa ?mbar de seis patas e asas arredondadas.

Fonte planejada: `sources/medieval/Diana_Medieval_monster2_Face.png`. Sa?da planejada: `pack/medieval/img/faces/Diana_Medieval_monster2_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.walk.monster-3

Prompt ID: `medieval.walk.monster-3`. M?dulo: medieval.

Gerar arte original: Caranguejo de basalto com cristais foscos.

Fonte planejada: `sources/medieval/Diana_Medieval_monster3_Walk.png`. Sa?da planejada: `pack/medieval/img/characters/Diana_Medieval_monster3_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.battle.monster-3

Prompt ID: `medieval.battle.monster-3`. M?dulo: medieval.

Gerar arte original: Caranguejo de basalto com cristais foscos.

Fonte planejada: `sources/medieval/Diana_Medieval_monster3_Battle.png`. Sa?da planejada: `pack/medieval/img/pictures/Diana_Medieval_monster3_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.portrait.monster-3

Prompt ID: `medieval.portrait.monster-3`. M?dulo: medieval.

Gerar arte original: Caranguejo de basalto com cristais foscos.

Fonte planejada: `sources/medieval/Diana_Medieval_monster3_Face.png`. Sa?da planejada: `pack/medieval/img/faces/Diana_Medieval_monster3_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.tiles.terrain

Prompt ID: `medieval.tiles.terrain`. M?dulo: medieval.

Gerar arte original: Terrenos de vila de pedra clara, madeira e pradaria: solo, caminho, ?gua, piso, ponte, borda, acento e terreno ?spero.

Fonte planejada: `sources/medieval/Diana_Medieval_Terrain_A5.png`. Sa?da planejada: `pack/medieval/img/tilesets/Diana_Medieval_Terrain_A5.png`. Pasta no editor: `img/tilesets`.

Contrato: `terrain`, 256 ? 256 px; grade 8 ? 8; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.tiles.architecture

Prompt ID: `medieval.tiles.architecture`. M?dulo: medieval.

Gerar arte original: Kit de arquitetura de vila de pedra clara, madeira e pradaria: parede, telhado, porta, janela, escada, canto e soleira; m?dulos de 32 px.

Fonte planejada: `sources/medieval/Diana_Medieval_Architecture_Source.png`. Sa?da planejada: `pack/medieval/img/tilesets/Diana_Medieval_Architecture_Source.png`. Pasta no editor: `img/tilesets`.

Contrato: `objects`, 512 ? 512 px; grade 16 ? 16; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

Composi??o determin?stica: `{"target":"Diana_Medieval_Objects_B.png","cells":[1,63],"reservedTransparent":"0 e 64..255"}`; preservar posi??es reservadas transparentes.

## medieval.tiles.props

Prompt ID: `medieval.tiles.props`. M?dulo: medieval.

Gerar arte original: ?rvore modular, cerca, barril, banco, canteiro e placa sem texto.

Fonte planejada: `sources/medieval/Diana_Medieval_Props_Source.png`. Sa?da planejada: `pack/medieval/img/tilesets/Diana_Medieval_Props_Source.png`. Pasta no editor: `img/tilesets`.

Contrato: `objects`, 512 ? 512 px; grade 16 ? 16; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

Composi??o determin?stica: `{"target":"Diana_Medieval_Objects_B.png","cells":[64,127],"reservedTransparent":"0..63 e 128..255"}`; preservar posi??es reservadas transparentes.

## medieval.background.area-1

Prompt ID: `medieval.background.area-1`. M?dulo: medieval.

Gerar arte original: vila de pedra clara, madeira e pradaria; pra?a externa ao amanhecer, ch?o livre na metade inferior, sem personagens.

Fonte planejada: `sources/medieval/Diana_Medieval_Area1_Background.png`. Sa?da planejada: `pack/medieval/img/battlebacks1/Diana_Medieval_Area1_Background.png`. Pasta no editor: `img/battlebacks1`.

Contrato: `background`, 1280 ? 720 px; grade 1 ? 1; c?lula 1280 ? 720 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.background.area-2

Prompt ID: `medieval.background.area-2`. M?dulo: medieval.

Gerar arte original: vila de pedra clara, madeira e pradaria; ?rea de confronto ao entardecer, ch?o livre na metade inferior, sem personagens.

Fonte planejada: `sources/medieval/Diana_Medieval_Area2_Background.png`. Sa?da planejada: `pack/medieval/img/battlebacks1/Diana_Medieval_Area2_Background.png`. Pasta no editor: `img/battlebacks1`.

Contrato: `background`, 1280 ? 720 px; grade 1 ? 1; c?lula 1280 ? 720 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.weapons.set

Prompt ID: `medieval.weapons.set`. M?dulo: medieval.

Gerar arte original: Oito armas originais: espada curta, bast?o, arco, lan?a, ma?a, adaga, escudo e varinha.

Fonte planejada: `sources/medieval/Diana_Medieval_Weapons_Source.png`. Sa?da planejada: `pack/medieval/img/system/Diana_Medieval_Weapons_Source.png`. Pasta no editor: `img/system`.

Contrato: `icons`, 256 ? 128 px; grade 8 ? 4; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

Composi??o determin?stica: `{"target":"IconSet.png","indices":[0,7]}`; preservar posi??es reservadas transparentes.

## medieval.items.set

Prompt ID: `medieval.items.set`. M?dulo: medieval.

Gerar arte original: Oito itens originais: frasco de cura, frasco de energia, ant?doto, chave, lanterna, corda, alimento e cristal de recurso; coerentes com o m?dulo.

Fonte planejada: `sources/medieval/Diana_Medieval_Items_Source.png`. Sa?da planejada: `pack/medieval/img/system/Diana_Medieval_Items_Source.png`. Pasta no editor: `img/system`.

Contrato: `icons`, 256 ? 128 px; grade 8 ? 4; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

Composi??o determin?stica: `{"target":"IconSet.png","indices":[16,23]}`; preservar posi??es reservadas transparentes.

## medieval.effects.impact

Prompt ID: `medieval.effects.impact`. M?dulo: medieval.

Gerar arte original: Impacto de fa?scas douradas e folhas luminosas, expans?o e dissipa??o.

Fonte planejada: `sources/medieval/Diana_Medieval_Impact.png`. Sa?da planejada: `pack/medieval/img/animations/Diana_Medieval_Impact.png`. Pasta no editor: `img/animations`.

Contrato: `effects`, 960 ? 576 px; grade 5 ? 3; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## medieval.map.area-1

Prompt ID: `medieval.map.area-1`. M?dulo: medieval.

Especificar receita original de mapa nativo: ?rea inicial explor?vel de vila de pedra clara, madeira e pradaria.

Fonte planejada: `sources/medieval/Map001.recipe.json`. Sa?da planejada: `pack/medieval/data/Map001.json`. Pasta no editor: `data`.

Mapa 24 ? 18 tiles de 32 px, seis camadas; copiar a recipe desta entrada e resolver somente depend?ncias locais declaradas.

## medieval.map.area-2

Prompt ID: `medieval.map.area-2`. M?dulo: medieval.

Especificar receita original de mapa nativo: Rota com arena de batalha de vila de pedra clara, madeira e pradaria.

Fonte planejada: `sources/medieval/Map002.recipe.json`. Sa?da planejada: `pack/medieval/data/Map002.json`. Pasta no editor: `data`.

Mapa 24 ? 18 tiles de 32 px, seis camadas; copiar a recipe desta entrada e resolver somente depend?ncias locais declaradas.

## moderno.walk.hero-1

Prompt ID: `moderno.walk.hero-1`. M?dulo: moderno.

Gerar arte original: Cora, t?cnica de manuten??o com macac?o azul e cabelo crespo.

Fonte planejada: `sources/moderno/Diana_Moderno_hero1_Walk.png`. Sa?da planejada: `pack/moderno/img/characters/Diana_Moderno_hero1_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.battle.hero-1

Prompt ID: `moderno.battle.hero-1`. M?dulo: moderno.

Gerar arte original: Cora, t?cnica de manuten??o com macac?o azul e cabelo crespo.

Fonte planejada: `sources/moderno/Diana_Moderno_hero1_Battle.png`. Sa?da planejada: `pack/moderno/img/pictures/Diana_Moderno_hero1_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.portrait.hero-1

Prompt ID: `moderno.portrait.hero-1`. M?dulo: moderno.

Gerar arte original: Cora, t?cnica de manuten??o com macac?o azul e cabelo crespo.

Fonte planejada: `sources/moderno/Diana_Moderno_hero1_Face.png`. Sa?da planejada: `pack/moderno/img/faces/Diana_Moderno_hero1_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.walk.hero-2

Prompt ID: `moderno.walk.hero-2`. M?dulo: moderno.

Gerar arte original: Davi, mensageiro de jaqueta terracota e mochila refletiva.

Fonte planejada: `sources/moderno/Diana_Moderno_hero2_Walk.png`. Sa?da planejada: `pack/moderno/img/characters/Diana_Moderno_hero2_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.battle.hero-2

Prompt ID: `moderno.battle.hero-2`. M?dulo: moderno.

Gerar arte original: Davi, mensageiro de jaqueta terracota e mochila refletiva.

Fonte planejada: `sources/moderno/Diana_Moderno_hero2_Battle.png`. Sa?da planejada: `pack/moderno/img/pictures/Diana_Moderno_hero2_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.portrait.hero-2

Prompt ID: `moderno.portrait.hero-2`. M?dulo: moderno.

Gerar arte original: Davi, mensageiro de jaqueta terracota e mochila refletiva.

Fonte planejada: `sources/moderno/Diana_Moderno_hero2_Face.png`. Sa?da planejada: `pack/moderno/img/faces/Diana_Moderno_hero2_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.walk.monster-1

Prompt ID: `moderno.walk.monster-1`. M?dulo: moderno.

Gerar arte original: Drone hexagonal de manuten??o desgovernado sem marca.

Fonte planejada: `sources/moderno/Diana_Moderno_monster1_Walk.png`. Sa?da planejada: `pack/moderno/img/characters/Diana_Moderno_monster1_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.battle.monster-1

Prompt ID: `moderno.battle.monster-1`. M?dulo: moderno.

Gerar arte original: Drone hexagonal de manuten??o desgovernado sem marca.

Fonte planejada: `sources/moderno/Diana_Moderno_monster1_Battle.png`. Sa?da planejada: `pack/moderno/img/pictures/Diana_Moderno_monster1_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.portrait.monster-1

Prompt ID: `moderno.portrait.monster-1`. M?dulo: moderno.

Gerar arte original: Drone hexagonal de manuten??o desgovernado sem marca.

Fonte planejada: `sources/moderno/Diana_Moderno_monster1_Face.png`. Sa?da planejada: `pack/moderno/img/faces/Diana_Moderno_monster1_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.walk.monster-2

Prompt ID: `moderno.walk.monster-2`. M?dulo: moderno.

Gerar arte original: Criatura de espuma azul com olhos geom?tricos.

Fonte planejada: `sources/moderno/Diana_Moderno_monster2_Walk.png`. Sa?da planejada: `pack/moderno/img/characters/Diana_Moderno_monster2_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.battle.monster-2

Prompt ID: `moderno.battle.monster-2`. M?dulo: moderno.

Gerar arte original: Criatura de espuma azul com olhos geom?tricos.

Fonte planejada: `sources/moderno/Diana_Moderno_monster2_Battle.png`. Sa?da planejada: `pack/moderno/img/pictures/Diana_Moderno_monster2_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.portrait.monster-2

Prompt ID: `moderno.portrait.monster-2`. M?dulo: moderno.

Gerar arte original: Criatura de espuma azul com olhos geom?tricos.

Fonte planejada: `sources/moderno/Diana_Moderno_monster2_Face.png`. Sa?da planejada: `pack/moderno/img/faces/Diana_Moderno_monster2_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.walk.monster-3

Prompt ID: `moderno.walk.monster-3`. M?dulo: moderno.

Gerar arte original: Rob? coletor sobre tr?s rodas e carca?a amarela.

Fonte planejada: `sources/moderno/Diana_Moderno_monster3_Walk.png`. Sa?da planejada: `pack/moderno/img/characters/Diana_Moderno_monster3_Walk.png`. Pasta no editor: `img/characters`.

Contrato: `walk`, 192 ? 256 px; grade 3 ? 4; c?lula 64 ? 64 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.battle.monster-3

Prompt ID: `moderno.battle.monster-3`. M?dulo: moderno.

Gerar arte original: Rob? coletor sobre tr?s rodas e carca?a amarela.

Fonte planejada: `sources/moderno/Diana_Moderno_monster3_Battle.png`. Sa?da planejada: `pack/moderno/img/pictures/Diana_Moderno_monster3_Battle.png`. Pasta no editor: `img/pictures`.

Contrato: `battle`, 1152 ? 1152 px; grade 6 ? 6; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.portrait.monster-3

Prompt ID: `moderno.portrait.monster-3`. M?dulo: moderno.

Gerar arte original: Rob? coletor sobre tr?s rodas e carca?a amarela.

Fonte planejada: `sources/moderno/Diana_Moderno_monster3_Face.png`. Sa?da planejada: `pack/moderno/img/faces/Diana_Moderno_monster3_Face.png`. Pasta no editor: `img/faces`.

Contrato: `portrait`, 576 ? 288 px; grade 4 ? 2; c?lula 144 ? 144 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.tiles.terrain

Prompt ID: `moderno.tiles.terrain`. M?dulo: moderno.

Gerar arte original: Terrenos de bairro urbano de tijolo, concreto e jardim comunit?rio: solo, caminho, ?gua, piso, ponte, borda, acento e terreno ?spero.

Fonte planejada: `sources/moderno/Diana_Moderno_Terrain_A5.png`. Sa?da planejada: `pack/moderno/img/tilesets/Diana_Moderno_Terrain_A5.png`. Pasta no editor: `img/tilesets`.

Contrato: `terrain`, 256 ? 256 px; grade 8 ? 8; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.tiles.architecture

Prompt ID: `moderno.tiles.architecture`. M?dulo: moderno.

Gerar arte original: Kit de arquitetura de bairro urbano de tijolo, concreto e jardim comunit?rio: parede, telhado, porta, janela, escada, canto e soleira; m?dulos de 32 px.

Fonte planejada: `sources/moderno/Diana_Moderno_Architecture_Source.png`. Sa?da planejada: `pack/moderno/img/tilesets/Diana_Moderno_Architecture_Source.png`. Pasta no editor: `img/tilesets`.

Contrato: `objects`, 512 ? 512 px; grade 16 ? 16; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

Composi??o determin?stica: `{"target":"Diana_Moderno_Objects_B.png","cells":[1,63],"reservedTransparent":"0 e 64..255"}`; preservar posi??es reservadas transparentes.

## moderno.tiles.props

Prompt ID: `moderno.tiles.props`. M?dulo: moderno.

Gerar arte original: Poste, lixeira, banco, bicicleta gen?rica, canteiro e caixa de servi?o sem marcas.

Fonte planejada: `sources/moderno/Diana_Moderno_Props_Source.png`. Sa?da planejada: `pack/moderno/img/tilesets/Diana_Moderno_Props_Source.png`. Pasta no editor: `img/tilesets`.

Contrato: `objects`, 512 ? 512 px; grade 16 ? 16; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

Composi??o determin?stica: `{"target":"Diana_Moderno_Objects_B.png","cells":[64,127],"reservedTransparent":"0..63 e 128..255"}`; preservar posi??es reservadas transparentes.

## moderno.background.area-1

Prompt ID: `moderno.background.area-1`. M?dulo: moderno.

Gerar arte original: bairro urbano de tijolo, concreto e jardim comunit?rio; pra?a externa ao amanhecer, ch?o livre na metade inferior, sem personagens.

Fonte planejada: `sources/moderno/Diana_Moderno_Area1_Background.png`. Sa?da planejada: `pack/moderno/img/battlebacks1/Diana_Moderno_Area1_Background.png`. Pasta no editor: `img/battlebacks1`.

Contrato: `background`, 1280 ? 720 px; grade 1 ? 1; c?lula 1280 ? 720 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.background.area-2

Prompt ID: `moderno.background.area-2`. M?dulo: moderno.

Gerar arte original: bairro urbano de tijolo, concreto e jardim comunit?rio; ?rea de confronto ao entardecer, ch?o livre na metade inferior, sem personagens.

Fonte planejada: `sources/moderno/Diana_Moderno_Area2_Background.png`. Sa?da planejada: `pack/moderno/img/battlebacks1/Diana_Moderno_Area2_Background.png`. Pasta no editor: `img/battlebacks1`.

Contrato: `background`, 1280 ? 720 px; grade 1 ? 1; c?lula 1280 ? 720 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.weapons.set

Prompt ID: `moderno.weapons.set`. M?dulo: moderno.

Gerar arte original: Oito equipamentos originais: chave de manuten??o, bast?o el?trico, lan?ador de pulsos abstrato, escudo, pin?a, martelo, emissor e luvas.

Fonte planejada: `sources/moderno/Diana_Moderno_Weapons_Source.png`. Sa?da planejada: `pack/moderno/img/system/Diana_Moderno_Weapons_Source.png`. Pasta no editor: `img/system`.

Contrato: `icons`, 256 ? 128 px; grade 8 ? 4; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

Composi??o determin?stica: `{"target":"IconSet.png","indices":[0,7]}`; preservar posi??es reservadas transparentes.

## moderno.items.set

Prompt ID: `moderno.items.set`. M?dulo: moderno.

Gerar arte original: Oito itens originais: frasco de cura, frasco de energia, ant?doto, chave, lanterna, corda, alimento e cristal de recurso; coerentes com o m?dulo.

Fonte planejada: `sources/moderno/Diana_Moderno_Items_Source.png`. Sa?da planejada: `pack/moderno/img/system/Diana_Moderno_Items_Source.png`. Pasta no editor: `img/system`.

Contrato: `icons`, 256 ? 128 px; grade 8 ? 4; c?lula 32 ? 32 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

Composi??o determin?stica: `{"target":"IconSet.png","indices":[16,23]}`; preservar posi??es reservadas transparentes.

## moderno.effects.impact

Prompt ID: `moderno.effects.impact`. M?dulo: moderno.

Gerar arte original: Impacto de an?is ciano e part?culas quadradas, expans?o e dissipa??o.

Fonte planejada: `sources/moderno/Diana_Moderno_Impact.png`. Sa?da planejada: `pack/moderno/img/animations/Diana_Moderno_Impact.png`. Pasta no editor: `img/animations`.

Contrato: `effects`, 960 ? 576 px; grade 5 ? 3; c?lula 192 ? 192 px. Seguir integralmente as c?lulas ocupadas, vazias, ?ncoras, dire??o e tempos do manifesto.

## moderno.map.area-1

Prompt ID: `moderno.map.area-1`. M?dulo: moderno.

Especificar receita original de mapa nativo: ?rea inicial explor?vel de bairro urbano de tijolo, concreto e jardim comunit?rio.

Fonte planejada: `sources/moderno/Map001.recipe.json`. Sa?da planejada: `pack/moderno/data/Map001.json`. Pasta no editor: `data`.

Mapa 24 ? 18 tiles de 32 px, seis camadas; copiar a recipe desta entrada e resolver somente depend?ncias locais declaradas.

## moderno.map.area-2

Prompt ID: `moderno.map.area-2`. M?dulo: moderno.

Especificar receita original de mapa nativo: Rota com arena de batalha de bairro urbano de tijolo, concreto e jardim comunit?rio.

Fonte planejada: `sources/moderno/Map002.recipe.json`. Sa?da planejada: `pack/moderno/data/Map002.json`. Pasta no editor: `data`.

Mapa 24 ? 18 tiles de 32 px, seis camadas; copiar a recipe desta entrada e resolver somente depend?ncias locais declaradas.

