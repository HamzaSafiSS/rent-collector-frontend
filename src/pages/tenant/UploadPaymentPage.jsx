import { useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, FileUpload, Input, Button, Alert } from '../../components/common';
import { paymentApi } from '../../api/paymentApi';
import { leaseApi } from '../../api/leaseApi';
import { useToast } from '../../context/ToastContext';
import { TENANT_NAV } from './tenantNav';

export default function UploadPaymentPage() {
  const toast = useToast();

  const [leases, setLeases]     = useState([]);
  const [leaseId, setLeaseId]   = useState('');
  const [month, setMonth]       = useState('');
  const [amount, setAmount]     = useState('');
  const [file, setFile]         = useState(null);

  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    leaseApi.getMyLeases(0, 50, 'ACTIVE')
      .then((r) => {
        const active = r.data?.data?.content || [];
        setLeases(active);
        if (active.length === 1) setLeaseId(String(active[0].id));
      })
      .catch(() => {});
  }, []);

  function validate() {
    const errs = {};
    if (!leaseId)        errs.leaseId = 'Please select a lease.';
    if (!month)          errs.month   = 'Payment month is required.';
    if (!amount || Number(amount) <= 0) errs.amount = 'Enter a valid amount.';
    if (!file)           errs.file    = 'Please select a file to upload.';
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
      formData.append('paymentMonth',  month);
      formData.append('amount',        amount);
      formData.append('leaseId',       leaseId);

      await paymentApi.uploadPayment(formData);
      setSuccess('Payment uploaded successfully. Your landlord will review it shortly.');
      toast.success('Payment uploaded.');
      setMonth(''); setAmount(''); setFile(null); setErrors({});
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to upload payment.');
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

  return (
    <PortalLayout navItems={TENANT_NAV} portalLabel="Tenant">
      <PageHeader title="Upload Payment" subtitle="Submit your payment proof for review" />

      <div className="max-w-lg">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {apiError && <Alert type="error"   message={apiError}  className="mb-5" />}
          {success  && <Alert type="success" message={success}   className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Lease selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Lease</label>
              <select
                value={leaseId}
                onChange={handleChange(setLeaseId, 'leaseId')}
                disabled={loading || leases.length === 1}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              >
                <option value="">Choose lease...</option>
                {leases.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.propertyName} — Unit {l.unitNumber} (ETB {Number(l.monthlyRent).toLocaleString()}/mo)
                  </option>
                ))}
              </select>
              {errors.leaseId && <p className="mt-1 text-xs text-red-600">{errors.leaseId}</p>}
              {leases.length === 0 && <p className="mt-1 text-xs text-yellow-600">No active leases found.</p>}
            </div>

            {/* Payment month */}
            <Input
              label="Payment month"
              type="month"
              value={month}
              onChange={handleChange(setMonth, 'month')}
              error={errors.month}
              disabled={loading}
            />

            {/* Amount */}
            <Input
              label="Amount (ETB)"
              type="number"
              min="1"
              value={amount}
              onChange={handleChange(setAmount, 'amount')}
              error={errors.amount}
              disabled={loading}
              placeholder="e.g. 6500"
            />

            {/* File upload */}
            <div>
              <FileUpload
                label="Payment proof (screenshot / receipt)"
                onFileSelect={(f) => { setFile(f); if (errors.file) setErrors((p) => ({ ...p, file: '' })); }}
                disabled={loading}
              />
              {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
            </div>

            <Button type="submit" fullWidth loading={loading} disabled={leases.length === 0}>
              Upload payment proof
            </Button>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}