pix = new Pix(
  ">CHAVE PIX<", // Chave pix (email, CPF, CNPJ, telefone, chave aletória)
  ">NOME DO BENEFICIARIO<", // Nome do beneficiário
  ">CIDADE<", // Cidade da transação ou do beneficiário
  ">TXID<", // Identificador do Pagamento
  5.5 // Valor serparado por ponto
);

alert(pix.getPayload());
console.log(pix.getPayload());
