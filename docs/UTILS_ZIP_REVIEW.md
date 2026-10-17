# Aprendizados do Utils.zip

Data: 2026-10-17. Estado: **análise estática realizada; propostas planejadas, sem integração de código ou assets**.

Fonte local: `C:\Users\lethe\Downloads\Utils.zip` (6.005.527 bytes).
SHA-256: `513a5f28a5d3a084cdd808a5c1de7cae09e38eb3d90953f3e36a73122b4e46f9`.
Inventário: 1.681 arquivos em 11 pastas de ferramentas, sem contar o conteúdo dos ZIPs internos. Foram lidos documentos, configurações e trechos do fonte PureBasic do Charas, diretamente dos arquivos compactados. Nenhum executável foi iniciado, nenhuma dependência instalada e nenhum recurso externo incorporado.

## O que aprender e como aplicar

| Ferramenta | Evidência no pacote | Aplicação proposta no Diana |
| --- | --- | --- |
| Charas, Offline Spriter Generator (1.127 arquivos) | `history.txt` descreve camadas, recoloração, prévia, correção de pés e formato CHAR reeditável; `Additionals/source - complete.zip` contém fontes `.pb`/`.pbi` | Gerador visual que salva a receita de composição além do PNG; camadas e cores continuam editáveis. |
| ChipMunk, Chipset (tileset) Mixer (83) | `Help.txt` descreve biblioteca de partes, água/animação/autotiles por arraste e pintura da área geral | Montagem visual de tilesets com categorias e validação das regras dos autotiles. |
| DMK dialogue Text import and export (21) | `Documentation/Fran…ais/Manuel.txt`, v3.5, descreve extração, reinserção, processamento incremental e patches de diálogos | Revisão/tradução em lote com contexto e identificadores estáveis; mostrar diferenças antes de aplicar. |
| FaceMaker (417) | `picture/` separa rosto, olhos, íris, sobrancelhas, boca, cabelo frontal/traseiro, roupas, acessórios e sombra | Retratos por componentes, com expressão separada da identidade; produzir peças originais no padrão Clareira. A estrutura de pastas foi inspecionada; a interface não foi executada. |
| Image Positioner x,y coordinate mapper (1) | Apenas `ImagePositioner.exe`; nome indica a finalidade | Proposta inferida: coordenadas visuais, arraste, âncora e campos numéricos sincronizados. Comportamento do programa não confirmado. |
| MassImportTool (2) | `Explanation.rtf`: classificação pelo tamanho, cor transparente, conversão PNG/XYZ e redução de paleta | Importação em lote com sugestões de categoria, prévia e correção manual; dimensões sozinhas não determinam o uso. |
| MyWin, Window&Text Maker (8) | `mywin.ini`, `sample.png`, manual japonês e ajuda CHM presentes | Referência para um compositor de janelas/textos. Leitura do manual com encoding ocidental foi inconclusiva; não considerar seus detalhes funcionais validados. |
| Name Generator and RM2K Tutorials (15) | Listas de personagens, equipamentos, itens, habilidades e palavras; `ReadFirst.rtf` contextualiza a origem | Geração opcional por categorias e vocabulário PT-BR próprio; manter edição manual. Tutoriais internos do executável não foram examinados. |
| RMText Text Editor (2) | `HowToUse.rtf`: formata páginas de diálogo e aponta limitação com palavras sem espaços | Prévia de quebra de linhas calculada com a fonte e largura reais da janela; tratar palavras longas, acentos e códigos de controle. |
| Sprite Sheet Creator (3) | Executável e `Sprite_Sheet_Creator_Form.png` presentes | Proposta baseada na finalidade: montar folhas com grade, margens, âncoras e ordem explícitas. Funcionamento e imagem de interface não foram inspecionados visualmente. |
| Whole Map Screenshot Tool (2) | `Instructions.rtf`: exporta `MapXXXX.bmp` e exclui a camada de eventos | Exportar mapa completo com escolha de camadas e eventos, escala e limites de memória. |

