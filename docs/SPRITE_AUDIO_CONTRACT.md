# Contrato de sprites e BGM Diana

Estado: implementado e testado por Node em 16/10/2026. A validação visual e auditiva Windows **não foi executada** neste incremento.

## Folhas ilimitadas

`System.json` pode guardar `dianaSpriteAnimations` versao 1. Cada entrada em `characters` e indexada pelo nome da imagem e declara `columns`, `rows`, `anchor` e animacoes nomeadas. Uma animacao possui `frames` (indices de celulas em ordem, sem limite), `speed` (quadros de jogo por celula) e `loop` (`true`, `false` ou `"once"`). `walk` e consumida no mapa. Sem uma entrada valida, o runtime continua usando personagens estaticos e `[fN]` como antes.

Gráficos de ator/inimigo usam o mesmo objeto em `BattlePresentation.json`, em `graphic.spriteAnimation`. O compositor visual conectado a **Animações 2** permite informar colunas, linhas, âncora, animação nomeada, velocidade e repetição; clicar em uma célula acrescenta seu índice à lista ordenada de miniaturas, que permite mover ou remover quadros. A mesma prévia é usada durante a composição. O seletor de gráfico de personagem do mapa também oferece o compositor e persiste em `System.json`. Recortes de pose existentes continuam disponíveis.

O projeto Vila da Clareira agora usa `$Liora` e o contrato de grade, em vez de depender de `[f6]`.

## BGM

`System.json` pode declarar `dianaAudioLoops:{version:1,bgm:{Nome:{start,end}}}` em segundos. O runtime instala o intervalo no ciclo de decodificação WebAudio, antes dos ouvintes iniciarem a reprodução; assim os metadados decodificados não o sobrescrevem. Um intervalo com início negativo, fim não numérico ou fim menor/igual ao início gera erro claro em português; a ausência da configuração mantém a reprodução normal. Comandos/extensões podem passar o mesmo formato como `bgm.dianaLoop`; este é o ponto de extensão mínimo, sem nova arquitetura de plugins.

## Limites

A verificação cobre contratos, limites, composição, persistência por DOM simulado e seleção runtime por Node; não cobre áudio audível nem smoke visual Windows.
