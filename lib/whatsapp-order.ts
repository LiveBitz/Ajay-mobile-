/**
 * Generate WhatsApp Message Link for Order Placement
 * Redirects user to WhatsApp with pre-filled order details
 */

interface OrderDetails {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

/**
 * Format order details into WhatsApp message
 */
export function formatOrderMessageForWhatsApp(order: OrderDetails): string {
  const itemsList = order.items
    .map((item) => `• ${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString()}`)
    .join("\n");

  const message = `ORDER PLACEMENT REQUEST

Customer Details:
Name: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}

Items:
${itemsList}

Order Summary:
Subtotal: ₹${order.subtotal.toLocaleString()}
${order.tax && order.tax > 0 ? `Tax: ₹${order.tax.toLocaleString()}\n` : ""}${order.shipping && order.shipping > 0 ? `Shipping: ₹${order.shipping.toLocaleString()}\n` : ""}Total Amount: ₹${order.total.toLocaleString()}

Delivery Address:
${order.deliveryAddress.street}
${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}

Please confirm order and arrange payment.
Thank you!`;

  return message;
}

/**
 * Generate WhatsApp Direct Link with Message
 * Works on both mobile and desktop - opens WhatsApp app or web
 * 
 * @param adminPhoneNumber - Admin phone number with country code (e.g., +919876543210)
 * @param orderDetails - Order details to include in message
 * @returns WhatsApp direct message link
 */
export function generateWhatsAppLink(
  adminPhoneNumber: string,
  orderDetails: OrderDetails
): string {
  // Format phone number - remove any special characters except +
  const cleanPhone = adminPhoneNumber.replace(/[^\d+]/g, "");
  
  // Ensure phone starts with + (add if missing)
  const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;

  // Format message
  const message = formatOrderMessageForWhatsApp(orderDetails);

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // WhatsApp link format: https://wa.me/{phone}?text={message}
  // This works on mobile (opens app) and desktop (opens web)
  const whatsappLink = `https://wa.me/${formattedPhone.replace("+", "")}?text=${encodedMessage}`;

  return whatsappLink;
}

/**
 * Open WhatsApp in new window/tab
 * Handles both mobile and desktop
 * 
 * @param adminPhoneNumber - Admin phone number with country code
 * @param orderDetails - Order details to send
 */
export function redirectToWhatsApp(
  adminPhoneNumber: string,
  orderDetails: OrderDetails
): void {
  const whatsappLink = generateWhatsAppLink(adminPhoneNumber, orderDetails);

  // Check if on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // On mobile, redirect to WhatsApp app
    // Using whatsapp: protocol for app-specific redirect
    window.location.href = whatsappLink;
  } else {
    // On desktop, open in new window/tab
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  }
}

/**
 * Get admin WhatsApp number from environment
 */
export function getAdminWhatsAppNumber(): string {
  const adminPhoneFromEnv = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;
  
  if (!adminPhoneFromEnv) {
    throw new Error(
      "NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE is not set in environment variables"
    );
  }

  return adminPhoneFromEnv;
}

/**
 * Hook to handle WhatsApp order placement
 * Usage in React component:
 * 
 * const { redirectToWhatsApp } = useWhatsAppOrder();
 * 
 * const handlePlaceOrderViaWhatsApp = () => {
 *   redirectToWhatsApp(adminNumber, orderDetails);
 * };
 */
export function useWhatsAppOrder() {
  return {
    redirectToWhatsApp,
    generateWhatsAppLink,
    formatOrderMessageForWhatsApp,
  };
}
