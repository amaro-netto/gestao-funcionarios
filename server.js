// 1. CARREGAR DEPENDÊNCIAS E CONFIGURAÇÕES
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
// Ajuste a URI para o novo nome de banco local, se necessário, ou mantenha o anterior
const MONGO_URI = process.env.MONGO_URI; 

app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 

// 2. CONEXÃO COM O MONGODB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB!'))
    .catch(err => console.error('❌ Erro de conexão com MongoDB:', err));

// 3. DEFINIÇÃO DOS MODELOS (SCHEMAS)
// NOVO: 3.1. Modelo Departamento
// Um departamento tem apenas um nome e uma descrição
const departamentoSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    descricao: { type: String, required: false }
});

const Departamento = mongoose.model('Departamento', departamentoSchema);

// MODIFICADO: 3.2. Modelo Funcionário
const funcionarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cargo: { type: String, required: true },
    // NOVO CAMPO: Liga o funcionário ao Departamento usando o ID (relacionamento)
    departamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Departamento', required: true }, 
    dataAdmissao: { type: Date, default: Date.now } 
});

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);


// 4. ROTAS DA API REST

// NOVO: 4.1. ROTAS DE DEPARTAMENTOS (CRUD Básico - Foco em Criação e Leitura)
// C. CREATE Departamento: POST /api/departamentos
app.post('/api/departamentos', async (req, res) => {
    try {
        const novoDepartamento = new Departamento(req.body);
        const departamentoSalvo = await novoDepartamento.save();
        res.status(201).json(departamentoSalvo); 
    } catch (error) {
        res.status(400).json({ message: error.message }); 
    }
});

// R. READ Departamentos: GET /api/departamentos
app.get('/api/departamentos', async (req, res) => {
    try {
        const departamentos = await Departamento.find(); 
        res.json(departamentos);
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
});


// MODIFICADO: 4.2. ROTAS DE FUNCIONÁRIOS (CRUD Completo)
// C. CREATE Funcionário: POST /api/funcionarios (Nenhuma mudança na rota, apenas nos dados esperados)
app.post('/api/funcionarios', async (req, res) => {
    try {
        const novoFuncionario = new Funcionario(req.body);
        const funcionarioSalvo = await novoFuncionario.save();
        res.status(201).json(funcionarioSalvo); 
    } catch (error) {
        res.status(400).json({ message: error.message }); 
    }
});

// R. READ Funcionários: GET /api/funcionarios
app.get('/api/funcionarios', async (req, res) => {
    try {
        // USO DE POPULATE: Traz as informações do objeto Departamento junto com o Funcionário
        const funcionarios = await Funcionario.find().populate('departamentoId', 'nome'); 
        res.json(funcionarios);
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
});

// U. UPDATE Funcionário: PUT /api/funcionarios/:id (Nenhuma mudança na rota)
app.put('/api/funcionarios/:id', async (req, res) => {
    try {
        const funcionarioAtualizado = await Funcionario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!funcionarioAtualizado) {
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }
        res.json(funcionarioAtualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// D. DELETE Funcionário: DELETE /api/funcionarios/:id (Nenhuma mudança na rota)
app.delete('/api/funcionarios/:id', async (req, res) => {
    try {
        const funcionarioDeletado = await Funcionario.findByIdAndDelete(req.params.id);
        if (!funcionarioDeletado) {
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }
        res.json({ message: 'Funcionário deletado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 5. INICIAR O SERVIDOR
app.listen(PORT, () => {
    console.log(`💻 Servidor rodando em http://localhost:${PORT}`);
});