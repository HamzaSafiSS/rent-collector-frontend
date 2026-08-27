import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, Alert, Button } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';

export default function HowToPayPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        setError(err.response?.data?.message || t('leases.failedLoadLeases'));
      })
      .finally(() => setLoading(false));
  }, [t]);

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
      <PageHeader title={t('payments.howToPayTitle')} subtitle={t('payments.howToPaySubtitle')} />

      <div className="max-w-lg">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl p-6">
          {error && <Alert type="error" message={error} className="mb-5" />}

          {leases.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('payments.selectLeaseLabel')}
              </label>
              <select
                value={leaseId}
                onChange={handleLeaseChange}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100"
              >
                <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100" value="">{t('payments.chooseLease')}</option>
                {leases.map((l) => (
                  <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100" key={l.id} value={l.id}>
                    {l.propertyName} — {t('units.unit')} {l.unitNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          {leases.length === 0 && !loading && (
            <Alert type="info" message={t('payments.noActiveLeasesAlert')} />
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
                      <h3 className="text-emerald-400 font-semibold mb-4">{t('payments.paymentMethodsTitle')}</h3>
                      <div className="space-y-6">
                        {paymentInfo.map(info => (
                          <div key={info.id} className="text-sm text-slate-700 dark:text-slate-300 border-l-2 border-emerald-500/50 pl-3">
                            <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">{info.paymentType === 'BANK' ? t('payments.bankTransfer') : t('payments.digitalWallet')}</p>
                            {info.institutionName && <p><span className="text-slate-500 dark:text-slate-400">{info.paymentType === 'BANK' ? t('payments.bank') : t('payments.wallet')}:</span> <span className="text-emerald-700 dark:text-emerald-50">{info.institutionName}</span></p>}
                            {info.accountHolderName && <p><span className="text-slate-500 dark:text-slate-400">{t('payments.accountName')}:</span> <span className="text-emerald-700 dark:text-emerald-50">{info.accountHolderName}</span></p>}
                            {info.accountNumber && <p><span className="text-slate-500 dark:text-slate-400">{t('payments.accountNumber')}:</span> <span className="font-mono text-emerald-600 dark:text-emerald-300 font-semibold">{info.accountNumber}</span></p>}
                            {info.phoneNumber && <p><span className="text-slate-500 dark:text-slate-400">{t('payments.phoneNumber')}:</span> <span className="font-mono text-emerald-600 dark:text-emerald-300 font-semibold">{info.phoneNumber}</span></p>}
                          </div>
                        ))}
                      </div>

                      {/* Upload Payment Button */}
                      <div className="mt-6 pt-4 border-t border-emerald-500/20">
                        <Button
                          variant="primary"
                          onClick={() => navigate(leaseId ? `/tenant/upload-payment?leaseId=${leaseId}` : '/tenant/upload-payment')}
                          className="w-full flex items-center justify-center gap-2 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>{t('nav.uploadPayment', 'Upload Payment')}</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Alert type="warning" message={t('payments.contactLandlord')} />
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
