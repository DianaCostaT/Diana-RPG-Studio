# Correção de caminhada e combate — Liora e Brann

17/10/2026. **Implementado e testado por pixels, DOM e execução NW.js.** A validação específica de interação no Tauri está registrada abaixo quando concluída; não confundir com o smoke NW.js.

## Causas e correções

- O original de Liora tem linhas desiguais. A cabeça da direção direita começa em y=508, acima do corte antigo y=512. Cortar a folha em células iguais antes de alinhar eliminava cabelo e incluía partes do quadro seguinte. O importador agora identifica o personagem inteiro antes de montar a grade final.
- Brann tinha diferenças de braços, mas quase a mesma passada repetida. `assets/rtp/medieval/BrannCaminhada-v2.png` acrescenta poses de passagem com pés juntos. O original anterior permanece intacto. A ordem de caminhada começa pelo quadro de repouso: 2, 0, 1, 5, 3, 4 (índices a partir de zero), com seis quadros em cada uma das quatro direções.
- No combate, espadas, capas e o arco do golpe cruzavam divisões regulares do atlas. São recuperados os componentes inteiros dos 36 personagens do quadrante Brann, com máscara por componente para não copiar fragmentos vizinhos. Escala única em toda a folha e margem transparente; não redimensionar cada pose de forma independente.
- O runtime ignorava o índice fixado de uma pose quando havia `spriteAnimation`. O patch `zzzzzzzzzzzzzzzzz-sprite-grid-held-frames.patch` corrige o editor e o runtime juntos, para aliados e inimigos. A atualização de projetos existentes também compara `reactor_battle_data.js`, além dos arquivos de caminhada.

## Ferramenta no editor

Abra **Corrigir sprites** na barra superior. Também há acesso pela área de gráfico de batalha e pelo seletor de personagem do mapa.

1. Selecione a folha de mapa, aliado ou inimigo.
2. Para Liora e Brann, use **Usar original da Clareira**. Para outras folhas, carregue seu PNG de origem. Uma imagem que já perdeu pixels não contém informação para reconstruí-los.
3. Confira colunas, linhas, tamanho de saída e margem. **Isolar personagem completo** usa conectividade de oito vizinhos e separa fragmentos desconectados; armas e efeitos separados precisam de revisão. A opção vem desmarcada para fontes genéricas.
4. Use **Detectar e reconstruir quadros**. A escala é a mesma para todos os frames. O original fica à esquerda, a prévia à direita, com miniaturas numeradas, próximo/anterior, reprodução e seleção de direção. Cada frame permite editar X, Y, largura e altura do recorte original.
5. **Salvar cópia e usar nos personagens** cria um nome livre, preserva o PNG anterior e atualiza os atores e as referências de apresentação de batalha carregadas. A grade de caminhada existente é preservada quando compatível; folhas sem contrato recebem uma grade direcional. Salve o projeto para persistir os dados. Eventos que usam a folha antiga podem selecionar a cópia no seletor de gráficos.

O adaptador Tauri enumera nomes de arquivo em minúsculas; a ferramenta resolve nomes lógicos e referências sem diferenciar caixa, preservando o nome dos dados quando disponível. Essa distinção foi encontrada ao testar a janela Tauri.

## Evidências

- `tests/sprite-repair.test.cjs` verifica os 24 frames de cada caminhada e os 36 de combate contra a extração completa dos originais, seis imagens distintas em cada linha, transparência em todas as bordas, base comum, recortes fora da imagem e pose fixada de aliados/inimigos no editor/runtime preparados.
- `npm run smoke:sprites:windows` passou em `artifacts/sprite-repair-smoke-cH8cUG/`. O formulário real carregou os três originais, percorreu as 84 posições, gerou cópias e salvou o projeto. No jogo, verificou os 48 recortes direcionais de líder/seguidor, mudança de padrão durante movimento por teclado e os 36 recortes de combate de Brann. Capturas de cada folha, caminhada lateral e batalha estão nessa pasta; relatório em `artifacts/sprite-repair-smoke.json`.
- O movimento desse smoke usa passagem liberada para isolar o comportamento de animação; não certifica colisão ou navegação. Os frames de combate são percorridos por API de pose fixada; não equivalem a completar cada habilidade por interação.
- `npm run smoke:windows` passou em `artifacts/windows-smoke-yQ47gO/` na integração. Os testes gerais e preparados são registrados com seus totais finais em `.diana-ai/sprite-correction.json`.
- Os originais de Liora e do atlas de combate e a referência visual da vila foram preservados. Nenhum recurso externo, engine ou dependência foi instalado.

## Procedência da nova caminhada

Ferramenta: habilidade `imagegen`, ferramenta integrada, duas edições. Primeira tentativa descartada por repetir a passada; segunda integrada como `assets/rtp/medieval/BrannCaminhada-v2.png`. A imagem anterior `BrannCaminhada.png` permanece como referência e histórico. A geração não garante movimento perfeito por si: a aprovação desta integração inclui inspeção das poses de passagem, recorte por alpha e execução no jogo.

Prompt final da segunda edição (alvo: primeira tentativa de caminhada, baseada no original Brann):

> Correct this walking atlas. Keep character hair head armor shield identity pixel art style exactly. The current image is WRONG because all six poses show the SAME leg forward. Change ONLY LEGS in the atlas. In columns THREE and SIX of EVERY row, BOTH BOOTS must be SIDE BY SIDE UNDER THE BODY in a narrow neutral standing/passing pose, no leg extended forward and no raised knee. In columns FOUR and FIVE of EVERY row swap which leg is raised/forward compared to columns ONE and TWO. Front row columns1/2 viewer LEFT knee forward, columns4/5 viewer RIGHT knee forward. Back row must alternate same way. Side-facing rows columns3/6 MUST have BOOTS TOGETHER DIRECTLY BELOW HIPS, visibly narrow standing silhouette, while columns1/2 and4/5 remain broad walking silhouette. This contrast is essential. Do NOT produce all frames in the same striding pose again. Preserve 6 columns x4 rows, 1536x1024, full bodies, row directions down left right up. Transparent background. NO gradient backdrop or opaque painted background. Keep head proportions and detailed style. Change leg pose, do not merely change the arms.


## Resultado final desta integração

`npm test`: **210/210**. `npm run test:prepared`: **69/69**. `npm run smoke:windows`: passou em `artifacts/windows-smoke-NuQHpD/`. O smoke específico passou em `artifacts/sprite-repair-smoke-cH8cUG/`, com os 36 recortes de combate também conferidos no runtime. A ferramenta foi aberta no Tauri de desenvolvimento; o ciclo completo de persistência/reabertura e jogo das folhas corrigidas neste host permanece pendente.
