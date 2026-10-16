# Auditoria de licenças

Data da inspeção: 15-10-2026. Resultado: o código próprio do RPGReactor é uma base MIT utilizável, mas **o pacote completo não pode ser descrito como exclusivamente MIT**. A distribuição depende dos componentes efetivamente incluídos, das respetivas licenças e da proveniência dos recursos. Esta é uma auditoria técnica documental; não constitui uma autorização global de redistribuição.

## Âmbito e prova

Foram consultados os repositórios oficiais, os textos locais de licença, cabeçalhos, manifests, lockfile e caminhos de carregamento. As cópias EasyRPG em `artifacts/audit/` são material de consulta isolado: nenhum código, ícone, fonte, jogo de teste ou outro recurso EasyRPG foi integrado no produto. Não foram instaladas dependências, compilados executáveis ou lançados jogos nesta tarefa. O upstream existente não foi alterado por esta auditoria; alterações concorrentes de outros trabalhadores não são prova do estado publicado.

| Projeto | Revisão imutável auditada | Licença principal verificada |
| --- | --- | --- |
| RPGReactor | [dc918245cbf8f10ae6eef4ed8cb54b850fed9caa](https://github.com/Psychronic-Games/RPGReactor/tree/dc918245cbf8f10ae6eef4ed8cb54b850fed9caa) | [MIT, limitada ao código próprio](https://github.com/Psychronic-Games/RPGReactor/blob/dc918245cbf8f10ae6eef4ed8cb54b850fed9caa/LICENSE) |
| EasyRPG Editor | [4a83bb038275395b7e2bd166c0f15d4554783793](https://github.com/EasyRPG/Editor/tree/4a83bb038275395b7e2bd166c0f15d4554783793) | [GPLv3 ou posterior nos cabeçalhos](https://github.com/EasyRPG/Editor/blob/4a83bb038275395b7e2bd166c0f15d4554783793/src/ui/main_window.cpp), [COPYING](https://github.com/EasyRPG/Editor/blob/4a83bb038275395b7e2bd166c0f15d4554783793/COPYING) |
| EasyRPG Player | [0de2a9ab466a133ac6e192a84bd761a1d81f5f14](https://github.com/EasyRPG/Player/tree/0de2a9ab466a133ac6e192a84bd761a1d81f5f14) | [GPLv3 ou posterior nos cabeçalhos](https://github.com/EasyRPG/Player/blob/0de2a9ab466a133ac6e192a84bd761a1d81f5f14/src/game_interpreter.cpp), [COPYING](https://github.com/EasyRPG/Player/blob/0de2a9ab466a133ac6e192a84bd761a1d81f5f14/COPYING) |
| liblcf | [6854310c3432e553fd4ae672ce861899c80c3bd0](https://github.com/EasyRPG/liblcf/tree/6854310c3432e553fd4ae672ce861899c80c3bd0) | [MIT](https://github.com/EasyRPG/liblcf/blob/6854310c3432e553fd4ae672ce861899c80c3bd0/COPYING) |

`artifacts/audit/manifest.json` fixa origens, revisões, integridade do pacote lamejs e hashes das páginas consultadas. Os snapshots textuais em `artifacts/audit/source-evidence/` foram extraídos com `git show HEAD:caminho`, evitando atribuir alterações locais ao commit publicado. Clones e downloads de auditoria não devem entrar no instalador nem num export de jogo.

## RPGReactor: componentes e obrigações

Fontes centrais: [THIRD_PARTY_NOTICES](https://github.com/Psychronic-Games/RPGReactor/blob/dc918245cbf8f10ae6eef4ed8cb54b850fed9caa/THIRD_PARTY_NOTICES.md), [package.json](https://github.com/Psychronic-Games/RPGReactor/blob/dc918245cbf8f10ae6eef4ed8cb54b850fed9caa/editor/package.json) e [package-lock.json](https://github.com/Psychronic-Games/RPGReactor/blob/dc918245cbf8f10ae6eef4ed8cb54b850fed9caa/editor/package-lock.json). Os identificadores do lockfile são evidência de metadados, não uma auditoria completa dos conteúdos transitivos.

| Componente identificado | Evidência e licença | Consequência para distribuição |
| --- | --- | --- |
| Código próprio RPGReactor | LICENSE, MIT | Preservar copyright e texto MIT nas cópias substanciais. Não transforma terceiros em MIT. |
| PixiJS 8.20.0; Three.js 0.185.1 | Lockfile, notices e cabeçalhos dos bundles: MIT; Pixi também identifica tiny-lru 11.4.7 BSD-3-Clause | Incluir os avisos próprios e a cláusula de não endosso BSD. |
| Effekseer WebGL 1.70b | Notices e cabeçalho JS: MIT; há WASM emparelhado | Reter a licença; confirmar que o binário WASM distribuído corresponde à versão declarada. |
| localForage 1.7.3 | Cabeçalho e notices: Apache-2.0 | Incluir licença e avisos aplicáveis; marcar alterações quando exigido. |
| LZ-String 1.4.1 | Cabeçalho e notices: WTFPL v2 | Conservar identificação e licença no inventário; não declarar MIT. |
| pako; vorbisdecoder baseado em stb_vorbis | Notices: MIT; stb dual MIT/Unlicense | Conservar a opção MIT e os avisos; a atribuição ao stb não prova isoladamente toda a cadeia de geração do decoder. |
| meshopt_simplifier | [Licença adjacente](https://github.com/Psychronic-Games/RPGReactor/blob/dc918245cbf8f10ae6eef4ed8cb54b850fed9caa/runtime/libs/meshopt_simplifier.LICENSE.md): MIT, Arseny Kapoulkine | Preservar o ficheiro mesmo que não apareça como secção nos notices centrais. |
| gif.js 0.2.0, gifuct-js 2.1.2, pngjs 7.0.0 | Lockfile: MIT | Auditar e conservar os textos dos pacotes exatos antes de publicar. A licença atual do repositório não substitui a do tarball usado. |
| @jsquash/oxipng 2.3.0 | Lockfile: Apache-2.0 | Auditar também o conteúdo WASM e respetivos terceiros; o identificador npm não encerra essa verificação. |
| lamejs 1.2.1 | Entrada histórica do tarball/lock upstream, identificada como LGPL-3.0; patch Diana remove a dependência do manifest e lockfile preparados, além do transitivo exclusivo `use-strict` | Não faz parte do editor Diana preparado; evidência histórica preservada, manifests gerados verificados antes de empacotar. |
| nw-builder 4.17.13; png-to-ico 3.0.1 | Dev dependencies, lockfile MIT | Ferramentas de build não licenciam o NW.js obtido por download. Verificar se são transportadas para o pacote final. |
| NW.js / Chromium / Node | Artefactos adquiridos pelo build, com inventário próprio de terceiros | Preservar os avisos do runtime e auditar o binário exato; MIT de nw-builder não basta. |
| Overlay FFmpeg opcional NW.js 0.107.0 | Notices: LGPL-2.1-or-later; referências imutáveis de build e fonte | Distribuir licença, avisos e fonte correspondente conforme aplicável; validar substituição/relink e requisitos da forma binária. Rever separadamente patentes H.264/AAC. |
| Runtime AppImage | `editor/build-scripts/appimage-runtime-LICENSE.txt` | Conservar a licença do componente se o empacotamento Linux o incluir; não foi gerado AppImage nesta tarefa. |

### Histórico upstream: lamejs

O commit fixado do RPGReactor declara `lamejs` 1.2.1 como dependência e o lock upstream regista LGPL-3.0, com metadados de licença divergentes dentro do tarball. A Diana agora aplica `patches/zzzzzzzz-remove-lamejs-dependency.patch`, que remove a dependência de `editor/package.json`, a entrada de `editor/package-lock.json` e o transitivo exclusivo `use-strict`. O patch de áudio existente mantém MP3 fora da interface e impede o carregamento do encoder. A evidência/tarball arquivada é histórica e não entra no pacote. `tests/remove-lamejs-patch.test.cjs` aplica o patch numa cópia temporária e confirma os manifests sem modificar o upstream.

### Caveat confirmado: codecs e downloads

Os notices identificam [build overlay 44c5d44e78c457149c8bee98aeca9a7bb1d5659c](https://github.com/nwjs-ffmpeg-prebuilt/nwjs-ffmpeg-prebuilt/tree/44c5d44e78c457149c8bee98aeca9a7bb1d5659c) e [fonte FFmpeg e18f48eba6b367ac68b9c477ae6cbe224e36b031](https://chromium.googlesource.com/chromium/third_party/ffmpeg/+/e18f48eba6b367ac68b9c477ae6cbe224e36b031). Pacotes desktop completos elegíveis ativam-no por defeito; Minimal e Web não o incluem, segundo os notices. O [manifest de hashes](https://github.com/Psychronic-Games/RPGReactor/blob/dc918245cbf8f10ae6eef4ed8cb54b850fed9caa/editor/build-scripts/release-hashes.json) fixa NW.js e codecs; ler esse manifest não prova que um binário já existente passou a validação. Não foram adquiridos codecs nem validado um pacote final nesta tarefa.

## EasyRPG: diferenças importantes

O Editor e o Player são GPLv3 ou posterior, conforme os cabeçalhos, não MIT. Distribuir uma derivação exige satisfazer as obrigações GPL, incluindo fonte correspondente e avisos; a licença permite uso comercial. Isso não significa automaticamente que dados e recursos independentes de um jogo tenham de ser GPL. Aqui a restrição de não incorporar código EasyRPG foi cumprida: a comparação não contém transcrição de implementação.

O [README do Editor](https://github.com/EasyRPG/Editor/blob/4a83bb038275395b7e2bd166c0f15d4554783793/README.adoc) identifica ícones Breeze/derivados LGPLv3. O build usa Qt 6, incluindo Multimedia, SVG e QuickControls2: é necessário verificar licenças por módulo, plugins e codecs do pacote exato, além das condições de linking; não assumir que uma licença comercial Qt elimina a GPL do Editor.

O [README do Player](https://github.com/EasyRPG/Player/blob/0de2a9ab466a133ac6e192a84bd761a1d81f5f14/README.md) identifica bibliotecas, logos CC-BY-SA 4.0 e fontes com licenças distintas: Baekmuk, domínio público Shinonome, ttyp0 e WenQuanYi GPLv2+ com exceção para fontes. Há também FMMidi BSD-3-Clause e dr_wav público/MIT-0. Dependências opcionais de áudio podem trazer LGPL/GPL; a opção `PLAYER_NONFREE` em CMake não relicencia o código GPL do Player. Os nomes e opções foram verificados; as licenças de todos os binários transitivos não foram certificadas.

O [README de liblcf](https://github.com/EasyRPG/liblcf/blob/6854310c3432e553fd4ae672ce861899c80c3bd0/README.md) distingue MIT próprio, inih New BSD e span-lite Boost-1.0. ICU e Expat são dependências opcionais de conversão e XML, com licenças e avisos próprios a verificar na versão ligada. liblcf ser MIT não torna Editor/Player MIT; seria uma opção separada para interoperabilidade futura, **não incorporada nesta entrega**.

## Recursos, documentação e fronteira de reutilização

O Demo do RPGReactor contém plugins Galv/Moghunter com termos externos, Ultra Mode 7 BSD-3-Clause e alguns recursos declarados CC0 (Poly Haven/Kenney). Essa identificação parcial não comprova a proveniência de todos os ficheiros do Demo. O Demo e recursos proprietários ficam fora da base distribuível recomendada; não foram copiados para o produto nesta auditoria.

A [ajuda oficial MZ](https://rpgmakerofficial.com/product/MZ_help-en/index.html), as [regras oficiais de materiais](https://rpgmakerofficial.com/en/support/rule/) e [haylee.garden/rpg2003](https://haylee.garden/rpg2003/) servem como referências de comportamento/formato, não como licença de código, imagens ou documentação para redistribuição. Haylee é uma referência comunitária, não uma fonte oficial de autorização. A leitura das regras não concede direitos sobre RTP, DLC, plugins ou projetos importados; os termos de cada recurso e a titularidade do utilizador precisam de avaliação própria.

## Limitações ainda abertas

Antes de uma publicação: produzir inventário do pacote real (incluindo transitivos, WASM, NW.js e codecs), anexar todos os textos/avisos, comprovar fontes correspondentes quando exigidas e excluir recursos sem proveniência. Esta tarefa não executou build nem verificou o conteúdo de um instalador; portanto recomenda a base técnica com condições, sem dar o pacote por legalmente liberado.

## Atualização: pacote Windows local Diana (15/10/2026)

Estado: **implementado e testado localmente; publicação bloqueada**. A afirmação anterior de ausência de build aplica-se à fase documental inicial; agora há pacote e export reais, inventário/hash por arquivo e execução Windows, documentados em [WINDOWS_PACKAGE.md](WINDOWS_PACKAGE.md). Evidência final: `artifacts/windows-package-19frFh/report.json` e `diana-package.json` de cada pacote; `npm test` 56/56 e `npm run smoke:windows` passaram. As cópias EasyRPG e evidências de auditoria continuam fora dos pacotes.

O pacote preserva `LICENSE` Diana, `licenses/RPGReactor-MIT.txt`, `THIRD_PARTY_NOTICES.md`, licença adjacente meshopt e textos existentes nos pacotes npm. Não copia Demo, plugins Galv/Moghunter, ferramentas de build, nw-builder, png-to-ico, EasyRPG, codec overlay nem lamejs. Notices upstream incluem seções históricas sobre Demo/overlay; o inventário do pacote, não a mera presença desses nomes no documento, identifica os arquivos realmente transportados.

### Inventário npm efetivamente incluído no editor

| Componentes e versões | Declaração local | Texto preservado |
| --- | --- | --- |
| @jsquash/oxipng 2.3.0; wasm-feature-detect 1.8.0 | Apache-2.0 | LICENSE de cada pacote; cadeia WASM ainda pendente |
| @pixi/colord 2.9.6 | MIT | **Ausente no pacote instalado: bloqueio** |
| @types/earcut 3.0.0; @xmldom/xmldom 0.8.15; eventemitter3 5.0.1 | MIT | LICENSE de cada pacote |
| @webgpu/types 0.1.72; tiny-lru 11.4.7 | BSD-3-Clause | LICENSE de cada pacote |
| earcut 3.0.2 | ISC | LICENSE |
| gif.js 0.2.0 | MIT | Texto completo no README.md, copyright Johan Nordberg 2013 |
| gifuct-js 2.1.2; ismobilejs 1.1.1; js-binary-schema-parser 2.0.3; parse-svg-path 0.2.0 | MIT | LICENSE de cada pacote |
| pixi.js 8.20.0; pngjs 7.0.0; three 0.185.1 | MIT | LICENSE de cada pacote |

A closure de produção é copiada fisicamente da instalação existente, sem npm install. Fontes/licenças dos 17 pacotes e hashes individuais acompanham o pacote; declarações npm não substituem revisão de código embutido. O jogo usa as bibliotecas runtime da base preparada e não transporta essa árvore node_modules.

### Remoção da dependência LGPL no prepare Diana

`patches/zzzz-windows-package.patch` remove MP3 dos formatos disponíveis de AudioExport, rejeita solicitação MP3 e faz `loadLame` falhar explicitamente com orientação WAV/OGG. `patches/zzzzzzzz-remove-lamejs-dependency.patch` também remove `lamejs` e `use-strict` dos manifests preparados; o empacotador recusa voltar a incluir a dependência. A revisão upstream fixada e os artefactos históricos de auditoria permanecem intactos. Reprodução de áudio e codecs disponíveis no SDK são assunto separado da geração opcional MP3.

### NW.js local: requisito de notices não satisfeito

O SDK `tools/nwjs-sdk-v0.118.0-win-x64` contém `credits.html` de exemplo (401 bytes), com as instruções “This is sample credits page” e `generate_about_credits=true`; não foi encontrado texto completo de licenças NW.js/Chromium/Node nessa pasta. O arquivo é copiado sem alterações, junto aos binários locais e `ffmpeg.dll` local, cujos hashes são registrados; nenhum overlay é aplicado. A origem/hash do ZIP consta de `tools-lock.json`, mas isso não fornece os notices ausentes nem atesta a árvore extraída inteira.

**Publicação bloqueada:** obter/gerar notices oficiais correspondentes ao SDK exato e completar a evidência de licenças de `@pixi/colord`, WASM/decoders e demais terceiros embutidos antes de redistribuir. A tarefa não fez downloads nem instalações, não declarou conformidade legal e não publicou pacote. Pacotes locais estão marcados `blocked-license-review`; são artefatos de validação isolada, não uma liberação de distribuição.


## Atualização Diana: remoção da dependência LGPL de MP3

Estado: **implementado e testado por patch e API**. O prepare isolado `build/diana-license-clean` confirma `lamejs` e o transitivo exclusivo ausentes dos manifests e lockfile preparados; a revisão upstream fixada permanece intacta. A dependência LGPL-3.0 já não integra a closure declarada do editor Diana, e o empacotador bloqueia regressão. Esta correção não libera a publicação: permanecem pendentes notices completos do NW.js/Chromium/Node, o texto MIT de `@pixi/colord` e a revisão de WASM/terceiros. O smoke Windows global e a geração do pacote ficaram para a integração central.
