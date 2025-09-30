// URLs para as APIs
const API_URL_FUNCIONARIOS = '/api/funcionarios'; 
const API_URL_DEPARTAMENTOS = '/api/departamentos';

// Elementos da DOM
const form = document.getElementById('funcionario-form');
const funcionariosList = document.getElementById('funcionarios-list');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const funcionarioIdInput = document.getElementById('funcionario-id');
const nomeInput = document.getElementById('nome');
const cargoInput = document.getElementById('cargo');
// NOVO ELEMENTO
const departamentoIdSelect = document.getElementById('departamentoId'); 


// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Ordem importante: Carregar departamentos ANTES de carregar funcionários
    carregarDepartamentos().then(() => {
        carregarFuncionarios();
    });
    
    form.addEventListener('submit', salvarFuncionario);
    cancelButton.addEventListener('click', limparFormulario);
});

// -----------------------------------------------------------------
// NOVO: FUNÇÕES DE DEPARTAMENTO
// -----------------------------------------------------------------

/**
 * Carrega a lista de departamentos do backend e preenche o select.
 */
async function carregarDepartamentos() {
    try {
        const response = await fetch(API_URL_DEPARTAMENTOS);
        const departamentos = await response.json();

        // Limpa e adiciona a opção padrão
        departamentoIdSelect.innerHTML = '<option value="">Selecione um Departamento</option>';
        
        if (departamentos.length === 0) {
            departamentoIdSelect.innerHTML = '<option value="">Nenhum departamento. Crie um no backend (Postman).</option>';
            return;
        }

        departamentos.forEach(dep => {
            const option = document.createElement('option');
            option.value = dep._id; // O valor é o ID do MongoDB
            option.textContent = dep.nome; 
            departamentoIdSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
    }
}


// -----------------------------------------------------------------
// FUNÇÕES DE FUNCIONÁRIOS (CRUD)
// -----------------------------------------------------------------

/**
 * R. READ (Ler) - Busca os funcionários e exibe.
 */
async function carregarFuncionarios() {
    try {
        // Usa a API de funcionários que agora usa 'populate' para trazer o nome do departamento
        const response = await fetch(API_URL_FUNCIONARIOS); 
        const funcionarios = await response.json();

        funcionariosList.innerHTML = '';
        if (funcionarios.length === 0) {
            funcionariosList.innerHTML = '<tr><td colspan="5">Nenhum funcionário cadastrado.</td></tr>';
            return;
        }

        funcionarios.forEach(funcionario => {
            adicionarFuncionarioNaTabela(funcionario);
        });

    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
    }
}


/**
 * C. CREATE (Criar) ou U. UPDATE (Atualizar)
 */
async function salvarFuncionario(event) {
    event.preventDefault();

    const id = funcionarioIdInput.value;
    const isEditing = id ? true : false;

    // Dados agora incluem o ID do departamento selecionado
    const funcionarioData = {
        nome: nomeInput.value,
        cargo: cargoInput.value,
        departamentoId: departamentoIdSelect.value 
    };
    
    // Validação para garantir que um departamento foi selecionado
    if (!funcionarioData.departamentoId) {
        alert("Por favor, selecione um departamento.");
        return;
    }

    try {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL_FUNCIONARIOS}/${id}` : API_URL_FUNCIONARIOS;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funcionarioData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        limparFormulario();
        carregarFuncionarios();

        alert(`Funcionário ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);

    } catch (error) {
        console.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} funcionário:`, error);
        alert(`Não foi possível ${isEditing ? 'atualizar' : 'adicionar'} o funcionário.`);
    }
}


/**
 * D. DELETE (Deletar) - Mantém a mesma lógica.
 */
async function deletarFuncionario(id) {
    if (!confirm('Tem certeza que deseja deletar este funcionário?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL_FUNCIONARIOS}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        carregarFuncionarios();
        alert('Funcionário deletado com sucesso!');

    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);
        alert('Não foi possível deletar o funcionário.');
    }
}


// -----------------------------------------------------------------
// FUNÇÕES DE INTERFACE
// -----------------------------------------------------------------

/**
 * Preenche o formulário para edição.
 */
function preencherFormularioParaEdicao(funcionario) {
    funcionarioIdInput.value = funcionario._id;
    nomeInput.value = funcionario.nome;
    cargoInput.value = funcionario.cargo;
    
    // Seleciona o ID do departamento (que pode vir como objeto ou ID puro dependendo do backend)
    // O backend com 'populate' retorna um objeto, então pegamos o _id dele.
    departamentoIdSelect.value = funcionario.departamentoId._id || funcionario.departamentoId; 

    submitButton.textContent = 'Salvar Alterações';
    submitButton.style.backgroundColor = '#f39c12';
    cancelButton.style.display = 'inline-block';
}

/**
 * Limpa o formulário.
 */
function limparFormulario() {
    form.reset();
    funcionarioIdInput.value = '';

    submitButton.textContent = 'Adicionar Funcionário';
    submitButton.style.backgroundColor = '#2ecc71';
    cancelButton.style.display = 'none';
}


/**
 * Cria a linha da tabela.
 */
function adicionarFuncionarioNaTabela(funcionario) {
    const row = funcionariosList.insertRow();
    
    const dataAdmissao = new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR');

    // Extrai o nome do departamento. Se o populate funcionou, ele é um objeto.
    const departamentoNome = funcionario.departamentoId && funcionario.departamentoId.nome ? 
                             funcionario.departamentoId.nome : 
                             'Não Atribuído';

    row.insertCell(0).textContent = funcionario.nome;
    row.insertCell(1).textContent = funcionario.cargo;
    row.insertCell(2).textContent = departamentoNome; // Exibe o nome do departamento
    row.insertCell(3).textContent = dataAdmissao;
    
    const acoesCell = row.insertCell(4);

    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.classList.add('action-btn', 'edit-btn');
    editButton.onclick = () => preencherFormularioParaEdicao(funcionario); 
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Deletar';
    deleteButton.classList.add('action-btn', 'delete-btn');
    deleteButton.onclick = () => deletarFuncionario(funcionario._id);

    acoesCell.appendChild(editButton);
    acoesCell.appendChild(deleteButton);
}