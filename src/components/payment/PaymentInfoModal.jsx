import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../common';
import { useToast } from '../../context/ToastContext';

export default function PaymentInfoModal({ isOpen, onClose, onSave, loading }) {
  const [activeTab, setActiveTab] = useState('WALLET'); // 'WALLET' or 'BANK'

  const [formData, setFormData] = useState({
    institutionName: '',
    accountHolderName: '',
    accountNumber: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        institutionName: '',
        accountHolderName: '',
        accountNumber: '',
        phoneNumber: '',
      });
      setActiveTab('WALLET');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      paymentType: activeTab,
      ...formData,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment Method" size="md" footer={null}>
      <form onSubmit={handleSubmit} className="p-6">
        <p className="text-sm text-slate-400 mb-4">
          Add a new payment method for tenants to see when they pay rent.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'WALLET'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            onClick={() => setActiveTab('WALLET')}
          >
            Wallet
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'BANK'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            onClick={() => setActiveTab('BANK')}
          >
            Bank
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'BANK' ? (
            <>
              <Input
                label="Bank Name"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                placeholder="e.g. CBE, Awash Bank, Dashen Bank"
                required
              />
              <Input
                label="Account Holder Name"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="e.g. Hamza Safi"
                required
              />
              <Input
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="e.g. 1000123456789"
                required
              />
            </>
          ) : (
            <>
              <Input
                label="Wallet Name"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                placeholder="e.g. Telebirr, CBE Birr"
                required
              />
              <Input
                label="Account Holder Name"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="e.g. Hamza Safi"
                required
              />
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 0911234567"
                required
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Payment Method'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
