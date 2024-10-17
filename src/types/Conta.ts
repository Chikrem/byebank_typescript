import { Armazenador } from "./Armazenador.js";
import { GrupoTransacao } from "./GrupoTransacao.js";
import { TipoTransacao } from "./TipoTransacao.js";
import { Transacao } from "./Transacao.js";

// Define a classe "Conta" que encapsula operações relacionadas
export class Conta {
    // Inicializa a variável "nome" com uma string vazia. Que será o nome do titular da conta.
    nome: string;
    // Inicializa a variável "saldo" a partir do valor armazenado no localStorage. 
    // Se o valor não existir, o saldo inicial será 0.
    private saldo: number = Armazenador.obterValor("saldo") || 0;
    // Carrega a lista de transações do localStorage e converte qualquer campo "data"
    // para objetos do tipo Date, ou inicializa como uma lista vazia se não houver transações salvas.
    private transacoes: Transacao[] = Armazenador.obterValor(("transacoes"), (key: string, value: string) => {
        if (key == "data") {
            return new Date(value); // Transforma o valor do campo "data" em um objeto Date.
        }
        return value; // Retorna outros valores sem alteração.
    });

    // public: O modificador public permite que os membros sejam acessados livremente de qualquer lugar. É o modificador padrão caso nenhum seja especificado.
    // private: O modificador private restringe o acesso aos membros somente à própria classe. Isso significa que eles não podem ser acessados ou modificados fora da classe.
    // protected: O modificador protected permite que os membros sejam acessados dentro da classe e também pelas classes derivadas (subclasses). No entanto, eles não são acessíveis fora das classes derivadas.

    // Construtor da classe "Conta" que recebe o nome do titular da conta.
    constructor(nome: string) {
        this.nome = nome;
    }


    // Métodos

    public getTitular(): string {
        return this.nome;
    }

    // Método para obter o saldo atual.
    getSaldo() {
        return this.saldo;
    }

    // Método para obter a data de acesso atual.
    getDataAcesso(): Date {
        return new Date();
    }

    // Metodo que debita um valor do saldo.
    debitar(valor: number): void {
        if (valor <= 0) {
            throw new Error("O valor a ser debitado deve ser maior que zero!"); // Valida que o valor seja positivo.
        }
        if (valor > this.saldo) {
            throw new Error("Saldo insuficiente!"); // Valida que o saldo seja suficiente para a operação.
        }
        this.saldo -= valor; // Subtrai o valor do saldo.
        Armazenador.salvarChaveValor("saldo", JSON.stringify(this.saldo)); // Atualiza o saldo no localStorage.
    }

    // Método que deposita um valor no saldo.
    depositar(valor: number): void {
        if (valor <= 0) {
            throw new Error("O valor a ser depositado deve ser maior que zero!"); // Valida que o valor seja positivo.
        }
        this.saldo += valor; // Adiciona o valor ao saldo.
        Armazenador.salvarChaveValor("saldo", JSON.stringify(this.saldo)); // Atualiza o saldo no localStorage.
    }

    // Método para obter o saldo atual.

    getGruposTransacoes(): GrupoTransacao[] {
        const gruposTransacoes: GrupoTransacao[] = [];
        const listaTransacoes: Transacao[] = structuredClone(this.transacoes); // Clona a lista de transações para não modificar o original.
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
    }

    // Método para registrar uma nova transação.
    registrarTransacao(novaTransacao: Transacao): void {
        // Se a transação for um depósito, chama a função depositar.
        if (novaTransacao.tipoTransacao == TipoTransacao.DEPOSITO) {
            this.depositar(novaTransacao.valor);
        }
        // Se a transação for uma transferência ou pagamento de boleto, debita o valor.
        else if (novaTransacao.tipoTransacao == TipoTransacao.TRANSFERENCIA || novaTransacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO) {
            this.debitar(novaTransacao.valor);
            novaTransacao.valor *= -1; // Transações de débito têm valores negativos.
        }
        // Se o tipo da transação for inválido, lança um erro.
        else {
            throw new Error("Tipo de Transação é inválido!");
        }
        this.transacoes.push(novaTransacao); // Adiciona a nova transação à lista de transações.
        console.log(this.getGruposTransacoes()); // Exibe os grupos de transações no console.
        Armazenador.salvarChaveValor("transacoes", JSON.stringify(this.transacoes)); // Salva as transações atualizadas no localStorage.
    }



}

// Cria uma nova instância da classe "Conta" com o nome "Joana da Silva Oliveira".
const conta = new Conta("Joana da Silva Oliveira");

export default conta; // Exporta a instância da classe "Conta" como padrão.