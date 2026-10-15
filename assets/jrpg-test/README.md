# Vila da Clareira — recursos de teste Diana

Arte original gerada para este projeto com a ferramenta integrada **imagegen**,
em 15/10/2026. Referência estética: linguagem de JRPGs 2D de 16 bits — cores
ricas, silhuetas legíveis, floresta em camadas, retratos expressivos e combate
lateral. Nenhuma imagem, personagem ou código foi extraído de jogos comerciais.

## Conteúdo

- `originals/Clareira.png`: vila florestal vista de cima.
- `originals/LioraCaminhada.png`: aventureira, três quadros e quatro direções.
- `originals/GuardiaoCaminhada.png`: guardião de pedra e musgo.
- `originals/Combate.png`: quatro quadros de espera e quatro de ataque por lado.
- `originals/Dano.png`: quatro reações de dano para cada combatente.
- `originals/Rostos.png`: três expressões de Liora e um rosto do guardião.
- `originals/BosqueBatalha.png`: cenário lateral de combate.
- `pack/img/`: versões importáveis no Diana. Originais preservados integralmente.
- `pack/manifest.json`: dimensões e SHA-256 dos PNGs importados.

`node scripts/compile-jrpg-assets.cjs` faz a importação determinística: ajusta
resolução por vizinho mais próximo, organiza as células e mantém transparência.
Não usa uma segunda engine nem instala dependências. Rostos usam células de
144 × 144, personagens 48 × 48, poses 192 × 192. O parallax mede 1024 × 1024.

No atlas de rostos 4 × 2: normal = 0, sorrindo = 1, séria = 4, guardião = 5.
Na folha de batalha 4 × 6: Liora espera/ataque nas linhas 0/1; guardião nas
linhas 2/3; dano de Liora/guardião nas linhas 4/5. As poses têm âncora nos pés e duração configurável no editor.

## Usar

No Novo projeto do Diana 0.2.4, já vem marcado **Usar Vila da Clareira**. O mapa tem
parallax nativo, colisões por tiles transparentes, NPC com retrato e batalha
de treino. Projetos existentes e o modelo básico permanecem preservados.

## Limitações artísticas

A arte é gerada e exige revisão antes de produção final. A folha original do
guardião contém uma orientação inconsistente no terceiro quadro da segunda
linha; a versão importada usa o primeiro quadro coerente nessa posição.
Expressões, volumes e detalhes podem variar entre quadros. O arco luminoso
do ataque ocupa quase toda a célula; não é uma animação de efeito independente.
A colisão do cenário é uma aproximação manual por grid, não detecção automática
de objetos nem um tileset modular para reconstruir as casas/árvores.

Os prompts e a origem ficam em [GENERATION.md](GENERATION.md).
Os recursos são disponibilizados sob a licença MIT do repositório; a geração
não usou assets proprietários como entrada.
