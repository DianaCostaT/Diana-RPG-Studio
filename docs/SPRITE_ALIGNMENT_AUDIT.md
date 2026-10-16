# Auditoria de alinhamento dos sprites

Estado em 16/10/2026: **os atlas de moradores, herói, guardião e batalha passam a medição geométrica e a regressão de alinhamento**. A verificação usa o canal alpha real de cada célula, sem inferir posições a partir do tamanho do arquivo.

Rode no Windows com `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/audit-sprite-alignment-windows.ps1`. O relatório repetível fica em `artifacts/sprite-alignment-audit.json`. Para atlas novos, cada célula preenchida deve ter centro horizontal do alpha a no máximo 1 px do centro da célula e variação vertical da base de no máximo 1 px por linha de animação; células vazias são permitidas apenas quando o contrato da pose usa menos quadros.

## Resultado atual

- `$Ivo.png`, `$Liora[f6].png`, `$Mira.png`, `$Nila.png` e `$Orin.png`: grade 6 × 4 de células 48 × 48; 24 quadros preenchidos por folha. O centro de alpha varia de −0,5 px a 0 px e a base fica em y=47 em todas as direções.
- `ClareiraCombate.png`: grade 6 × 8 de células 192 × 192. Os centros variam de −0,5 px a 0 px e a base fica em y=187 em todas as linhas. As duas células vazias nas linhas 0, 1 e 4 correspondem às poses de ator que usam quatro quadros; o restante usa seis.
- `$Guardiao.png`: folha 3 × 4 de células 48 × 48, com três quadros em cada direção. O compilador agora usa o mesmo recorte proporcional e âncora de base das outras folhas; os 12 centros ficam entre −0,5 px e 0 px e todas as linhas assentam em y=47. `assets/jrpg-test/originals/GuardiaoCaminhada.png` permanece intacto.

A medição confirma geometria e transparência, não continuidade artística entre poses. A inspeção visual permanece necessária ao adicionar personagens, armas ou itens; essas categorias ainda não fazem parte desta auditoria.
