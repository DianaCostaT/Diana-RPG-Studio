# Usar o Luae RPG

O host principal é Tauri. Consulte [PROJECT_STATE.md](../PROJECT_STATE.md) para o estado e [TAURI_MIGRATION.md](TAURI_MIGRATION.md) para executar ou gerar um pacote portátil.

1. Abra Luae RPG.exe mantendo runtime e avisos ao lado. Requer Windows/WebView2.
2. Use Começar pela Vila da Clareira, informe o nome e escolha a pasta no seletor nativo. O projeto fica numa subpasta própria; guarde fora de artifacts.
3. Abra Mapas para pintar tiles e Eventos para editar diálogos. Salve pelo menu Arquivo.
4. Banco de dados permite editar heróis, inimigos, itens e habilidades. Os combatentes compartilham o contrato de poses.
5. Em sequências, Adicionar passo oferece o grupo Battle Studio. ATTACK anima; DAMAGE aplica a ação no instante escolhido. Duração, simultaneidade e easing usam os campos existentes.
6. Testar jogo salva antes de abrir; Fechar teste retorna ao editor. No jogo, setas movem, Enter confirma e Escape abre o menu.
7. Exportar gera uma pasta nova com LuaeGame.exe e game. Preserve os dois juntos. Distribuição pública ainda depende da revisão de licenças.

Aparência fica no canto superior direito. Projetos existentes preservam seus nomes e dados; nomes internos Diana continuam por compatibilidade. Não confunda os smokes NW.js com validação Tauri: veja os resultados separados na fonte central.
