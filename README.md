# Luae RPG

Editor de JRPGs para Windows, versão 0.2.6. RPGReactor continua a única engine;
Tauri é o host principal. Estado e limites atuais: [PROJECT_STATE.md](PROJECT_STATE.md).

Com dependências locais já disponíveis:

```powershell
npm run prepare:editor
npm start
```

É necessário Node >=22, Git, Rust/MSVC e WebView2. O launcher usa Cargo offline;
não instala dependências. Instalações em outro ambiente exigem aprovação.
Crie ou abra um projeto pelo editor e guarde-o fora de artifacts.
Use Testar jogo e Fechar teste para retornar à autoria.

O preparo usa upstream-lock.json e patches versionados; altere src/, scripts/ e
patches/, nunca o build gerado. Preserve a [direção da Clareira](docs/CLAREIRA_VISUAL_DIRECTION.md).

```powershell
npm test
npm run test:prepared
npm run smoke:windows
cargo test --offline --manifest-path src-tauri/Cargo.toml
```

smoke:windows usa NW.js e não certifica Tauri. Fallback: npm run start:nw.
Exportar no Tauri gera um jogo local com LuaeGame.exe; a validação completa
standalone e a distribuição pública continuam pendentes. O pacote portátil Tauri
é separado do instalador: [migração](docs/TAURI_MIGRATION.md).
Para gerar o pacote local: `npm run tauri:build`, seguido de
`npm run package:windows -- --out dist/Luae-RPG-Tauri-local` (pasta nova).
Licenças e bloqueios: [LICENSE_AUDIT.md](docs/LICENSE_AUDIT.md).
