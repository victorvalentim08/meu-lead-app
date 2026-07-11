# Puxa uma imagem oficial que já vem com o Node.js e o Chrome configurados perfeitamente
FROM ghcr.io/puppeteer/puppeteer:24.43.1

# Define onde o código vai rodar dentro do container
WORKDIR /app

# Copia as dependências do projeto
COPY package*.json ./

# Instala os pacotes do Node de forma limpa
RUN npm ci

# Copia todo o resto do código para dentro do container
COPY . .

# Expõe a porta que o Render espera por padrão em containers
EXPOSE 10000

# Executa o servidor principal
CMD ["node", "server.js"]