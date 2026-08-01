import { useState, useEffect } from 'react';
import { PageHeader, Alert } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';

export default function HowToPayPage() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [leaseId, setLeaseId] = useState('');
  const [paymentInfo, setPaymentInfo] = useState([]);
  const [infoLoading, setInfoLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    leaseApi.getMyLeases(0, 50, 'ACTIVE')
      .then(res => {
        const data = res.data?.data?.content || [];
        setLeases(data);
        if (data.length === 1) {
          setLeaseId(data[0].id);
          fetchPaymentInfo(data[0].id);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load leases.');
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchPaymentInfo = async (id) => {
    if (!id) {
      setPaymentInfo([]);
      return;
    }
    setInfoLoading(true);
    try {
      const res = await paymentApi.getPaymentInfoForLease(id);
      setPaymentInfo(res.data?.data || []);
    } catch (err) {
      setPaymentInfo([]);
    } finally {
      setInfoLoading(false);
    }
  };

  const handleLeaseChange = (e) => {
    const val = e.target.value;
    setLeaseId(val);
    fetchPaymentInfo(val);
  };

  return (
    <>
      <PageHeader title="How to Pay" subtitle="Payment instructions from your landlord" />

      <div className="max-w-lg">
        <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-6">
          {error && <Alert type="error" message={error} className="mb-5" />}

          {leases.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Select Lease
              </label>
              <select
                value={leaseId}
                onChange={handleLeaseChange}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-slate-800/50 bg-[#111827] text-white"
              >
                <option value="">Choose lease...</option>
                {leases.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.propertyName} — Unit {l.unitNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          {leases.length === 0 && !loading && (
            <Alert type="info" message="You do not have any active leases." />
          )}

          {leaseId && (
            <>
              {infoLoading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded"></div>
                      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {paymentInfo && paymentInfo.length > 0 ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <h3 className="text-emerald-400 font-semibold mb-4">Payment Methods</h3>
                      <div className="space-y-6">
                        {paymentInfo.map(info => (
                          <div key={info.id} className="text-sm text-slate-300 border-l-2 border-emerald-500/50 pl-3">
                            <p className="font-bold text-slate-100 mb-1">{info.paymentType === 'BANK' ? 'Bank Transfer' : 'Digital Wallet'}</p>
                            {info.institutionName && <p><span className="text-slate-400">{info.paymentType === 'BANK' ? 'Bank' : 'Wallet'}:</span> <span className="text-emerald-50">{info.institutionName}</span></p>}
                            {info.accountHolderName && <p><span className="text-slate-400">Account Name:</span> <span className="text-emerald-50">{info.accountHolderName}</span></p>}
                            {info.accountNumber && <p><span className="text-slate-400">Account Number:</span> <span className="font-mono text-emerald-300 font-semibold">{info.accountNumber}</span></p>}
                            {info.phoneNumber && <p><span className="text-slate-400">Phone Number:</span> <span className="font-mono text-emerald-300 font-semibold">{info.phoneNumber}</span></p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert type="warning" message="Please contact your landlord to get payment instructions." />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
