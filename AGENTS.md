# Diana RPG Studio — instruções de desenvolvimento

Preserve o trabalho existente. O idioma principal é português brasileiro.
Use o RPGReactor fixado em `upstream-lock.json` como base provisória; a decisão e
suas limitações ficam em `docs/BASE_EVALUATION.md` e `docs/LICENSE_AUDIT.md`.

- O editor, o formato de dados e o runtime devem evoluir juntos. Não adicione outra engine.
- Código Diana fica em `src/`; mudanças no upstream devem ter patches versionados em
  `patches/`, aplicáveis após `held-poses.patch`. O upstream é uma dependência local ignorada.
- `npm run prepare:editor` exporta a revisão fixada e aplica patches; alterações não
  registradas do upstream não entram na aplicação. Preserve licenças e avisos.
- Não inclua o Demo upstream, código proprietário ou assets de jogos comerciais.
- Aliados e inimigos compartilham o mesmo contrato de animações e testes de regressão.
- Ofereça controles visuais; configuração JSON pode ser uma opção avançada.
- Execute `npm test` e `npm run smoke:windows` após integração. O smoke exige o SDK
  Windows local. Diferencie testes de API, interação visual e execução de jogo.
- Antes de instalações, obtenha aprovação do usuário. Não instale globalmente,
  publique, modifique segurança ou faça operações destrutivas sem autorização.
- Atualize `.diana-ai/` e a documentação com evidências e estados: implementado e
  testado; implementado não testado; parcial; planejado; bloqueado.
- Para trabalho paralelo autorizado, use workers Orca e arquivos com donos distintos;
  use worktrees quando houver conflito. Integre após revisão; não faça commit sem autorização.
- IA futura usa comandos internos validados, prévia, aprovação e undo/redo. Nunca
  grave credenciais no projeto ou modifique arquivos do usuário arbitrariamente.

## Direção visual permanente — Vila da Clareira

A primeira versão aprovada da Vila da Clareira é a referência visual permanente para o projeto. Todo agente deve preservar e desenvolver essa direção: sprites grandes e legíveis, cenários ricos em camadas, vegetação e arquitetura detalhadas, e animações de batalha fluidas no mesmo estilo. Não troque essa identidade por arte menor, simplificada ou visualmente genérica; ao melhorar um recurso, mantenha o padrão da Clareira e confira o resultado dentro do jogo.

Consulte `docs/CLAREIRA_VISUAL_DIRECTION.md` antes de alterar arte, sprites, mapas ou apresentação de batalha. Trate mudanças de estilo como regressões a corrigir, não como nova direção.
