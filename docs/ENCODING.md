# Texto UTF-8

Estado: correções aplicadas e teste de regressão implementado. O teste percorre
arquivos textuais versionados com `git ls-files`; não lê nem modifica binários.
Valida os bytes UTF-8, detecta sequências de UTF-8 interpretadas como Windows-1252,
caractere de substituição e palavras portuguesas com perda conhecida de acentos.
Operadores JavaScript `??` e o caractere legítimo `Â` não são erros por si só.

```powershell
node scripts/audit-encoding.cjs
node --test tests/encoding.test.cjs
```

`--fix` recupera somente sequências reversíveis de Windows-1252/UTF-8, em até
quatro passagens. Revise o diff antes de manter a correção. Palavras que perderam
caracteres exigem revisão contextual; nenhuma substituição global de `?` é segura.
Os patches de tradução mantêm correspondência entre a adição e o patch posterior.

Origem provável: leitura de UTF-8 como página de código Windows e regravação,
por vezes repetida. A perda para `?` indica outra conversão com caracteres não
representáveis. Nesta sessão, redirecionar stdout com `>` no Windows PowerShell
produziu UTF-16 em logs. Isso foi observado; não prova a origem de cada arquivo.
Use `fs.readFileSync(..., 'utf8')` / `fs.writeFileSync(..., ..., 'utf8')` para
geradores JS e `Get-Content -Encoding UTF8` nas inspeções PowerShell. Para escrever
fontes, prefira APIs com encoding explícito. JSON do Rust usa bytes UTF-8 do serde.

Limites: heurísticas não provam correção linguística; pontuação isolada perdida
e corrupção em alfabetos desconhecidos podem exigir revisão humana. Catálogos
externos preservam URLs e autoria; recuperação de texto não licencia seus assets.
