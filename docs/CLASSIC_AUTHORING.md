# Autoria clássica — 0.2.3

Implementado e testado no pacote Windows: **Novo NPC** abre um formulário de
nome, posição, personagem, retrato e texto. O editor converte o diálogo em
comandos existentes, com páginas de até quatro linhas. Posições ocupadas geram
aviso. Criar participa do desfazer/refazer; salvar continua explícito.

O formulário reutiliza o gerenciador de eventos e o runtime existentes, sem
adicionar engine ou formato paralelo. A seleção de imagens é por nome de arquivo;
miniaturas e condições avançadas continuam pendentes.

No perfil 2D, **Ferramentas avançadas** recolhe construção, iluminação, superfícies
e geradores da barra. O perfil híbrido mantém essas ferramentas disponíveis.
Os menus Geradores e Exportar continuam acionando os recursos existentes.

As oito miniaturas de Animações 2 agora redesenham apenas quando o recorte muda,
ignoram itens fora da área visível e suspendem a reprodução com a página oculta.
Comparação real 0.2.2/0.2.3 durante aproximadamente dois segundos: 968 contra 60
chamadas Canvas drawImage, redução de 93,8%, com os dados inalterados. Isso não é
uma medição de CPU, FPS ou desempenho do aplicativo inteiro.

Evidências: `artifacts/classic-ui-smoke.json` (ponteiro, validação de posição,
undo/redo, salvar e diálogo com retrato no jogo), `artifacts/pose-benchmark.json`
(comparação entre versões). Há testes unitários de paginação, posicionamento e
integração com o histórico. O MVP completo e a reprodução integral do HUD clássico
continuam parciais.
