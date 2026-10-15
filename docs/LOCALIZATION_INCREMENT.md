# Incremento de localização — editor de poses por retângulos

Estado: **implementado e testado** em testes de catálogo/API e DOM simulado.

As duas regressões de `i18n.test.cjs` foram corrigidas. O editor agora usa
frases-fonte em inglês e o catálogo revisado existente, com 34 entradas em cada
um dos 17 idiomas não ingleses suportados. Português brasileiro tem traduções
para controles, instruções, acessibilidade, nomes inválidos, JSON inválido e
todos os caminhos do validador de poses. Os demais idiomas recebem traduções
próprias, preservando os identificadores `idle`, `attack`, `true`, `false` e
`once` quando representam valores de dados.

Os controles deixaram de ignorar a localização. Nomes escritos pelo autor
continuam literais; legendas de quadros usam `{number}`. Os erros com prefixo
de nome reconhecem o sufixo completo do validador e interpolam `{name}` uma
única vez, inclusive quando o nome contém dois-pontos, `$&`, `{name}` ou HTML.
Cada erro mantém sua fonte e seus parâmetros para troca de idioma ao vivo.
O runtime, o contrato de dados e o comportamento das animações não mudaram.

## Evidências

- `node --test upstream/RPGReactor/editor/tests/i18n.test.cjs`: **25/25 passaram**.
- `node --check` nos dois arquivos JavaScript alterados: passou.
- DOM simulado com o editor e o I18n reais: controles em português, seis
  caminhos do validador, JSON inválido, nomes literais e troca de idioma para
  alemão passaram. Este teste verifica handlers e DOM; não é interação com
  janela nativa nem execução de jogo.
- `git apply --check --whitespace=error`: passou sobre cópia isolada do estado
  anterior à alteração, já contendo `held-poses.patch` e `animation-poses.patch`.
- Aplicação com `core.autocrlf=false` reproduziu os dois arquivos finais byte
  por byte. A opção controla apenas a conversão de finais de linha na cópia
  temporária; nenhuma configuração Git do projeto foi alterada.

Interação visual nativa e execução de jogo: **implementado não testado** neste
incremento. Preparação do editor, teste Windows e suíte geral ficam com a
integração coordenada; não foram executados por este worker conforme o escopo.

## Reprodução

`patches/z-pose-localization.patch` contém somente o delta deste incremento em
`editor/src/I18nReviewedTranslations.js` e
`editor/src/battle/BattlePresentationEditor.js`. Aplicar na raiz do RPGReactor
**após `held-poses.patch` e `animation-poses.patch`**, preservando os demais
patches existentes. Não exporta alterações anteriores nem modifica o runtime.
Não houve instalação de dependências, preparação, smoke ou commit.
