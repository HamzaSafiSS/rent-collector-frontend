const fs = require('fs');
const glob = require('glob');
const path = require('path');
const files = [
  'src/pages/super-admin/ViewListPage.jsx',
  'src/pages/admin/ViewListPage.jsx',
  'src/pages/super-admin/ManageAdminsPage.jsx',
  'src/pages/admin/ManageTenantsPage.jsx',
  'src/pages/admin/ManageLandlordsPage.jsx',
  'src/pages/landlord/PaymentsPage.jsx',
  'src/pages/landlord/LeasesPage.jsx',
  'src/components/tenant/TenantTable.jsx',
  'src/pages/admin/LeaseDashboardViewPage.jsx',
  'src/pages/admin/PropertyDashboardViewPage.jsx',
  'src/pages/admin/TenantDashboardViewPage.jsx',
  'src/pages/admin/UnitDashboardViewPage.jsx',
  'src/pages/admin/LandlordDashboardViewPage.jsx',
  'src/pages/admin/AdminDashboardViewPage.jsx',
  'src/components/payment/ReviewModal.jsx',
  'src/components/payment/PaymentDetailModal.jsx'
];
files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // Replace <Badge label={r.status} />
    content = content.replace(/<Badge label=\{r\.status\} \/>/g, 
      '<Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : \\'\\'} />');
    
    // Replace <Badge label={adminData.status} />
    content = content.replace(/<Badge label=\{adminData\.status\} \/>/g, 
      '<Badge statusKey={adminData.status} label={adminData.status ? t(`common.status${adminData.status.charAt(0) + adminData.status.slice(1).toLowerCase()}`, { defaultValue: adminData.status }) : \\'\\'} />');

    // Replace <Badge label={payment.status} />
    content = content.replace(/<Badge label=\{payment\.status\} \/>/g, 
      '<Badge statusKey={payment.status} label={payment.status ? t(`common.status${payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}`, { defaultValue: payment.status }) : \\'\\'} />');
    
    fs.writeFileSync(p, content);
  }
});
