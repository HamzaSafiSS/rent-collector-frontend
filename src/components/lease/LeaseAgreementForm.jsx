import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import { Input, Button, Alert } from '../common';
import EthiopianDatePicker from '../common/EthiopianDatePicker';
import { useAuth } from '../../context/AuthContext';

const selectClass =
  'w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/30 disabled:text-slate-400 dark:disabled:text-slate-500 transition-all duration-200';

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash',
  'Mobile Payment (TeleBirr)',
  'Check',
];

// ── Helper: generate the PDF blob from filled form data ──────────────────────
function generateAgreementPDF(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 20;

  const lineH = 7;

  function addLine(height = 0.3) {
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(height);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  }

  function checkPage(needed = 30) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  }

  function wrappedText(text, fontSize = 11, isBold = false) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentW);
    lines.forEach((line) => {
      checkPage(lineH);
      doc.text(line, margin, y);
      y += lineH;
    });
  }

  function labelValue(label, value) {
    checkPage(lineH);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const labelW = doc.getTextWidth(label + ' ');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '______________________________', margin + labelW, y);
    y += lineH;
  }

  // ── Title ──
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HOUSE RENTAL AGREEMENT', pageW / 2, y, { align: 'center' });
  y += 12;

  addLine(0.5);

  // ── Header info ──
  labelValue('Agreement Date:', data.agreementDate || '');
  y += 2;
  labelValue('Landlord:', data.landlordName || '');
  labelValue('Phone:', data.landlordPhone || '');
  y += 2;
  labelValue('Tenant:', data.tenantName || '');
  labelValue('Phone:', data.tenantPhone || '');
  y += 2;
  labelValue('Property Address:', data.propertyAddress || '');
  y += 4;

  addLine(0.5);
  y += 2;

  // ── Body ──
  wrappedText(
    `This Rental Agreement is made on ${data.agreementDate || '____________________________'} between ${data.landlordName || '____________________________'}, hereinafter referred to as the Landlord, and ${data.tenantName || '____________________________'}, hereinafter referred to as the Tenant.`,
  );
  y += 4;

  wrappedText(
    `The Landlord agrees to rent the property located at ${data.propertyAddress || '____________________________________________________________'} to the Tenant for residential purposes.`,
  );
  y += 4;

  wrappedText(
    `The rental period starts on ${data.startDate || '____________________________'} and ends on ${data.endDate || '____________________________'}.`,
  );
  y += 4;

  wrappedText(
    `The Tenant agrees to pay ${data.monthlyRent ? `${Number(data.monthlyRent).toLocaleString()} ETB` : '____________________________ ETB'} per month. Rent is due on or before ${data.paymentDueDay || '____________________________'} of each month. The agreed payment method is ${data.paymentMethod || '____________________________'}.`,
  );
  y += 4;

  wrappedText(
    'The Tenant agrees to keep the property clean and in good condition, pay rent and agreed utilities on time, report major damage or maintenance problems to the Landlord, not make major changes to the property without the Landlord\'s permission, and use the property for residential purposes only.',
  );
  y += 4;

  wrappedText(
    'Either Party may terminate this Agreement by providing the required notice according to the applicable law and the terms agreed by both Parties.',
  );
  y += 4;

  wrappedText(
    'Both Parties confirm that they have read and agreed to the terms of this Rental Agreement.',
  );
  y += 6;

  addLine(0.5);
  y += 4;

  // ── Signatures ──
  checkPage(60);
  labelValue('Landlord Name:', data.landlordName || '');
  labelValue('Signature:', '');
  labelValue('Date:', '');
  y += 6;
  labelValue('Tenant Name:', data.tenantName || '');
  labelValue('Signature:', '');
  labelValue('Date:', '');
  y += 8;

  // ── Generated date ──
  checkPage(12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  const genDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  doc.text(`Generated Date: ${genDate}`, margin, y);
  doc.setTextColor(0, 0, 0);

  return doc.output('blob');
}

