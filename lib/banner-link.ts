export function normalizeBannerLink(rawLink: unknown): string {
  if (typeof rawLink !== "string") return "/";

  const trimmed = rawLink.trim();
  if (!trimmed) return "/";

  // Only allow relative paths (no external redirects via banner links)
  if (trimmed.startsWith("/")) {
    // Strip any protocol-relative or double-slash attempts (e.g. //evil.com)
    return `/${trimmed.replace(/^\/+/, "")}`;
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  // Reject absolute URLs (http/https/mailto/tel) — banners link within the store only
  return `/${trimmed.replace(/^\/+/, "")}`;
}

function toTitleCaseFromSlug(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getBannerLinkTag(rawLink: unknown): string {
  const href = normalizeBannerLink(rawLink);

  const cleanPath = href.split("?")[0].split("#")[0] || "/";
  if (cleanPath === "/") return "Home";

  const parts = cleanPath.split("/").filter(Boolean);
  const first = parts[0] || "";
  const second = parts[1] || "";

  if (first === "category") {
    return second ? toTitleCaseFromSlug(second) : "Categories";
  }

  if (first === "product") {
    return second ? "View Product" : "Products";
  }

  if (first === "wishlist") return "Wishlist";
  if (first === "cart") return "Cart";
  if (first === "checkout") return "Checkout";
  if (first === "profile") return "Profile";
  if (first === "login") return "Login";
  if (first === "signup") return "Sign Up";

  return toTitleCaseFromSlug(second || first || "Shop Now");
}
