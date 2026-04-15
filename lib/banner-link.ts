export function normalizeBannerLink(rawLink: unknown): string {
  if (typeof rawLink !== "string") return "/";

  const trimmed = rawLink.trim();
  if (!trimmed) return "/";

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

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

  if (href.startsWith("mailto:")) return "Email Us";
  if (href.startsWith("tel:")) return "Call Now";

  if (/^https?:\/\//i.test(href)) {
    try {
      const url = new URL(href);
      const host = url.hostname.replace(/^www\./i, "");
      return toTitleCaseFromSlug(host.split(".")[0] || "Visit Site");
    } catch {
      return "Visit Site";
    }
  }

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
