import * as React from "react";

interface PaymentReceiptProps {
  open: boolean;
  onClose: () => void;
  payment: any | null;
}

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-rounded-2xl tw-border tw-border-border tw-bg-background ${className}`}>{children}</div>
);
const CardHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-px-5 tw-py-4 tw-border-b tw-border-border ${className}`}>{children}</div>
);
const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-p-6 ${className}`}>{children}</div>
);

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ open, onClose, payment }) => {
  if (!open || !payment) return null;

  const dateStr = payment.payment_date ? new Date(payment.payment_date).toLocaleString() : "-";
  const amountStr = `${Number(payment.amount)} MDL`;
  const methodStr = payment.payment_method || '-';
  const description = payment.description || 'Payment';
  const courseName = payment?.enrollment?.course?.name || payment?.enrollment?.course_name || 'Course';

  function printReceipt() {
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt #${payment.id}</title>
      <meta charset=\"utf-8\" />
      <style>
        body{ font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #111827; }
        .card{ max-width: 640px; margin: 0 auto; border:1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
        h1{ font-size: 18px; margin: 0 0 12px; }
        .row{ display:flex; justify-content: space-between; padding: 6px 0; border-bottom:1px dashed #eee; }
        .row:last-child{ border-bottom: none; }
        .label{ color:#6b7280; }
        .value{ font-weight:600; }
      </style>
    </head><body>
      <div class="card">
        <h1>Payment Receipt</h1>
        <div class="row"><span class="label">Receipt #</span><span class="value">${payment.id}</span></div>
        <div class="row"><span class="label">Description</span><span class="value">${description}</span></div>
        <div class="row"><span class="label">Course</span><span class="value">${courseName}</span></div>
        <div class="row"><span class="label">Amount</span><span class="value">${amountStr}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${dateStr}</span></div>
        <div class="row"><span class="label">Method</span><span class="value">${methodStr}</span></div>
      </div>
      <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
    </body></html>`);
    win.document.close();
  }

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black/50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-background tw-rounded-2xl tw-w-full tw-max-w-lg tw-border tw-border-border tw-shadow-xl">
        <Card>
          <CardHeader>
            <div className="tw-flex tw-items-center tw-justify-between">
              <h3 className="tw-text-base tw-font-semibold">Receipt #{payment.id}</h3>
              <button onClick={onClose} className="tw-text-sm tw-text-muted-foreground hover:tw-text-foreground">Close</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="tw-space-y-2">
              <div className="tw-flex tw-justify-between"><span className="tw-text-muted-foreground">Description</span><span className="tw-font-semibold">{description}</span></div>
              <div className="tw-flex tw-justify-between"><span className="tw-text-muted-foreground">Course</span><span className="tw-font-semibold">{courseName}</span></div>
              <div className="tw-flex tw-justify-between"><span className="tw-text-muted-foreground">Amount</span><span className="tw-font-semibold">{amountStr}</span></div>
              <div className="tw-flex tw-justify-between"><span className="tw-text-muted-foreground">Date</span><span className="tw-font-semibold">{dateStr}</span></div>
              <div className="tw-flex tw-justify-between"><span className="tw-text-muted-foreground">Method</span><span className="tw-font-semibold">{methodStr}</span></div>
            </div>
            <div className="tw-flex tw-justify-end tw-gap-3 tw-mt-6">
              <button onClick={onClose} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-border tw-border-input hover:tw-bg-secondary">Close</button>
              <button onClick={printReceipt} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90">Print</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentReceipt;
