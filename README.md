# Diana RPG Studio

Editor de JRPGs para Windows em desenvolvimento, com português brasileiro como
idioma principal. A base escolhida é RPGReactor 0.99.0, revisão fixada em
`upstream-lock.json`. Editor e jogo usam a mesma engine; EasyRPG foi auditado como
alternativa, sem incorporar seu código.

## Executar neste workspace

Há uma versão local pronta em `dist/Diana-RPG-Studio-Windows-0.2.4/Diana.exe`.
Abra esse executável para usar o editor sem comandos, Node ou Git instalados
separadamente. Mantenha a pasta completa junta. Esta é uma versão de desenvolvimento
para teste local; os bloqueios de distribuição pública continuam documentados.

[Começar a usar](docs/USAR_AGORA.md): projetos novos já abrem com tiles originais,
mapa navegável, personagem e batalha de treino; água e obstáculos têm colisão.

A 0.1.2 corrige o fechamento ao escolher pasta para criar projeto, com um
[seletor integrado](docs/PROJECT_CREATION_FIX.md) para criar e abrir projetos.

A interface Diana tem navegação direta para mapas, eventos, banco de dados,
inimigos, sequências, recursos, parallax e teste, com paleta e árvore de mapas
à esquerda e editor central. Usa os mesmos comandos e dados da engine existente.

As dependências e o NW.js SDK já estão presentes. Não é necessário instalar nada
para executar os comandos abaixo:

```powershell
npm run prepare:editor
npm start
```

`npm start` abre `build/diana/editor` com perfil local em `artifacts/profile`.
O launcher abre uma janela visível e registra saída em `artifacts/launch.log`.
Também há `Diana.bat`, um atalho por arquivo para preparar e iniciar no Windows;
o fluxo automatizado validado usa os comandos npm acima.
O preparo exporta o commit fixado, aplica patches versionados e registra hashes
em `build/diana/provenance.json`. Ele preserva a versão anterior em `build/previous-*`.
Não edite o build gerado: mudanças devem estar em `src/`, `scripts/` ou `patches/`.

## Preparar outro ambiente Windows

Requisitos: Node >=22, npm, Git, `tar` e NW.js SDK 0.118.0 Windows x64 com
chromedriver correspondente. Neste ambiente foram identificados Node 24.22.0,
npm 11.19.1 e Git 2.56.0.windows.2.

Obtenha o repositório oficial em `upstream/RPGReactor`, faça checkout do commit
`dc918245cbf8f10ae6eef4ed8cb54b850fed9caa` e, após aprovação para instalar
dependências, execute `npm ci --ignore-scripts` em `upstream/RPGReactor/editor`.
Extraia o SDK em `tools/nwjs-sdk-v0.118.0-win-x64`.
O arquivo ZIP esperado tem SHA-256
`687f78233a56f19185a0ca9b638e114620f3335f4c4b01f2801f3664df27b838`,
comparado com o [manifest oficial NW.js](https://dl.nwjs.io/v0.118.0/SHASUMS256.txt).
Não há instalador Diana pronto nem validação de instalação em uma máquina limpa.

O preparo usa um link local para os `node_modules` já instalados. Portanto
`build/diana` é uma aplicação de desenvolvimento, não um pacote portátil de release.

## Incremento disponível

- Criar, abrir, salvar e reabrir projetos sem Demo e sem plugins pré-instalados.
- Pintura de tile com ponteiro real, undo/redo e persistência de duas camadas.
- Importação de PNGs de tileset, personagem e parallax pelo gerenciador de recursos.
- Evento de diálogo e parallax de fundo executados no jogo gerado.
- Poses nomeadas com recortes, duração por quadro, loop e âncoras compartilhadas
  por aliados e inimigos; controles visuais e JSON avançado opcional.
- Seletor de spritesheet por grade ou arraste livre, prévia automática com
  reproduzir/pausar/reiniciar e linha do tempo básica para avançar a um instante.
- Licenças e avisos copiados para os novos projetos; título Diana ao abrir/salvar.
- Projeto inicial original com personagem, progressão, mapa transitável e batalha
  de treino por teclado. Veja [como testar](docs/STARTER_PROJECT.md).
- Proteção de referências de poses e controle visual de passos simultâneos.
- Aviso de imagens ausentes antes da prévia; parallax e diálogo validados por
  controles reais. [Cobertura de autoria visual](docs/UI_AUTHORING_VALIDATION.md).
- Pacote Windows e export local relocáveis; [distribuição pública ainda bloqueada](docs/WINDOWS_PACKAGE.md).
- Vila da Clareira é um tileset nativo editável de 32 px (A5/B), com mapa
  inicial, rota de colisão e arena de animação/batalha; o parallax original é
  apenas referência opcional. Consulte [recursos JRPG](docs/JRPG_ASSETS.md).

Os cenários e limites estão em [VALIDATION.md](docs/VALIDATION.md).
Não há validação completa de todos os fluxos ou conclusão do MVP.

Para configurar poses: Banco de dados → Personagens ou Inimigos → tipo gráfico
explícito → Opções do combatente → Poses por retângulos. Use `idle` para repouso
ou um nome selecionável em sequências. Com a imagem carregada, ajuste largura e
altura da célula e clique na grade para adicionar quadros. Marque Retângulo livre
para recortar por arraste. Reproduzir pose, Pausar pose e Reiniciar pose controlam
a prévia; a linha do tempo muda seu instante sem alterar as poses salvas.

## Testes

```powershell
npm test
npm run test:prepared
npm run verify:prepared
npm run smoke:windows
npm run smoke:battle:windows
npm run smoke:poses:windows
npm run smoke:starter:windows
node scripts/smoke-starter-windows.cjs defeat
node scripts/smoke-starter-windows.cjs escape
npm run smoke:maps:windows
npm run smoke:authoring:windows
npm run smoke:sequences:windows
npm run smoke:package:windows
npm run test:upstream
```

Os smokes abrem e fecham janelas reais e geram projetos próprios em `artifacts/`.
O smoke de batalha utiliza uma cópia isolada do projeto criado pelo smoke Windows.
A suíte upstream completa tem falhas registradas; seu resultado não é um aceite
global da aplicação. Consulte [VALIDATION.md](docs/VALIDATION.md).

## Documentação e licenças

[Arquitetura](docs/ARCHITECTURE.md), [batalha](docs/BATTLE_SYSTEM.md),
[animação](docs/ANIMATION_SYSTEM.md), [avaliação das bases](docs/BASE_EVALUATION.md),
[auditoria de licenças](docs/LICENSE_AUDIT.md), [roadmap](ROADMAP.md),
[tarefas](TASKS.md) e [handoff](.diana-ai/handoff.md).

As adições Diana e o código próprio do RPGReactor são MIT, com avisos preservados.
Dependências mantêm licenças distintas. A distribuição pública ainda depende de
fechar obrigações de terceiros, incluindo lamejs/LGPL e o runtime NW.js.
Não foram incorporados Demo, RTP ou recursos extraídos de jogos comerciais.
IA e novos modos de RPG permanecem planejados.
