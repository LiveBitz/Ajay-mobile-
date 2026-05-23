type PinelabsStatus = "paid" | "failed" | "pending";

const DEFAULT_TOKEN_PATH = "/api/auth/v1/token";
const DEFAULT_CHECKOUT_PATH = "/api/checkout/v1/orders";
const DEFAULT_STATUS_PATH = "/api/pay/v1/orders";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is not configured`);
  }
  return value.trim();
}

function apiBase(): string {
  return requiredEnv("PINELABS_API_BASE").replace(/\/+$/, "");
}

function pathFromEnv(name: string, fallback: string): string {
  const raw = process.env[name]?.trim() || fallback;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function requestHeaders(token?: string): HeadersInit {
  return {
    accept: "application/json",
    "Content-Type": "application/json",
    "Request-ID": crypto.randomUUID(),
    "Request-Timestamp": new Date().toISOString(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function parseJsonOrText(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(prefix: string, status: number, body: unknown): string {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return `${prefix} failed (${status}): ${payload}`;
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${apiBase()}${pathFromEnv("PINELABS_TOKEN_PATH", DEFAULT_TOKEN_PATH)}`, {
    method: "POST",
    headers: requestHeaders(),
    body: JSON.stringify({
      client_id: requiredEnv("PINELABS_CLIENT_ID"),
      client_secret: requiredEnv("PINELABS_CLIENT_SECRET"),
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  const body = await parseJsonOrText(res);
  if (!res.ok) {
    throw new Error(errorMessage("Pine Labs auth", res.status, body));
  }

  const data = asObject(body);
  const accessToken = data.access_token;
  if (typeof accessToken !== "string" || !accessToken) {
    throw new Error("Pine Labs auth response did not include access_token");
  }

  return accessToken;
}

export interface CreateOrderInput {
  merchantTxnId: string;
  amountPaisa: number;
  orderDesc: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  returnUrl: string;
  failureReturnUrl?: string;
}

export interface CreateOrderResult {
  pinelabsOrderId: string;
  checkoutUrl: string;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: nameParts[0] || "Customer",
    lastName: nameParts.slice(1).join(" ") || "Name",
  };
}

function checkoutUrlFromResponse(data: Record<string, unknown>): string | null {
  const nested = asObject(data.data);
  const redirectUrl =
    data.redirect_url ??
    data.checkout_url ??
    data.challenge_url ??
    nested.redirect_url ??
    nested.checkout_url ??
    nested.challenge_url;

  if (typeof redirectUrl === "string" && redirectUrl.length > 0) {
    return redirectUrl;
  }

  const token = data.token ?? data.order_token ?? nested.token ?? nested.order_token;
  const checkoutBase = process.env.PINELABS_CHECKOUT_BASE?.replace(/\/+$/, "");
  if (typeof token === "string" && token.length > 0 && checkoutBase) {
    return `${checkoutBase}/checkout?token=${encodeURIComponent(token)}`;
  }

  return null;
}

export async function createPinelabsOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const token = await getAccessToken();
  const { firstName, lastName } = splitName(input.customerName);
  const cleanPhone = input.customerPhone.replace(/\D/g, "").slice(-10);

  const address = {
    address1: input.street.slice(0, 100),
    address2: "",
    address3: "",
    pincode: input.zipCode,
    city: input.city.slice(0, 50),
    state: input.state.slice(0, 50),
    country: "INDIA",
    full_name: input.customerName.slice(0, 50),
    address_type: "HOME",
    address_category: "billing",
  };

  const payload = {
    merchant_order_reference: input.merchantTxnId,
    order_amount: {
      value: input.amountPaisa,
      currency: "INR",
    },
    pre_auth: false,
    allowed_payment_methods: ["CARD", "UPI", "NETBANKING", "WALLET", "CREDIT_EMI", "DEBIT_EMI"],
    notes: input.orderDesc,
    callback_url: input.returnUrl,
    failure_callback_url: input.failureReturnUrl ?? input.returnUrl,
    purchase_details: {
      customer: {
        email_id: input.customerEmail,
        first_name: firstName.slice(0, 50),
        last_name: lastName.slice(0, 50),
        customer_id: input.merchantTxnId.slice(0, 19),
        mobile_number: cleanPhone,
        country_code: "91",
        billing_address: address,
        shipping_address: {
          ...address,
          address_category: "shipping",
        },
      },
      merchant_metadata: {
        source: "priyamobilepark-web",
        merchant_order_reference: input.merchantTxnId,
      },
    },
  };

  const res = await fetch(`${apiBase()}${pathFromEnv("PINELABS_CHECKOUT_PATH", DEFAULT_CHECKOUT_PATH)}`, {
    method: "POST",
    headers: requestHeaders(token),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await parseJsonOrText(res);
  if (!res.ok) {
    throw new Error(errorMessage("Pine Labs checkout creation", res.status, body));
  }

  const data = asObject(body);
  const nested = asObject(data.data);
  const pinelabsOrderId =
    data.order_id ??
    data.plural_order_id ??
    nested.order_id ??
    nested.plural_order_id ??
    input.merchantTxnId;
  const checkoutUrl = checkoutUrlFromResponse(data);

  if (typeof pinelabsOrderId !== "string" || !pinelabsOrderId) {
    throw new Error("Pine Labs checkout response did not include order_id");
  }
  if (!checkoutUrl) {
    throw new Error("Pine Labs checkout response did not include redirect_url");
  }

  return { pinelabsOrderId, checkoutUrl };
}

export function normalisePinelabsStatus(raw: unknown): PinelabsStatus {
  const s = String(raw ?? "").trim().toLowerCase();
  if (["4", "success", "captured", "processed", "authorized", "paid"].includes(s)) {
    return "paid";
  }
  if (["5", "failed", "failure", "cancelled", "canceled"].includes(s)) {
    return "failed";
  }
  return "pending";
}

export function extractPinelabsStatus(payload: unknown): PinelabsStatus {
  const body = asObject(payload);
  const data = asObject(body.data);
  const firstPayment = Array.isArray(data.payments) ? asObject(data.payments[0]) : {};
  return normalisePinelabsStatus(
    body.transaction_status ??
      body.payment_status ??
      body.status ??
      data.transaction_status ??
      data.payment_status ??
      data.status ??
      firstPayment.status
  );
}

export async function getPinelabsOrderStatus(pinelabsOrderId: string) {
  const token = await getAccessToken();
  const path = pathFromEnv("PINELABS_STATUS_PATH", DEFAULT_STATUS_PATH);
  const res = await fetch(`${apiBase()}${path}/${encodeURIComponent(pinelabsOrderId)}`, {
    headers: requestHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return parseJsonOrText(res);
}
