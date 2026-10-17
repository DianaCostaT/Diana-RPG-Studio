# Biblioteca de arte V2 — medieval e cyberpunk

Arte original gerada com `image_gen`, preservando a direção visual da Clareira: arquitetura legível, telhados azul-petróleo, vegetação em camadas e personagens grandes no combate. As fontes estão em `assets/art-library-v2/originals/`, os 69 PNGs de uso no jogo em `assets/art-library-v2/pack/`. Prompts completos e revisões: [GENERATION.md](../assets/art-library-v2/GENERATION.md). O manifesto registra SHA-256 das fontes e saídas; não há geração de imagens durante o build.

## Usar no editor

Crie um novo projeto da Vila da Clareira e abra **Recursos**. A biblioteca permite buscar pelo nome e filtrar **Medieval** ou **Futurista / cyberpunk**; as miniaturas de folhas mostram um quadro legível. Equipamentos têm imagem ampliada e acesso ao banco de dados. Os mapas também aparecem na árvore do projeto. Na arena há guardiões que levam aos quatro novos mapas; nos mapas modulares, conversar com a companheira recruta a Arqueira ou a Mensageira.

A integração é aplicada ao projeto inicial durante sua criação. Projetos salvos anteriormente não são migrados automaticamente: arquivos e bancos autorais não são sobrescritos. Os recursos também podem ser importados visualmente pelo gerenciador existente; importar só a imagem não cria seus registros de personagem ou animação.

## Conteúdo integrado

| Recurso | Quantidade e uso | Estado |
| --- | --- | --- |
| Mercado da Clareira e Distrito Neon | Dois cenários ilustrados, mapas 10 e 11, com rota central, colisão conservadora e retorno à vila | Implementado e testado no jogo NW.js |
| Jardim modular e Quadra Neon modular | Mapas 12 e 13, terrenos A5, objetos B, pintura nativa, copas no primeiro plano e eventos editáveis | Implementado e testado por dados e abertura no jogo NW.js |
| Construção de mapas | 24 objetos modulares: prédios, bancas, árvores, fontes, pontes, cercas, pedras/cargas e iluminação; oito superfícies e transições medievais | Implementado e testado por importação/flags; acabamento dos exemplos modulares é mais simples que os cenários ilustrados |
| Brann | Nova fonte exclusiva, 36 quadros em seis estados, células de 256 px, nova imagem de rosto | Implementado e testado no jogo NW.js; originais anteriores preservados |
| Arqueira e Mensageira Neon | Dois atores recrutáveis, 24 quadros de caminhada cada, seis estados de batalha com seis tempos por estado, equipamento e rosto | Implementado e testado por API e abertura/recortes de combate NW.js; caminhada nova tem contrato direcional testado, revisão interativa de todas as passadas pendente |
| Personagens ilustrados | Oito imagens de corpo inteiro, incluindo as referências dos atores; seis não têm caminhada/batalha próprias | Implementado e inspecionado como ilustração; não declarar oito atores animados |
| Monstros | Oito designs; Golem e Robô têm 36 quadros animados cada, os outros seis são imagens estáticas | Implementado e testado por contrato comum; Golem e Robô conferidos em combate NW.js |
| Armas, armaduras e itens | 32 imagens individuais e 32 ícones adicionados após os ícones existentes; oito armas, oito armaduras/acessórios e 16 itens correspondentes no banco | Implementado e testado por importação, integridade e referências de equipamento |
| Efeitos | Corte, fogo, plasma e escudo cibernético, cinco quadros cada, registros nativos de animação; corte/fogo usados pelas técnicas do exemplo | Implementado e testado por dados; inspeção interativa de cada efeito em ação pendente |
| Praça Neon de batalha | Fundo próprio, compilado em 1000×740 para a escala do runtime | Implementado e inspecionado no jogo NW.js |

Os dois cenários ilustrados são placas parallax com eventos e colisão editáveis; a arquitetura dessas placas não é pintável tile a tile. Os mapas modulares são a alternativa integralmente pintável, com recursos próprios dos dois temas. A vila canônica e suas extensões existentes continuam disponíveis. Esta entrega amplia e renova a biblioteca; a substituição literal de toda arte histórica do projeto permanece **parcial**, inclusive moradores antigos, interiores antigos e animações dos seis monstros estáticos.

## Nitidez e limites das fontes

O Brann anterior dividia um atlas com outros três personagens. A nova fonte dedica toda a imagem a ele e passa pela identificação de silhuetas completas antes da montagem, evitando recortar a espada na grade nominal. A compilação usa uma escala uniforme por folha e nearest-neighbor, com alpha e margem; não usa borrão para simular movimento. As armas já desenhadas nos atores não recebem uma segunda arma sobreposta pelo runtime.

As fontes iniciais de Arqueira, Mensageira e Golem tinham poses sobrepostas ou incompletas; foram preservadas e substituídas por revisões V3 na compilação. A vitória da Mensageira usa quatro desenhos e duas sustentações declaradas. Audits em `pack/*-audit.json` registram fontes, recortes e repetições. A folha V3 não é anunciada como 36 desenhos únicos.

## Evidências e reprodução

- `npm run assets:compile:library`: compilação determinística local, sem dependências novas.
- `npm test`: 228/228 na integração; testes específicos em `tests/art-library.test.cjs` cobrem hashes, alpha, margens, contratos comuns, destinos, recrutamento e navegação dos mapas nativos.
- `npm run test:prepared`: 69/69 na revisão integrada.
- `npm run smoke:windows`: passou; cobre editor, persistência e execução de jogo no SDK NW.js local.
- `npm run smoke:library:windows`: passou; abre os quatro mapas, filtra a biblioteca e verifica 144 recortes em combate: Brann, duas companheiras e Golem. Robô também aparece na cena cyberpunk.
- `npm run smoke:starter:windows`: passou após a integração; exploração, diálogo e vitória por teclado no projeto inicial, em `artifacts/starter-smoke-82F7Eo/`.
- Capturas inspecionadas e versionadas: [mercado](../images/biblioteca-v2/mercado-clareira.png), [distrito](../images/biblioteca-v2/distrito-neon.png), [jardim modular](../images/biblioteca-v2/jardim-modular.png), [quadra modular](../images/biblioteca-v2/quadra-neon-modular.png), [Brann e robô](../images/biblioteca-v2/brann-e-robo.png), [companheiras e Golem](../images/biblioteca-v2/companheiras-e-golem.png), [biblioteca](../images/biblioteca-v2/biblioteca-editor.png).

API, interação visual do editor e execução de jogo são evidências distintas. Os smokes acima usam **NW.js**; não validam o pacote **Tauri**. O prepare inclui o módulo e o pack para o host Tauri, mas a revisão visual desta biblioteca em seu WebView e a exportação Tauri seguem **implementadas não testadas nesta tarefa**. A migração do host continua regida por `TAURI_MIGRATION.md`.
