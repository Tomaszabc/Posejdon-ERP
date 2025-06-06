export function filterOrders(orders, dateFilter, ORDERS_LIMIT) {
  const { startDate, endDate } = dateFilter;
  const filtered = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate
      ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
      : null;

    if (start && end) {
      return orderDate >= start && orderDate <= end;
    } else if (start) {
      return orderDate >= start;
    } else if (end) {
      return orderDate <= end;
    }
    return true;
  });

  if (!startDate && !endDate) {
    return filtered
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, ORDERS_LIMIT);
  } else {
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}