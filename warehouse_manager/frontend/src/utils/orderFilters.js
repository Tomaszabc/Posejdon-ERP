export function filterOrders(orders, filters, ORDERS_LIMIT) {
  const { startDate, endDate, diameter, shape, size, color, quantity } = filters;

  const filtered = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;

    if (start && orderDate < start) return false;
    if (end && orderDate > end) return false;
    if (diameter && order.diameter !== diameter) return false;
    if (shape && order.shape !== shape) return false;
    if (size && order.size !== size) return false;
    if (color && order.color !== color) return false;
    if (quantity && String(order.quantity_to_assemble) !== String(quantity)) return false;
    return true;
  });

  if (!startDate && !endDate && !diameter && !shape && !size && !color && !quantity) {
    return filtered
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, ORDERS_LIMIT);
  } else {
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}
