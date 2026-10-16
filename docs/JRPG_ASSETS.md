# Recursos ilustrados JRPG — 0.2.5

## Implementado e testado

Conjunto original **Vila da Clareira**, criado com imagegen integrada:
dois cenários (mapa e fundo de batalha), duas spritesheets de caminhada,
24 quadros de combate e quatro retratos. Sete PNGs originais em alta resolução
ficam preservados em `assets/jrpg-test/originals`; sete arquivos importáveis
ficam em `assets/jrpg-test/pack/img`, incluindo a folha transparente de colisão.

[Descrição, dimensões e limitações](../assets/jrpg-test/README.md).
[Prompts completos e origem](../assets/jrpg-test/GENERATION.md).

O editor 0.2.5 oferece **Usar Vila da Clareira** na criação de projeto. É uma
opção marcada por padrão. Projetos existentes são preservados.
O pacote importa os arquivos e configura banco, mapa, evento e sequências
sobre os formatos/runtime existentes. Não usa Demo upstream ou outra engine.

O projeto de teste usa terrenos e objetos como tiles nativos editáveis, sem
uma imagem de parallax achatada. Terrenos, margens de água/terra e os objetos
modulares ficam em `ClareiraTerrenos.png` e `ClareiraObjetos.png`; a composição
do mapa continua no formato de mapa existente. O contrato
`pack/chipset.json` fixa tile de 32 px, A5 em IDs 1536+ (oito colunas) e B em
IDs 0–255 (16 colunas). `DianaTileKit` é a única origem dos IDs, flags e
montagem de mapas, portanto a paleta, colisão e runtime usam os mesmos dados.
`!VilaClareira.png` permanece no pacote apenas como referência/parallax
opcional e não é a camada visual dos mapas nativos.

Além da Vila inicial, `Map002` é a **Rota de navegação** com água bloqueada,
ponte transitável e obstáculos B; `Map003` é a **Arena de animação e batalha**,
com evento de combate que reutiliza as poses existentes de Liora e Guardião.
Cada fixture registra `dianaFixture` versão 1, propósito e páginas nativas;
as transferências e encontros usam somente comandos já suportados pelo runtime.

Liora usa seis quadros por direção no arquivo `$Liora[f6].png`; o patch
versionado de cadência conserva a duração total do ciclo de caminhada e só é
ativado nos novos projetos da Clareira. `$Liora.png` continua sendo a versão
compatível de três quadros. Rostos usam o atlas padrão 4 × 2 de 144 pixels,
com índices 0/1/4/5 ocupados.

Aliado e inimigo compartilham quatro poses: espera, ataque, dano e vitória.
Recortes de combate têm 192 × 192. Liora usa quatro quadros de ataque; o
guardião usa seis quadros de espera, ataque e dano; ambos usam seis quadros de
vitória que preservam o quadro final. Outros estados reutilizam essas imagens;
nocaute e defesa ainda não têm desenhos separados.
Os mapeamentos cobrem os estados do motor para evitar renderizar a folha inteira
quando o motor pede input, ready, wait ou entry.

## Evidências

- Incremento de tiles nativos: `npm run assets:compile` e
  `node --test tests/jrpg-sample.test.cjs tests/jrpg-polish.test.cjs` aprovados
  (10/10). Cobrem compilação determinística, contrato A5/B, IDs/flags,
  configurações do mapa inicial e as duas fixtures.
- `npm test`: 86/86; `test:prepared -- build/diana-0.2.5`: 31/31.
- `npm run smoke:windows`: passou com editor, persistência e jogo executado
  (`artifacts/windows-smoke-Kqb6Dg`).
- Manifesto com dimensões e SHA-256 validado; transparência de personagens e
  folha de combate verificada.
- Smoke `scripts/smoke-jrpg-assets-windows.cjs` passou no pacote 0.2.4.
  Criou pela interface, abriu poses no editor, iniciou Novo jogo por teclado,
  caminhou, encontrou colisão, conversou com retrato e entrou na batalha.
