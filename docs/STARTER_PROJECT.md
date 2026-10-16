# Projeto inicial Diana

Novos projetos incluem dados e recursos originais mínimos para exploração e batalha lateral. O upstream Demo não é copiado. Projetos existentes não recebem alterações automáticas.

- Diana, classe Aventureiro, progressão até nível 99, ataque, defesa e nocaute.
- Parceiro de treino e grupo de inimigos editáveis pelo mesmo banco de dados.
- Mapa 17×13 com piso transitável e evento de ação diante da posição inicial.
- A partir da 0.1.1: tiles originais de terreno e objetos, caminho e lago no mapa,
  colisão de água/obstáculos e aba disponível selecionada automaticamente.
- Sprites geométricos, piso e janela gerados por código MIT em `src/DianaStarterData.js`. Podem ser substituídos pelo autor.
- Menus essenciais do jogo em português; batalha por turnos com apresentação lateral.
- Mensagens de combate, recompensa, opções e salvamento em português, editáveis nos termos do Sistema.

Para testar: crie um projeto, execute o teste do jogo, escolha **Novo jogo** e pressione **Enter** diante do NPC. Confirme o diálogo e escolha **Lutar → Atacar → alvo**. Setas movimentam o jogador; Escape abre o menu. A batalha de treino permite fuga e derrota sem encerrar o jogo.

Antes do teste pelo editor, `DianaProjectValidation` verifica grupo, referências de personagens/classes, parâmetros no nível inicial, habilidades 1/2 e estado de nocaute 1. Erros aparecem em uma janela com orientação em português. A validação não modifica dados nem cobre todos os campos, assets, fórmulas ou comandos de eventos; executar diretamente um export não chama essa verificação do editor.

## Evidências

`tests/starter-data.test.cjs` verifica dados essenciais, progressão, mapa e recursos. `tests/project-validation.test.cjs` verifica aceitação sem mutação e diagnósticos para dados incompletos.

`node scripts/smoke-starter-windows.cjs` cria o projeto pela API do editor e inicia **Novo jogo**, diálogo, comandos e vitória por teclado WebDriver. O runtime não recebe `setupNewGame`, `forceAction` ou dano por API. O teste confirma experiência, PV, nocaute do inimigo, ausência de erros e paleta legível. Capturas são salvas com o projeto em `artifacts/starter-smoke-*` e resumo em `artifacts/starter-smoke.json`.

`node scripts/smoke-starter-windows.cjs defeat` fortalece somente o inimigo do fixture salvo antes de iniciar o jogo e verifica derrota, recuperação com 1 PV e retorno ao mapa sem experiência. `escape` seleciona Fugir por seta e Enter e verifica retorno sem recompensa. A autoria do fixture usa API/arquivo; a batalha usa controles reais. Esses testes não comprovam som audível ou todas as combinações de habilidades e sequências.

A janela do projeto usa paleta clara na região que `ColorManager.textColor` consulta. A primeira captura revelou texto escuro; a correção foi verificada no runtime e por inspeção da captura de batalha.

A prévia também identifica imagens ausentes do grupo inicial e do mapa aberto,
reutilizando o resolvedor de recursos da base. O aviso mostra o caminho lógico;
nenhum arquivo é alterado. Cobertura e teste visual em
[UI_AUTHORING_VALIDATION.md](UI_AUTHORING_VALIDATION.md).

## Vila da Clareira obrigatória

Todo projeto novo começa com a **Vila da Clareira** e o RTP Medieval nativo editável. Não há opção de criar sem esse ponto de partida: depois de criado, o autor pode livremente editar, apagar ou substituir quaisquer mapas, dados e assets. Liora e Guardião mantêm o comportamento existente; Brann, três inimigos, poção e habilidades elementais ampliam o banco de dados.
