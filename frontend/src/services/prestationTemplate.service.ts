/**
 * Compatibility layer for prestationTemplate.service -> tarification.service migration
 * This file exports the same functions as prestationTemplate but uses the new API backend
 */

// Re-export everything from the new tarification service
export {
  TarificationService,
  type TarificationPackage,
  type PackageItem,
  type PackageWithItems,
  getPackages,
  getActivePackages,
  getPackageWithItems,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  getPackageItems,
  createPackageItem,
  updatePackageItem,
  deletePackageItem,
  copyPackageToCustomer,
  copyAllPackagesToCustomer
} from './tarification.service';
