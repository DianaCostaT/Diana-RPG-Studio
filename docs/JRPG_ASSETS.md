# Recursos ilustrados JRPG — 0.2.2

## Implementado e testado

Conjunto original **Vila da Clareira**, criado com imagegen integrada:
dois cenários (mapa e fundo de batalha), duas spritesheets de caminhada,
16 quadros de combate e quatro retratos. Seis PNGs originais em alta resolução
ficam preservados em `assets/jrpg-test/originals`; sete arquivos importáveis
ficam em `assets/jrpg-test/pack/img`, incluindo a folha transparente de colisão.

[Descrição, dimensões e limitações](../assets/jrpg-test/README.md).
[Prompts completos e origem](../assets/jrpg-test/GENERATION.md).

O editor 0.2.2 oferece **Usar Vila da Clareira** na criação de projeto. É uma
opção desmarcada por padrão, preservando o modelo básico e projetos existentes.
O pacote importa os arquivos e configura banco, mapa, evento e sequências
sobre os formatos/runtime existentes. Não usa Demo upstream ou outra engine.

Projeto pronto para abrir: `dist/Projetos/Vila da Clareira`.
Editor pronto: `dist/Diana-RPG-Studio-Windows-0.2.2/Diana.exe`.
Abra a pasta do projeto no editor e clique em Testar jogo; Enter inicia Novo
jogo e conversa com o guardião logo à frente. Lutar/Atacar inicia os ataques.

O mapa usa parallax nativo 1024 × 1024, grid 32 × 32, tiles de 32 pixels e
colisão aproximada em uma camada transparente. Os personagens de exploração
usam quadros 48 × 48, três padrões e quatro direções. Rostos usam o atlas padrão
4 × 2 de 144 pixels, com índices 0/1/4/5 ocupados.

Aliado e inimigo compartilham duas poses: espera e ataque, com quatro quadros
cada. Recortes de combate têm 192 × 192; ataque dura 32 frames, com impacto
sincronizado e movimento simultâneo. Outros estados reutilizam essas imagens,
sem fingir que existem poses de dano, nocaute ou defesa desenhadas separadamente.
Os mapeamentos cobrem os estados do motor para evitar renderizar a folha inteira
quando o motor pede input, ready, wait ou entry.

## Evidências

- `npm test`: 78/78; `test:prepared -- build/diana-0.2.2`: 31/31.
- Manifesto com dimensões e SHA-256 validado; transparência de personagens e
  folha de combate verificada.
- Smoke `scripts/smoke-jrpg-assets-windows.cjs` passou no pacote 0.2.2.
  Criou pela interface, abriu poses no editor, iniciou Novo jogo por teclado,
  caminhou, encontrou colisão, conversou com retrato e entrou na batalha.
- Ações de combate foram forçadas pela API para isolar animações e dano de
  RNG/timing dos menus. Não é um teste completo de todas as opções de comando.
- Instrumentação temporária do teste registrou os quatro recortes efetivamente
  renderizados do ataque de cada lado, e dano em ambos sem erros JavaScript.
- Resumo/capturas: `artifacts/jrpg-assets-smoke.json`, último conjunto validado
  `artifacts/jrpg-assets-hdYll2`. O projeto em `dist/Projetos` foi criado no
  teste anterior `artifacts/jrpg-assets-RXyM5P` com os mesmos assets/dados.
- Capturas de mapa, diálogo e batalha foram inspecionadas. Uma primeira captura
  revelou a folha inteira: corrigido por mapeamentos de estado explícitos e
  regressão que exige recortes de 192 pixels para ambos os lados.

## Parcial

Revisão artística final, quadros de dano/nocaute/defesa específicos, efeitos
e sons separados e tileset modular de construção ainda pendentes. Pequenas
variações gerativas e ajustes manuais de alinhamento podem ser necessários.
O cenário não oferece entradas funcionais nas casas nem missão completa.
As limitações de distribuição do engine continuam documentadas separadamente.
