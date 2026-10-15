# Usar o Diana agora

Abra `dist/Diana-RPG-Studio-Windows-0.2.3/Diana.exe`. Mantenha a pasta completa junto
do executável. Não é necessário executar comandos.

**Recursos JRPG ilustrados:** abra a pasta `dist/Projetos/Vila da Clareira` pelo
botão Abrir projeto, ou marque **Usar Vila da Clareira** ao criar um novo projeto.
Inclui mapa, personagens, rostos e combate animado. [Detalhes](JRPG_ASSETS.md).

Clique em **Aparência** no canto superior direito para escolher Grafite, Claro,
Rosa claro, Verde oliva, Azul névoa ou Ametista. A mudança é imediata e fica
salva para as próximas aberturas. Veja [Identidade visual e temas](APPEARANCE.md).

1. Clique em **Novo projeto**, escolha **Inteiramente 2D**, dê um nome e informe **Salvar o projeto em**.
2. Use **Procurar…** para escolher a pasta no seletor integrado, confirme
   **Usar esta pasta** e depois **Criar**. O projeto terá sua própria subpasta.
3. A aba **B** já abre com os tiles originais. Escolha uma peça e pinte no mapa.
   Para substituir o chão diretamente, selecione a camada 1 (primeira camada
   numérica da barra). Desfazer e refazer ficam na barra de ferramentas.
4. Clique em **Salvar** e em **Testar jogo**. Escolha **Novo jogo**.
5. Use as setas para andar, Enter para conversar com o NPC e Escape para o menu.
   O NPC oferece uma batalha de treino editável.

Projetos antigos: escolha **Projeto 2D** no seletor do topo para ocultar as
ferramentas 3D. **Projeto 2D + 3D** oferece o conjunto completo. Essa escolha
preserva os dados existentes e fica salva no projeto.

Abra **Animações 2** para configurar poses de aliados e inimigos em páginas de
oito prévias. **Definir…** abre recortes, quadros e reprodução; aplique a pose e
salve pelo OK do banco. **Tela de batalha** configura apresentação, comandos e
posições dos aliados. Veja os recursos e limites em [Interface 2D](2D_WORKSPACE.md).

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
água pintada e movimento no caminho. A preparação desse teste usa API. Na 0.1.2,
`smoke:project:windows` também confirma a criação completa pela interface e pelo
seletor integrado, substituindo o caminho nativo que causava o fechamento.

Resumo em `artifacts/basic-use-smoke.json`; projeto e capturas em sua pasta de
evidências. O pacote atual também é verificado por `smoke-ready-windows.cjs`.
Continua sendo uma versão de desenvolvimento: autoria completa, animações
avançadas e distribuição pública ainda têm pendências documentadas.

**Novo NPC:** abra um mapa, clique em Novo NPC, escolha imagem/retrato e escreva o diálogo. Confirme, salve e teste com Enter diante do personagem. Ferramentas avançadas expande a barra no perfil 2D. [Detalhes](CLASSIC_AUTHORING.md).
