# Proveniencia do RTP Diana

Estado: o experimento local SD 1.5 abaixo continua **bloqueado** e fora do RTP.
O pack `assets/rtp/medieval/pack` versão 2 combina arte original da ferramenta
imagegen integrada com efeitos, ícones e props procedurais Diana, sob a licença
do projeto. Originais: `BatalhadoresOriginais.png` e `BrannCaminhada.png` nesta
pasta; Liora reutiliza a arte original da Clareira. Prompts e limitações em
`docs/JRPG_GENERATION_REVIEW.md`. Nenhum RTP, Demo ou asset comercial foi usado.

## RTP Medieval nativo

Execute primeiro `npm run assets:compile`, depois `npm run assets:compile:rtp`.
O compilador escreve o pack sem apagar a pasta e em
ordem estável, produz PNG RGBA8 e atualiza `manifest.json` com dimensões e
SHA-256 por arquivo. O manifesto declara as grades: personagens 288×192,
batalhadores 1152×1152, efeitos 960×192, ícones e props 512×512.

O pack contém Liora e Brann, Lobo Cinzento, Musgo Vivo, Bruxa Cinzenta, baú,
porta aberta/fechada, fogueira, props, ícones e sete efeitos (corte/impacto,
fogo, água, gelo, raio e arcano). O teste `tests/native-rtp.test.cjs`
recompila duas vezes e valida hashes, dimensões, alpha e contratos de dados.
Os efeitos são mapeados em `BattlePresentation.json` durante a criação do
projeto; o suporte visual de cada efeito pelo runtime upstream ainda requer
validação Windows dedicada.

## Smoke local de geracao

Em 16-10-2026 foi validado somente o caminho tecnico de geracao local, fora do
repositorio:

| Item | Valor |
| --- | --- |
| Aplicacao local | Local AI Image Generator, commit `d386daefb875fb0c1a9bb2122ffd8329dc16a7a9`, MIT |
| Checkpoint | `stable-diffusion-v1-5` / `v1-5-pruned-emaonly.safetensors` |
| Origem do checkpoint | `stable-diffusion-v1-5/stable-diffusion-v1-5` |
| SHA-256 do checkpoint | `6ce0161689b3853acaa03779ec93eafe75a02f4ced659bee03f50797806fa2fa` |
| Execucao | CUDA local, VAE tiling e VAE na CPU; 320x320, 2 passos, seed `1701` |
| Saida de smoke | `8275edd89fa9ba53503313114bca79efce0b978d548d52cf6e8585ecaf7dc3eb` |

A saida de smoke ficou exclusivamente na area de sessao e serve apenas para
confirmar carga do modelo, inferencia e codificacao PNG. Ela nao e um recurso
do Diana e nao pode ser reutilizada como asset.

## Gate de licenca

O aplicativo local ser MIT nao altera a licenca do checkpoint. O checkpoint
SD 1.5 acima e disponibilizado sob **CreativeML Open RAIL-M**, nao MIT.
Portanto, ele nao e evidencia suficiente para licenciar sob MIT assets
gerados por ele. Ate haver uma revisao juridica que aprove um modelo e um
processo compativeis com a distribuicao MIT pretendida, e obrigatorio:

1. manter imagens experimentais fora do repositorio;
2. nao declarar qualquer imagem gerada como MIT;
3. nao incluir essas imagens em projetos, pacotes ou builds;
4. registrar modelo, versao, hash, prompt, seed, intervencao humana e revisao
   de semelhanca antes de aceitar qualquer futura fonte.

Um modelo de producao escolhido para o RTP precisa ter licenca verificavel
compativel com o objetivo de distribuicao e uma cadeia de proveniencia
documentada. A revisao de licenca deve ser concluida antes de iniciar o lote
Medieval ou Moderno.
