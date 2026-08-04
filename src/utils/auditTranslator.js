export const translateAuditDescription = (desc, t) => {
  if (!desc) return '—';

  try {
    // 1. Exact matches
    if (desc === "User logged out.") return t('audit.desc_user_logged_out');
    
    // 2. Auth matches
    if (desc.startsWith("User logged in: ")) {
      return t('audit.desc_user_logged_in', { email: desc.replace("User logged in: ", "") });
    }
    if (desc.startsWith("Landlord registered and logged in: ")) {
      return t('audit.desc_landlord_registered', { email: desc.replace("Landlord registered and logged in: ", "") });
    }
    if (desc.startsWith("Password changed for userId=")) {
      return t('audit.desc_password_changed', { id: desc.replace("Password changed for userId=", "") });
    }
    
    // 3. Property matches
    if (desc.startsWith("Property created: ")) {
      return t('audit.desc_property_created', { name: desc.replace("Property created: ", "") });
    }
    if (desc.startsWith("Property updated: ")) {
      return t('audit.desc_property_updated', { name: desc.replace("Property updated: ", "") });
    }
    if (desc.startsWith("Property soft-deleted: ")) {
      return t('audit.desc_property_deleted', { name: desc.replace("Property soft-deleted: ", "") });
    }

    // 4. Unit matches
    if (desc.startsWith("Unit renamed to: ")) {
      return t('audit.desc_unit_renamed', { name: desc.replace("Unit renamed to: ", "") });
    }
    if (desc.startsWith("Unit soft-deleted: ")) {
      return t('audit.desc_unit_deleted', { name: desc.replace("Unit soft-deleted: ", "") });
    }
    const unitMaintenanceMatch = desc.match(/^Unit (.+) set to MAINTENANCE\.$/);
    if (unitMaintenanceMatch) {
      return t('audit.desc_unit_maintenance', { name: unitMaintenanceMatch[1] });
    }
    const unitAvailableMatch = desc.match(/^Unit (.+) set to AVAILABLE\.$/);
    if (unitAvailableMatch) {
      return t('audit.desc_unit_available', { name: unitAvailableMatch[1] });
    }
    if (desc.startsWith("Bulk created ")) {
      // Simplification since it has multiple dynamic parts
      return t('audit.desc_bulk_units_created');
    }

    // 5. Payment matches
    if (desc.startsWith("Payment uploaded for month=")) {
      return t('audit.desc_payment_uploaded');
    }
    if (desc.startsWith("Payment approved.")) {
      return t('audit.desc_payment_approved');
    }
    if (desc.startsWith("Payment rejected.")) {
      return t('audit.desc_payment_rejected');
    }

    // 6. Admin matches
    if (desc.startsWith("Admin account created: ")) {
      return t('audit.desc_admin_created', { email: desc.replace("Admin account created: ", "") });
    }
    if (desc.startsWith("Admin account updated: ")) {
      return t('audit.desc_admin_updated', { email: desc.replace("Admin account updated: ", "") });
    }
    if (desc.startsWith("Admin account suspended: ")) {
      return t('audit.desc_admin_suspended', { email: desc.replace("Admin account suspended: ", "") });
    }
    if (desc.startsWith("Admin account activated: ")) {
      return t('audit.desc_admin_activated', { email: desc.replace("Admin account activated: ", "") });
    }
    if (desc.startsWith("Admin account deleted (soft): ")) {
      return t('audit.desc_admin_deleted', { email: desc.replace("Admin account deleted (soft): ", "") });
    }

    // 7. Tenant / User matches
    if (desc.startsWith("Temporary password issued to: ")) {
      return t('audit.desc_temp_password_issued', { email: desc.replace("Temporary password issued to: ", "") });
    }
    if (desc.startsWith("New tenant account created: ")) {
      return t('audit.desc_tenant_created', { email: desc.replace("New tenant account created: ", "") });
    }
    if (desc.startsWith("Tenant contact info updated for userId=")) {
      return t('audit.desc_tenant_updated', { id: desc.replace("Tenant contact info updated for userId=", "") });
    }
    if (desc.startsWith("Tenant soft-deleted: userId=")) {
      return t('audit.desc_tenant_deleted', { id: desc.replace("Tenant soft-deleted: userId=", "") });
    }

    // 8. Lease matches
    const leaseCreatedMatch = desc.match(/^Lease created for tenant userId=(.+) in unit=(.+), rent=(.+)$/);
    if (leaseCreatedMatch) {
      return t('audit.desc_lease_created', { userId: leaseCreatedMatch[1], unit: leaseCreatedMatch[2], rent: leaseCreatedMatch[3] });
    }
    const leaseTerminatedMatch = desc.match(/^Lease terminated for unit=(.+)\. Reason: (.*)$/);
    if (leaseTerminatedMatch) {
      return t('audit.desc_lease_terminated', { unit: leaseTerminatedMatch[1], reason: leaseTerminatedMatch[2] });
    }

    // Fallback: pass to t() directly
    return t(desc, { defaultValue: desc });
  } catch (err) {
    return desc;
  }
};
