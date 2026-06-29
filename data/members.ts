export interface FamilyMember {
  fullName: string;
  relationship: string;
  age: number;
}

export interface MemberRecord {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED" | "SUSPENDED";
  validUntil: string;
  qrCodeUrl: string;
  familyMembers: FamilyMember[];
  joinedDate: string;
  membershipType: "Life" | "Annual" | "Patron";
}

export const mockMembers: MemberRecord[] = [
  {
    id: "mem-1",
    membershipNumber: "MEM-2026-0001",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@example.com",
    phone: "+91 98220 12345",
    status: "ACTIVE",
    joinedDate: "2024-01-15",
    validUntil: "2027-01-15",
    membershipType: "Annual",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEM-2026-0001",
    familyMembers: [
      { fullName: "Sunita Kumar", relationship: "Spouse", age: 42 },
      { fullName: "Aarav Kumar", relationship: "Son", age: 14 }
    ]
  },
  {
    id: "mem-2",
    membershipNumber: "MEM-2026-0002",
    firstName: "Harish",
    lastName: "Mehta",
    email: "harish.mehta@example.com",
    phone: "+91 99110 54321",
    status: "ACTIVE",
    joinedDate: "2018-05-20",
    validUntil: "2099-12-31",
    membershipType: "Life",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEM-2026-0002",
    familyMembers: [
      { fullName: "Geeta Mehta", relationship: "Spouse", age: 58 },
      { fullName: "Nikhil Mehta", relationship: "Son", age: 28 },
      { fullName: "Rohan Mehta", relationship: "Son", age: 25 }
    ]
  },
  {
    id: "mem-3",
    membershipNumber: "MEM-2026-0003",
    firstName: "Sneha",
    lastName: "Desai",
    email: "sneha.desai@example.com",
    phone: "+91 97660 99887",
    status: "PENDING",
    joinedDate: "2026-06-20",
    validUntil: "2027-06-20",
    membershipType: "Annual",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEM-2026-0003",
    familyMembers: [
      { fullName: "Vijay Desai", relationship: "Spouse", age: 31 }
    ]
  },
  {
    id: "mem-4",
    membershipNumber: "MEM-2026-0004",
    firstName: "Amitabh",
    lastName: "Banerjee",
    email: "amitabh.b@example.com",
    phone: "+91 93330 11223",
    status: "EXPIRED",
    joinedDate: "2023-06-01",
    validUntil: "2026-06-01",
    membershipType: "Annual",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEM-2026-0004",
    familyMembers: []
  },
  {
    id: "mem-5",
    membershipNumber: "MEM-2026-0005",
    firstName: "Kiran",
    lastName: "Chawla",
    email: "kiran.chawla@example.com",
    phone: "+91 94440 33445",
    status: "ACTIVE",
    joinedDate: "2020-10-10",
    validUntil: "2099-12-31",
    membershipType: "Patron",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEM-2026-0005",
    familyMembers: [
      { fullName: "Manju Chawla", relationship: "Spouse", age: 52 },
      { fullName: "Priya Chawla", relationship: "Daughter", age: 23 }
    ]
  }
];
