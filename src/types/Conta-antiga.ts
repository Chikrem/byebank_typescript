
// Lógica de controle de saldo da conta, incluindo transações como depósito, débito e agrupamento de transações por data. 
// O saldo e as transações são armazenados no localStorage para persistência de dados.

// Importação das classes que serão utilizadas no código.
import { Transacao } from "./Transacao.js";
import { TipoTransacao } from "./TipoTransacao.js";
import { GrupoTransacao } from "./GrupoTransacao.js";

// Inicializa a variável "saldo" a partir do valor armazenado no localStorage. 
// Se o valor não existir, o saldo inicial será 0.
let saldo: number = JSON.parse(localStorage.getItem("saldo")) || 0;

// Carrega a lista de transações do localStorage e converte qualquer campo "data" 
// para objetos do tipo Date, ou inicializa como uma lista vazia se não houver transações salvas.
const transacoes: Transacao[] = JSON.parse(localStorage.getItem("transacoes"), (key: string, value: string) => {
    if (key == "data") {
        return new Date(value); // Transforma o valor do campo "data" em um objeto Date.
    }
    return value; // Retorna outros valores sem alteração.
}) || [];

// Função que debita um valor do saldo.
function debitar(valor: number): void {
    if (valor <= 0) {
        throw new Error("O valor a ser debitado deve ser maior que zero!"); // Valida que o valor seja positivo.
    }
    if (valor > saldo) {
        throw new Error("Saldo insuficiente!"); // Valida que o saldo seja suficiente para a operação.
    }
    saldo -= valor; // Subtrai o valor do saldo.
    localStorage.setItem("saldo", JSON.stringify(saldo)); // Atualiza o saldo no localStorage.
}

// Função que deposita um valor no saldo.
function depositar(valor: number): void {
    if (valor <= 0) {
        throw new Error("O valor a ser depositado deve ser maior que zero!"); // Valida que o valor seja positivo.
    }
    saldo += valor; // Adiciona o valor ao saldo.
    localStorage.setItem("saldo", JSON.stringify(saldo)); // Atualiza o saldo no localStorage.
}

// Objeto "Conta" que encapsula operações relacionadas à conta e suas transações.
const Conta = {
    // Método para obter o saldo atual.
    getSaldo() {
        return saldo;
    },

    // Método para obter a data de acesso atual.
    getDataAcesso(): Date {
        return new Date();
    },

    // Método que retorna as transações agrupadas por mês e ano.
    getGruposTransacoes(): GrupoTransacao[] {
        const gruposTransacoes: GrupoTransacao[] = [];
        const listaTransacoes: Transacao[] = structuredClone(transacoes); // Clona a lista de transações para não modificar o original.
        // Ordena as transações por data (mais recente primeiro).
        const transacoesOrdenadas: Transacao[] = listaTransacoes.sort((t1, t2) => t2.data.getTime() - t1.data.getTime());
        let labelAtualGrupoTransacao: string = "";

        // Itera pelas transações ordenadas.
        for (let transacao of transacoesOrdenadas) {
            // Cria um label baseado no mês e ano da transação.
            let labelGrupoTransacao: string = transacao.data.toLocaleDateString("pt-br", { month: "long", year: "numeric" });
            // Se o label atual for diferente do anterior, cria um novo grupo de transações.
            if (labelAtualGrupoTransacao !== labelGrupoTransacao) {
                labelAtualGrupoTransacao = labelGrupoTransacao;
                gruposTransacoes.push({
                    label: labelGrupoTransacao,
                    transacoes: [] // Inicializa um novo grupo de transações.
                });
            }
            // Adiciona a transação ao último grupo criado.
            gruposTransacoes.at(-1).transacoes.push(transacao);
        }

        return gruposTransacoes; // Retorna os grupos de transações.
    },

    // Método para registrar uma nova transação.
    registrarTransacao(novaTransacao: Transacao): void {
        // Se a transação for um depósito, chama a função depositar.
        if (novaTransacao.tipoTransacao == TipoTransacao.DEPOSITO) {
            depositar(novaTransacao.valor);
        } 
        // Se a transação for uma transferência ou pagamento de boleto, debita o valor.
        else if (novaTransacao.tipoTransacao == TipoTransacao.TRANSFERENCIA || novaTransacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO) {
            debitar(novaTransacao.valor);
            novaTransacao.valor *= -1; // Transações de débito têm valores negativos.
        } 
        // Se o tipo da transação for inválido, lança um erro.
        else {
            throw new Error("Tipo de Transação é inválido!");
        }
        transacoes.push(novaTransacao); // Adiciona a nova transação à lista de transações.
        console.log(this.getGruposTransacoes()); // Exibe os grupos de transações no console.
        localStorage.setItem("transacoes", JSON.stringify(transacoes)); // Salva as transações atualizadas no localStorage.
    }
}

// Exporta o objeto Conta para que possa ser utilizado em outros arquivos.
export default Conta;
