# PhotoCraft: aprendizado aplicado à criação de artes Diana

Data: 17/10/2026. **Estado: estudo estático e guia de produção concluídos;
melhorias de software propostas, ainda planejadas.**

## Evidência e alcance

Fonte fornecida: `C:\Users\lethe\Downloads\photocraft-main.zip`.
SHA-256: `33712cdbfe447c1033f0cce51e0ca1496cada8aae818d62a18336a8ad035c9a4`.
Extração de consulta em `artifacts/photocraft-study/photocraft-main/`, sem alterar
o ZIP. Inventário completo de 1.816 arquivos (1.365 Rust, 102 Markdown), 44.588.387
bytes, com hashes por arquivo em `artifacts/photocraft-study/inventory.json`.
Essas evidências são locais e ignoradas pelo Git; este documento é o registro durável.

Foi inventariado todo o conteúdo e estudada uma seleção orientada à arte: README,
arquitetura, modelo de documento, composição, histórico, pincéis, reamostragem,
gestão de cores, codecs, OpenRaster, automação, maturidade e avisos de licença.
A captura `docs/images/photocraft-masks.jpg` foi inspecionada visualmente.
Isso não equivale a ler integralmente cada arquivo nem executar o aplicativo.
Não houve instalação, compilação, testes PhotoCraft, importação de código/assets
ou alteração dos recursos existentes do Diana.

## Técnicas estudadas e consequências práticas

| Área | Evidência dentro do ZIP | Aplicação ao Diana |
| --- | --- | --- |
| Edição reversível | `crates/doc/src/lib.rs`, `crates/ops/src/lib.rs` | Preservar original, separar componentes e produzir cópias derivadas; uma operação artística deve poder ser desfeita. |
| Camadas e máscaras | `crates/compose/src/lib.rs`, captura de máscaras | Ajustar roupa, pele, folhagem e iluminação por regiões; máscara oculta, não apaga a fonte. |
| Recorte e escala | `crates/algo/src/resample.rs` | Escolher interpolação conforme o material; tratar alpha durante filtragem e testar halos. |
| Pincéis | `crates/paint/src/brush.rs`, `lib.rs`, `dynamics.rs`, `docs/brush-parity.md` | Espaçamento, pressão, dispersão e variação de cor controlados; salvar parâmetros e semente para repetir resultados. |
| Cor | `crates/cms/README.md`, `crates/compose/src/lib.rs` | Distinguir perfil de origem, conversão, composição e exibição; evitar mudanças acidentais de paleta. |
| Exportação | `crates/codecs/README.md`, `docs/ora.md` | Avisar perdas antes de gravar, manter fonte editável e conferir o arquivo reaberto. |
| Automação | `crates/engine/src/commands.rs`, `docs/control-protocol.md`, `docs/mcp.md` | Controles visuais e futura IA usam comandos internos comuns, validação, prévia, aprovação e undo/redo. |
| Desempenho | `crates/raster/src/lib.rs`, `crates/ops/src/lib.rs` | Histórico com dados compartilhados e limite de memória; atualizar somente regiões afetadas quando necessário. |

### Bordas transparentes e escolha de interpolação

O redimensionador PhotoCraft premultiplica os canais de cor pelo alpha antes da
filtragem e desfaz essa representação depois. O teste
`transparent_edges_do_not_darken` verifica uma borda vermelha transparente sem
escurecimento; outro teste exige que nearest neighbor não produza médias na redução.
São testes presentes no código, não executados nesta análise.

Para a Clareira, manter nearest neighbor no trabalho com pixels deliberadamente
definidos e escalas inteiras. Para ilustração com bordas suaves, comparar redução
filtrada em cópia, com alpha correto, evitando halos e excesso de nitidez. Não
aplicar Lanczos indiscriminadamente a folhas de sprites: filtros podem misturar
quadros vizinhos. Recortar cada célula, preservar margem e depois montar a folha.
Manter o contrato de alpha esperado por PNG, canvas e Pixi; premultiplicação interna
não deve virar uma segunda multiplicação na importação.

O `scripts/jrpg-raster.cjs` Diana já usa cópia por vizinho mais próximo e escala
compartilhada na animação. Seu limite de detecção por alpha é 96: isso é uma
heurística de enquadramento, não uma ferramenta de remoção de fundo. Efeitos
translúcidos e detalhes finos exigem inspeção; não apagar olhos, cabelos ou partículas
apenas porque têm pouco alpha. Não foi identificado nem corrigido um defeito desse
script nesta tarefa.

### Consistência sem perder detalhe

Camadas de ajuste permitem comparar versões sem repintar o original. Para Diana,
guardar o acabamento aprovado e testar matiz, saturação e contraste em cópias ou
ajustes localizados. Conversão de perfil é diferente de atribuir um perfil: mudar
só a etiqueta não transforma as cores. A saída de jogo proposta é PNG RGBA em sRGB,
confirmada visualmente no runtime; isso ainda não é garantia de gestão de cores
uniforme em todos os hosts.

A documentação PhotoCraft tem planos históricos e implementações posteriores.
Por exemplo, a arquitetura fala em composição linear configurável, enquanto o
cabeçalho do compositor consultado descreve composição em RGB de exibição. Não
presumir que todo recurso descrito em um plano já foi implementado.

