const fs = require('fs');

const files = [
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\tenant\\PaymentHistoryPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\super-admin\\ManageAdminsPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\super-admin\\AuditLogPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\landlord\\TenantsPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\landlord\\PropertyDetailPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\landlord\\PropertiesPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\landlord\\PaymentsPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\landlord\\LeasesPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\landlord\\DueSoonPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\admin\\ManageTenantsPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\admin\\ManageLandlordsPage.jsx",
  "d:\\Spring_Boot projects\\rent-collector-frontend\\src\\pages\\admin\\AuditLogPage.jsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/(\n\s*)\}, (\[.*?), t\]\);/g, '$1// eslint-disable-next-line react-hooks/exhaustive-deps$1}, $2]);');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log("Updated", file);
  }
}
