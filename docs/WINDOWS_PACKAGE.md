> Fluxo legado NW.js. O pacote principal agora é Tauri; consulte [TAURI_MIGRATION.md](TAURI_MIGRATION.md) e [PROJECT_STATE.md](../PROJECT_STATE.md). Os resultados abaixo são históricos.

# Pacote Windows local

Estado em 15/10/2026: **implementado e testado para validação local; distribuição pública bloqueada por licenças**. O editor e o jogo usam o mesmo NW.js SDK local 0.118.0 win-x64, sem instalação, download, junction no resultado ou overlay de codecs. Não se trata de instalador nem de certificação em máquina Windows limpa.

## Uso

Versão atual: `dist/Luae-RPG-Windows-0.2.6-20261016-r2/Luae RPG.exe`. O launcher C#
original em `src/windows/DianaLauncher.cs` é compilado pelo .NET Framework local,
sem instalação, e inicia o NW.js com caminhos absolutos, diretório correto e perfil
local. É um executável de janela, sem terminal. Mantenha `nw.exe`, DLLs e `app`
ao lado dele; não é um binário único autocontido. `Luae RPG.cmd` permanece alternativo.

`scripts/smoke-ready-windows.cjs` passou contra essa pasta: criação/salvamento,
runtime e dependências resolvidos dentro do pacote, barra Diana e alternância de
mapas/eventos. Evidência em `artifacts/ready-exe-smoke.json` e captura no diretório
do teste. A abertura direta do launcher tem evidência separada em
`artifacts/direct-exe-launch.json`. O teste não certifica outra máquina limpa.

Após o prepare centralizado com `patches/zzzz-windows-package.patch`:

```powershell
node scripts/package-windows.cjs --out artifacts/MeuEditorWindows
node scripts/export-windows.cjs --project "C:/meus-projetos/Meu jogo" --out artifacts/MeuJogoWindows
node scripts/smoke-package-windows.cjs
```

`--prepared` seleciona outro staging preparado; `--sdk` seleciona outra pasta local do SDK. Use destinos novos: scripts recusam sobrescrita e sobreposição com origens. Execute `Luae RPG.cmd` ou `Jogar.cmd` dentro do pacote; ambos usam caminhos relativos e perfil local. O smoke lança os mesmos executáveis e diretórios via WebDriver, sem testar o duplo clique dos arquivos CMD.

O pacote editor contém `app/editor`, `app/runtime`, licenças Diana/RPGReactor, notices upstream e dependências de produção copiadas fisicamente. O link de desenvolvimento `node_modules` é resolvido apenas na origem; links internos são recusados. O pacote inclui 17 dependências, respectivos textos disponíveis e código; o patch de preparação remove `lamejs` e o transitivo exclusivo `use-strict` do manifest e lockfile, e o empacotador recusa manifests que ainda declarem `lamejs`. Dependências exclusivas de desenvolvimento, testes, scripts de build, chromedriver e nwjc também ficam fora. O runtime mantém o `ffmpeg.dll` original da pasta SDK, identificado por SHA-256; não aplica overlay nem promete codecs proprietários. A integridade do arquivo ZIP registrada em `tools-lock.json` não certifica por si só toda a árvore extraída.

O export copia o projeto indicado, excluindo `Demo`, `.git`, `node_modules`, saves, perfil, debug e arquivo de projeto do editor. O export não identifica automaticamente recursos comerciais importados pelo autor: o usuário precisa ter direitos sobre seus recursos. Não exporta o Demo upstream. Os testes usam somente o starter original Diana.

Cada pacote contém `diana-package.json`: inventário por arquivo com tamanho/SHA-256, componentes npm e textos identificados, hashes do SDK, estado das licenças e proveniência do prepare. O manifest não inclui seu próprio hash e descreve o conteúdo antes da primeira execução, que pode criar perfil, saves e logs. Os notices upstream são preservados integralmente como documentação histórica; suas seções Demo/overlay não significam inclusão desses componentes.

