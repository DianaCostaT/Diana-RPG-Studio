# Revisão JRPG 0.2.6

Estado: **parcial**, integração Windows final em andamento. A entrega não declara
o programa completo nem certifica animação perfeita.

## Correções verificadas

- O pack Medieval sobrescrevia `$Liora` ilustrada de seis colunas com outro
  sprite, de três colunas. Os packs agora têm nomes independentes e a heroína
  mantém sua arte e apresentação. O PNG canônico corresponde à grade 6 × 4.
- `installProject` não lia Skills, Items, Animations e Classes; a integração
  acrescentava registros apenas quando os arrays já existiam. Agora lê e grava
  o banco completo, preserva os manifestos/licenças e tem teste real de instalação.
- Os índices de repouso/ataque do Guardião apontavam para Liora. As animações
  dela também selecionavam células vazias de um atlas com apenas quatro quadros
  desenhados nessas linhas. Cada contrato agora usa somente os quadros existentes.
- A grade ignorava aliases de movimento; o runtime calculava duração por poses
  antigas ou pelo padrão de três quadros. Dois patches adicionais corrigem a
  resolução e o término; o teste Windows detectou o último quadro de dano ausente
  antes da correção e o renderizou depois dela. As sequências esperam a reação
  do alvo antes de permitir a próxima ação.
- Poção: recuperação fixa de 50 PV. Técnicas têm registros MV nativos em
  Animations.json, aprendizado e tipo de habilidade disponíveis à classe.
- NPCs deixam de ocupar lâmpadas/rochas; estradas, ponte e portas têm testes de
  alcance. A vila tem 48 × 40 tiles; paredes dos interiores bloqueiam passagem.
  Portas transferem diretamente; o texto dos moradores usa o mesmo paginador
  da autoria visual para não sair da janela.

## Arte original

Mira, Orin, Nila e Ivo têm folhas próprias de caminhada; Celina e Teo reutilizam
Mira e Ivo. Brann, lobo, musgo e bruxa têm atlas de combate ilustrados de seis
quadros por pose. Terrenos, fachadas, árvore, fonte, vegetação, luzes e cercas
grandiosos substituem os anteriores, preservados em originals. Banca, placas,
cama, mesa, estante e balcão passam a usar objetos ilustrados sobre transparência.

Originais e prompts: `docs/JRPG_GENERATION_REVIEW.md`,
`assets/jrpg-test/originals/`, `assets/rtp/medieval/`. A compilação mantém IDs de
tiles, usa alpha, escala proporcional e alinha os pés. Testar recortes não prova
continuidade de desenho, contato dos pés ou qualidade de cada transição.

## Evidências e limites

Antes da integração final: 147 testes Node aprovados e 53 contra fonte preparada.
`artifacts/windows-smoke.json` registra criação/importação/pintura/persistência
e jogo; `artifacts/jrpg-assets-smoke.json` registra editor por controles, entradas
e saídas por teclado e ataques/dano por ações forçadas no jogo. Os relatórios
locais são atualizados pelo último smoke; conferir o campo `app`/proveniência
para identificar exatamente a build ensaiada.

Defesa/equipamentos e som por pose têm revisão adicional em
`docs/POSE_SOUND_DEFENSE_REVIEW.md`. O disparo de SE por API não comprova áudio
audível. Modos campo/combos/preparação tática e expansão de RTP em trabalho
paralelo precisam de homologação própria. A suíte upstream histórica tem falhas
conhecidas, descritas em `.diana-ai/known_issues.json`; não foi declarada aprovada.
O gate de distribuição pública e Windows limpo permanece o de LICENSE_AUDIT.
