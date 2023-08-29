/*
ID_MERCHANT_ACCOUNT_INFORMATION_DESCRIPTION
Removido por não constar no manual PIX do BCB

https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf
(Consultado em 29/08/2023)
*/

function Pix (pixKey, /*description,*/ merchantName, merchantCity, txid, amount) {
  var self = this;
  this.pixKey = pixKey;
//  this.description = description;
  this.merchantName = merchantName;
  this.merchantCity = merchantCity;
  this.txid = txid;
  this.amount = amount.toFixed(2);

  const ID_PAYLOAD_FORMAT_INDICATOR = "00",
  ID_MERCHANT_ACCOUNT_INFORMATION = "26",
  ID_MERCHANT_ACCOUNT_INFORMATION_GUI = "00",
  ID_MERCHANT_ACCOUNT_INFORMATION_KEY = "01",
  //ID_MERCHANT_ACCOUNT_INFORMATION_DESCRIPTION = "02",
  ID_MERCHANT_CATEGORY_CODE = "52",
  ID_TRANSACTION_CURRENCY = "53",
  ID_TRANSACTION_AMOUNT = "54",
  ID_COUNTRY_CODE = "58",
  ID_MERCHANT_NAME = "59",
  ID_MERCHANT_CITY = "60",
  ID_ADDITIONAL_DATA_FIELD_TEMPLATE = "62",
  ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TXID = "05",
  ID_CRC16 = "63";

  let getValue = function (id, value) {
    value = value.toString();
    const size = String(value.length).padStart(2, "0");
    return id + size + value;
  }

  let getMechantAccountInfo = function () {
    const gui = getValue(
      ID_MERCHANT_ACCOUNT_INFORMATION_GUI,
      "br.gov.bcb.pix"
    );
    let key = getValue(
      ID_MERCHANT_ACCOUNT_INFORMATION_KEY,
      self.pixKey
    );
/*    let description = getValue(
      ID_MERCHANT_ACCOUNT_INFORMATION_DESCRIPTION,
      self.description
    );
*/
    return getValue(
      ID_MERCHANT_ACCOUNT_INFORMATION,
      gui + key// + description
    );
  }

  let getAdditionalDataFieldTemplate = function () {
    const txid = getValue(
      ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TXID,
      self.txid
    );
    return getValue(ID_ADDITIONAL_DATA_FIELD_TEMPLATE, txid);
  }

  this.getPayload = function() {
    const payload =
      getValue(ID_PAYLOAD_FORMAT_INDICATOR, "01") +
      getMechantAccountInfo() +
      getValue(ID_MERCHANT_CATEGORY_CODE, "0000") +
      getValue(ID_TRANSACTION_CURRENCY, "986") +
      getValue(ID_TRANSACTION_AMOUNT, self.amount) +
      getValue(ID_COUNTRY_CODE, "BR") +
      getValue(ID_MERCHANT_NAME, self.merchantName) +
      getValue(ID_MERCHANT_CITY, self.merchantCity) +
      getAdditionalDataFieldTemplate();
    
    return payload + getCRC16(payload);
  }

  let getCRC16 = function (payload) {
    function ord(str) {
      return str.charCodeAt(0);
    }
    function dechex(number) {
      if (number < 0) {
        number = 0xffffffff + number + 1;
      }
      return parseInt(number, 10).toString(16);
    }

    //ADICIONA DADOS GERAIS NO PAYLOAD
    payload = payload + ID_CRC16 + "04";

    //DADOS DEFINIDOS PELO BACEN
    const POLIMONIO = 0x1021;
    const RESULTADO = 0xffff;
    let resultado = RESULTADO;
    let length;

    //CHECKSUM
    if ((length = payload.length) > 0) {
      for (let offset = 0; offset < length; offset++) {
        resultado ^= ord(payload[offset]) << 8;
        for (let bitwise = 0; bitwise < 8; bitwise++) {
          if ((resultado <<= 1) & 0x10000) resultado ^= POLIMONIO;
          resultado &= RESULTADO;
        }
      }
    }

    //RETORNA CÓDIGO CRC16 DE 4 CARACTERES
    return ID_CRC16 + "04" + dechex(resultado).toUpperCase();
  }
};
