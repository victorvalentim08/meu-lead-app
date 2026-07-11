#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências do projeto
npm install

# Instala o Chrome do Puppeteer e armazena no cache local do projeto
echo "--- Instalando o Google Chrome para o Puppeteer ---"
npx puppeteer browsers install chrome