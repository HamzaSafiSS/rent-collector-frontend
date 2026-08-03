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
files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace <Badge label={r.status} />
    const replacement = "<Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} />";
    content = content.replaceAll('<Badge label={r.status} />', replacement);
    
    // Replace <Badge label={p.status} />
    const pReplacement = "<Badge statusKey={p.status} label={p.status ? t(`common.status${p.status.charAt(0) + p.status.slice(1).toLowerCase()}`, { defaultValue: p.status }) : ''} />";
    content = content.replaceAll('<Badge label={p.status} />', pReplacement);
    
    // Replace <Badge label={adminData.status} />
    const adminDataReplacement = "<Badge statusKey={adminData.status} label={adminData.status ? t(`common.status${adminData.status.charAt(0) + adminData.status.slice(1).toLowerCase()}`, { defaultValue: adminData.status }) : ''} />";
    content = content.replaceAll('<Badge label={adminData.status} />', adminDataReplacement);

    // Replace <Badge label={payment.status} />
    const paymentReplacement = "<Badge statusKey={payment.status} label={payment.status ? t(`common.status${payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}`, { defaultValue: payment.status }) : ''} />";
    content = content.replaceAll('<Badge label={payment.status} />', paymentReplacement);

    fs.writeFileSync(p, content);
  }
});
console.log('done fixing remaining badges');
