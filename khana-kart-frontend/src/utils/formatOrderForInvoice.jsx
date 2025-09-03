export function formatOrderForInvoice(order, menu) {
  if (!order) return null;

  const items = order.items.map(item => {
    const menuItem = menu.find(m => m.id === item.menu_item_id) || {};
    const price = Number(menuItem.price || 0);
    const subtotal = price * item.quantity;

    return {
      name: menuItem.name || "Unknown Item",
      quantity: item.quantity,
      price,
      subtotal,
    };
  });

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const discount_percent = order.discount || 0;
  const discount_amount = (subtotal * discount_percent) / 100;
  const total = subtotal - discount_amount;

  return {
    invoice_number: order.invoice_number || order.id || "N/A",
    items,
    subtotal,
    discount_amount,
    discount_percent,
    total,
  };
}
