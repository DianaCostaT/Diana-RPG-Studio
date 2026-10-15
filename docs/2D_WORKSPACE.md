# Interface 2D e batalha clássica — 0.2.0

## Implementado e testado

- Novo projeto oferece **Inteiramente 2D** (padrão) e **2D + 3D**. A escolha
  fica em `project.rpgreactor`, campo `diana.mode`. O seletor no topo permite
  alterar as ferramentas visíveis e persiste essa escolha atomicamente.
- Projetos anteriores sem esse campo mantêm o modo completo por compatibilidade.
  Escolha **Projeto 2D** no topo para usar a interface reduzida. Nenhum mapa,
  modelo ou vínculo é removido/convertido ao trocar a interface.
- No modo 2D, ocultam-se modelos/estruturas, visualização e propriedades de mapas
  3D, camada de objetos 3D, classificação 3D dos tiles, vínculos 3D, controles
  de física/natação 3D e seção de comandos de eventos 3D. Projeção 3D, salas de
  batalha e gráficos de modelo ficam indisponíveis nos seletores compartilhados.
  Sequências iniciam com projeção plana. Esses caminhos adicionais foram
  inspecionados no código; o smoke visual cobre mapa, camada de objetos e a
  troca de modo, não todas as janelas avançadas.
- Banco de dados organizado em abas horizontais. Entradas próprias
  **Animações 2 — Poses** e **Tela de batalha** também acessíveis no topo.
- Animações 2 tem grupo Aliados/Inimigos, seleção do registro, gráfico, formato,
  velocidade de prévia e oito poses por página com prévias e botão **Definir**.
  As primeiras doze posições seguem a organização da referência; poses extras
  não têm limite fixo. Armas e sequências abrem os editores funcionais existentes.
- Definir abre o editor compartilhado de recortes: grade/retângulo livre,
  quadros, ordem, duração, âncora, loop e timeline. Alterações são um rascunho
  até **Aplicar pose**; **Cancelar** descarta o rascunho. Depois, OK/Aplicar
  do banco grava o projeto; Cancelar do banco mantém sua semântica existente.
- Tela de batalha configura lateral/frontal, turnos/tempo ativo/espera,
  mensagens, nomes dos comandos e posições dos primeiros quatro aliados.
  Posições usam coordenadas lógicas 816 × 624, com o ajuste do runtime.
  Valores inválidos não substituem as posições padrão.
- O runtime lê o mesmo `BattlePresentation.json`; não há nova engine nem
  dependências instaladas. A revisão `diana-0.2.0` permite ao mecanismo existente
  atualizar o runtime de projetos abertos. Jogos exportados mantêm os dados.

## Evidências

`npm test`: 73/73. `npm run test:prepared`: 31/31. Smoke Windows passou.
`scripts/smoke-2d-windows.cjs` usa ponteiro real para abrir a grade, configurar
poses, aplicar/cancelar e salvar. Alguns campos são alterados via eventos DOM,
portanto não é uma validação integral por teclado. Novo projeto é fixture de
API nesse teste; o fluxo real Criar é coberto pelo smoke de projeto separado.

O teste executa outro processo do jogo: confirma duração 17 em poses de aliados
e inimigos e posição (510, 280) do primeiro aliado. Capturas e resumo ficam em
`artifacts/2d-ui-smoke.json` e no diretório indicado nele. Não é teste completo
de todos os ataques/efeitos/HUDs.

## Parcial e planejado

Esta implementação reproduz a organização de poses da
[referência Animations 2](https://haylee.garden/rpg2003/danimations2), sem copiar
seus assets/código. Não é uma cópia pixel a pixel. A referência consultada de
[Battle Screen](https://haylee.garden/rpg2003/dbattlescreen) também inclui layouts
A/B/C, comandos individuais e ranks; esses recursos não foram reproduzidos.
A prévia de composição atual é esquemática, explicitamente identificada como
tal, e não substitui Testar jogo. Armas e tipos ainda usam os editores existentes.

Nomes de poses personalizados, incluindo ataque esquerdo e caminhada direita,
não criam regras de ação automaticamente: a sequência deve referenciar a pose.
Trocar para 2D é uma configuração de autoria, não uma conversão de jogos 3D.
Falta auditar todas as superfícies avançadas para garantir que nenhuma ferramenta
3D escape do perfil. O foco continua na autoria de jogos inteiramente 2D.
