import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const base =
    "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-full tw-text-sm tw-font-medium tw-transition-all tw-duration-200 tw-focus-visible:tw-outline-none tw-focus-visible:tw-ring-2 tw-focus-visible:tw-ring-ring tw-disabled:tw-opacity-50 tw-disabled:tw-pointer-events-none";
  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "tw-h-9 tw-px-3",
    md: "tw-h-10 tw-px-4",
    lg: "tw-h-11 tw-px-6",
  };
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90",
    secondary: "tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/80",
    outline:
      "tw-bg-transparent tw-text-foreground tw-border tw-border-input hover:tw-bg-secondary",
    ghost: "tw-bg-transparent tw-text-foreground hover:tw-bg-secondary",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge: React.FC<React.PropsWithChildren<{ variant?: "outline" | "secondary" | "destructive"; className?: string }>> = ({ variant = "secondary", className = "", children }) => {
  const base = "tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5";
  const variants = {
    outline: "tw-border tw-border-input tw-text-foreground",
    secondary: "tw-bg-secondary tw-text-secondary-foreground",
    destructive: "tw-bg-red-500/15 tw-text-red-600",
  } as const;
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
};

const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <div className={`tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 ${className}`}>{children}</div>
);

const CardRoot: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-rounded-2xl tw-border tw-border-border tw-bg-background ${className}`}>{children}</div>
);
const CardHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-px-5 tw-py-4 tw-border-b tw-border-border ${className}`}>{children}</div>
);
const CardTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <h3 className={`tw-text-base tw-font-semibold ${className}`}>{children}</h3>
);
const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-p-5 ${className}`}>{children}</div>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  description: string;
  variant?: "primary" | "warning";
  trend?: { value: string; isPositive: boolean };
}> = ({ title, value, description, variant, trend }) => (
  <CardRoot className="tw-animate-fade-in-up">
    <CardContent>
      <div className="tw-flex tw-items-start tw-justify-between">
        <div>
          <div className="tw-text-sm tw-text-muted-foreground">{title}</div>
          <div className="tw-mt-1 tw-text-2xl tw-font-semibold">{value}</div>
          <div className="tw-text-xs tw-text-muted-foreground tw-mt-1">{description}</div>
        </div>
        <div className={`tw-w-10 tw-h-10 tw-rounded-lg ${variant === "primary" ? "tw-bg-primary/10" : variant === "warning" ? "tw-bg-amber-500/15" : "tw-bg-muted"} tw-flex tw-items-center tw-justify-center`}>
          <div className={`${variant === "primary" ? "tw-bg-primary" : variant === "warning" ? "tw-bg-amber-500" : "tw-bg-foreground/40"} tw-w-4 tw-h-4 tw-rounded-sm`}></div>
        </div>
      </div>
      {trend && (
        <div className={`tw-mt-3 tw-text-xs ${trend.isPositive ? "tw-text-emerald-600" : "tw-text-red-600"}`}>{trend.value}</div>
      )}
    </CardContent>
  </CardRoot>
);

const NavBar: React.FC = () => {
  const { t } = useTranslation('portal');
  return (
    <>
      <nav className="tw-fixed tw-top-4 tw-left-1/2 tw-transform -tw-translate-x-1/2 tw-z-50 tw-w-full tw-max-w-6xl tw-px-4 tw-hidden md:tw-block">
        <div className="tw-bg-white tw-rounded-full tw-px-6 tw-py-3 tw-shadow-lg">
          <div className="tw-flex tw-items-center tw-justify-between">
            {/* Brand */}
            <div className="tw-flex tw-items-center tw-space-x-2">
              <img src="/assets/logo.png" alt={t('portal.landing.public.img.alt.logo')} className="tw-w-10 tw-h-10 tw-object-contain" />
              <span className="tw-text-xl tw-font-bold tw-text-gray-900">{t('appName', { ns: 'portal', defaultValue: 'DriveAdmin' })}</span>
            </div>
            {/* Nav Links */}
            <div className="tw-flex tw-items-center tw-space-x-6">
              {[
                { path: "/dashboard", label: t('portal.landing.public.nav.dashboard') },
                { path: "/lessons", label: t('portal.landing.public.nav.lessons') },
                { path: "/progress", label: t('portal.landing.public.nav.progress') },
                { path: "/practice", label: t('portal.landing.public.nav.practice') },
                { path: "/payments", label: t('portal.landing.public.nav.payments') },
              ].map(item => (
                <a key={item.path} href={item.path} className="tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-text-gray-900 tw-transition-colors">
                  {item.label}
                </a>
              ))}
            </div>
            {/* Avatar */}
            <div className="tw-w-10 tw-h-10 tw-bg-gradient-card tw-rounded-full tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-primary/20">
              <div className="tw-w-8 tw-h-8 tw-bg-primary tw-rounded-full tw-flex tw-items-center tw-justify-center">
                <span className="tw-text-xs tw-font-bold tw-text-primary-foreground">JS</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="tw-h-32" />
    </>
  );
};

const LandingStudent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('portal');
  return (
  <div className="tw-min-h-screen tw-bg-white tw-text-gray-900">
      <NavBar />
      <Container className="tw-pb-10">
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 tw-mt-2">
          {/* Left: copy like LandingPublic hero */}
          <div className="tw-space-y-4">
            <div className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-muted-foreground">{t('portal.landing.student.hero.kicker')}</div>
            <h1 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-leading-tight">{t('portal.landing.student.hero.title')}</h1>
            <p className="tw-text-base sm:tw-text-lg tw-text-muted-foreground">{t('portal.landing.student.hero.subtitle')}</p>
          </div>

          {/* Right: image + CTA */}
          <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
            <div className="tw-w-full tw-aspect-[16/10] tw-rounded-xl tw-border tw-border-dashed tw-border-border tw-bg-muted tw-flex tw-items-center tw-justify-center">
              <span className="tw-text-sm tw-text-muted-foreground">Image Placeholder</span>
            </div>
            <Button
              variant="primary"
              className="tw-w-full sm:tw-w-auto tw-rounded-full"
              onClick={() => navigate('/signup')}
            >
              {t('portal.landing.student.hero.ctaBook')}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LandingStudent;
