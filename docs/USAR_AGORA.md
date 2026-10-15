# Usar o Diana agora

Abra `dist/Diana-RPG-Studio-Windows-0.1.1/Diana.exe`. Mantenha a pasta completa junto
do executável. Não é necessário executar comandos.

1. Clique em **Novo projeto**, dê um nome e confirme **Criar**.
2. Escolha a pasta que receberá a nova subpasta do projeto.
3. A aba **B** já abre com os tiles originais. Escolha uma peça e pinte no mapa.
   Para substituir o chão diretamente, selecione a camada 1 (primeira camada
   numérica da barra). Desfazer e refazer ficam na barra de ferramentas.
4. Clique em **Salvar** e em **Testar jogo**. Escolha **Novo jogo**.
5. Use as setas para andar, Enter para conversar com o NPC e Escape para o menu.
   O NPC oferece uma batalha de treino editável.

Os tiles incluem grama, caminho, água, tijolos, madeira, piso, areia, árvore,
flores, telhado, ponte, pedra e neve. Água, parede, árvore, telhado, pedra grande
e vazio escuro bloqueiam a passagem. Os demais pisos permitem andar.

Para modificar o diálogo inicial, abra **Eventos**, dê duplo clique no NPC da
lista, edite o comando Mostrar texto e confirme OK. Salve e teste novamente.

Este conjunto inicial aparece em **projetos novos**. Projetos existentes não são
reescritos. Para experimentar os tiles novos, crie um projeto nesta versão.

## Evidência do uso básico

`npm run smoke:basic:windows` passou: diálogo de novo projeto e cancelamento,
paleta B disponível automaticamente, seleção de água por ponteiro, pintura,
undo/redo e salvar pelos botões; execução de Novo jogo por teclado, colisão na
água pintada e movimento no caminho. Preparação do projeto do teste usa API;
a escolha da pasta no diálogo nativo do Windows não foi automatizada.

Resumo em `artifacts/basic-use-smoke.json`; projeto e capturas em sua pasta de
evidências. O pacote 0.1.1 também é verificado por `smoke-ready-windows.cjs`.
Continua sendo uma versão de desenvolvimento: autoria completa, animações
avançadas e distribuição pública ainda têm pendências documentadas.