## Evidências

- API: `node --test tests/windows-package.test.cjs` passou 3/3; protege fontes, recusa sobreposição/links, verifica closure física, exclusões, notices e inventário.
- Integração: `npm test` passou 56/56; `npm run smoke:windows` passou, evidência em `artifacts/windows-smoke.json` e `artifacts/windows-smoke-xhAp0k/`.
- Pacote real: `artifacts/windows-package-19frFh/report.json`, `editor.png`, `game.png`, `Editor relocado/` e `Jogo relocado/`. Editor e export foram construídos em pastas novas e renomeados antes de executar; caminhos originais deixaram de existir. Não há links no inventário do pacote.
- Editor relocado criou e salvou projeto por API e resolveu `pngjs` dentro do próprio pacote; formatos visuais de áudio oferecem WAV/OGG e excluem MP3.
- Jogo exportado executou título/mapa/menu; teclas reais WebDriver Enter, seta direita e Escape iniciaram jogo, moveram jogador de `(8,6)` para `(10,6)` e abriram menu. A espera de movimento ocorre após transferência inicial do mapa, evitando confundir spawn com deslocamento.
- A captura de menu foi feita durante a transição de entrada e aparece escurecida; comprova a cena, não revisão de acabamento visual. Este smoke não cobre export pela interface, batalha, audição, instalador, máquina limpa ou duplo clique do launcher.
- Somente sessões/processos criados pelo smoke são encerrados; não há encerramento global de NW.js nem modificação da aplicação aberta do usuário.

## Pendências de distribuição

**Bloqueado:** o SDK existente contém `credits.html` de 401 bytes com “This is sample credits page” e `generate_about_credits=true`. Verifiquei o binário exato NW.js 0.118.0 com WebDriver: `chrome://credits` também mostra o placeholder (165 caracteres de texto), logo os avisos completos NW.js/Chromium/Node não estão disponíveis nesse runtime. O empacotador registra esta evidência e mantém `distributionStatus: blocked-license-review`; o placeholder sozinho não é aviso suficiente. O [Chromium gera a página completa de créditos durante o build](https://chromium.googlesource.com/chromium/src/+/cd1a830ea08c7a13d3690ad8bf77ee6bd0d7c794/docs/adding_to_third_party.md), e o [NW.js pede redistribuir os arquivos do runtime](https://github.com/nwjs/nw.js/blob/main/docs/For%20Users/Package%20and%20Distribute.md), exceto ferramentas do SDK.

**Resolvido no pacote de editor:** `@pixi/colord` 2.9.6 declara MIT, mas o tarball instalado não traz o texto. `licenses/pixi-colord-MIT.txt` agora fornece o aviso correspondente ao autor/ano e o empacotador o acrescenta ao pacote e inventário. `gif.js` 0.2.0 contém MIT completo no README, que é preservado e inventariado. WASM/decoders e terceiros embutidos ainda requerem revisão da cadeia exata. Todos os manifests continuam com `distributionStatus: blocked-license-review`; essa correção não libera publicação.

**Resolvido no editor Diana preparado:** MP3 não é oferecido pelo AudioExport, `lamejs` é removido do manifest/lockfile através de patch versionado e o empacotador falha se a dependência reaparecer. A discrepância do tarball permanece apenas como evidência histórica upstream na auditoria. Reprepare antes de gerar um pacote atualizado.

## Prévia local da Clareira — 16/10/2026

O executável de revisão é `dist/Diana-RPG-Studio-Clareira-preview-2026-10-16/Diana.exe`. Mantenha toda a pasta do pacote ao lado de `Luae RPG.exe`; este é um bundle local de revisão, não um binário único nem uma liberação pública. `node scripts/smoke-ready-windows.cjs dist/Diana-RPG-Studio-Clareira-preview-2026-10-16` passou. Capturas reais do editor, do mapa, dos comandos de batalha e de um golpe ficam em `artifacts/clareira-restaurada-5z8mlD/`.
