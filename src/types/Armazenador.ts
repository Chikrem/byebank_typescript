export class Armazenador {

    constructor() { }

    // Método para salvar um valor no localStorage.
    static salvarChaveValor(chave: string, valor: any): void {
        const valorString = JSON.stringify(valor);
        localStorage.setItem(chave, valorString);
    }

    // Método para obter um valor salvo no localStorage.
    static obterValor(chave: string, reviver?: (this: any, key: string, value: any) => any) {

        const valorString = localStorage.getItem(chave);

        if (valorString === null) {
            return null;
        }

        if (reviver) {
            return JSON.parse(valorString, reviver);
        }

        return JSON.parse(valorString);
    }
}
