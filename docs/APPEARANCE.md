# Identidade visual e temas — 0.2.1

## Implementado e testado

- Símbolo Diana original: cristal com estrela, em SVG, PNG e ICO com 16, 32,
  48 e 256 pixels. Gerador determinístico em `scripts/diana-icons.cjs`, sem
  biblioteca ou fonte externa. O launcher incorpora o ICO; o NW.js usa o PNG.
  A extração do ícone associado ao `Diana.exe` confirmou o símbolo no Windows.
- Ícones vetoriais próprios para a barra de ferramentas, áreas de trabalho e
  abas de região/objetos. Os ícones herdam a cor do tema; eventos e ações
  existentes são preservados. Não é uma substituição de todos os ícones dos
  geradores e ferramentas avançadas do upstream.
- **Aparência** no canto superior direito oferece Grafite, Claro, Rosa claro,
  Verde oliva, Azul névoa e Ametista. Aplica imediatamente e confirma se a
  preferência foi salva. Reutiliza `rr-settings.theme` e o OptionsManager,
  preservando idioma e demais preferências. Não altera dados do jogo.
- Superfícies, textos, campos, bordas, foco, botões, seleção e diálogos Diana
  usam tokens compartilhados; as cores fixas da interface anterior foram
  removidas. Imagens do mapa e prévias mantêm suas próprias cores.
- Revisão de espaçamento, ícones de 24 pixels, alinhamento, botões e seleção;
  cabeçalho compacto com textos reduzidos por largura e tooltips preservados.
- Tela Sobre identifica o Diana e mantém o crédito da base e suas licenças.

## Validação

`npm test`: 75/75, incluindo contraste mínimo 4,5:1 dos textos/legendas,
campos e botões principais nas seis paletas e geração dos ícones.
`npm run test:prepared -- build/diana-0.2.1`: 31/31.

`scripts/smoke-appearance-windows.cjs` passou no pacote 0.2.1: abriu Aparência,
selecionou as seis paletas por ponteiro, capturou mapa/banco de poses e reiniciou
o processo com o mesmo perfil. Verde oliva foi restaurado. Evidência em
`artifacts/appearance-smoke.json`, diretório `artifacts/appearance-sh6q8k`.
As capturas das telas principais foram inspecionadas visualmente.

O contraste foi medido para os tokens principais, não para todo texto/estado
de toda ferramenta avançada. Revisão completa de acessibilidade permanece
parcial. Sem novas instalações ou dependências.

## Build Windows

O Windows recusou renomear `build/diana` com EPERM; a origem do bloqueio não
foi determinada. Nenhuma janela do usuário foi encerrada nem configuração de
segurança alterada. O build novo fica separado, com destino validado:

```powershell
npm run prepare:editor -- --out build/diana-0.2.1
npm run package:windows -- --prepared build/diana-0.2.1 --out dist/Diana-RPG-Studio-Windows-0.2.1
npm run smoke:windows -- dist/Diana-RPG-Studio-Windows-0.2.1/app/editor
npm run smoke:appearance:windows -- dist/Diana-RPG-Studio-Windows-0.2.1/app/editor
```

O empacotamento exige um destino novo; versões anteriores ficam preservadas.
A revisão completa de licenças de distribuição continua pendente, como antes.
