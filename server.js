// 1. CARREGAR DEPENDÊNCIAS
// Carrega variáveis de ambiente do .env
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 2. CONFIGURAÇÕES BÁSICAS DO EXPRESS
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Configurações do Middleware
// Permite requisições de outras origens
app.use(cors()); 
// Habilita o Express a receber JSON no corpo das requisições
app.use(express.json()); 
// Define a pasta 'public' para servir arquivos estáticos (HTML, CSS, JS do frontend)
app.use(express.static('public')); 

// 3. CONEXÃO COM O MONGODB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB!'))
    .catch(err => console.error('❌ Erro de conexão com MongoDB:', err));

// 4. DEFINIÇÃO DO MODELO (SCHEMA)
// O Schema é o "molde" que define a estrutura dos documentos (funcionários) no DB
const funcionarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cargo: { type: String, required: true },
    departamento: { type: String, required: true },
    // Data é definida automaticamente se não for passada
    dataAdmissao: { type: Date, default: Date.now } 
});

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);

// 5. ROTAS DA API REST (CRUD)

// A. CREATE (Criar) - Rota: POST /api/funcionarios
app.post('/api/funcionarios', async (req, res) => {
    try {
        const novoFuncionario = new Funcionario(req.body);
        const funcionarioSalvo = await novoFuncionario.save();
        // Resposta 201: Recurso criado com sucesso
        res.status(201).json(funcionarioSalvo); 
    } catch (error) {
        // Resposta 400: Requisição inválida (ex: campo obrigatório faltando)
        res.status(400).json({ message: error.message }); 
    }
});

// R. READ (Ler Todos) - Rota: GET /api/funcionarios
app.get('/api/funcionarios', async (req, res) => {
    try {
        // Encontra todos os documentos da coleção
        const funcionarios = await Funcionario.find(); 
        res.json(funcionarios);
    } catch (error) {
        // Resposta 500: Erro interno do servidor
        res.status(500).json({ message: error.message }); 
    }
});

// U. UPDATE (Atualizar) - Rota: PUT /api/funcionarios/:id
app.put('/api/funcionarios/:id', async (req, res) => {
    try {
        // Atualiza o funcionário pelo ID e retorna o novo documento (opção { new: true })
        const funcionarioAtualizado = await Funcionario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!funcionarioAtualizado) {
            // Resposta 404: Não encontrado
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }
        res.json(funcionarioAtualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// D. DELETE (Deletar) - Rota: DELETE /api/funcionarios/:id
app.delete('/api/funcionarios/:id', async (req, res) => {
    try {
        // Deleta o funcionário pelo ID
        const funcionarioDeletado = await Funcionario.findByIdAndDelete(req.params.id);
        if (!funcionarioDeletado) {
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }
        res.json({ message: 'Funcionário deletado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 6. INICIAR O SERVIDOR
app.listen(PORT, () => {
    console.log(`💻 Servidor rodando em http://localhost:${PORT}`);
});