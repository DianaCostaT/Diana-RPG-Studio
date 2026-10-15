# Tarefas Diana

Estado em 15/10/2026. Marcar uma tarefa como concluída exige fonte identificada e, quando for comportamento executável, comando/artefato correspondente. Este arquivo não substitui os resultados da auditoria ou dos workers responsáveis.

## Confirmado nesta inspeção

- [x] Identificar pin RPGReactor em `upstream-lock.json` e integração em `src/DianaBootstrap.js`.
- [x] Documentar arquitetura, batalha, animação e marcos do MVP nas cinco peças deste conjunto documental.
- [x] Registrar o escopo limitado do smoke Windows disponível em `artifacts/windows-smoke.json`.

## Prioridade 0 — base e evidência

- [x] Preparo a partir do commit fixado e patches versionados; fonte local não registrada não é copiada.
- [x] Comparar duas preparações: 2212 arquivos idênticos, excluindo timestamp e link de dependências.
- [x] Executar smoke Windows de projeto, camadas, pintura, histórico, assets, evento, parallax e jogo.
- [x] Executar e triar suíte upstream: 6.950/7.016 aprovados, 40 falhas, 26 ignorados. Relatório em `artifacts/upstream-test-report.json`; triagem não encerra todas as causas.
- [ ] Resolver ou validar individualmente as falhas pendentes do relatório; regressões Diana de tradução têm incremento específico.
- [x] Corrigir regressões de tradução das poses; 25 testes i18n e smokes finais aprovados.
- [ ] Validar instalação/extração NW.js 0.118.0 e execução por `scripts/launch.cjs` em ambiente limpo.
- [x] Confirmar `npm start` neste workspace com janela Diana visível/respondendo e log de inicialização.

## Prioridade 1 — autoria e runtime

- [x] Pintar/apagar por ponteiro, histórico e colisão por seta após reabrir; evidência em docs/MAP_EVENT_VALIDATION.md.
- [ ] Validar importação de recursos e caminho com espaços/acentos, ausência de asset e mensagem de erro.
- [ ] Validar ordem, opacidade, visibilidade e deslocamento de duas camadas/parallax no editor e no jogo.
- [ ] Criar dados de personagem, habilidade e item e confirmar persistência/referências.
- [x] Diálogo, condição, variável/switch e transferência executados por Enter; autoria do fixture via API, autoria visual completa pendente.
- [x] Implementar poses nomeadas, recortes, duração, loop, âncoras e formulário visual compartilhado; regressões de ator/inimigo e dados inválidos aprovadas.
- [x] Confirmar patches de pose no build de desenvolvimento preparado e no jogo gerado.
- [x] Executar formulário Windows e ataque com dano; não equivale a batalha completa controlada pelo jogador.
- [x] Recorte por grade/arraste, prévia automática e seek de poses; limites da imagem rejeitados com mensagem em português.
- [x] Preservar Unicode dos novos rótulos e validar autoria por ponteiro real em aliados/inimigos e recortes no jogo.
- [x] Projeto inicial e validação essencial; batalha por teclado até vitória/derrota permitida/fuga; referências protegidas e Simultâneo visual. Comparação audiovisual avançada continua parcial.
- [ ] Executar batalha completa e comparações de animação descritas em [BATTLE_SYSTEM.md](docs/BATTLE_SYSTEM.md) e [ANIMATION_SYSTEM.md](docs/ANIMATION_SYSTEM.md).
- [ ] Rever tradução das 11 interfaces usando fluxo real; português padrão não garante tradução integral.

## Prioridade 2 — IA controlada, planejada

