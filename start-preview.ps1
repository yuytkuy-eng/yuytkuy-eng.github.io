# Run from PowerShell: ./start-preview.ps1
$ErrorActionPreference = 'Stop'
Push-Location -LiteralPath $PSScriptRoot
try {
    if ((Test-Path -LiteralPath './_site/index.html') -and (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host 'Open http://127.0.0.1:4173 to view the generated homepage.'
        node ./scripts/serve-preview.mjs ./_site 4173
        return
    }
    if (Get-Command ruby -ErrorAction SilentlyContinue) {
        bundle install
        if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
        bundle exec jekyll serve --config _config.yml,_config_local.yml --host 127.0.0.1 --port 4000
    } elseif (Get-Command wsl -ErrorAction SilentlyContinue) {
        wsl -d Ubuntu -- sh -lc 'bundle install && bundle exec jekyll serve --config _config.yml,_config_local.yml --host 127.0.0.1 --port 4000'
    } else {
        throw 'Please install Ruby 3.3 and Bundler, or use WSL Ubuntu.'
    }
    if ($LASTEXITCODE -ne 0) { throw 'Preview could not start.' }
} finally {
    Pop-Location
}
