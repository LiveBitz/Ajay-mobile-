export const PRESET_COLORS = [
  { name: "Midnight Black", hex: "#121212" },
  { name: "Starlight White", hex: "#F5F5F0" },
  { name: "Titanium Grey", hex: "#8E8E93" },
  { name: "Arctic Silver", hex: "#C0C0C0" },
  { name: "Pacific Blue", hex: "#0070BB" },
  { name: "Deep Purple", hex: "#4E3C58" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Graphite", hex: "#41424C" },
  { name: "Emerald Green", hex: "#046307" },
  { name: "Sunset Orange", hex: "#FD5E28" },
  { name: "Natural Titanium", hex: "#BEBEBE" },
  { name: "Copper", hex: "#B87333" },
];

/**
 * Gets the hex code for a color name.
 * If the input is already a hex code (starts with #), returns it directly.
 * Otherwise, searches the preset list or returns the input as lowercase.
 */
export const getColorHex = (name: string): string => {
  if (name.startsWith("#")) return name;
  const preset = PRESET_COLORS.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  return preset?.hex ?? name.toLowerCase();
};

/**
 * Determines if a color is "light" to help decide which text/icon color to use over it.
 */
export const isLightColor = (name: string): boolean => {
  const n = name.toLowerCase();
  return ["white", "silver", "starlight", "arctic", "cream", "beige"].some((w) =>
    n.includes(w)
  ) || n === "#ffffff" || n === "#f5f5f0";
};
