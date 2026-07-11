#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências do projeto
npm install

echo "--- Instalando o Google Chrome na pasta local do Backend ---"
PUPPETEER_CACHE_DIR=$(pwd)/.cache npx puppeteer browsers install chrome