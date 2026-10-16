Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$sources = @(
    @{ Path = 'assets/jrpg-test/pack/img/characters/$Ivo.png'; Cell = 48; Columns = 6; Rows = 4 },
    @{ Path = 'assets/jrpg-test/pack/img/characters/$Liora[f6].png'; Cell = 48; Columns = 6; Rows = 4 },
    @{ Path = 'assets/jrpg-test/pack/img/characters/$Mira.png'; Cell = 48; Columns = 6; Rows = 4 },
    @{ Path = 'assets/jrpg-test/pack/img/characters/$Nila.png'; Cell = 48; Columns = 6; Rows = 4 },
    @{ Path = 'assets/jrpg-test/pack/img/characters/$Orin.png'; Cell = 48; Columns = 6; Rows = 4 },
    @{ Path = 'assets/jrpg-test/pack/img/sv_actors/ClareiraCombate.png'; Cell = 192; Columns = 6; Rows = 8 },
    @{ Path = 'assets/jrpg-test/pack/img/characters/$Guardiao.png'; Cell = 48; Columns = 3; Rows = 4 }
)
$results = @()
$errors = @()
foreach ($source in $sources) {
    $file = Join-Path $root $source.Path
    $bitmap = [System.Drawing.Bitmap]::FromFile($file)
    try {
        if ($bitmap.Width -ne $source.Cell * $source.Columns -or $bitmap.Height -ne $source.Cell * $source.Rows) {
            $errors += "$($source.Path): dimensão fora da grade esperada"
            continue
        }
        for ($row = 0; $row -lt $source.Rows; $row++) {
            $centers = @()
            $bottoms = @()
            $empty = 0
            for ($column = 0; $column -lt $source.Columns; $column++) {
                $minX = $source.Cell; $maxX = -1; $maxY = -1
                for ($y = $row * $source.Cell; $y -lt ($row + 1) * $source.Cell; $y++) {
                    for ($x = $column * $source.Cell; $x -lt ($column + 1) * $source.Cell; $x++) {
                        if ($bitmap.GetPixel($x, $y).A -gt 0) {
                            $localX = $x % $source.Cell
                            $localY = $y % $source.Cell
                            if ($localX -lt $minX) { $minX = $localX }
                            if ($localX -gt $maxX) { $maxX = $localX }
                            if ($localY -gt $maxY) { $maxY = $localY }
                        }
                    }
                }
                if ($maxX -lt 0) { $empty++; continue }
                $centers += (($minX + $maxX + 1) / 2) - ($source.Cell / 2)
                $bottoms += ($maxY + 1)
            }
            if ($centers.Count -eq 0) {
                $errors += "$($source.Path), linha ${row}: todos os frames estão vazios"
                continue
            }
            $centerMin = [Math]::Round(($centers | Measure-Object -Minimum).Minimum, 1)
            $centerMax = [Math]::Round(($centers | Measure-Object -Maximum).Maximum, 1)
            $maxCenterDelta = [Math]::Max([Math]::Abs($centerMin), [Math]::Abs($centerMax))
            $baselineMin = ($bottoms | Measure-Object -Minimum).Minimum
            $baselineMax = ($bottoms | Measure-Object -Maximum).Maximum
            $baselineSpread = $baselineMax - $baselineMin
            $status = if ($maxCenterDelta -le 1 -and $baselineSpread -le 1) { 'pass' } else { 'fail' }
            if ($status -eq 'fail') { $errors += "$($source.Path), linha ${row}: centro=$centerMin..$centerMax; base=$baselineMin..$baselineMax" }
            $results += [pscustomobject]@{
                asset = $source.Path; row = $row; populatedCells = $centers.Count; emptyCells = $empty
                centerDelta = @($centerMin, $centerMax); baseline = @($baselineMin, $baselineMax); status = $status
            }
        }
    } finally { $bitmap.Dispose() }
}
$report = [pscustomobject]@{ status = if ($errors.Count) { 'failed' } else { 'passed' }; rows = $results; errors = $errors }
$out = Join-Path $root 'artifacts/sprite-alignment-audit.json'
New-Item -ItemType Directory -Path (Split-Path $out) -Force | Out-Null
[System.IO.File]::WriteAllText($out, ($report | ConvertTo-Json -Depth 5), [System.Text.UTF8Encoding]::new($false))
$results | Format-Table -AutoSize | Out-String | Write-Output
Write-Output "Relatório: $out"
if ($errors.Count) { $errors | Write-Error; exit 1 }
