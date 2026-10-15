# Pacote Windows local

Estado em 15/10/2026: **implementado e testado para validação local; distribuição pública bloqueada por licenças**. O editor e o jogo usam o mesmo NW.js SDK local 0.118.0 win-x64, sem instalação, download, junction no resultado ou overlay de codecs. Não se trata de instalador nem de certificação em máquina Windows limpa.

## Uso

Versão local pronta: `dist/Diana-RPG-Studio-Windows-0.1.1/Diana.exe`. O launcher C#
original em `src/windows/DianaLauncher.cs` é compilado pelo .NET Framework local,
sem instalação, e inicia o NW.js com caminhos absolutos, diretório correto e perfil
local. É um executável de janela, sem terminal. Mantenha `nw.exe`, DLLs e `app`
ao lado dele; não é um binário único autocontido. `Diana.cmd` permanece alternativo.

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

`--prepared` seleciona outro staging preparado; `--sdk` seleciona outra pasta local do SDK. Use destinos novos: scripts recusam sobrescrita e sobreposição com origens. Execute `Diana.cmd` ou `Jogar.cmd` dentro do pacote; ambos usam caminhos relativos e perfil local. O smoke lança os mesmos executáveis e diretórios via WebDriver, sem testar o duplo clique dos arquivos CMD.

O pacote editor contém `app/editor`, `app/runtime`, licenças Diana/RPGReactor, notices upstream e dependências de produção copiadas fisicamente. O link de desenvolvimento `node_modules` é resolvido apenas na origem; links internos são recusados. O pacote inclui 17 dependências, respectivos textos disponíveis e código; exclui lamejs, dependências exclusivas de desenvolvimento, testes, scripts de build, chromedriver e nwjc. O runtime mantém o `ffmpeg.dll` original da pasta SDK, identificado por SHA-256; não aplica overlay nem promete codecs proprietários. A integridade do arquivo ZIP registrada em `tools-lock.json` não certifica por si só toda a árvore extraída.

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

**Bloqueado:** o SDK existente contém `credits.html` de 401 bytes com “This is sample credits page” e `generate_about_credits=true`, sem licença completa NW.js/Chromium/Node local. O arquivo original acompanha ambos os pacotes, mas não cumpre o requisito de notices oficiais completos. Nenhum texto foi inventado nem buscado por download.

**Bloqueado:** `@pixi/colord` 2.9.6 declara MIT, mas não contém texto de licença no pacote instalado. `gif.js` 0.2.0 contém MIT completo no README, que é preservado e inventariado. WASM/decoders e terceiros embutidos ainda requerem revisão da cadeia exata. Todos os manifests marcam `distributionStatus: blocked-license-review`; resolver esses pontos antes de publicar. A rotina oferece pacote local para revisão, sem promover seu conteúdo a distribuição liberada.

**Resolvido por exclusão:** MP3 opcional não é oferecido pelo AudioExport, carregar lamejs lança erro explícito, e o pacote/manifest de dependências não transporta lamejs. A discrepância GPL/LGPL histórica permanece documentada na auditoria e não é reinterpretada.
