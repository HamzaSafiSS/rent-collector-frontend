import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Input } from '../common';

export default function PaymentInfoModal({ isOpen, onClose, onSave, loading }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('WALLET'); // 'WALLET' or 'BANK'

  const [formData, setFormData] = useState({
    institutionName: '',
    accountHolderName: '',
    accountNumber: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        institutionName: '',
        accountHolderName: '',
        accountNumber: '',
        phoneNumber: '',
      });
      setErrors({});
      setActiveTab('WALLET');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (activeTab === 'BANK') {
      if (!formData.institutionName.trim()) newErrors.institutionName = t('validation.bankNameRequired');
      if (!formData.accountHolderName.trim()) newErrors.accountHolderName = t('validation.accountHolderRequired');
      if (!formData.accountNumber.trim()) newErrors.accountNumber = t('validation.accountNumberRequired');
    } else {
      if (!formData.institutionName.trim()) newErrors.institutionName = t('validation.walletNameRequired');
      if (!formData.accountHolderName.trim()) newErrors.accountHolderName = t('validation.accountHolderRequired');
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = t('validation.phoneNumberRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      paymentType: activeTab,
      ...formData,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('payments.addPaymentMethodTitle')} size="md" footer={null}>
      <form onSubmit={handleSubmit} className="p-6" noValidate>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {t('payments.addPaymentMethodDesc')}
        </p>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700/50 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'WALLET'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            onClick={() => setActiveTab('WALLET')}
          >
            {t('payments.wallet')}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'BANK'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            onClick={() => setActiveTab('BANK')}
          >
            {t('payments.bank')}
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'BANK' ? (
            <>
              <Input
                label={t('payments.bankName')}
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                placeholder={t('payments.bankNamePlaceholder')}
                error={errors.institutionName}
                required
              />
              <Input
                label={t('payments.accountHolderName')}
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder={t('payments.accountHolderPlaceholder')}
                error={errors.accountHolderName}
                required
              />
              <Input
                label={t('payments.accountNumberLabel')}
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder={t('payments.accountNumberPlaceholder')}
                error={errors.accountNumber}
                required
              />
            </>
          ) : (
            <>
              <Input
                label={t('payments.walletName')}
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                placeholder={t('payments.walletNamePlaceholder')}
                error={errors.institutionName}
                required
              />
              <Input
                label={t('payments.accountHolderName')}
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder={t('payments.accountHolderPlaceholder')}
                error={errors.accountHolderName}
                required
              />
              <Input
                label={t('payments.phoneNumberLabel')}
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder={t('payments.phoneNumberPlaceholder')}
                error={errors.phoneNumber}
                required
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('common.saving') : t('payments.savePaymentMethod')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
