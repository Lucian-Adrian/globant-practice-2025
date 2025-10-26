import * as React from "react";
import { useTranslation } from 'react-i18next';
import PortalNavBar from "./PortalNavBar";
import { useEffect, useMemo, useState } from "react";
import { studentRawFetch } from "../../api/httpClient";
import MakePayment from "./MakePayment";
import PaymentReceipt from "./PaymentReceipt";
import { iconXs, iconSm, iconMd, iconLg } from "../../shared/constants/iconSizes";

// Tiny UI primitives matching our portal styles
const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <div className={`tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 ${className}`}>{children}</div>
);
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-rounded-2xl tw-border tw-border-border tw-bg-background ${className}`}>{children}</div>
);
const CardHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-px-5 tw-py-4 tw-border-b tw-border-border ${className}`}>{children}</div>
);
const CardTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <h3 className={`tw-text-base tw-font-semibold ${className}`}>{children}</h3>
);
const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-p-6 ${className}`}>{children}</div>
);

const Badge: React.FC<React.PropsWithChildren<{ variant?: "default" | "secondary" | "warning" | "destructive" | "outline" | "success"; className?: string }>> = ({ children, variant = "secondary", className = "" }) => {
  const variants = {
    default: "tw-bg-primary tw-text-primary-foreground",
    secondary: "tw-bg-secondary tw-text-secondary-foreground",
    warning: "tw-bg-warning tw-text-warning-foreground",
    destructive: "tw-bg-destructive tw-text-destructive-foreground",
    outline: "tw-border tw-border-input",
    // Map success to primary to improve contrast and keep consistency across pages
    success: "tw-bg-primary tw-text-primary-foreground",
  } as const;
  return <span className={`tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5 ${variants[variant]} ${className}`}>{children}</span>;
};

// Small inline icons (no default size class; use iconXs/iconSm/iconMd/iconLg at call sites)
const CreditCardIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>);
const CalendarIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const CheckCircleIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>);
const ClockIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const AlertCircleIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1"/></svg>);
const ShieldIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const LockIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);

const Payments: React.FC = () => {
  const { t } = useTranslation('portal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Make-a-payment form state
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const resp = await studentRawFetch('/api/student/dashboard/', { headers: { 'Content-Type': 'application/json' } });
        if (resp.status === 401) { window.location.href = '/login'; return; }
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.detail || body?.message || 'Failed to load payments');
        if (mounted) setData(body);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  const enrollments = useMemo(() => (data?.enrollments ?? []), [data]);
  const payments = useMemo(() => (data?.payments ?? []), [data]);
  const courses = useMemo(() => (data?.courses ?? []), [data]);

  const totalCourse = useMemo(() => {
    const ids = new Set((enrollments || []).map((e: any) => e?.course_id || e?.course?.id));
    const sum = (courses || [])
      .filter((c: any) => ids.has(c?.id))
      .reduce((acc: number, c: any) => acc + Number(c?.price || 0), 0);
    return sum;
  }, [enrollments, courses]);
  const totalPaid = useMemo(() => (payments || []).reduce((acc: number, p: any) => acc + Number(p?.amount || 0), 0), [payments]);
  const outstanding = Math.max(0, Number(totalCourse || 0) - Number(totalPaid || 0));
  const paymentSummary = { totalPaid, outstanding, totalCourse };

  // Pick primary enrollment for due date: prefer IN_PROGRESS, else earliest by enrollment_date
  const primaryEnrollment = useMemo(() => {
    const list = Array.isArray(enrollments) ? enrollments.slice() : [];
    if (!list.length) return null;
    const inProgress = list.find((e:any) => (e?.status||'').toUpperCase()==='IN_PROGRESS');
    if (inProgress) return inProgress;
    list.sort((a:any,b:any) => new Date(a.enrollment_date).getTime() - new Date(b.enrollment_date).getTime());
    return list[0];
  }, [enrollments]);

  function addMonths(date: Date, months: number) {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    // handle month overflow (e.g., Jan 31 + 1 month → Mar 03 in JS). Clamp to last day of month.
    if (d.getDate() < day) d.setDate(0);
    return d;
  }
  const dueDateInfo = useMemo(() => {
    try {
      const ed = primaryEnrollment?.enrollment_date ? new Date(primaryEnrollment.enrollment_date) : null;
      if (!ed || isNaN(ed.getTime())) return null;
      const due = addMonths(ed, 3);
      const today = new Date();
      const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const label = due.toLocaleDateString();
      const relative = diffDays > 0
        ? t('commonUI.inDays', { count: diffDays, defaultValue: `In ${diffDays} day${diffDays === 1 ? '' : 's'}` })
        : diffDays === 0
          ? t('commonUI.today', 'Today')
          : t('commonUI.daysAgo', { count: Math.abs(diffDays), defaultValue: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago` });
      return { label, relative };
    } catch {
      return null;
    }
  }, [primaryEnrollment, t]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success">{t('payments.status.paid', 'Paid')}</Badge>;
      case 'pending': return <Badge variant="warning">{t('payments.status.pending', 'Due Soon')}</Badge>;
      case 'upcoming': return <Badge variant="secondary">{t('payments.status.upcoming', 'Upcoming')}</Badge>;
      case 'overdue': return <Badge variant="destructive">{t('payments.status.overdue', 'Overdue')}</Badge>;
      default: return <Badge variant="outline">{t(`payments.status.${status}`, status)}</Badge>;
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className={`${iconXs} tw-text-primary`} />;
      case 'pending': return <AlertCircleIcon className={`${iconXs} tw-text-warning`} />;
      case 'upcoming': return <ClockIcon className={`${iconXs} tw-text-muted-foreground`} />;
      default: return null;
    }
  };

  const progressPct = paymentSummary.totalCourse > 0 ? (paymentSummary.totalPaid / paymentSummary.totalCourse) * 100 : 0;
  const openMakePayment = (target?: any) => {
    setSelectedPayment(target || { type: t('payments.customPayment', 'Custom Payment'), amount: Math.max(0, outstanding) });
    setIsPaymentModalOpen(true);
  };
  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
      <Container className="tw-py-8 tw-space-y-8">
        {/* Header */}
        <div className="tw-text-center tw-space-y-4 tw-animate-fade-in">
          <h1 className="tw-text-4xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-primary tw-via-primary-glow tw-to-primary">{t('payments.header.title')}</h1>
          <p className="tw-text-xl tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">{t('payments.header.subtitle')}</p>
        </div>

        {/* Summary Cards */}
        <div className="tw-grid md:tw-grid-cols-3 tw-gap-6 tw-animate-fade-in-up">
          <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
            <CardContent className="tw-p-6 tw-text-center">
              <CreditCardIcon className={`${iconLg} tw-mx-auto tw-mb-3`} />
              <div className="tw-text-3xl tw-font-bold tw-mb-2">{paymentSummary.totalPaid} {t('makePayment.currency')}</div>
              <div className="tw-opacity-90">{t('payments.cards.totalPaid')}</div>
              <div className="tw-text-sm tw-opacity-75 tw-mt-1">{t('payments.cards.ofCourse', { pct: progressPct.toFixed(0) })}</div>
            </CardContent>
          </Card>

          <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
            <CardContent className="tw-p-6 tw-text-center tw-space-y-3">
              <AlertCircleIcon className={`${iconLg} tw-text-warning tw-mx-auto`} />
              <div className="tw-text-3xl tw-font-bold tw-text-foreground">{paymentSummary.outstanding} {t('makePayment.currency')}</div>
              <div className="tw-text-muted-foreground">{t('payments.cards.outstanding')}</div>
              <div>
                <button onClick={() => openMakePayment()} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90">{t('payments.cards.payNow')}</button>
              </div>
            </CardContent>
          </Card>

          <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
            <CardContent className="tw-p-6 tw-text-center">
              <CalendarIcon className={`${iconLg} tw-text-primary tw-mx-auto tw-mb-3`} />
              <div className="tw-text-lg tw-font-bold tw-text-foreground tw-mb-2">{dueDateInfo?.label ?? '-'}</div>
              <div className="tw-text-muted-foreground">{t('payments.cards.nextDueDate')}</div>
              <div className="tw-text-sm tw-text-muted-foreground tw-mt-1">{dueDateInfo?.relative ?? ''}</div>
            </CardContent>
          </Card>
        </div>

        {/* Removed Next Payment Alert per request */}

        {/* Payment History */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader>
            <CardTitle className="tw-flex tw-items-center tw-gap-2">
              <CreditCardIcon className={`${iconSm} tw-text-primary`} />
              {t('payments.history.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tw-overflow-x-auto">
              <table className="tw-w-full tw-text-sm">
                <thead>
                  <tr className="tw-text-left tw-text-muted-foreground">
                    <th className="tw-py-2 tw-px-3">{t('payments.history.description')}</th>
                    <th className="tw-py-2 tw-px-3">{t('payments.history.amount')}</th>
                    <th className="tw-py-2 tw-px-3">{t('payments.history.date')}</th>
                    <th className="tw-py-2 tw-px-3">{t('payments.history.status')}</th>
                    <th className="tw-py-2 tw-px-3">{t('payments.history.paymentMethod')}</th>
                    <th className="tw-py-2 tw-px-3">{t('payments.history.action')}</th>
                  </tr>
                </thead>
                <tbody>
          {payments.map((p: any) => (
                    <tr key={p.id} className="hover:tw-bg-secondary/30">
                      <td className="tw-py-2 tw-px-3">
                        <div className="tw-flex tw-items-center tw-gap-2">
              {getStatusIcon((p?.status && typeof p.status === 'string' ? p.status.toLowerCase() : 'paid'))}
                          <span className="tw-font-medium">{p.description || t('payments.history.payment')}</span>
                        </div>
                      </td>
                      <td className="tw-py-2 tw-px-3 tw-font-semibold">{Number(p.amount)} {t('makePayment.currency')}</td>
                      <td className="tw-py-2 tw-px-3 tw-text-muted-foreground">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '-'}</td>
            <td className="tw-py-2 tw-px-3">{getStatusBadge((p?.status && typeof p.status === 'string' ? p.status.toLowerCase() : 'paid'))}</td>
                      <td className="tw-py-2 tw-px-3 tw-text-muted-foreground">{p.payment_method || '-'}</td>
                      <td className="tw-py-2 tw-px-3">
                        <button onClick={() => { setSelectedPayment(p); setReceiptOpen(true); }} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-h-9 tw-px-3 tw-text-xs tw-font-medium tw-border tw-border-input hover:tw-bg-secondary">{t('payments.history.receipt')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods / Security / CTA */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader>
            <CardTitle className="tw-flex tw-items-center tw-gap-2">
              <ShieldIcon className={`${iconSm} tw-text-primary`} />
              {t('payments.secure.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tw-grid md:tw-grid-cols-3 tw-gap-6">
              {/* Column 1: Accepted Payment Methods (two inner columns if space) */}
              <div className="tw-space-y-4">
                <h3 className="tw-font-semibold tw-text-foreground">{t('payments.secure.acceptedMethods')}</h3>
                <div className="tw-grid grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
                  <Card className="tw-bg-secondary/30 tw-border-border/30 tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
                      <div className="tw-h-6 tw-px-2 tw-rounded tw-bg-white tw-text-black tw-text-xs tw-font-bold tw-flex tw-items-center">VISA</div>
                      <div className="tw-h-6 tw-px-2 tw-rounded tw-bg-black tw-text-white tw-text-xs tw-font-bold tw-flex tw-items-center">Mastercard</div>
                    </div>
                  </Card>
                  <Card className="tw-bg-secondary/30 tw-border-border/30 tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
                      <div className="tw-h-6 tw-px-2 tw-rounded tw-bg-black tw-text-white tw-text-xs tw-font-bold tw-flex tw-items-center">Google&nbsp;Pay</div>
                      <div className="tw-h-6 tw-px-2 tw-rounded tw-bg-black tw-text-white tw-text-xs tw-font-bold tw-flex tw-items-center">Apple&nbsp;Pay</div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Column 2: Security Features */}
              <div className="tw-space-y-4 tw-text-center">
                <h3 className="tw-font-semibold tw-text-foreground tw-flex tw-items-center tw-justify-center tw-gap-2">
                  <LockIcon className={iconXs} />
                  {t('payments.secure.securityFeatures')}
                </h3>
          <div className="tw-space-y-3 tw-text-sm tw-text-muted-foreground">
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-2"><CheckCircleIcon className={`${iconXs} tw-text-primary`} />{t('payments.secure.featureSsl')}</div>
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-2"><CheckCircleIcon className={`${iconXs} tw-text-primary`} />{t('payments.secure.featurePci')}</div>
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-2"><CheckCircleIcon className={`${iconXs} tw-text-primary`} />{t('payments.secure.featureFraud')}</div>
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-2"><CheckCircleIcon className={`${iconXs} tw-text-primary`} />{t('payments.secure.featureGateway')}</div>
                </div>
              </div>

              {/* Column 3: Pay Now */}
              <div className="tw-flex tw-items-center tw-justify-center">
                <button onClick={() => openMakePayment()} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-6 tw-text-sm tw-font-medium tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90">{t('payments.cards.payNow')}</button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Plan */}
        <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
          <CardContent className="tw-p-8 tw-text-center">
            <div className="tw-space-y-4">
              <div className="tw-text-4xl">💳</div>
              <h3 className="tw-text-2xl tw-font-bold">{t('payments.plan.title')}</h3>
              <p className="tw-opacity-90 tw-max-w-md tw-mx-auto">{t('payments.plan.description')}</p>
              <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-6 tw-text-sm tw-font-medium tw-transition-colors tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90">{t('payments.plan.cta')}</button>
            </div>
          </CardContent>
        </Card>

        {/* Make a Payment Modal */}
        <MakePayment
          open={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amountDefault={Math.max(0, outstanding)}
          enrollments={enrollments}
          onSuccess={async () => {
            // refresh dashboard data after a real payment
            setLoading(true);
            try {
              const resp = await studentRawFetch('/api/student/dashboard/', { headers: { 'Content-Type': 'application/json' } });
              const body = await resp.json().catch(() => ({}));
              if (resp.ok) setData(body);
            } finally {
              setLoading(false);
            }
          }}
        />
      </Container>
      {/* Receipt Modal */}
      <PaymentReceipt open={receiptOpen} onClose={() => setReceiptOpen(false)} payment={selectedPayment} />
    </div>
  );
};

export default Payments;
