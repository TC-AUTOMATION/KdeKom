// A tarification package is a tariff plan (B2B, B2C, etc.)
export interface TarificationPackage {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  items?: PackageItem[]; // Loaded separately
}

// Individual prestation within a tariff plan
export interface PackageItem {
  id: string;
  packageId: string;
  name: string;
  description?: string;
  defaultPrice: number;
  taxRate: number;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TarificationPackageInput {
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PackageItemInput {
  name: string;
  description?: string;
  defaultPrice: number;
  taxRate: number;
  sortOrder?: number;
}
