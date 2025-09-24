import * as React from "react";

type Enrollment = { id: number; course?: any; status?: string };

export interface MakePaymentProps {
  open: boolean;
  onClose: () => void;
  amountDefault: number;
  enrollments: Enrollment[];
  description?: string;
  onSuccess?: () => void;
}

// Minimal inline icons
const ShieldIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-5 tw-h-5" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const LockIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-4 tw-h-4" {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-rounded-2xl tw-border tw-border-border tw-bg-background ${className}`}>{children}</div>
);
const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-p-4 ${className}`}>{children}</div>
);

function mapUiToPaymentMethod(v: string): 'CASH' | 'CARD' | 'TRANSFER' {
  // Restrict to card for portal payments
  return 'CARD';
}

export const MakePayment: React.FC<MakePaymentProps> = ({ open, onClose, amountDefault, enrollments, description = 'Student portal payment', onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [amount, setAmount] = React.useState<number>(amountDefault || 0);
  const [enrollmentId, setEnrollmentId] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setAmount(amountDefault || 0);
  }, [amountDefault]);

  React.useEffect(() => {
    // Default enrollment: first IN_PROGRESS, else first
    if (!enrollmentId && enrollments && enrollments.length) {
      const active = enrollments.find((e:any) => (e?.status || '').toUpperCase() === 'IN_PROGRESS');
      setEnrollmentId((active || enrollments[0])?.id ?? null);
    }
  }, [enrollments, enrollmentId]);

  async function submitPayment() {
    if (!enrollmentId || !amount || !paymentMethod) return;
    setSubmitting(true); setError(null);
    try {
      const payload = {
        enrollment_id: enrollmentId,
        amount: Number(amount),
        payment_method: mapUiToPaymentMethod(paymentMethod),
        description,
      };
      // Use plain fetch without Authorization header (backend allows Any by default in dev)
      const resp = await fetch('/api/payments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.detail || body?.message || 'Payment failed');
      onClose();
      if (onSuccess) onSuccess();
      // reset
      setPaymentMethod(""); setCardNumber(""); setExpiryDate(""); setCvv("");
    } catch (e:any) {
      setError(e?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;
  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black/50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-background tw-rounded-2xl tw-w-full tw-max-w-md tw-border tw-border-border tw-shadow-xl">
        <div className="tw-p-5 tw-border-b tw-border-border">
          <h3 className="tw-text-base tw-font-semibold tw-flex tw-items-center tw-gap-2"><ShieldIcon className="tw-w-5 tw-h-5 tw-text-primary"/> Secure Payment</h3>
        </div>
        <div className="tw-p-6 tw-space-y-6">
          {/* Enrollment choose when multiple */}
          {enrollments?.length > 1 && (
            <div className="tw-space-y-2">
              <label className="tw-text-sm">Enrollment</label>
              <select value={enrollmentId ?? ''} onChange={e => setEnrollmentId(Number(e.target.value))} className="tw-w-full tw-h-10 tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3">
                {enrollments.map((e:any) => (
                  <option key={e.id} value={e.id}>{e?.course?.name || `Enrollment #${e.id}`}</option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Summary */}
          <Card className="tw-bg-secondary/30 tw-border-border/30">
            <CardContent>
              <div className="tw-flex tw-justify-between tw-items-center">
                <span className="tw-font-medium">Portal Payment</span>
                <div className="tw-flex tw-items-center tw-gap-2">
                  <input type="number" min={1} step={1} value={amount} onChange={e => setAmount(Number(e.target.value || 0))} className="tw-w-28 tw-h-9 tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-2"/>
                  <span className="tw-text-xl tw-font-bold">MDL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="tw-space-y-2">
            <label className="tw-text-sm">Payment Method</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="tw-w-full tw-h-10 tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3">
              <option value="" disabled>Select payment method</option>
              <option value="card">Credit/Debit Card</option>
            </select>
          </div>

          {/* Card Details for card payments */}
          {paymentMethod === 'card' && (
            <div className="tw-space-y-4">
              <div className="tw-space-y-2">
                <label htmlFor="card-number" className="tw-text-sm">Card Number</label>
                <input id="card-number" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="tw-w-full tw-h-10 tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3"/>
              </div>
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                <div className="tw-space-y-2">
                  <label htmlFor="expiry" className="tw-text-sm">Expiry Date</label>
                  <input id="expiry" placeholder="MM/YY" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="tw-w-full tw-h-10 tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3"/>
                </div>
                <div className="tw-space-y-2">
                  <label htmlFor="cvv" className="tw-text-sm">CVV</label>
                  <input id="cvv" placeholder="123" value={cvv} onChange={e => setCvv(e.target.value)} className="tw-w-full tw-h-10 tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3"/>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="tw-bg-primary/15 tw-p-3 tw-rounded-lg">
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-primary tw-text-sm">
              <LockIcon />
              <span>Your payment is protected by 256-bit SSL encryption</span>
            </div>
          </div>

          {error && <div className="tw-text-red-600 tw-text-sm">{error}</div>}

          {/* Actions */}
          <div className="tw-flex tw-justify-end tw-gap-3">
            <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-border tw-border-input hover:tw-bg-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90 disabled:tw-opacity-60" disabled={!paymentMethod || !amount || !enrollmentId || submitting} onClick={submitPayment}>
              {submitting ? 'Processing…' : `Pay ${amount} MDL`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;
