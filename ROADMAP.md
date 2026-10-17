# Roadmap — Luae RPG

Estado implementado: [PROJECT_STATE.md](PROJECT_STATE.md). Sem datas artificiais
ou fases antigas apresentadas como trabalho futuro.

1. **Consolidar Tauri.** Encerrar os fluxos pendentes de criação/reabertura,
   autoria, playtest e export relocável. Condição de saída: aceite gráfico e
   jogo executado no pacote, além de testes de API e Rust.
2. **Battle Studio.** Coreografia visual sobre ActionSequences e BattleData,
   com poses por combatente, simultaneidade, duração, easing e reprodução
   verificável. Aliados e inimigos compartilham formato e interpretação.
3. **Autoria visual completa.** Importação, eventos, recursos e ajustes do jogo
   disponíveis por controles; JSON avançado opcional. Preservar a Clareira.
4. **Exportação e distribuição.** Pacote portátil e instalador Tauri em ambiente
   limpo, recuperação de erros, migração de projetos e auditoria de licenças.
   Remover fallback NW somente após paridade comprovada.
5. **Assistência de IA.** Comandos internos validados, prévia, aprovação e
   undo/redo. Nenhuma execução arbitrária ou credencial gravada no projeto.
