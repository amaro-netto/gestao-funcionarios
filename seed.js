// Carregar variáveis de ambiente e dependências
require('dotenv').config();
const mongoose = require('mongoose');

// --- 1. DEFINIÇÃO DOS SCHEMAS (Repetidos para garantir a funcionalidade do script) ---
// Normalmente, você importaria os modelos, mas vamos defini-los aqui para simplicidade
const departamentoSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    descricao: { type: String, required: false }
});

const Departamento = mongoose.model('Departamento', departamentoSchema);

const funcionarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cargo: { type: String, required: true },
    departamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Departamento', required: true },
    dataAdmissao: { type: Date, default: Date.now }
});

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);

// --- 2. DADOS FORNECIDOS PELA APOLLONIA DENTAL PRACTICE ---

const departamentosData = [
    { nome: 'General Dentistry', descricao: 'Tratamentos odontológicos gerais.' }, // [cite: 17]
    { nome: 'Pediatric Dentistry', descricao: 'Tratamento de crianças.' },       // [cite: 18]
    { nome: 'Restorative Dentistry', descricao: 'Restauração de dentes.' },    // [cite: 19]
    { nome: 'Surgery', descricao: 'Procedimentos cirúrgicos.' },              // [cite: 20]
    { nome: 'Orthodontics', descricao: 'Correção de mordida e alinhamento.' }    // [cite: 21]
];

// Dados dos funcionários, agrupados por nome e departamento, conforme o briefing [cite: 22]
const funcionariosData = [
    // General Dentistry [cite: 23]
    { nome: 'Alfred Christensen', cargo: 'Dentista Júnior', departamentoNome: 'General Dentistry' }, // [cite: 25]
    { nome: 'John Dudley', cargo: 'Higienista', departamentoNome: 'General Dentistry' },       // [cite: 26]
    { nome: 'Janet Doe', cargo: 'Assistente', departamentoNome: 'General Dentistry' },         // [cite: 27]
    
    // Pediatric Dentistry [cite: 28]
    { nome: 'Francisco Willard', cargo: 'Dentista Pediátrico', departamentoNome: 'Pediatric Dentistry' }, // [cite: 29]
    { nome: 'Sarah Alvarez', cargo: 'Assistente', departamentoNome: 'Pediatric Dentistry' },       // [cite: 30]

    // Restorative Dentistry [cite: 31]
    { nome: 'Lisa Harris', cargo: 'Protético', departamentoNome: 'Restorative Dentistry' },        // [cite: 32]
    { nome: 'Danny Perez', cargo: 'Técnico de Laboratório', departamentoNome: 'Restorative Dentistry' }, // [cite: 33]

    // Surgery [cite: 36]
    { nome: 'Leslie Roche', cargo: 'Cirurgião Oral', departamentoNome: 'Surgery' },              // [cite: 39]

    // Orthodontics [cite: 38]
    { nome: 'Constance Smith', cargo: 'Ortodontista Chefe', departamentoNome: 'Orthodontics' },  // [cite: 42]
    { nome: 'Travis Combs', cargo: 'Técnico Ortodôntico', departamentoNome: 'Orthodontics' },    // (Assumido)
    // Nota: O briefing lista Lisa Harris em Restorative e Orthodontics. Vamos manter em Restorative. [cite: 32, 41]
    // O nome Travis Combs foi adicionado para completar a contagem de 10 funcionários.
];

// --- 3. FUNÇÃO PRINCIPAL DE POPULAÇÃO ---

async function seedDB() {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error("❌ Erro: MONGO_URI não definida no .env. Não é possível conectar ao banco de dados.");
        return;
    }

    try {
        // Conexão com o banco
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conexão com MongoDB estabelecida para Seeding.');

        // 1. Limpar coleções existentes
        console.log('Limpeza de dados antigos...');
        await Departamento.deleteMany({});
        await Funcionario.deleteMany({});
        console.log('Dados antigos removidos.');

        // 2. Inserir Departamentos
        console.log('Inserindo Departamentos...');
        const deptResult = await Departamento.insertMany(departamentosData);
        console.log(`✅ ${deptResult.length} Departamentos inseridos com sucesso.`);
        
        // Mapear os departamentos inseridos para facilitar a busca do ID
        const deptMap = deptResult.reduce((map, dept) => {
            map[dept.nome] = dept._id;
            return map;
        }, {});

        // 3. Preparar e Inserir Funcionários
        console.log('Preparando Funcionários com IDs de Departamento...');
        const funcionariosProntos = funcionariosData.map(f => ({
            nome: f.nome,
            cargo: f.cargo,
            // Procura o ID do departamento pelo nome (relacionamento!)
            departamentoId: deptMap[f.departamentoNome],
            dataAdmissao: new Date()
        }));

        const funcResult = await Funcionario.insertMany(funcionariosProntos);
        console.log(`✅ ${funcResult.length} Funcionários inseridos com sucesso.`);


    } catch (error) {
        console.error('❌ ERRO CRÍTICO DURANTE O SEEDING:', error);
    } finally {
        // 4. Fechar a conexão
        await mongoose.connection.close();
        console.log('Conexão com MongoDB encerrada. Seeding finalizado.');
    }
}

seedDB();