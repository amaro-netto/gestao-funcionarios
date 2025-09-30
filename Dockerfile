# 1. ESTÁGIO: Imagem base
FROM node:20-alpine

# 2. DIRETÓRIO DE TRABALHO
WORKDIR /usr/src/app

# Novo comentário para forçar invalidacao do cache na próxima etapa:
# BUILD_DATE_2025_09_29

# 3. COPIAR ARQUIVOS DE DEPENDÊNCIA
COPY package*.json ./

# 4. INSTALAR DEPENDÊNCIAS
RUN npm install

# NOVO: Copia o script de seed
COPY seed.js .

# 5. COPIAR CÓDIGO FONTE (Esta linha deve copiar o seed.js)
COPY . .

# 6. EXPOR A PORTA
EXPOSE 3000

# 7. COMANDO DE EXECUÇÃO
CMD [ "npm", "start" ]