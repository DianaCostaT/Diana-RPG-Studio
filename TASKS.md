# Tarefas atuais — Luae RPG

Fonte de estado: [PROJECT_STATE.md](PROJECT_STATE.md). Marcar conclusão exige
evidência; teste de API, interação visual e partida são verificações distintas.

- [ ] Completar ciclo gráfico Tauri: criar, editar mapa/dados, salvar, fechar,
  remover artifacts da sandbox, reabrir, jogar, fechar teste e retomar editor.
- [ ] Validar export Tauri por controles reais e iniciar LuaeGame.exe relocado;
  verificar título, entrada no mapa, batalha e persistência sem editor instalado.
- [ ] Validar pacote portátil release fora do checkout; gerar instalador somente
  com ferramentas locais aprovadas e completar notices WebView2/Rust/dependências.
- [ ] Migrar importadores, captura e geradores que ainda exigem Node/NW por
  subsistema; inventário em docs/CONSOLIDATION_AUDIT.md.
- [ ] Tornar abertura de projetos grandes observável e reduzir custo do espelho.
- [ ] Melhorar transação de salvamento entre arquivos e recuperação após falha;
  o lote atual pode ser parcialmente persistido.
- [ ] Battle Studio: consolidar controles visuais nos comandos existentes,
  reproduzir preview/runtime com o mesmo contrato e testar aliados/inimigos.
- [ ] Completar aceite visual dos interiores e sprites sem mudar estilo Clareira.
- [ ] Revisar licenças antes de distribuição pública e revalidar suíte upstream
  separadamente; não converter relatórios históricos em aprovação atual.

O pedido de Battle Studio recebido termina em “suportar easing/m”. A continuação
foi solicitada; os requisitos já recebidos continuam válidos.
