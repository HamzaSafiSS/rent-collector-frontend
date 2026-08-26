/**
 * Calculates payment status (unpaid, due soon, due date, target month) for a lease given its payment history.
 *
 * @param {Object} lease The lease object
 * @param {Array} payments List of payments
 * @param {Date} [currentDate=new Date()] Optional reference date
 * @returns {{ isUnpaid: boolean, isDueSoon: boolean, targetMonth: string, dueDate: Date|null, diffDays: number|null }}
 */
export function getLeasePaymentStatus(lease, payments = [], currentDate = new Date()) {
  if (!lease || !lease.startDate) {
    return { isUnpaid: false, isDueSoon: false, targetMonth: '', dueDate: null, diffDays: null };
  }

  const leasePayments = payments.filter(
    (p) => String(p.leaseId) === String(lease.id) && ['APPROVED', 'PENDING'].includes(p.status)
  );
  leasePayments.sort((a, b) => (b.paymentMonth || '').localeCompare(a.paymentMonth || ''));

  const latestPayment = leasePayments[0];
  const sourceMonthStr = !latestPayment
    ? lease.startDate.substring(0, 7)
    : latestPayment.paymentMonth;

  if (!sourceMonthStr || !sourceMonthStr.includes('-')) {
    return { isUnpaid: false, isDueSoon: false, targetMonth: '', dueDate: null, diffDays: null };
  }

  const parts = sourceMonthStr.split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  m += 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  const targetYearMonthStr = `${y}-${String(m).padStart(2, '0')}`;

  const targetParts = targetYearMonthStr.split('-');
  const targetYear = parseInt(targetParts[0], 10);
  const targetMonth = parseInt(targetParts[1], 10) - 1;

  const startDateObj = new Date(lease.startDate);
  const startDay = isNaN(startDateObj.getDate()) ? 1 : startDateObj.getDate();

  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const dueDay = Math.min(startDay, lastDayOfTargetMonth);

  const dueDateObj = new Date(targetYear, targetMonth, dueDay);
  dueDateObj.setHours(23, 59, 59, 999);

  if (currentDate > dueDateObj) {
    return {
      isUnpaid: true,
      isDueSoon: false,
      targetMonth: targetYearMonthStr,
      dueDate: dueDateObj,
      diffDays: null,
    };
  }

  const diffTime = dueDateObj.getTime() - currentDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isDueSoon = diffDays >= 0 && diffDays <= 3;

  return {
    isUnpaid: false,
    isDueSoon,
    targetMonth: targetYearMonthStr,
    dueDate: dueDateObj,
    diffDays,
  };
}
