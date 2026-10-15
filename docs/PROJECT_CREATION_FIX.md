# Fechamento ao criar projeto — correção 0.1.2

O log da 0.1.1 registrou encerramento nativo em
`content/browser/web_contents/file_chooser_impl.cc:35`, com
`Check failed: !base_dir.empty()`, durante a seleção de pasta. Dois dumps em
`profile/Crashpad/reports` foram preservados. A causa interna do componente
NW.js não foi determinada; a correção elimina o caminho afetado.

Os testes anteriores criavam projetos pela API e abriam/cancelavam a janela
inicial. Eles não comprovavam o fluxo completo executado pelo usuário.

`src/DianaWindowsFolders.js` usa um navegador de pastas dentro do editor, com
leitura assíncrona, caminho digitável, subpastas, navegação ao pai e cancelamento.
Criar e Abrir projeto no Windows não usam mais `input[nwdirectory]`. Não há
helper adicional, instalação ou segunda engine.

Novo projeto apresenta **Salvar o projeto em** e **Procurar…**. Falhas aparecem
em português sem encerrar o editor. Destinos ocupados são preservados; reentrada
é bloqueada e o estado é liberado após cancelamento ou erro. Projetos, perfis e
versões anteriores não foram removidos. A 0.1.2 é um pacote separado.

## Evidências

- Sete testes novos cobrem criação, cancelamento, destino inválido, falha e nova
  tentativa, reentrada, abertura e leitura de pastas.
- `npm test`: 70/70. `npm run test:prepared`: 31/31. Smoke Windows aprovado.
- `scripts/smoke-project-ui-windows.cjs`: interface real para digitar nome/caminho
  com acentos, escolher destino, criar e carregar mapa. Repetir em pasta ocupada
  e cancelar preservam dados e janela; abrir/cancelar e reabrir também passam.
- O mesmo fluxo passou no pacote 0.1.2: `artifacts/project-ui-smoke.json` contém
  resumo e diretório com capturas. `artifacts/ready-exe-smoke.json` confirma
  criação/salvamento com dependências e runtime internos ao pacote.

Outros seletores de ferramentas avançadas ainda não foram migrados/testados.
Nenhuma configuração de segurança foi alterada.

Validação adicional em 15/10: o smoke do pacote 0.1.2 também acionou o botão
real Testar jogo; o processo filho permaneceu ativo por 12 segundos e o editor
respondeu após seu encerramento controlado. Isso verifica lançamento e permanência
do processo, não interação visual dentro desse jogo. Evidência:
`artifacts/project-ui-ulHSw4` e `artifacts/project-ui-smoke.json`.
`npm test` voltou a passar (70/70), assim como `npm run smoke:windows`
(`artifacts/windows-smoke-akyLwv`). Abertura direta do `Diana.exe` a partir de
outro diretório exibiu a tela inicial; posteriormente a janela mostrou
“Meu jogo” com mapa carregado. A janela foi deixada aberta para uso.

A [documentação NW.js](https://docs.nwjs.io/References/Changes%20to%20DOM/)
descreve `nwdirectory`; não comprova funcionamento no runtime local afetado.
