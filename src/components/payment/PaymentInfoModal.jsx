import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../common';
import { useToast } from '../../context/ToastContext';

export default function PaymentInfoModal({ isOpen, onClose, initialData, onSave, loading }) {
  const [formData, setFormData] = useState({
    companyName: '',
    landlordName: '',
    accountNumber: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        companyName: initialData?.companyName || '',
        landlordName: initialData?.landlordName || '',
        accountNumber: initialData?.accountNumber || '',
        phoneNumber: initialData?.phoneNumber || '',
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Information" size="md" footer={null}>
      <form onSubmit={handleSubmit} className="p-6">
        <p className="text-sm text-slate-400 mb-6">
          Add or update the payment information you want tenants to see when they pay rent.
        </p>

        <div className="space-y-4">
          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. CBE, Nib, Wegagen,telebirr, etc"
          />
          <Input
            label="Landlord Name"
            name="landlordName"
            value={formData.landlordName}
            onChange={handleChange}
            placeholder="e.g. Hamza Safi"
          />
          <Input
            label="Account Number"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="e.g. 1000123456789"
          />
          <Input
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g. +251 911 234 567"
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Info'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
