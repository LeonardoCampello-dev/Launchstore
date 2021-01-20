const Intl = require("intl");

module.exports = {
  date(timestamp) {
    const date = new Date(timestamp);

    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();

    return {
      minutes,
      hours,
      day,
      month,
      year,
      iso: `${year}-${month}-${day}`,
      birthDay: `${day}/${month}`,
      format: `${day}/${month}/${year}`,
    };
  },
  formatPrice(price) {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100);
  },
  formatCpfCnpj(value) {
    value = value.replace(/\D/g, "");

    if (value.length > 14) value = value.slice(0, -1);

    if (value.length > 11) {
      // CNPJ 12.123.123/0001-12

      value = value.replace(/(\d{2})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      // CPF 123.456.789-10

      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1-$2");
    }

    return value;
  },
  formatCep(value) {
    value = value.replace(/\D/g, "");

    if (value.length > 8) value = value.slice(0, -1);

    value = value.replace(/(\d{5})(\d)/, "$1-$2");

    return value;
  },
};
