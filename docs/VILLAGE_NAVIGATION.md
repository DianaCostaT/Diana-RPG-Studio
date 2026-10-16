# Navegação da Vila da Clareira

Estado em 2026-10-16: **implementado e testado por API/dados**. A vila
nativa tem 48 × 40 tiles de 32 px, com seis camadas, sem trocar a engine,
o formato do projeto ou os assets. O início permanece em `(20,30)`.

## Organização espacial

As coordenadas abaixo são `(x,y)`, com origem no canto superior esquerdo.
Nenhum evento precisa mudar de posição para esta revisão.

| Elemento | Posição e regra |
| --- | --- |
| Casa do jardineiro | Objeto em `(8,6)`; porta em `(10,9)`; retorno em `(10,10)` |
| Hospedaria | Objeto em `(25,6)`; porta em `(27,9)`; retorno em `(27,10)` |
| Guardião | Evento preservado em `(18,25)`; lâmpada deslocada para `(17,24)` |
| Retorno da rota | `(18,24)` livre, conectado à praça |
| Pescador | Evento preservado em `(7,20)`; rocha deslocada para `(8,22)` |
| Praça e arena | Acesso preservado ao evento em `(23,24)` |
| Rota de navegação | Acesso preservado ao evento em `(20,33)` |
| Expansão leste | Caminho vertical em `x=40..42`, ligado à ponte e ao caminho sul |
| Caminho sul | `x=9..42`, `y=32..34`, ligado ao eixo central |

As duas casas do norte foram alinhadas às portas existentes. O terceiro tile
da última linha do objeto `house` é transitável, correspondendo à porta da
ilustração; o restante da fachada e o telhado permanecem sólidos. As cercas
do norte e a placa da hospedaria foram reposicionadas para não sobrepor as
casas. A via em `y=10..11` conecta as soleiras ao eixo central. A expansão
recebe árvores, iluminação e um jardim com solo cultivado.

O rio continua sólido em `x=2..5`, salvo a ponte em `y=17..19`. Copas
usam a flag de sobreposição `16`; troncos e objetos sólidos usam `15`.
A textura nativa `shade` (`1542`) passa a representar paredes sólidas,
enquanto `stone` continua transitável na praça. Os quatro lados dos
interiores usam `shade`; as saídas permanecem dentro do cômodo em `(10,13)`.
Como a colisão pertence ao tileset, esse contrato vale para todos os mapas
que usam esses tiles, inclusive casas adicionais e paredes pintadas à mão.

## Evidência e limites

Comando focado: `node --test tests/village-navigation.test.cjs`.
Resultado: **6 testes aprovados, 0 falhas**.

Os testes percorrem tiles em quatro direções, consultando as flags de cima
para baixo, ignorando tiles vazios e de sobreposição, e verificando a saída
e a entrada de cada passo. Cobrem:

- conexão do início às portas, NPCs, transferências e caminhos da expansão;
- aproximação dos NPCs com suas posições tratadas como ocupadas;
- eventos e destinos reais gerados por `DianaJRPGSample` nos cinco mapas;
- porta no tile ilustrado, cercada por fachada sólida;
- água bloqueada, ponte transitável e desconexão da margem oeste ao remover
  a ponte no teste, além de colisão de tronco, lâmpada e rocha;
- saída e pontos de leitura acessíveis nos interiores, com bordas e móveis
  sólidos.

Esta evidência verifica os dados e a lógica de passagem por flood fill;
não representa interação visual nem uma sessão executada do jogo. A arte
do tileset foi inspecionada para localizar a porta; a apresentação final
do mapa na janela do editor e os gatilhos de transferência em jogo ainda
precisam de validação visual após a integração. Não foram executados
`prepare:editor`, smoke Windows ou suíte completa durante a integração
paralela, conforme o escopo delegado. Esses passos e a atualização de
`.diana-ai/` ficam com o coordenador, que possui esses arquivos.
