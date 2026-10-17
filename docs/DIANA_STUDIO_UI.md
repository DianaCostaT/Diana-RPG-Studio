# Camada visual Diana Studio

Estado em 16/10/2026: **implementado e testado por API**. A validação de interação visual no editor e a execução de jogo não foram feitas nesta tarefa.

`src/DianaStudio.js` é uma camada pós-carregamento: substitui somente rótulos, títulos, tooltips, placeholders e nomes acessíveis explicitamente identificados como chrome do produto. Ela não altera valores de campos, dados de projeto, scripts, IDs, seletores CSS, conteúdo autoral nem avisos legais; identificadores internos como `RPGReactor` continuam sendo detalhes técnicos e não marca de UI.

`src/DianaStudio.css` aplica uma composição original Diana, compacta e clássica: menus, barra de ferramentas, mapa central, painel de mapas, paleta de miniaturas e banco de dados usam os tokens de tema existentes, fontes de sistema e bordas discretas. Não adiciona assets de terceiros, gráficos herdados ou gradientes.

## Integração

O integrador deve carregar `DianaStudio.css` e depois `DianaStudio.js` **após** Bootstrap, Appearance, Icons e os módulos que constroem a UI. A camada observa novos nós de chrome após a carga, preservando avisos de licença e o conteúdo do usuário.

## Evidência

`node --test tests/diana-studio.test.cjs` cobre o rebranding de rótulos explícitos, atributos acessíveis e título do documento, além da não alteração de conteúdo autoral, campos e avisos legais. O teste é de API/DOM isolado; não substitui uma revisão visual dos painéis e da responsividade no aplicativo Windows.

## Simplificação da navegação

Estado em 16/10/2026: **implementado e testado por API/DOM e smoke visual Windows**. A barra principal mantém Mapas, Eventos, Banco de dados, Batalha, Recursos e Testar jogo, além do atalho contextual para criar NPC. Os atalhos separados para Inimigos, Sequências e Parallax foram removidos; as tabelas de inimigos continuam no banco, poses e sequências continuam acessíveis pelas telas de batalha, e camadas de imagem continuam na barra contextual de mapas.

Recursos abre uma janela própria com a biblioteca de exemplos e o botão para importar arquivos. A preferência de seguidores permanece nas configurações de batalha, sem misturar o catálogo com os controles de combate. A preparação tática foi recolhida e identificada como planejamento experimental que ainda não inicia/controla uma batalha tática. Projetos novos seguem 2D; a seleção 2D + 3D fica recolhida em opções avançadas e os dados de projetos existentes são preservados.

Evidências: `npm test` passou (157/157). `node scripts/smoke-project-ui-windows.cjs build/diana-ui-clean/editor` passou; verificou a criação real de projeto, seis áreas principais, biblioteca separada com 26 exemplos, preparação tática recolhida, alternância persistida 2D/2D+3D e execução do jogo. A captura da biblioteca está em `artifacts/project-ui-Sqrzfj/resource-library.png`. O smoke geral de pintura foi tentado, mas parou antes da pintura porque seu assertion não reconheceu o canvas como alvo do ponteiro (`scripts/smoke-windows.cjs:100`); isso não invalida o smoke de interface acima.


## Tela inicial e poses de batalha ? 2026-10-17

A tela inicial agora convida a come?ar pela Vila da Clareira e descreve o conte?do do projeto obrigat?rio. ?Come?ar pela Vila da Clareira? abre o fluxo normal de cria??o e deixa o usu?rio escolher a pasta; o editor n?o cria arquivos sem essa escolha.

A ficha de poses foi simplificada para uma lista numerada ? esquerda e detalhes da pose selecionada ? direita, com pr?via ampliada, edi??o de quadros/recortes e som contextual de entrada. Aliados e inimigos mant?m o mesmo cadastro, e a aba de anima??es segue separada para grade, armas e sequ?ncias. A tela de batalha conserva a pr?via de fundo, grupo e forma??o.

Estado: **implementado e testado por API/DOM; editor Tauri aberto e ?rvore acess?vel confirmou a lista e os controles**. `npm test` passou 179/179, `npm run prepare:editor` concluiu e `npm run test:prepared` passou 63/63. O smoke NW.js passou pelos passos do editor/export e falhou depois ao aguardar a cena de t?tulo do jogo gerado por 90 segundos; o jogo e a migra??o Tauri de playtest seguem parciais.