## Lições técnicas mais relevantes

1. **Guardar a receita, além da imagem.** O histórico do Charas registra que CHAR preserva dados para trocar cabelos e recolorir depois. No Diana, uma receita versionada deve guardar componentes, ordem, deslocamentos e paletas e gerar o PNG por um pipeline determinístico. É proposta, não formato implementado.
2. **Ordem de camadas faz parte do contrato.** O histórico relata regressões entre corpo, cabeça, roupa, cabelo e itens. Registrar a ordem e permitir partes atrás/à frente; testar o resultado em direções e poses. Compartilhar o contrato entre aliados e inimigos.
3. **Âncoras e pés devem sobreviver às variações.** O Charas registra correções de pés e preservação de recursos ao trocar conjuntos. O compositor atual do Diana já oferece seleção de quadros, prévia e centralização pela transparência, conforme `docs/SPRITE_SHEET_AUTHORING.md`; ampliar esse fluxo em vez de criar um editor concorrente.
4. **Não reproduzir restrições antigas.** O fonte `charsetgenerator.pbi` usa células de personagem de 72×128 e folha de 288×256; o importador contém passos de 24/32 pixels. São pressupostos desse formato antigo. A Clareira exige sprites grandes, grade configurável e qualidade preservada, sem redução automática para 256 cores.
5. **Importação precisa permitir corrigir a sugestão.** MassImporter usa tamanho para classificação; ChipMunk oferece escolha de cor transparente. Preservar alfa nativo, mostrar o efeito da remoção de fundo e salvar cópia, sem substituir o original silenciosamente.
6. **Edição textual em lote precisa detectar conflitos.** O manual DMK alerta sobre reinserção repetida e substituição dos mapas. Uma implementação própria deve usar IDs de mapa/evento/página/comando, revisão de origem, prévia, aplicação atômica e undo/redo. Uma segunda aplicação deve ser inócua ou rejeitada com explicação; preservar comandos e códigos de controle.
7. **Biblioteca organizada vale mais que muitos arquivos soltos.** Separar função, compatibilidade de grade, estilo e procedência. Peças de retrato e corpo precisam de conjuntos coerentes, não combinações arbitrárias.

## Procedência e limites de reutilização

O `Help.txt` do ChipMunk declara CC BY-ND e aponta a versão 2.5 Brasil. O documento `Copyrights.txt` distribuído na pasta do DMK declara CC BY-NC e condições próprias, inclusive autorização comercial. O escopo desses avisos não foi auditado arquivo a arquivo; a presença do fonte Charas também não estabelece uma licença permissiva. Não foram copiados código, listas, DLLs, executáveis ou imagens para o produto.

O `ReadFirst.rtf` do gerador de nomes menciona uma versão não oficial do RM2K; nomes de alguns recursos Charas também remetem a personagens comerciais. Isso não prova a origem de cada imagem, mas impede tratar o ZIP como um pacote de assets originais liberados. O estudo serve como referência funcional para implementação própria e arte original. Não foi realizada verificação externa de autoria ou licenças.

## Prioridade sugerida e verificação

**Planejado:** primeiro importação visual em lote e revisão de diálogos; depois receitas de personagens/retratos e montagem de tilesets; exportação de mapa completo como ferramenta de revisão. Esta ordem é uma proposta, não altera o roadmap aprovado nem substitui as pendências da migração Tauri.

Implementar futuros fluxos sobre o RPGReactor fixado, código Diana em `src/`, patches do upstream versionados e operações de arquivo pelo host Tauri. Manter editor, dados e runtime juntos. Conferir o resultado dentro do jogo com a direção de `docs/CLAREIRA_VISUAL_DIRECTION.md`.

**Validação desta análise:** leitura estática e hash do ZIP. Sem testes de API das ferramentas, interação visual ou execução de jogo. `npm test` e `npm run smoke:windows` não foram executados nesta tarefa documental, sem integração de runtime/editor. Quando houver implementação, executar ambos e registrar testes Tauri separadamente.
