/**
 * WhatsApp order notification helpers.
 *
 * Security note: WhatsApp messages are stored in chat history on both devices
 * and are not under the application's control. To avoid leaking customer PII
 * (name, email, phone, address) into that uncontrolled channel, messages now
 * contain only the order number, item list, and total.
 * The admin can look up full customer details by order number in the admin panel.
 */

interface OrderMessageData {
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

/**
 * Build a minimal WhatsApp message — NO customer PII included.
 */
export function formatOrderMessageForWhatsApp(order: OrderMessageData): string {
  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.name} (x${item.quantity}) — ₹${(item.price * item.quantity).toLocaleString()}`
    )
    .join("\n");

  return `NEW ORDER: ${order.orderNumber}

Items:
${itemsList}

Total: ₹${order.total.toLocaleString()}

Please check the admin panel for full customer details.`;
}

/**
 * Generate a WhatsApp wa.me link with the pre-filled order message.
 */
export function generateWhatsAppLink(
  adminPhoneNumber: string,
  order: OrderMessageData
): string {
  const cleanPhone = adminPhoneNumber.replace(/[^\d+]/g, "");
  const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;
  const message = formatOrderMessageForWhatsApp(order);
  return `https://wa.me/${formattedPhone.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

/**
 * Open WhatsApp in a new tab / redirect to WhatsApp app on mobile.
 */
export function redirectToWhatsApp(
  adminPhoneNumber: string,
  order: OrderMessageData
): void {
  const link = generateWhatsAppLink(adminPhoneNumber, order);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = link;
  } else {
    window.open(link, "_blank", "noopener,noreferrer");
  }
}

export function getAdminWhatsAppNumber(): string {
  const phone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;
  if (!phone) {
    throw new Error("NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE is not set in environment variables");
  }
  return phone;
}
