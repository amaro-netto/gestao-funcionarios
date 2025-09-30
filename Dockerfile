# 1. ESTÁGIO: Imagem base, usamos a versão LTS (Long Term Support) do Node.js
# Isso já vem com o Node e o npm instalados
FROM node:20-alpine

# 2. DIRETÓRIO DE TRABALHO
# Define a pasta onde o código da aplicação estará dentro do container
WORKDIR /usr/src/app

# 3. COPIAR ARQUIVOS DE DEPENDÊNCIA
# Copia o package.json e o package-lock.json para poder instalar as dependências
COPY package*.json ./

# 4. INSTALAR DEPENDÊNCIAS
# Roda a instalação das bibliotecas listadas no package.json
RUN npm install

# 5. COPIAR CÓDIGO FONTE
# Copia o resto do código da aplicação para o diretório de trabalho
# O .dockerignore (que criaremos a seguir) evitará que a pasta node_modules seja copiada
COPY . .

# 6. EXPOR A PORTA
# Informa ao Docker que a aplicação usa a porta 3000
EXPOSE 3000

# 7. COMANDO DE EXECUÇÃO
# Define o comando que será executado ao iniciar o container
CMD [ "npm", "start" ]