- Ações de combate foram forçadas pela API para isolar animações e dano de
  RNG/timing dos menus. Não é um teste completo de todas as opções de comando.
- Instrumentação temporária do teste registrou os quatro recortes efetivamente
  renderizados do ataque de cada lado, e dano em ambos sem erros JavaScript.
- Resumo/capturas: `artifacts/jrpg-assets-smoke.json`, último conjunto validado
  `artifacts/jrpg-assets-BbjUJh`, que também criou o projeto pronto atualizado.
- Capturas de mapa, diálogo e batalha foram inspecionadas. Uma primeira captura
  revelou a folha inteira: corrigido por mapeamentos de estado explícitos e
  regressão que exige recortes de 192 pixels para ambos os lados.
- Não foi executado smoke visual Windows específico para Map002/Map003 neste
  incremento; a evidência atual dessas fixtures é de contrato e runtime Node.

## Parcial

Revisão artística final, quadros de nocaute/defesa específicos, efeitos
e sons separados e expansão artística do tileset ainda pendentes. Pequenas
variações gerativas e ajustes manuais de alinhamento podem ser necessários.
O cenário não oferece entradas funcionais nas casas nem missão completa.
As limitações de distribuição do engine continuam documentadas separadamente.

## Padrão a partir da 0.2.4

Projetos novos usam Vila da Clareira por padrão, incluindo Liora, guardião, rostos, mapa e fundo de batalha. Desmarcar o modelo ainda permite o conjunto básico legado. No padrão ilustrado, $Diana, $Treinador e DianaChao não são copiados. Projetos existentes são preservados.

Na 0.2.4, ClareiraCombate media 768 × 1152, com espera/ataque de Liora, espera/ataque do guardião e duas linhas de dano. A pose damage usa quatro quadros de oito ticks, sem loop, para ambos; o runtime existente a aciona quando recebem dano. A expressão da personagem é própria, com olhos fechados e recuo, sem reutilizar o ataque. Original em assets/jrpg-test/originals/Dano.png.

## Incremento 0.2.5

O atlas de combate passou a medir 1152 × 1536: as linhas 0–5 preservam as
poses anteriores e as linhas 6–7 registram vitória para Liora e guardião. Os
originais, alinhamentos e chipset são versionados em `assets/jrpg-test`; a
compilação é determinística por `npm run assets:compile`. A inspeção de
alinhamento, transparência, seis recortes distintos e compatibilidade de
cadência é coberta por testes de regressão. A comparação visual/audível
completa de batalha permanece parcial. Este incremento não cria arte final de
personagens distintos: as fixtures técnicas reutilizam somente Liora e Guardião.

## Expansão editável da Vila da Clareira

A Vila da Clareira passou de fixture compacta para uma vila nativa de **40 ×
36 tiles**, ainda inteiramente montada nas seis camadas do mapa. O mapa não
usa parallax para desenhar terreno ou objetos: `!VilaClareira.png` continua
apenas como referência opcional.

O conjunto de tiles agora possui três páginas editáveis:

| Página | Arquivo | Uso |
| --- | --- | --- |
| A5 | `ClareiraTerrenos.png` | grama, terra, água, pedra, madeira e margens |
| B | `ClareiraObjetos.png` | casas, árvores, poço, arbustos, pedras, flores, postes e cercas |
| C | `ClareiraInteriores.png` | letreiros, banca, balcão, mesas, camas e estantes |

A praça central inclui poço, jardim, mercado, ponte sobre o rio, quatro casas
e postes. Cinco moradores possuem eventos de diálogo: hoteleira, mercador,
jardineira, pescador e aprendiz. As portas levam à **Hospedaria da Lanterna**
(`Map004`) e à **Casa do Jardineiro** (`Map005`), ambas decoradas com os tiles
da página C e com saída de retorno. Os mapas de rota e arena permanecem como
`Map002` e `Map003`.

Os moradores reutilizam Liora e Guardião como sprites de fixture para não
alegar personagens ilustrados distintos. Arte final de NPCs continua
pendente de fonte original aprovada e de revisão de licença.
