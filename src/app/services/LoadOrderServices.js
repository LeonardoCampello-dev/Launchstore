const LoadProductServices = require("./LoadProductServices");
const Order = require("../models/Order");
const User = require("../models/User");

const {
  formatPrice,
  date,
  formatCpfCnpj,
  formatCep,
} = require("../../lib/utils");

async function format(order) {
  order.product = await LoadProductServices.load("productWithDeleted", {
    where: { id: order.product_id },
  });

  order.buyer = await User.findOne({
    where: { id: order.buyer_id },
  });

  order.seller = await User.findOne({
    where: { id: order.seller_id },
  });

  order.buyer.formattedCpfCpnj = formatCpfCnpj(order.buyer.cpf_cnpj);
  order.buyer.formattedCep = formatCep(order.buyer.cep);

  order.seller.formattedCpfCpnj = formatCpfCnpj(order.seller.cpf_cnpj);
  order.seller.formattedCep = formatCep(order.seller.cep);

  order.formattedPrice = formatPrice(order.price);
  order.formattedTotal = formatPrice(order.total);

  const statusTypes = {
    open: "Aberto",
    canceled: "Cancelado",
    sold: "Vendido",
  };

  order.formattedStatus = statusTypes[order.status];

  const updatedAt = date(order.updated_at);

  order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.day}/${updatedAt.month}/${updatedAt.year} às ${updatedAt.hours}h${updatedAt.minutes}`;

  return order;
}

const LoadService = {
  load(service, filter) {
    this.filter = filter;
    return this[service]();
  },
  async order() {
    try {
      const order = await Order.findOne(this.filter);

      return format(order);
    } catch (error) {
      console.error(error);
    }
  },
  async orders() {
    try {
      const orders = await Order.findAll(this.filter);

      const ordersPromises = await orders.map(format);

      return Promise.all(ordersPromises);
    } catch (error) {
      console.error(error);
    }
  },
  format,
};

module.exports = LoadService;