## Procedimento para as próximas artes

1. **Referência:** abrir a Clareira aprovada e as referências do personagem; definir
   perspectiva, proporções, silhueta, materiais, direção de luz e função no jogo.
   Preservar telhados azul-petróleo, reboco claro, caminhos ocre, vegetação densa e
   ruínas com musgo. A técnica PhotoCraft não substitui essa identidade.
2. **Fonte editável:** organizar silhueta/base, volumes, materiais, sombras, luz e
   efeitos em componentes separados. Guardar a fonte de trabalho e sua procedência;
   PNG exportado é derivado. Não afirmar que arquivos PNG existentes têm camadas.
3. **Paleta e volume:** trabalhar primeiro leitura e contraste em tamanho de jogo;
   adicionar textura em grupos coerentes. Variar folhas/pedras com limites de cor e
   escala, sem ruído uniforme. Usar máscara para trocar roupa sem contaminar pele.
4. **Personagens:** fixar escala de toda a sequência e pivô estável, preservar rosto,
   roupa, arma e proporção entre poses. Não centralizar cada quadro de um salto ou
   ataque automaticamente se isso eliminar o deslocamento intencional. Revisar
   caminhada, repouso, impacto e retorno em reprodução contínua.
5. **Cenários:** separar terreno, objetos e copas/primeiro plano quando o recurso
   permitir. Checar luz, contato dos pés, sombras, caminhos e oclusão. Preservar a
   composição central já aprovada e a edição das expansões; não remodelar o mapa
   existente por causa desta pesquisa.
6. **Acabamento:** inspecionar transparência sobre fundo claro, escuro e colorido;
   conferir franjas, pixels soltos, cortes e detalhes desaparecidos. Para tiles,
   testar repetição 3×3 e transições; para sprites, verificar todas as células e
   margem da arma/efeitos, sem sobreposição no quadro vizinho.
7. **Exportação:** salvar cópia PNG com nome livre, grade e dimensões do contrato
   Diana, mantendo alpha. Registrar origem, parâmetros, versão e arquivo derivado.
   Reabrir o PNG antes de selecionar no editor. Evitar JPEG para sprites com alpha.
8. **Aceitação no jogo:** comparar antes/depois no mesmo enquadramento, com fundo,
   personagens e iluminação reais. Verificar legibilidade, fluidez, colisão e
   oclusão. Validação do PNG ou prévia isolada não comprova resultado dentro do jogo.

## O que merece implementação futura

- **Planejado — prioridade alta:** prévia de recorte com fundos claro/escuro,
  indicação de margem e pivô, comparação antes/depois e aviso de conteúdo na borda.
  Complementar o compositor existente, sem criar outro contrato para inimigos.
- **Planejado:** receitas de processamento versionadas e reprodução determinística
  de variantes, exportando cópias e preservando a fonte.
- **Planejado:** escolha explícita entre arte de pixels e ilustração para o método
  de escala, somente após comparação com amostras Clareira e testes de halos.
- **Planejado:** suporte opcional a fontes em camadas, com relatório de perdas de
  importação. OpenRaster não preserva todos os recursos PSD: a documentação lista
  rasterização de texto/formas e perdas de ajustes, efeitos e perfis não sRGB.
- **Planejado:** comandos de arte validados compartilhados entre interface e IA.
  Um lote de comandos não deve ser apresentado como transação se pode falhar após
  alterações parciais. Undo em memória não desfaz arquivos já gravados no disco.

RPGReactor continua a base e Tauri continua o host. Rust e WASM são possibilidades
de implementação a avaliar por subsistema; esta pesquisa não adiciona PhotoCraft,
wgpu, egui ou outra engine ao produto.

## Maturidade, licenças e validação

O próprio material classifica PhotoCraft como alpha. `docs/brush-parity.md` distingue
amplitude de ferramentas de sensação de pintura, latência e suporte de caneta;
ter um controle não comprova qualidade de uso. Percentuais e desempenho do README
são afirmações do projeto externo e não foram reproduzidos aqui.

`LICENSE-MIT`, `LICENSE-APACHE` e `NOTICE` apresentam o código principal sob
MIT OU Apache-2.0. Marcas ArtCraft têm termos separados; fontes, ícones, dicionário,
pesos de detecção e imagens de demonstração exigem suas próprias atribuições.
Consultar `ATTRIBUTION.md` e `docs/images/SOURCES.md` antes de qualquer reutilização.
Nenhum desses componentes foi incorporado nesta entrega.

Verificação desta tarefa: extração com validação de caminhos, inventário/hash do
ZIP e arquivos, inspeção estática e leitura visual da captura de máscaras. Sem
mudança de aplicação ou arte, não foram executados `npm test`, smoke, playtest ou
testes Tauri. Na implementação das propostas, executar `npm test` e
`npm run smoke:windows`, distinguindo API, interação visual e jogo; validar Tauri
separadamente. Referências permanentes: `CLAREIRA_VISUAL_DIRECTION.md`,
`CANONICAL_ART_STYLE.md`, `SPRITE_SHEET_AUTHORING.md` e `TAURI_MIGRATION.md`.
