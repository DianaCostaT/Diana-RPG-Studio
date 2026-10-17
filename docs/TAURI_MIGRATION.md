# Tauri — host principal do Luae RPG

Estado atual e testes: [PROJECT_STATE.md](../PROJECT_STATE.md).

Biblioteca de arte V2 (17/10/2026): o prepare inclui `DianaArtLibrary.js` e `diana-assets/art-library-v2` para criação de novos projetos. API e jogo NW.js foram testados; as capturas da biblioteca nova no WebView e seu ciclo completo no pacote Tauri não foram repetidos nesta tarefa. Não atribuir os smokes NW.js à validação Tauri. Conteúdo e evidências: [ART_LIBRARY_V2.md](ART_LIBRARY_V2.md).
Auditoria e impacto: [CONSOLIDATION_AUDIT.md](CONSOLIDATION_AUDIT.md).

## Executar e empacotar

```powershell
npm run prepare:editor
npm start
npm run tauri:build
npm run package:windows -- --out dist/Luae-RPG-Tauri-0.2.6-local
```

Cargo usa dependências locais offline. Não instala toolchain ou pacotes.
package:windows copia o executável release, runtime, licenças e inventário para
uma pasta nova. Requer WebView2; não produz MSI/NSIS. Configuração de instalador
existe, mas geração e instalação em máquina limpa continuam pendentes.

No editor Tauri, Exportar usa o projeto salvo e cria LuaeGame.exe, game/ e
luae-export.json. O mesmo host detecta o manifesto ao iniciar e abre o jogo.
Não há outra engine ou interpretador. Cada exportação recebe identidade e perfil
isolado em AppLocalData/br.luaerpg.studio/games. Não copiar o perfil do editor.
Distribuição pública segue bloqueada por revisão de licenças/notices.

## Inventário de migração

| Subsistema | Caminho Tauri | Pendência |
|---|---|---|
| Inicialização | Rust cria WebView, frontend preparado | corrigir carregadores opcionais Node e validar pacote limpo |
| Abrir/criar | seletor nativo, comandos Rust e espelho | aceite visual de todos os caminhos; progresso em projetos grandes |
| Mapas/dados/salvar | editores existentes, flush serializado | lote não é transação global; ampliar recuperação de falhas |
| Recursos do starter | assets embutidos sob demanda | validar todos os packs no pacote final |
| Runtime | recursos somente leitura do pacote | fallback do checkout removido no release; validar instalador |
| Playtest | iframe + protocolo diana-project com raiz validada | combate e entrada por teclado completos no Tauri |
| Fechar teste | remove iframe e retoma editor | aceite de suspensão/retorno em todos os modos |
| Export | mesmo host em modo jogo, projeto copiado | smoke standalone e relocação do pacote real |
| Perfil | AppLocalData via Tauri, localStorage/WebView2 | migração de preferências NW não é automática |
| Importar/capturar/gerar | dependências Node parcialmente adaptadas | migrar por subsistema antes de retirar NW |
| Projetos existentes | marcador e runtime renovado ao abrir | validar formatos e recursos MZ/MV individualmente |

Smoke separado: `node scripts/smoke-tauri-windows.cjs`, com executável debug
compilado, Node e WebView2 locais; --executable permite testar o pacote release. Usa perfil isolado e porta de depuração efêmera
no processo de teste. Cria fixtures fora de artifacts, remove somente artifacts
da própria sandbox e mantém o relatório regenerável em artifacts/tauri-smoke.json.
Passou pelo controller/Rust real e abriu o mapa no jogo exportado relocado;
não é teste de ponteiro/teclado nem certificação do instalador release.

## Fallback legado explícito

start:nw usa NW.js SDK local. package:nw:windows e export:nw:windows mantêm os
scripts legados; export:windows é alias histórico NW e será removido só depois
de migração compatível. smokes Windows existentes usam NW, incluindo smoke:windows.
Perfil legado foi movido para dados do sistema com cópia do perfil antigo;
nenhum projeto de usuário é movido ou apagado automaticamente.

O espelho síncrono é compatibilidade transitória, não um novo filesystem de
produto. Não duplicar configurações nem reimplementar bancos/mapas no Rust.
Manter RPGReactor e seus contratos; portar APIs de host onde houver dependência
real. Só remover NW após aceite de editor, jogo e export no pacote Tauri.
