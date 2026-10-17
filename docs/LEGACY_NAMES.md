# Nomenclatura Luae RPG

Produto atual: **Luae RPG**, versão definida em package.json e tauri.conf.json.

| Classe | Exemplos | Decisão |
|---|---|---|
| Precisa renomear, baixo risco | título, descrição do projeto inicial, texto alternativo do símbolo, navegação acessível | Luae RPG; correções nesta consolidação |
| Interno legado seguro | classes Diana*, seletores diana-*, src/Diana*.js, build/diana | preservar: existem consumidores, testes e patches |
| Histórico útil | .diana-ai/handoff.md, docs/DIANA_STUDIO_UI.md, antigos dist/Diana* | histórico de evidências; não usar como instrução atual |
| Alto risco | dianaSpriteAnimations, nomes de assets Diana_Medieval*, protocolo diana-project, marcador project.rpgreactor | preservar compatibilidade dos projetos e referências salvas |
| Ferramentas e metadados | diana-package.json, .diana-ai/, scripts/diana-icons.cjs | preservar caminhos; conteúdo atual aponta para PROJECT_STATE.md |

Não renomear pastas dos projetos do usuário, licenças, autores ou avisos upstream.
Os scripts package-windows/export-windows e smokes Windows são fallback NW.js;
o nome histórico não significa que empacotem Tauri. O empacotador Tauri reutiliza
somente funções puras de cópia, proteção de destino e inventário desse módulo.
