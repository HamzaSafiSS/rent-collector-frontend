const fs = require('fs');
const path = require('path');
const files = [
  'src/pages/tenant/PaymentHistoryPage.jsx',
  'src/pages/super-admin/ManageAdminsPage.jsx',
  'src/pages/landlord/PaymentsPage.jsx',
  'src/pages/landlord/LeasesPage.jsx',
  'src/pages/admin/LeaseDashboardViewPage.jsx',
  'src/pages/admin/ManageTenantsPage.jsx',
  'src/pages/admin/PropertyDashboardViewPage.jsx',
  'src/pages/admin/TenantDashboardViewPage.jsx',
  'src/pages/admin/UnitDashboardViewPage.jsx',
  'src/pages/admin/ManageLandlordsPage.jsx',
  'src/pages/admin/LandlordDashboardViewPage.jsx',
  'src/pages/admin/AdminDashboardViewPage.jsx',
  'src/components/tenant/TenantTable.jsx',
  'src/components/payment/ReviewModal.jsx',
  'src/components/payment/PaymentDetailModal.jsx'
];

let filesMissingT = [];

files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Check if 'useTranslation' is imported
    if (!content.includes('useTranslation')) {
      filesMissingT.push(f);
      
      // Inject import
      content = "import { useTranslation } from 'react-i18next';\n" + content;
      
      // Inject const { t } = useTranslation(); at the start of the component
      // Find export default function XYZ() {
      content = content.replace(/(export default function \w+\([^)]*\)\s*\{)/, "$1\n  const { t } = useTranslation();\n");
      fs.writeFileSync(p, content);
    }
  }
});
console.log("Fixed missing translations in:", filesMissingT);
