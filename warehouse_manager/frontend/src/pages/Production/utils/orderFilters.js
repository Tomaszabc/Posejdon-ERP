export function filterOrders(orders, filters, limit) {
  let filtered = [...orders];

  if (filters.startDate) {
    filtered = filtered.filter(order => 
      new Date(order.produced_at) >= new Date(filters.startDate)
    );
  }

  if (filters.endDate) {
    filtered = filtered.filter(order => 
      new Date(order.produced_at) <= new Date(filters.endDate)
    );
  }

  if (filters.diameter) {
    filtered = filtered.filter(order => 
      order.diameter === filters.diameter
    );
  }

  if (filters.shape) {
    filtered = filtered.filter(order => 
      order.shape === filters.shape
    );
  }

  if (filters.size) {
    filtered = filtered.filter(order => 
      order.size === filters.size
    );
  }

  if (filters.color) {
    filtered = filtered.filter(order => 
      order.color === filters.color
    );
  }

  if (filters.quantity) {
    filtered = filtered.filter(order => 
      order.quantity_to_assemble === Number(filters.quantity)
    );
  }

  return filtered.slice(0, limit);
}