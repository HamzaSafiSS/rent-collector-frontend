import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button, Alert } from '../common';

export default function PropertyForm({ initial, onSubmit, loading, error }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', address: '', description: '' });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    if (initial) {
      setForm({ name: initial.name || '', address: initial.address || '', description: initial.description || '' });
      if (initial.id && initial.imageUrl) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        setImagePreview(`${baseUrl}/properties/${initial.id}/image`);
      }
    }
  }, [initial]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = t('validation.propertyNameRequired');
    if (!form.address.trim()) errs.address = t('validation.addressRequired');
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  }

  function handleImageSelect(file) {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((p) => ({ ...p, image: t('validation.imageOnlyAllowed') }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: t('validation.imageMaxSize') }));
      return;
    }
    setErrors((p) => ({ ...p, image: '' }));
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleFileInputChange(e) {
    handleImageSelect(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-emerald-500', 'bg-emerald-500/10');
    handleImageSelect(e.dataTransfer.files?.[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add('border-emerald-500', 'bg-emerald-500/10');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-emerald-500', 'bg-emerald-500/10');
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form, imageFile);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert type="error" message={error} />}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('properties.propertyImageLabel')}</label>
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600/50 group">
            <img src={imagePreview} alt={t('properties.propertyPreview')} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition-colors"
              >
                {t('common.change')}
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors"
              >
                {t('common.remove')}
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={dropZoneRef}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600/50 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-200"
          >
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('properties.clickToUpload')}</p>
            <p className="text-xs text-slate-600 mt-1">{t('properties.imageFormats')}</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
        {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
      </div>

      <Input label={t('properties.propertyNameLabel')} name="name" value={form.name} onChange={handleChange} error={errors.name} disabled={loading} placeholder={t('properties.propertyNamePlaceholder')} required />
      <Input label={t('properties.addressLabel')} name="address" value={form.address} onChange={handleChange} error={errors.address} disabled={loading} placeholder={t('properties.addressPlaceholder')} required />
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('properties.descriptionLabel')}</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={loading}
          rows={3}
          className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/30 disabled:text-slate-400 dark:disabled:text-slate-500 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
          placeholder={t('properties.descriptionPlaceholder')}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {initial ? t('common.saveChanges') : t('properties.createPropertyBtn')}
        </Button>
      </div>
    </form>
  );
}