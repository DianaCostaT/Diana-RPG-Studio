# Validação de mapas, eventos e parallax — 2026-10-15

Estado: **implementado e testado**, dentro da cobertura abaixo. Não equivale a homologação completa da autoria visual de eventos.

## Comandos e evidências

- `node --test tests/map-events.test.cjs`: 3 testes de contrato/API aprovados.
- `npm test`: 57 testes aprovados na rodada final (inclui trabalho integrado por outros workers).
- `node scripts/smoke-map-events-windows.cjs`: aprovado no SDK Windows local, duas rodadas finais consecutivas; última evidência em `artifacts/map-events-smoke-Zkst0G/` e resumo em `artifacts/map-events-smoke.json`.
- `npm run smoke:windows`: houve falha transitória enquanto o processo anterior ainda usava o build com mapa vazio. Após promoção coordenada do starter preenchido, o smoke global passou com undo1/redo3. Resumo atual em `artifacts/windows-smoke.json`.

A pasta de evidências contém projeto real salvo, perfis isolados, `editor.png`, `dialogue.png` e `transfer.png`. A imagem final foi inspecionada: mostra a mensagem “Switch e variável: mapa dois!”; o contraste de texto da janela é baixo com os recursos iniciais atuais, sem correção visual neste escopo.

## Interação real e execução do jogo

O smoke abre NW.js via WebDriver, cria projeto em caminho com espaços e acentos e importa PNGs sintéticos próprios. Usa ponteiro WebDriver sobre o canvas para pintar e apagar tile, verifica undo/redo por API, salva/reabre e confirma persistência da pintura e do apagamento no JSON. O ciclo de histórico é recriado após reabrir; não afirma persistência de histórico.

No jogo, sem chamar diretamente o interpreter ou definir switches/variáveis de resultado, usa ArrowRight contra tile bloqueado e Enter para iniciar/confirmar diálogo. Verifica posição preservada em (3,3), passagem bloqueada, transferência para mapa 2 em (4,4), switch 1 verdadeiro, variável 1 igual a 7 e página automática condicionada mostrando a segunda mensagem. Não ocorreram erros JavaScript capturados.

Camadas reais carregadas: fundo z=-1/opacity180, primeiro plano z=9.0001/opacity64, drift alterando origem entre frames e camada condicionada ao switch2 inicialmente oculta. Tile quadrado de 32px foi reconhecido no editor e runtime; personagem importado de folha 144x240 tem frame runtime 48x60, independente do tile.

## API e limites

Fixture de eventos, importação, tileset/flags, configurações de camadas e tamanho de tile são preparados pelas APIs existentes. A seleção de ferramenta e tile também usa API; o gesto de pintura/apagamento usa ponteiro real. Salvar/reabrir e undo/redo usam API. Não foram validados cliques nas janelas de autoria de eventos, importação, parallax ou configuração de dimensões; esses fluxos permanecem **implementados não testados visualmente** nesta tarefa.

Os testes Node verificam contrato editor/runtime para camadas após round-trip JSON, profundidade, drift/follow, combinação de switch/variável e limites da grade de colisão. São testes de API, não prova de interação visual ou de movimento em jogo.

Não há suporte adicional introduzido para dimensões retangulares independentes de tile nem retângulo de colisão customizado. Colisão testada é a flag de passagem padrão do tileset; colisão por máscara de imagem teve apenas teste de consulta de grade. Tamanho do preview de sprite no editor e edição visual desses parâmetros não foram afirmados.

## Correções desta retomada

O script parcial enviava Enter como texto literal; foi corrigido para a tecla WebDriver. Foram acrescentadas esperas por mapa ativo, fim do fade e fim do cooldown da janela, evitando comandos durante fases que ignoram entrada; screenshots aguardam texto revelado. Foram adicionados sprite variável e colisão real por controle, além de diagnóstico de foco, frames, eventos, teclas e erros nas falhas.

Nenhum arquivo upstream foi modificado nesta retomada; portanto não há delta para `patches/zzzz-map-events.patch` e não é necessário prepare por este trabalho. Sem instalações ou commits. O coordenador mantém responsabilidade pela atualização de `.diana-ai/` e pelo smoke global após integração final.
