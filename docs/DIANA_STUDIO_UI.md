# Camada visual Diana Studio

Estado em 16/10/2026: **implementado e testado por API**. A validação de interação visual no editor e a execução de jogo não foram feitas nesta tarefa.

`src/DianaStudio.js` é uma camada pós-carregamento: substitui somente rótulos, títulos, tooltips, placeholders e nomes acessíveis explicitamente identificados como chrome do produto. Ela não altera valores de campos, dados de projeto, scripts, IDs, seletores CSS, conteúdo autoral nem avisos legais; identificadores internos como `RPGReactor` continuam sendo detalhes técnicos e não marca de UI.

`src/DianaStudio.css` aplica uma composição original Diana, compacta e clássica: menus, barra de ferramentas, mapa central, painel de mapas, paleta de miniaturas e banco de dados usam os tokens de tema existentes, fontes de sistema e bordas discretas. Não adiciona assets de terceiros, gráficos herdados ou gradientes.

## Integração

O integrador deve carregar `DianaStudio.css` e depois `DianaStudio.js` **após** Bootstrap, Appearance, Icons e os módulos que constroem a UI. A camada observa novos nós de chrome após a carga, preservando avisos de licença e o conteúdo do usuário.

## Evidência

`node --test tests/diana-studio.test.cjs` cobre o rebranding de rótulos explícitos, atributos acessíveis e título do documento, além da não alteração de conteúdo autoral, campos e avisos legais. O teste é de API/DOM isolado; não substitui uma revisão visual dos painéis e da responsividade no aplicativo Windows.
