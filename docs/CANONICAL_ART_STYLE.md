# Padrão visual obrigatório da Clareira

O usuário definiu a imagem `assets/jrpg-test/originals/Clareira.png`, mostrada na
captura do editor, como referência visual padrão. A direção está registrada em
`assets/jrpg-test/style-guide.json`: pixel art JRPG detalhada, telhados
azul-petróleo, reboco claro, vegetação densa, ruínas com musgo e caminhos naturais.

A imagem original permanece preservada como referência e voltou a ser a cena
central da vila no tamanho e composição aprovados. Ela é apresentada como uma
placa parallax dentro de um canvas transparente de 80 × 64 tiles; as áreas ao
redor continuam em tiles nativos, com colisões e eventos editáveis. As casas da
placa visual têm entradas para interiores nativos próprios. A placa central é
uma composição ilustrada e não pode ser pintada tile a tile; a área de expansão
e os interiores seguem editáveis. `ClareiraTerrenosPadrao.png` e
`ClareiraObjetosPadrao.png` permanecem disponíveis para extensões no mesmo
estilo. Fontes alternativas anteriores não definem a direção padrão.

## Edição e execução

| Página | Conteúdo | IDs nativos |
| --- | --- | --- |
| A5 | Grama, caminho, rio, pedra, madeira, solo e transições | 1536+ |
| B | Árvores, casas azuis, fonte, vegetação, luzes e cercas | 0–255 |
| C | Móveis, banca e placas | 256–511 |
| D | Ruína/escadaria, ponte, pinheiro, margem rochosa e toco | 512–767 |

O compilador preserva proporções, transparência e IDs existentes. Árvores e
pinheiros têm copa com flag de primeiro plano; troncos bloqueiam. A ruína tem
degraus transitáveis e paredes sólidas; a ponte permite cruzar o rio. Cada célula
pode ser pintada, apagada e restaurada pelo undo/redo do editor. Casas, ruína e
ponte são conjuntos de tiles, não imagens de fundo imutáveis.

Testes de dados cobrem a grade, hashes, recortes e navegação. O smoke de recursos
adiciona pintura por ponteiro de um tile D e compara undo/redo. A inspeção visual
do resultado no jogo permanece necessária: gerar peças no estilo da referência
não garante o mesmo acabamento de uma composição manual final.
