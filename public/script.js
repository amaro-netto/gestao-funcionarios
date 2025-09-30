// A API_URL aponta para a rota que criamos no server.js
const API_URL = '/api/funcionarios'; 

// Elementos da DOM
const form = document.getElementById('funcionario-form');
const funcionariosList = document.getElementById('funcionarios-list');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const funcionarioIdInput = document.getElementById('funcionario-id');
const nomeInput = document.getElementById('nome');
const cargoInput = document.getElementById('cargo');
const departamentoInput = document.getElementById('departamento');

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarFuncionarios();
    form.addEventListener('submit', salvarFuncionario);
    cancelButton.addEventListener('click', limparFormulario);
});

// -----------------------------------------------------------------
// FUNÇÕES PRINCIPAIS (CRUD)
// -----------------------------------------------------------------

/**
 * R. READ (Ler) - Busca os dados no backend e exibe na tabela.
 */
async function carregarFuncionarios() {
    try {
        const response = await fetch(API_URL);
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
        alert('Erro ao carregar dados. Verifique se o servidor está rodando.');
    }
}


/**
 * C. CREATE (Criar) ou U. UPDATE (Atualizar) - Envia dados do formulário para o backend.
 */
async function salvarFuncionario(event) {
    event.preventDefault();

    const id = funcionarioIdInput.value;
    const isEditing = id ? true : false;

    const funcionarioData = {
        nome: nomeInput.value,
        cargo: cargoInput.value,
        departamento: departamentoInput.value
    };

    try {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${id}` : API_URL;

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
 * D. DELETE (Deletar) - Remove um funcionário pelo ID.
 */
async function deletarFuncionario(id) {
    if (!confirm('Tem certeza que deseja deletar este funcionário?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
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
 * Preenche o formulário com dados para edição.
 * @param {object} funcionario - O objeto do funcionário a ser editado.
 */
function preencherFormularioParaEdicao(funcionario) {
    funcionarioIdInput.value = funcionario._id;
    nomeInput.value = funcionario.nome;
    cargoInput.value = funcionario.cargo;
    departamentoInput.value = funcionario.departamento;

    submitButton.textContent = 'Salvar Alterações';
    submitButton.style.backgroundColor = '#f39c12';
    cancelButton.style.display = 'inline-block';
}

/**
 * Limpa o formulário e volta para o modo Criação.
 */
function limparFormulario() {
    form.reset();
    funcionarioIdInput.value = '';

    submitButton.textContent = 'Adicionar Funcionário';
    submitButton.style.backgroundColor = '#2ecc71';
    cancelButton.style.display = 'none';
}


/**
 * Cria a linha da tabela e adiciona os botões de ação.
 * @param {object} funcionario - O objeto do funcionário.
 */
function adicionarFuncionarioNaTabela(funcionario) {
    const row = funcionariosList.insertRow();
    
    const dataAdmissao = new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR');

    row.insertCell(0).textContent = funcionario.nome;
    row.insertCell(1).textContent = funcionario.cargo;
    row.insertCell(2).textContent = funcionario.departamento;
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