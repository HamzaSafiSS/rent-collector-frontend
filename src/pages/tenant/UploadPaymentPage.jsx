import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, FileUpload, Input, Button, Alert } from '../../components/common';
import { paymentApi } from '../../api/paymentApi';
import { leaseApi } from '../../api/leaseApi';
import { useToast } from '../../context/ToastContext';


export default function UploadPaymentPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [leases, setLeases]     = useState([]);
  const [leaseId, setLeaseId]   = useState('');
  const [amount, setAmount]     = useState('');
  const [file, setFile]         = useState(null);
  
  const [paymentInfo, setPaymentInfo] = useState(null);

  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');

  // ── Month/Year picker state ───────────────────────────────────────────────
  const [paymentMonth, setPaymentMonth] = useState('');

  const selectedLease = leases.find((l) => String(l.id) === String(leaseId));

  useEffect(() => {
    leaseApi.getMyLeases(0, 50, 'ACTIVE')
      .then((r) => {
        const active = r.data?.data?.content || [];
        setLeases(active);
        if (active.length === 1) {
            setLeaseId(String(active[0].id));
            fetchPaymentInfo(active[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const fetchPaymentInfo = async (id) => {
      if (!id) {
          setPaymentInfo(null);
          return;
      }
      try {
          const res = await paymentApi.getPaymentInfoForLease(id);
          setPaymentInfo(res.data?.data);
      } catch (err) {
          setPaymentInfo(null);
      }
  };

  function validate() {
    const errs = {};
    if (!leaseId)        errs.leaseId = t('validation.selectLeaseRequired');
    if (!paymentMonth)   errs.month = t('validation.monthAndYearRequired');
    else if (selectedLease && paymentMonth < selectedLease.startDate.substring(0, 7)) {
       errs.month = t('payments.invalidMonthBeforeLease', 'Payment month cannot be before lease start date');
    }
    if (!amount || Number(amount) <= 0) errs.amount = t('validation.validAmountRequired');
    if (!file)           errs.file    = t('validation.fileRequired');
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(''); setSuccess('');

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file',          file);
      formData.append('paymentMonth',  paymentMonth);
      formData.append('amount',        amount);
      formData.append('leaseId',       leaseId);

      await paymentApi.uploadPayment(formData);
      setSuccess(t('payments.uploadSuccessDesc'));
      toast.success(t('payments.uploadSuccessToast'));
      setAmount(''); setFile(null); setErrors({});
      setPaymentMonth('');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('already paid')) {
        setApiError(t('payments.alreadyPaidError', 'Payment for this month and year already paid. Please check the date.'));
      } else {
        setApiError(msg || t('payments.failedUploadPayment'));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(setter, field) {
    return (e) => {
      setter(e.target.value);
      if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
    };
  }

  function handleLeaseChange(e) {
    const newLeaseId = e.target.value;
    setLeaseId(newLeaseId);
    fetchPaymentInfo(newLeaseId);
    if (errors.leaseId) setErrors((p) => ({ ...p, leaseId: '' }));

    const newLease = leases.find((l) => String(l.id) === String(newLeaseId));
    if (newLease?.startDate && paymentMonth && paymentMonth < newLease.startDate.substring(0, 7)) {
      setPaymentMonth('');
    }
  }

  const selectClass =
    'w-full px-3 py-2 text-sm bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50';

  return (
    <>
      <PageHeader title={t('payments.uploadPaymentTitle')} subtitle={t('payments.uploadPaymentSubtitle')} />

      <div className="max-w-lg">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl p-6">
          {apiError && <Alert type="error"   message={apiError}  className="mb-5" />}
          {success  && <Alert type="success" message={success}   className="mb-5" />}

          {paymentInfo && paymentInfo.length > 0 && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <h3 className="text-emerald-400 font-semibold mb-3">{t('payments.instructionsTitle')}</h3>
              <div className="space-y-4">
                {paymentInfo.map(info => (
                  <div key={info.id} className="text-sm text-slate-700 dark:text-slate-300 border-l-2 border-emerald-500/50 pl-3">
                    <p className="font-semibold text-slate-900 dark:text-slate-200 mb-1">{info.paymentType === 'BANK' ? t('payments.bankTransfer') : t('payments.digitalWallet')}</p>
                    {info.institutionName && <p><span className="text-slate-500 dark:text-slate-400">{info.paymentType === 'BANK' ? t('payments.bank') : t('payments.wallet')}:</span> {info.institutionName}</p>}
                    {info.accountHolderName && <p><span className="text-slate-500 dark:text-slate-400">{t('payments.name')}:</span> {info.accountHolderName}</p>}
                    {info.accountNumber && <p><span className="text-slate-500 dark:text-slate-400">{t('payments.account')}:</span> <span className="font-mono text-emerald-600 dark:text-emerald-300">{info.accountNumber}</span></p>}
                    {info.phoneNumber && <p><span className="text-slate-500 dark:text-slate-400">{t('payments.phone')}:</span> {info.phoneNumber}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Lease selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span className="text-red-500 mr-1" aria-hidden="true">*</span>{t('payments.selectLeaseLabel')}
              </label>
              <select
                value={leaseId}
                onChange={handleLeaseChange}
                disabled={loading || leases.length === 1}
                className={selectClass}
              >
                <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100" value="">{t('payments.chooseLease')}</option>
                {leases.map((l) => (
                  <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100" key={l.id} value={l.id}>
                    {l.propertyName} — {t('units.unit')} {l.unitNumber} (ETB {Number(l.monthlyRent).toLocaleString()}/{t('payments.mo')})
                  </option>
                ))}
              </select>
              {errors.leaseId && <p className="mt-1 text-xs text-red-400">{errors.leaseId}</p>}
              {leases.length === 0 && <p className="mt-1 text-xs text-yellow-600">{t('payments.noActiveLeasesFound')}</p>}
            </div>

            {/* Payment month */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span className="text-red-500 mr-1" aria-hidden="true">*</span>
                {t('payments.paymentMonthLabel')}
              </label>
              <input
                type="month"
                value={paymentMonth}
                onChange={(e) => {
                  setPaymentMonth(e.target.value);
                  if (errors.month) setErrors(p => ({ ...p, month: '' }));
                }}
                disabled={loading}
                className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/30 disabled:text-slate-400 dark:disabled:text-slate-500 transition-all duration-200"
              />
              {errors.month && <p className="mt-1 text-xs text-red-400">{errors.month}</p>}
            </div>

            {/* Amount */}
            <Input
              label={t('payments.amountETBLabel')}
              type="number"
              min="1"
              value={amount}
              onChange={handleChange(setAmount, 'amount')}
              error={errors.amount}
              disabled={loading}
              placeholder={t('payments.amountPlaceholder')}
              required
            />

            <div>
              <FileUpload
                label={t('payments.paymentProofLabel')}
                onFileSelect={(f) => { setFile(f); if (errors.file) setErrors((p) => ({ ...p, file: '' })); }}
                disabled={loading}
                required
              />
              {errors.file && <p className="mt-1 text-xs text-red-400">{errors.file}</p>}
            </div>

            <Button type="submit" fullWidth loading={loading} disabled={leases.length === 0}>
              {t('payments.uploadProofBtn')}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}