# Renomeia imagens em Resources\Images para nomes válidos para o Resizetizer (minúsculas, sem acentos, apenas a-z0-9 e _)
# Executar na raiz do projeto: powershell.exe -ExecutionPolicy Bypass -File .\TCCpricipal\scripts\sanitize-images.ps1

$imagesDir = Join-Path $PSScriptRoot "..\Resources\Images"
$imagesDir = (Resolve-Path $imagesDir).ProviderPath
Write-Host "Diretório de imagens: $imagesDir"

function Remove-Diacritics([string]$s) {
	$normalized = $s.Normalize([System.Text.NormalizationForm]::FormD)
	$chars = $normalized.ToCharArray() | Where-Object { [globalization.charunicodeinfo]::GetUnicodeCategory($_) -ne 'NonSpacingMark' }
	return -join $chars
}

Get-ChildItem -Path $imagesDir -File | ForEach-Object {
	$origName = $_.Name
	$nameNoExt = [System.IO.Path]::GetFileNameWithoutExtension($origName)
	$ext = $_.Extension

	$base = Remove-Diacritics($nameNoExt)
	$base = $base.ToLower()
	# substitui qualquer caractere inválido por underscore
	$base = $base -replace '[^a-z0-9]', '_'
	# remove underscores duplicados
	$base = $base -replace '_+', '_'
	# trim underscores
	$base = $base.Trim('_')
	if ($base -eq '') { $base = 'img' }
	# garante que comece e termine com letra
	if ($base -notmatch '^[a-z]') { $base = 'a' + $base }
	if ($base -notmatch '[a-z]$') { $base = $base + 'a' }

	$newName = "$base$ext"
	$newPath = Join-Path $imagesDir $newName

	if ($origName -ne $newName) {
		if (Test-Path $newPath) {
			Write-Warning "Arquivo destino já existe: $newName - pulando rename de $origName"
		} else {
			Write-Host "Renomeando $origName -> $newName"
			Rename-Item -Path $_.FullName -NewName $newName
			# substitui referências nos arquivos XAML do projeto
			Get-ChildItem -Path "$(Resolve-Path .)" -Recurse -Include *.xaml,*.csproj | ForEach-Object {
				(Get-Content $_.FullName) -replace [regex]::Escape($origName), $newName | Set-Content $_.FullName
			}
		}
	} else {
		Write-Host "Nome já válido: $origName"
	}
}

Write-Host "Sanitização concluída. Recomendo executar: dotnet clean && dotnet build";