// ── HTML preview of the agreement ────────────────────────────────────────────
function AgreementPreview({ data }) {
  const blank = (v, w = 200) =>
    v ? `<strong>${v}</strong>` : `<span style="display:inline-block;border-bottom:1px solid #888;width:${w}px;">&nbsp;</span>`;

  const html = `
    <div style="font-family: 'Segoe UI', system-ui, sans-serif; line-height:1.8; color:#1e293b;">
      <h2 style="text-align:center; font-size:1.3rem; letter-spacing:1px; margin-bottom:4px;">HOUSE RENTAL AGREEMENT</h2>
      <hr style="border:none;border-top:2px solid #334155;margin:10px 0 16px;" />

      <p><strong>Agreement Date:</strong> ${blank(data.agreementDate)}</p>
      <p><strong>Landlord:</strong> ${blank(data.landlordName)} &nbsp;&nbsp; <strong>Phone:</strong> ${blank(data.landlordPhone, 140)}</p>
      <p><strong>Tenant:</strong> ${blank(data.tenantName)} &nbsp;&nbsp; <strong>Phone:</strong> ${blank(data.tenantPhone, 140)}</p>
      <p><strong>Property Address:</strong> ${blank(data.propertyAddress, 340)}</p>

      <hr style="border:none;border-top:1px solid #94a3b8;margin:14px 0;" />

      <p>This Rental Agreement is made on ${blank(data.agreementDate)} between ${blank(data.landlordName)}, hereinafter referred to as the Landlord, and ${blank(data.tenantName)}, hereinafter referred to as the Tenant.</p>

      <p>The Landlord agrees to rent the property located at ${blank(data.propertyAddress, 340)} to the Tenant for residential purposes.</p>

      <p>The rental period starts on ${blank(data.startDate)} and ends on ${blank(data.endDate)}.</p>

      <p>The Tenant agrees to pay ${blank(data.monthlyRent ? `${Number(data.monthlyRent).toLocaleString()} ETB` : '', 120)} per month. Rent is due on or before ${blank(data.paymentDueDay, 120)} of each month. The agreed payment method is ${blank(data.paymentMethod, 150)}.</p>

      <p>The Tenant agrees to keep the property clean and in good condition, pay rent and agreed utilities on time, report major damage or maintenance problems to the Landlord, not make major changes to the property without the Landlord's permission, and use the property for residential purposes only.</p>

      <p>Either Party may terminate this Agreement by providing the required notice according to the applicable law and the terms agreed by both Parties.</p>

      <p>Both Parties confirm that they have read and agreed to the terms of this Rental Agreement.</p>

      <hr style="border:none;border-top:2px solid #334155;margin:18px 0 14px;" />

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
        <div>
          <p><strong>Landlord Name:</strong> ${blank(data.landlordName)}</p>
          <p><strong>Signature:</strong> ${blank('', 180)}</p>
          <p><strong>Date:</strong> ${blank('', 150)}</p>
        </div>
        <div>
          <p><strong>Tenant Name:</strong> ${blank(data.tenantName)}</p>
          <p><strong>Signature:</strong> ${blank('', 180)}</p>
          <p><strong>Date:</strong> ${blank('', 150)}</p>
        </div>
      </div>

      <p style="margin-top:20px;font-size:0.8rem;color:#64748b;font-style:italic;">Generated Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  `;

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-inner max-h-[60vh] overflow-y-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function LeaseAgreementForm({
  units = [],
  totalUnits = 0,
  onSubmit,
  loading,
  error,
  property,
}) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    tenantEmail: '',
    tenantName: '',
    unitId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    paymentDueDay: '',
    paymentMethod: '',
    propertyAddress: property?.address || '',
  });
  const [errors, setErrors] = useState({});

  // Auto-populate landlord info
  const landlordName = user?.fullName || '';
  const landlordPhone = user?.phoneNumber || '';

  const agreementDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Combine all data for preview / PDF
  const agreementData = useMemo(
    () => ({
      agreementDate,
      landlordName,
      landlordPhone,
      tenantName: form.tenantName,
      tenantPhone: '', // intentionally blank per user request
      propertyAddress: form.propertyAddress || property?.address || '',
      startDate: form.startDate,
      endDate: form.endDate,
      monthlyRent: form.monthlyRent,
      paymentDueDay: form.paymentDueDay,
      paymentMethod: form.paymentMethod,
    }),
    [agreementDate, landlordName, landlordPhone, form, property],
  );

  function validate() {
    const errs = {};
    if (!form.tenantEmail.trim())
      errs.tenantEmail = t('validation.tenantEmailRequired');
    if (!form.tenantName.trim())
      errs.tenantName = t('leases.tenantNameRequired', { defaultValue: 'Tenant name is required.' });
    if (!form.unitId)
      errs.unitId = t('validation.selectUnit');
    if (!form.startDate)
      errs.startDate = t('validation.startDateRequired');
    if (!form.monthlyRent)
      errs.monthlyRent = t('validation.monthlyRentRequired');
    else if (Number(form.monthlyRent) <= 0)
      errs.monthlyRent = t('validation.mustBeGreaterThanZero');
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  }

  function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep(2);
  }

  async function handleGenerate() {
    // Generate the PDF blob
    const pdfBlob = generateAgreementPDF(agreementData);
    const pdfFile = new File([pdfBlob], 'lease-agreement.pdf', {
      type: 'application/pdf',
    });

    const payload = {
      unitId: Number(form.unitId),
      startDate: form.startDate,
      monthlyRent: Number(form.monthlyRent),
      tenantEmail: form.tenantEmail.trim(),
    };

    onSubmit(payload, pdfFile);
  }

  // ── Step 1: Lease details form ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
        className="space-y-4"
        noValidate
      >
        {error && <Alert type="error" message={error} />}

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
              1
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              {t('leases.stepDetails', { defaultValue: 'Lease Details' })}
            </span>
          </div>
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold">
              2
            </span>
            <span className="text-sm font-medium text-slate-500">
              {t('leases.stepPreview', {
                defaultValue: 'Preview & Generate',
              })}
            </span>
          </div>
        </div>

        <Input
          label={t('leases.tenantEmail')}
          name="tenantEmail"
          type="email"
          value={form.tenantEmail}
          onChange={handleChange}
          error={errors.tenantEmail}
          disabled={loading}
          placeholder={t('leases.tenantEmailPlaceholder')}
          hint={t('leases.tenantEmailHint')}
          required
        />

        <Input
          label={t('leases.tenantNameLabel', { defaultValue: 'Tenant Full Name' })}
          name="tenantName"
          value={form.tenantName}
          onChange={handleChange}
          error={errors.tenantName}
          disabled={loading}
          placeholder={t('leases.tenantNamePlaceholder', {
            defaultValue: 'e.g. John Doe',
          })}
          hint={t('leases.tenantNameHint', {
            defaultValue: 'Full name as it will appear on the agreement.',
          })}
          required
        />

        {/* Unit selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            <span className="text-red-400 mr-1" aria-hidden="true">
              *
            </span>
            {t('leases.unitSelector')}
          </label>
          <select
            name="unitId"
            value={form.unitId}
            onChange={handleChange}
            disabled={loading}
            className={selectClass}
          >
            <option value="">{t('leases.selectUnit')}</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.unitNumber}
              </option>
            ))}
          </select>
          {errors.unitId && (
            <p className="mt-1 text-xs text-red-400">{errors.unitId}</p>
          )}
          {totalUnits === 0 ? (
            <p className="mt-1 text-xs text-amber-400">
              {t('leases.noUnitsYet')}
            </p>
          ) : units.length === 0 ? (
            <p className="mt-1 text-xs text-amber-400">
              {t('leases.noAvailableUnits')}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EthiopianDatePicker
            label={t('leases.startDate')}
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            error={errors.startDate}
            disabled={loading}
            required
          />
          <EthiopianDatePicker
            label={t('leases.endDateLabel', { defaultValue: 'End Date' })}
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <Input
          label={t('leases.monthlyRentETB')}
          name="monthlyRent"
          type="number"
          min="1"
          value={form.monthlyRent}
          onChange={handleChange}
          error={errors.monthlyRent}
          disabled={loading}
          placeholder={t('leases.monthlyRentPlaceholder')}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('leases.paymentDueDayLabel', {
              defaultValue: 'Payment Due Day',
            })}
            name="paymentDueDay"
            value={form.paymentDueDay}
            onChange={handleChange}
            disabled={loading}
            placeholder={t('leases.paymentDueDayPlaceholder', {
              defaultValue: 'e.g. the 5th',
            })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('leases.paymentMethodLabel', {
                defaultValue: 'Payment Method',
              })}
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              disabled={loading}
              className={selectClass}
            >
              <option value="">
                {t('leases.selectPaymentMethod', {
                  defaultValue: 'Select method...',
                })}
              </option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label={t('leases.propertyAddressLabel', {
            defaultValue: 'Property Address',
          })}
          name="propertyAddress"
          value={form.propertyAddress}
          onChange={handleChange}
          disabled={loading}
          placeholder={t('leases.propertyAddressPlaceholder', {
            defaultValue: 'e.g. Bole, Addis Ababa',
          })}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading}>
            {t('leases.nextStepBtn', {
              defaultValue: 'Next: Preview Agreement →',
            })}
          </Button>
        </div>
      </form>
    );
  }

  // ── Step 2: Preview & Generate ─────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {error && <Alert type="error" message={error} />}

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2 opacity-60">
          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
            ✓
          </span>
          <span className="text-sm font-medium text-slate-500">
            {t('leases.stepDetails', { defaultValue: 'Lease Details' })}
          </span>
        </div>
        <div className="flex-1 h-px bg-emerald-500" />
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
            2
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            {t('leases.stepPreview', { defaultValue: 'Preview & Generate' })}
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          {t('leases.previewInfo', {
            defaultValue:
              'Review the agreement below. A PDF will be generated and attached to the lease automatically.',
          })}
        </span>
      </div>

      {/* Agreement preview */}
      <AgreementPreview data={agreementData} />

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          disabled={loading}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors flex items-center gap-1"
        >
          ← {t('leases.backToDetails', { defaultValue: 'Back to Details' })}
        </button>
        <Button onClick={handleGenerate} loading={loading}>
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {t('leases.generateAndCreate', {
              defaultValue: 'Generate PDF & Create Lease',
            })}
          </span>
        </Button>
      </div>
    </div>
  );
}
