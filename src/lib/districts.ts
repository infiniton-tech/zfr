export const BANGLADESH_DISTRICTS = [
  "Dhaka",
  "Bagerhat",
  "Bandarban",
  "Barguna",
  "Barishal",
  "Bhola",
  "Bogura",
  "Brahmanbaria",
  "Chandpur",
  "Chattogram",
  "Chuadanga",
  "Cox's Bazar",
  "Cumilla",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gaibandha",
  "Gazipur",
  "Gopalganj",
  "Habiganj",
  "Jamalpur",
  "Jashore (Jessore)",
  "Jhalokati",
  "Jhenaidah",
  "Joypurhat",
  "Khagrachhari",
  "Khulna",
  "Kishoreganj",
  "Kurigram",
  "Kushtia",
  "Lakshmipur",
  "Lalmonirhat",
  "Madaripur",
  "Magura",
  "Manikganj",
  "Meherpur",
  "Moulvibazar",
  "Munshiganj",
  "Mymensingh",
  "Naogaon",
  "Narail",
  "Narayanganj",
  "Narsingdi",
  "Natore",
  "Nawabganj (Chapainawabganj)",
  "Netrokona",
  "Nilphamari",
  "Noakhali",
  "Pabna",
  "Panchagarh",
  "Patuakhali",
  "Pirojpur",
  "Rajbari",
  "Rajshahi",
  "Rangamati",
  "Rangpur",
  "Satkhira",
  "Shariatpur",
  "Sherpur",
  "Sirajganj",
  "Sunamganj",
  "Sylhet",
  "Tangail",
  "Thakurgaon",
] as const;

/**
 * Calculates shipping cost based on District / Zilla in Bangladesh:
 * - Inside Dhaka: 60 BDT
 * - Outside Dhaka: 120 BDT
 */
export function getShippingCost(districtOrCity: string): number {
  const clean = (districtOrCity || "").trim().toLowerCase();
  if (clean === "dhaka" || clean.startsWith("dhaka")) {
    return 60; // 60 BDT Inside Dhaka
  }
  return 120; // 120 BDT Outside Dhaka
}

export function getShippingLocationLabel(districtOrCity: string): string {
  const cost = getShippingCost(districtOrCity);
  return cost === 60 ? "Inside Dhaka (৳60)" : "Outside Dhaka (৳120)";
}
