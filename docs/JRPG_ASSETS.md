# Recursos ilustrados JRPG — 0.2.4

## Implementado e testado

Conjunto original **Vila da Clareira**, criado com imagegen integrada:
dois cenários (mapa e fundo de batalha), duas spritesheets de caminhada,
24 quadros de combate e quatro retratos. Sete PNGs originais em alta resolução
ficam preservados em `assets/jrpg-test/originals`; sete arquivos importáveis
ficam em `assets/jrpg-test/pack/img`, incluindo a folha transparente de colisão.

[Descrição, dimensões e limitações](../assets/jrpg-test/README.md).
[Prompts completos e origem](../assets/jrpg-test/GENERATION.md).

O editor 0.2.4 oferece **Usar Vila da Clareira** na criação de projeto. É uma
opção marcada por padrão. Projetos existentes são preservados.
O pacote importa os arquivos e configura banco, mapa, evento e sequências
sobre os formatos/runtime existentes. Não usa Demo upstream ou outra engine.

Projeto pronto para abrir: `dist/Projetos/Vila da Clareira 0.2.4`.
Editor pronto: `dist/Diana-RPG-Studio-Windows-0.2.4/Diana.exe`.
Abra a pasta do projeto no editor e clique em Testar jogo; Enter inicia Novo
jogo e conversa com o guardião logo à frente. Lutar/Atacar inicia os ataques.

O mapa usa parallax nativo 1024 × 1024, grid 32 × 32, tiles de 32 pixels e
colisão aproximada em uma camada transparente. Os personagens de exploração
usam quadros 48 × 48, três padrões e quatro direções. Rostos usam o atlas padrão
4 × 2 de 144 pixels, com índices 0/1/4/5 ocupados.

Aliado e inimigo compartilham três poses: espera, ataque e dano, com quatro quadros
cada. Recortes de combate têm 192 × 192; ataque dura 32 frames, com impacto
sincronizado e movimento simultâneo. Outros estados reutilizam essas imagens,
com pose própria de dano; nocaute e defesa ainda não têm desenhos separados.
Os mapeamentos cobrem os estados do motor para evitar renderizar a folha inteira
quando o motor pede input, ready, wait ou entry.

## Evidências

- `npm test`: 81/81; `test:prepared -- build/diana-0.2.4`: 31/31.
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

## Parcial

Revisão artística final, quadros de nocaute/defesa específicos, efeitos
e sons separados e tileset modular de construção ainda pendentes. Pequenas
variações gerativas e ajustes manuais de alinhamento podem ser necessários.
O cenário não oferece entradas funcionais nas casas nem missão completa.
As limitações de distribuição do engine continuam documentadas separadamente.

## Padrão a partir da 0.2.4

Projetos novos usam Vila da Clareira por padrão, incluindo Liora, guardião, rostos, mapa e fundo de batalha. Desmarcar o modelo ainda permite o conjunto básico legado. No padrão ilustrado, $Diana, $Treinador e DianaChao não são copiados. Projetos existentes são preservados.

ClareiraCombate agora mede 768 × 1152, com seis linhas: espera/ataque de Liora, espera/ataque do guardião e duas linhas de dano. A pose damage usa quatro quadros de oito ticks, sem loop, para ambos; o runtime existente a aciona quando recebem dano. A expressão da personagem é própria, com olhos fechados e recuo, sem reutilizar o ataque. Original em assets/jrpg-test/originals/Dano.png.
