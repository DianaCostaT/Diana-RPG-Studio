# Vila da Clareira — recursos de teste Diana

Arte original gerada para este projeto com a ferramenta integrada **imagegen**,
em 15/10/2026. Referência estética: linguagem de JRPGs 2D de 16 bits — cores
ricas, silhuetas legíveis, floresta em camadas, retratos expressivos e combate
lateral. Nenhuma imagem, personagem ou código foi extraído de jogos comerciais.

## Conteúdo

- `originals/Clareira.png`: vila florestal vista de cima.
- `originals/LioraCaminhada6.png`: aventureira, seis quadros e quatro direções.
- `originals/GuardiaoCaminhada.png`: guardião de pedra e musgo.
- `originals/GuardiaoCombate6.png`: seis quadros do guardião; `Vitoria6Final.png`
  contém seis quadros de vitória para ambos os lados.
- `originals/Terrenos.png` e `ObjetosModulares.png`: fontes dos tiles editáveis.
- `pack/chipset.json`: contrato versionado das páginas A5 (`ClareiraTerrenos`,
  IDs 1536+), B (`ClareiraObjetos`, IDs 0–255) e C
  (`ClareiraInteriores`, IDs 256–511).
- `originals/Dano.png`: quatro reações de dano para cada combatente.
- `originals/Rostos.png`: três expressões de Liora e um rosto do guardião.
- `originals/BosqueBatalha.png`: cenário lateral de combate.
- `pack/img/`: versões importáveis no Diana. Originais preservados integralmente.
- `pack/manifest.json`: dimensões e SHA-256 dos PNGs importados.

`node scripts/compile-jrpg-assets.cjs` faz a importação determinística: ajusta
resolução por vizinho mais próximo, organiza as células e mantém transparência.
Não usa uma segunda engine nem instala dependências. Rostos usam células de
144 × 144, personagens 48 × 48, poses 192 × 192. O parallax mede 1024 × 1024.
As páginas nativas usam tiles de 32 × 32: A5 tem oito colunas de terreno; B e
C têm 16 colunas de objetos e interiores. `!VilaClareira.png` é preservado
como referência ou fundo opcional; não é usado para desenhar os mapas de
amostra.

No atlas de rostos 4 × 2: normal = 0, sorrindo = 1, séria = 4, guardião = 5.
Na folha de batalha 6 × 8: Liora espera/ataque nas linhas 0/1; guardião nas
linhas 2/3; dano de Liora/guardião nas linhas 4/5; vitória de Liora/guardião
nas linhas 6/7. As poses têm âncora nos pés e duração configurável no editor.

## Usar

No Novo projeto do Diana 0.2.5, já vem marcado **Usar Vila da Clareira**. O
mapa inicial tem 40 × 36 tiles editáveis, quatro casas, praça, mercado, rio,
ponte, jardim, cinco moradores, colisões por tiles e batalha de treino. Ele
inclui `Map002`, a **Rota de navegação**; `Map003`, a **Arena de animação e
batalha**; `Map004`, a **Hospedaria da Lanterna**; e `Map005`, a **Casa do
Jardineiro**. Todos carregam `dianaFixture` versão 1, que declara seu propósito
e as páginas nativas. Projetos existentes e o modelo básico permanecem
preservados.

## Revisão 0.2.6

A vila agora tem 48 × 40 tiles, estradas conectadas e portas alinhadas às casas.
Mira, Orin, Nila e Ivo têm desenhos próprios em `originals/MoradoresClareira.png`;
Celina e Teo reutilizam Mira e Ivo. Cada folha importada usa seis colunas e quatro
direções, com os pés alinhados. `InterioresClareira.png` fornece banca, placas,
balcão, mesa, cama e estante ilustrados, preservando os IDs editáveis existentes.
Liora canônica também usa seis colunas; o RTP não sobrescreve seu nome nem sua
apresentação de combate. Prompts em `docs/JRPG_GENERATION_REVIEW.md`.

## Limitações artísticas

A arte é gerada e exige revisão antes de produção final. A folha original do
guardião contém uma orientação inconsistente no terceiro quadro da segunda
linha; a versão importada usa o primeiro quadro coerente nessa posição.
Expressões, volumes e detalhes podem variar entre quadros. O arco luminoso
do ataque ocupa quase toda a célula; não é uma animação de efeito independente.
A colisão do cenário continua uma aproximação manual por grid, não detecção
automática de objetos. Casas e árvores agora usam objetos modulares, mas ainda
exigem revisão artística antes de produção final. Continuidade de volumes,
acessórios e contatos dos pés ainda demanda revisão artística; os testes de
recortes e duração não certificam animação perfeita.

Os prompts e a origem ficam em [GENERATION.md](GENERATION.md).
Os recursos são disponibilizados sob a licença MIT do repositório; a geração
não usou assets proprietários como entrada.
