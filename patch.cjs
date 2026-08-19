const fs = require('fs');

// Update PaymentRepository.java
const repoPath = 'D:\\Spring_Boot projects\\RentCollector\\rent-collector-backend\\src\\main\\java\\com\\rentcollector\\repository\\PaymentRepository.java';
let repoContent = fs.readFileSync(repoPath, 'utf-8');

const newMethod = '    List<Payment> findByLeaseIdInAndStatusIn(List<Long> leaseIds, List<PaymentStatus> statuses);\n';
if (!repoContent.includes('findByLeaseIdInAndStatusIn')) {
    repoContent = repoContent.replace(
        'boolean existsByLeaseIdAndPaymentMonthAndStatus(Long leaseId, String paymentMonth, PaymentStatus status);',
        'boolean existsByLeaseIdAndPaymentMonthAndStatus(Long leaseId, String paymentMonth, PaymentStatus status);\n' + newMethod
    );
    fs.writeFileSync(repoPath, repoContent, 'utf-8');
}


// Update ReportService.java
const servicePath = 'D:\\Spring_Boot projects\\RentCollector\\rent-collector-backend\\src\\main\\java\\com\\rentcollector\\service\\ReportService.java';
let serviceContent = fs.readFileSync(servicePath, 'utf-8');

const oldLoop = `        long unpaidCount = 0;
        long dueSoonCount = 0;
        java.time.LocalDate today = java.time.LocalDate.now();

        for (Lease lease : activeLeases) {
            Payment latestPayment = paymentRepository.findTopByLeaseIdAndStatusInOrderByPaymentMonthDesc(
                    lease.getId(), List.of(PaymentStatus.APPROVED, PaymentStatus.PENDING));

            YearMonth targetMonth;
            if (latestPayment == null) {
                targetMonth = YearMonth.from(lease.getStartDate()).plusMonths(1);
            } else {
                targetMonth = YearMonth.parse(latestPayment.getPaymentMonth()).plusMonths(1);
            }

            int dueDay = Math.min(lease.getStartDate().getDayOfMonth(), targetMonth.lengthOfMonth());
            java.time.LocalDate dueDate = targetMonth.atDay(dueDay);

            if (today.isAfter(dueDate)) {
                unpaidCount++;
            } else {
                long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(today, dueDate);
                if (daysUntilDue >= 0 && daysUntilDue <= 3) {
                    dueSoonCount++;
                }
            }
        }`;

const newLoop = `        long unpaidCount = 0;
        long dueSoonCount = 0;
        java.time.LocalDate today = java.time.LocalDate.now();

        List<Long> leaseIds = activeLeases.stream().map(Lease::getId).toList();
        
        Map<Long, Payment> latestPaymentMap = new java.util.HashMap<>();
        if (!leaseIds.isEmpty()) {
            List<Payment> relevantPayments = paymentRepository.findByLeaseIdInAndStatusIn(leaseIds, List.of(PaymentStatus.APPROVED, PaymentStatus.PENDING));
            for (Payment p : relevantPayments) {
                Payment existing = latestPaymentMap.get(p.getLeaseId());
                if (existing == null || p.getPaymentMonth().compareTo(existing.getPaymentMonth()) > 0) {
                    latestPaymentMap.put(p.getLeaseId(), p);
                }
            }
        }

        for (Lease lease : activeLeases) {
            Payment latestPayment = latestPaymentMap.get(lease.getId());

            YearMonth targetMonth;
            if (latestPayment == null) {
                targetMonth = YearMonth.from(lease.getStartDate()).plusMonths(1);
            } else {
                targetMonth = YearMonth.parse(latestPayment.getPaymentMonth()).plusMonths(1);
            }

            int dueDay = Math.min(lease.getStartDate().getDayOfMonth(), targetMonth.lengthOfMonth());
            java.time.LocalDate dueDate = targetMonth.atDay(dueDay);

            if (today.isAfter(dueDate)) {
                unpaidCount++;
            } else {
                long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(today, dueDate);
                if (daysUntilDue >= 0 && daysUntilDue <= 3) {
                    dueSoonCount++;
                }
            }
        }`;

if (serviceContent.includes(oldLoop)) {
    serviceContent = serviceContent.replace(oldLoop, newLoop);
    fs.writeFileSync(servicePath, serviceContent, 'utf-8');
    console.log("Updated ReportService.java successfully.");
} else {
    console.log("Could not find the target code in ReportService.java!");
}
