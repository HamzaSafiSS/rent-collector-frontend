import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Input } from '../common';
import { propertyApi } from '../../api/propertyApi';

export default function PaymentInfoModal({ isOpen, onClose, onSave, loading, initialData = null }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('WALLET'); // 'WALLET' or 'BANK'

  const [formData, setFormData] = useState({
    institutionName: '',
    accountHolderName: '',
    accountNumber: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [properties, setProperties] = useState([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          institutionName: initialData.institutionName || '',
          accountHolderName: initialData.accountHolderName || '',
          accountNumber: initialData.accountNumber || '',
          phoneNumber: initialData.phoneNumber || '',
        });
        setActiveTab(initialData.paymentType || 'WALLET');
      } else {
        setFormData({
          institutionName: '',
          accountHolderName: '',
          accountNumber: '',
          phoneNumber: '',
        });
        setActiveTab('WALLET');
      }
      setErrors({});
      
      setPropertiesLoading(true);
      propertyApi.listMyProperties(0, 100)
        .then((res) => {
          const fetchedProps = res.data?.data?.content || [];
          setProperties(fetchedProps);
          if (initialData && initialData.propertyIds) {
            setSelectedPropertyIds(initialData.propertyIds);
          } else if (fetchedProps.length === 1) {
            setSelectedPropertyIds([fetchedProps[0].id]);
          } else {
            setSelectedPropertyIds([]);
          }
          if (fetchedProps.length <= 1) {
            setStep(2);
          } else {
            setStep(1);
          }
        })
        .catch(console.error)
        .finally(() => setPropertiesLoading(false));
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (selectedPropertyIds.length === 0) {
      setErrors({ propertyIds: t('validation.selectAtLeastOneProperty') });
      return;
    }
    setErrors({});
    setStep(2);
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
      ...(initialData ? { id: initialData.id } : {}),
      paymentType: activeTab,
      ...formData,
      propertyIds: selectedPropertyIds,
    });
  };

  const isEditMode = !!initialData;
  const modalTitle = isEditMode ? t('payments.editPaymentMethodTitle') : t('payments.addPaymentMethodTitle');
  const modalDesc = isEditMode ? t('payments.editPaymentMethodDesc') : t('payments.addPaymentMethodDesc');
  const saveBtnLabel = isEditMode ? t('payments.updatePaymentMethod') : t('payments.savePaymentMethod');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md" footer={null}>
      <form onSubmit={handleSubmit} className="p-6" noValidate>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {modalDesc}
        </p>

        {step === 1 ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('payments.assignToProperties')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md p-3 bg-white dark:bg-slate-800">
              {propertiesLoading ? (
                <div className="text-sm text-slate-500">{t('common.loading')}</div>
              ) : (
                properties.map((prop) => (
                  <label key={prop.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedPropertyIds.includes(prop.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPropertyIds(prev => [...prev, prop.id]);
                        } else {
                          setSelectedPropertyIds(prev => prev.filter(id => id !== prop.id));
                        }
                        setErrors(prev => ({ ...prev, propertyIds: '' }));
                      }}
                      className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600"
                    />
                    {prop.name}
                  </label>
                ))
              )}
            </div>
            {errors.propertyIds && <p className="text-sm text-red-500 mt-1">{errors.propertyIds}</p>}
            
            <div className="flex justify-end gap-3 mt-8">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                {t('common.cancel')}
              </Button>
              <Button type="button" onClick={handleNext} disabled={propertiesLoading || loading}>
                {t('common.next')}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700/50 mb-6">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'WALLET'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => {
                  setActiveTab('WALLET');
                  setErrors({});
                }}
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
                onClick={() => {
                  setActiveTab('BANK');
                  setErrors({});
                }}
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

            <div className="flex justify-between mt-8">
              {properties.length > 1 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                  {t('common.back')}
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                  {t('common.cancel')}
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? t('common.saving') : saveBtnLabel}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
