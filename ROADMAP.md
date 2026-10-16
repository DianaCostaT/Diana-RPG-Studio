# Roadmap Diana — MVP em 30 dias

Plano relativo ao início da execução, revisto em 15/10/2026. Os dias são marcos propostos, não dias já concluídos nem promessa de cobertura total do RPGReactor.

## Ponto de partida comprovável

- **Implementado e testado:** integração em `src/`, português padrão, projeto inicial original jogável e metadados `diana.schemaVersion: 1`; dados essenciais validados antes da prévia.
- **Implementado upstream:** editor, banco de dados, eventos, camadas de imagem, sequências e runtime nas fontes mapeadas em [ARCHITECTURE.md](docs/ARCHITECTURE.md).
- **Implementado e testado:** aplicação Windows, projeto, camadas, pintura por ponteiro, histórico, importação, evento/parallax no jogo e poses compartilhadas; cenários e limites em [VALIDATION.md](docs/VALIDATION.md).
- **Implementado e testado:** preparo por revisão/patches, duas exportações equivalentes e pacote/export local relocado. **Parcial:** instalação limpa, distribuição e aceite completo da autoria/animação. Batalha inicial por teclado cobre vitória, derrota permitida e fuga.
- **Planejado:** assistente de IA com comandos controlados, aprovação e histórico integrado. Não há implementação Diana disso nas fontes inspecionadas.
- **Bloqueio de evidência:** `reactor-tests.log` contém falha `spawnSync unzip ENOENT`; não sustenta a afirmação de suíte upstream inteira aprovada. Uma nova execução pode produzir resultado diferente e deve gerar artefato próprio.

## Marcos e condições de saída

Incremento posterior: autoria de parallax e edição de diálogo por controles reais,
com persistência e execução confirmadas; prévia identifica imagens ausentes do
grupo/mapa aberto. Importação visual, novo evento e database completo ainda
precisam de aceite. [Evidências](docs/UI_AUTHORING_VALIDATION.md).

| Período | Entrega proposta | Estado atual | Aceite verificável |
| --- | --- | --- | --- |
| Dias 1–5 | Base reproduzível Windows, pin upstream, identidade Diana e projeto vazio | Implementado/testado no ambiente atual; instalação limpa pendente | Preparar a partir do pin e patches em ambiente limpo, abrir NW.js, criar/salvar/reabrir sem demo/plugins; registrar comandos e versão |
| Dias 6–10 | Fluxo de mapa 2D e recursos | Fonte upstream disponível; validação Diana parcial | Pintar/apagar com mouse, undo/redo, colisão, importar imagem, compor duas camadas/parallax e comparar com playtest após reabrir |
| Dias 11–15 | Banco, eventos e jogo mínimo navegável | Fonte upstream disponível; aceite Diana pendente | Criar personagem, item, diálogo, condição e transferência entre mapas; salvar/reabrir e jogar o fluxo |
| Dias 16–20 | Batalha 2D por turnos e animações | Vitória/derrota/fuga por teclado e poses testadas; comparação audiovisual parcial | Uma tropa completa até vitória/derrota, dano correto, animação/som/espera e retorno de pose; comparar prévia e runtime |
| Dias 21–25 | Timeline, parallax composto e execução/exportação | Grade/arraste e prévia básica testados; composição/exportação parcial | Timeline avançada, validação de dados, camadas e pacote Windows reproduzível |
| Dias 26–30 | Estabilização e demonstração reproduzível | Planejado | Resolver bloqueios críticos, executar cenário completo com novo projeto, registrar regressões Windows e instruções de instalação/distribuição |

Cada marco depende do aceite anterior. Se uma dependência falhar, reduzir escopo e registrar o bloqueio em [TASKS.md](TASKS.md); não converter ausência de teste em conclusão.

## Definição do MVP

Um autor consegue criar um projeto vazio em português, montar mapa 2D, importar recursos próprios, configurar dados e eventos, testar uma batalha por turnos e salvar/reabrir tudo. A demonstração precisa sair de um preparo reproduzível e incluir evidência Windows do cenário inteiro. IA permanece como arquitetura futura, após estabilizar esse fluxo.

Publicação/distribuição final depende de validar o empacotamento e as licenças dos componentes e recursos utilizados; a presença de scripts upstream não prova um pacote Diana pronto.

## Após o MVP — somente planejado para Diana

Modos frontal, no mapa, tático, estratégia, primeira pessoa, 2.5D, isométrico e Mode 7, além de ação, 3D, multiplayer, colaboração online, nuvem e suporte móvel não fazem parte do aceite de 30 dias. Módulos upstream relacionados são material para avaliação posterior, sem compromisso de integração ou suporte Diana. Importação ampla de projetos legados, marketplace, geração avançada de assets e provedores adicionais de IA exigem requisitos, auditoria e marcos próprios.


## Interface 2D — 0.2.0

Perfil 2D padrão, escolha 2D + 3D, grade Animações 2 e Tela de batalha integrados. Recursos verificados, contrato de posições no runtime e limites da reprodução clássica estão em [Interface 2D](docs/2D_WORKSPACE.md).

## Aparência 0.2.1

Implementado e testado: identidade própria, ícones e seis temas com persistência. Ver [evidências e limites](docs/APPEARANCE.md).

## Recursos JRPG 0.2.2

Implementado e testado: conjunto original de assets e projeto ilustrado opcional. [Evidências e limitações](docs/JRPG_ASSETS.md).

0.2.3 — implementado e testado: criação visual de NPC, histórico e diálogo no runtime; barra 2D simplificada e cache das miniaturas. [Evidências](docs/CLASSIC_AUTHORING.md). Finalização do MVP permanece parcial.

0.2.4: recursos ilustrados como padrão dos novos projetos, sem placeholders antigos; pose de dano própria para aliado e inimigo. Ver docs/JRPG_ASSETS.md.

0.2.5: Vila da Clareira passa a usar terrenos e objetos nativos editáveis,
caminhada de seis quadros com cadência opt-in e poses de vitória para ambos os
lados. A comparação audiovisual completa de batalha continua parcial.
