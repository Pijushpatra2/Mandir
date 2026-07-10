export interface Coupon {
  code: string;
  discountType: "PERCENT" | "FIXED";
  value: number;
  minSpend: number;
  active: boolean;
  description: string;
}

export const mockCoupons: Coupon[] = [
  {
    code: "DEVOTION10",
    discountType: "PERCENT",
    value: 10,
    minSpend: 500,
    active: true,
    description: "10% OFF on purchases above UGX 500",
  },
  {
    code: "FESTIVE20",
    discountType: "PERCENT",
    value: 20,
    minSpend: 2000,
    active: true,
    description: "20% OFF on purchases above UGX 2000",
  },
  {
    code: "WELCOME50",
    discountType: "FIXED",
    value: 150,
    minSpend: 1000,
    active: true,
    description: "Flat UGX 150 OFF on purchases above UGX 1000",
  },
  {
    code: "BHAKTI300",
    discountType: "FIXED",
    value: 300,
    minSpend: 3000,
    active: true,
    description: "Flat UGX 300 OFF on orders above UGX 3000",
  },
  {
    code: "SACRED5",
    discountType: "PERCENT",
    value: 5,
    minSpend: 100,
    active: true,
    description: "5% OFF on any order",
  }
];
