import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, Button } from '../../components/common';
import PaymentInfoModal from '../../components/payment/PaymentInfoModal';
import { paymentApi } from '../../api/paymentApi';
import { useToast } from '../../context/ToastContext';

export default function PaymentMethodsPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [isPaymentInfoModalOpen, setIsPaymentInfoModalOpen] = useState(false);
  const [paymentInfoData, setPaymentInfoData] = useState(null);
  const [paymentInfoLoading, setPaymentInfoLoading] = useState(false);
  const [editingPaymentInfo, setEditingPaymentInfo] = useState(null);

  const fetchPaymentInfo = async () => {
    try {
      const res = await paymentApi.getPaymentInfo();
      setPaymentInfoData(res.data?.data);
    } catch (err) {
      console.error('Failed to fetch payment info:', err);
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const handleSavePaymentInfo = async (data) => {
    try {
      setPaymentInfoLoading(true);
      if (data.id) {
        await paymentApi.updatePaymentInfo(data.id, data);
        toast.success(t('payments.paymentInfoUpdated'));
      } else {
        await paymentApi.savePaymentInfo(data);
        toast.success(t('payments.paymentInfoSaved'));
      }
      setIsPaymentInfoModalOpen(false);
      setEditingPaymentInfo(null);
      fetchPaymentInfo();
    } catch (err) {
      toast.error(err.response?.data?.message || t('payments.failedSavePaymentInfo'));
    } finally {
      setPaymentInfoLoading(false);
    }
  };

  const handleDeletePaymentInfo = async (id) => {
    if (!window.confirm(t('payments.confirmDeletePaymentInfo'))) return;
    try {
      await paymentApi.deletePaymentInfo(id);
      toast.success(t('payments.paymentInfoDeleted'));
      fetchPaymentInfo();
    } catch (err) {
      toast.error(err.response?.data?.message || t('payments.failedDeletePaymentInfo'));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {t('payments.paymentMethodsHeading')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('payments.addPaymentMethodDesc')}
          </p>
        </div>
        <Button onClick={() => { setEditingPaymentInfo(null); setIsPaymentInfoModalOpen(true); }}>
          {t('payments.addPaymentMethod')}
        </Button>
      </div>

      {paymentInfoData && paymentInfoData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paymentInfoData.map((info) => (
            <div key={info.id} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full">
                  {info.paymentType === 'BANK' ? t('payments.bank') : t('payments.wallet')}
                </span>
              </div>
              <div className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">
                {info.institutionName}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t('payments.accountName', 'Account Name')}: <span className="font-medium text-slate-700 dark:text-slate-300">{info.accountHolderName}</span>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg mt-2 inline-block w-fit">
                {info.accountNumber || info.phoneNumber}
              </div>
              
              <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                <button onClick={() => { setEditingPaymentInfo(info); setIsPaymentInfoModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-md hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors" title={t('common.edit')}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDeletePaymentInfo(info.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-slate-700 transition-colors" title={t('common.delete')}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">{t('payments.noPaymentMethods', 'No Payment Methods')}</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {t('payments.addPaymentMethodDesc')}
          </p>
          <Button onClick={() => { setEditingPaymentInfo(null); setIsPaymentInfoModalOpen(true); }}>
            {t('payments.addPaymentMethod')}
          </Button>
        </div>
      )}

      <PaymentInfoModal
        isOpen={isPaymentInfoModalOpen}
        onClose={() => {
          setIsPaymentInfoModalOpen(false);
          setEditingPaymentInfo(null);
        }}
        onSave={handleSavePaymentInfo}
        loading={paymentInfoLoading}
        initialData={editingPaymentInfo}
      />
    </>
  );
}