- [ ] Definir esquema versionado de comandos e lista inicial permitida: alterar registros simples, adicionar evento validado e modificar células/camadas delimitadas.
- [ ] Implementar leitura de contexto mínimo e proposta sem efeitos colaterais; impedir execução de JavaScript/shell livre retornado pelo modelo.
- [ ] Mostrar intenção, arquivos/registros afetados e diff; aprovação/rejeição explícita por proposta antes da aplicação.
- [ ] Validar IDs, referências, limites e versão-base; recusar proposta obsoleta se o projeto mudar durante a geração.
- [ ] Aplicar lote como transação com pré-imagem, recuperação de falha e identificação da operação; não confundir escrita atômica de um arquivo com transação de vários arquivos.
- [ ] Integrar undo/redo de IA aos históricos existentes ou criar adaptador com ordem global definida; testar edição manual intercalada, limpeza de redo e desfazer após salvar.
- [ ] Implementar credenciais no armazenamento seguro do sistema, com seleção de provedor/modelo e remoção; não salvar chave em JSON do projeto, logs, exportação ou controle de versão.
- [ ] Tratar cancelamento, timeout, limite de uso, falha de rede e ausência de credencial com mensagens claras e nenhuma alteração parcial.
- [ ] Registrar somente metadados necessários de operação, com segredos removidos e política de retenção; aprovar envio de conteúdo ao provedor antes da primeira chamada.

## Fora do MVP — planejado

- [ ] Avaliar separadamente ação, tático e 3D; não anunciar como modos Diana validados.
- [ ] Especificar colaboração, multiplayer, nuvem, móvel e marketplace antes de implementação.
- [ ] Avaliar importação legada e exportação/distribuição com relatórios de compatibilidade e licenças próprios.

O acompanhamento dos marcos está em [ROADMAP.md](ROADMAP.md). Nenhum item pendente representa validação concluída por mera existência de código upstream.

## Retomada integrada

- [x] Pacote/editor e export local relocados sem links; controles do jogo validados.
- [ ] Completar notices oficiais SDK, MIT @pixi/colord e revisão WASM antes de distribuir.
- [ ] Validar integralmente autoria visual de eventos, database, importação e parallax.
- [ ] Comparar trajetórias/efeitos renderizados e som audível para ambos os lados.

## Autoria visual — incremento posterior

- [x] Parallax: adicionar fundo/névoa, selecionar imagem, editar opacidade/follow/drift por controles reais, salvar/reabrir e executar.
- [x] Renomear NPC e editar diálogo por controles reais, confirmar e acionar no jogo.
- [x] Diagnosticar imagens ausentes antes da prévia com aviso em português; cobertura limitada ao grupo/mapa aberto.
- [ ] Importação por seletor, novo evento/condições e database completo pela interface.

Evidências e limites em [UI_AUTHORING_VALIDATION.md](docs/UI_AUTHORING_VALIDATION.md).

## Executável local e interface Diana

- [x] Entregar dist/Diana-RPG-Studio-Windows/Diana.exe com dependências físicas e launcher de janela compilado.
- [x] Verificar abertura direta e criação/salvamento no pacote.
- [x] Interface original com organização familiar de mapas/paleta/árvore e atalhos funcionais de autoria.
- [ ] Refinar UX conforme uso real e completar aceites restantes; não declarar MVP inteiro concluído.

## Uso básico 0.1.1

- [x] Tiles originais variados e colisão de obstáculos em projetos novos.
- [x] Abrir automaticamente uma folha disponível e orientar o primeiro gesto de pintura.
- [x] Selecionar/pintar/desfazer/refazer/salvar por controles reais e verificar passagem no jogo.
- [x] Pacote separado 0.1.1 com criação/salvamento verificados.
- [ ] Seletor nativo de criação/abertura, novo evento e edição de dados em fluxo completo.

## Correção crítica 0.1.2

- [x] Identificar encerramento nativo em log real e preservar dumps/perfil.
- [x] Eliminar seletor nativo do fluxo Criar/Abrir e adicionar destino visível/integrado.
- [x] Confirmar criação, erro por pasta ocupada e cancelamento por UI sem encerramento.
- [x] Confirmar abrir/cancelar e reabrir sem alterar dados.
- [x] Gerar pacote 0.1.2 separado e validar fluxo real.
- [ ] Rever seletores de ferramentas avançadas em incremento próprio.

## Interface 2D — 0.2.0

Perfil 2D padrão, escolha 2D + 3D, grade Animações 2 e Tela de batalha integrados. Recursos verificados, contrato de posições no runtime e limites da reprodução clássica estão em [Interface 2D](docs/2D_WORKSPACE.md).
