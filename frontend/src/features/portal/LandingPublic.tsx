import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsLoggedIn } from "../../auth/useIsLoggedIn";
import PortalLanguageSelect from "./PortalLanguageSelect.jsx";
import { useI18nForceUpdate } from "../../i18n/index.jsx";
import { useSchoolConfig } from "../../shared/hooks/useSchoolConfig";

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
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Shared constrained layout width (match NavBar's max-w-6xl so edges align)
const Container: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <div
    className={`tw-max-w-6xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 ${className}`}
  >
    {children}
  </div>
);

// Inline icons (avoid external deps)
const ChevronDown: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const ArrowRight: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const NavBar: React.FC<{ logoUrl: string; schoolName: string }> = ({
  logoUrl,
  schoolName,
}) => {
  const navigate = useNavigate();
  const loggedIn = useIsLoggedIn();
  const { t } = useTranslation("portal");
  useI18nForceUpdate();
  return (
    <nav className="tw-fixed tw-top-4 tw-left-1/2 tw-transform -tw-translate-x-1/2 tw-z-50 tw-w-full tw-max-w-6xl tw-px-4">
      <div className="tw-bg-white tw-rounded-full tw-px-6 tw-py-3 tw-shadow-lg">
        <div className="tw-flex tw-items-center tw-justify-between">
          {/* Logo / Brand */}
          <div className="tw-flex tw-items-center tw-space-x-2">
            <img
              src={logoUrl}
              alt={t("portal.landing.public.img.alt.logo")}
              className="tw-w-10 tw-h-10 tw-object-contain"
            />
            <span className="tw-text-xl tw-font-bold tw-text-gray-900">
              {schoolName ||
                t("appName", { defaultValue: "DriveAdmin" })}
            </span>
          </div>

          {/* Navigation Menu */}
          {/* hide the md menu for guests */}
          {/* For md+ screens: show pages when logged in; show motto when guest */}
          {loggedIn ? (
            <div className="tw-hidden md:tw-flex tw-items-center tw-space-x-8">
              <div className="tw-flex tw-items-center tw-space-x-1 tw-text-gray-700 hover:tw-text-gray-900 tw-cursor-pointer">
                <span>
                  {t("portal.landing.public.nav.features", {
                    defaultValue: "Features",
                  })}
                </span>
                <ChevronDown className="tw-w-4 tw-h-4" />
              </div>
              <div className="tw-flex tw-items-center tw-space-x-1 tw-text-gray-700 hover:tw-text-gray-900 tw-cursor-pointer">
                <span>
                  {t("portal.landing.public.nav.cases", {
                    defaultValue: "Cases",
                  })}
                </span>
                <ChevronDown className="tw-w-4 tw-h-4" />
              </div>
              <span className="tw-text-gray-700 hover:tw-text-gray-900 tw-cursor-pointer">
                {t("portal.landing.public.nav.pricing", {
                  defaultValue: "Pricing",
                })}
              </span>
              <span className="tw-text-gray-700 hover:tw-text-gray-900 tw-cursor-pointer">
                {t("portal.landing.public.nav.reviews", {
                  defaultValue: "Reviews",
                })}
              </span>
            </div>
          ) : (
            <div className="tw-hidden md:tw-flex tw-items-center tw-space-x-8">
              <span className="tw-text-sm tw-text-muted-foreground">
                {t("portal.landing.public.hero.subtitle")}
              </span>
            </div>
          )}

          {/* CTA Buttons (Get started + Log in) */}
          <div className="tw-flex tw-items-center tw-space-x-3">
            <button
              onClick={() => navigate("/login")}
              className="tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-text-gray-900 tw-transition-colors"
            >
              {t("portal.landing.public.hero.ctaSecondary")}
            </button>
            <Button
              className="tw-bg-primary hover:tw-bg-primary/90 tw-text-white tw-rounded-full tw-px-6 tw-py-2 tw-flex tw-items-center tw-space-x-2"
              onClick={() => navigate("/signup")}
            >
              <span>{t("portal.landing.public.hero.ctaPrimary")}</span>
              <ArrowRight className="tw-w-4 tw-h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPublic: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("portal");
  useI18nForceUpdate();
  const { config } = useSchoolConfig();

  const lang = (i18n?.language || "en").split("-")[0];
  const landingText =
    (config?.landing_text || {})[lang] ||
    (config?.landing_text || {}).en ||
    t("portal.landing.public.hero.subtitle");

  const heroImg = config.landing_image;
  const logoUrl = config.school_logo;
  const schoolName = config.school_name;

  return (
    <div className="tw-min-h-screen tw-bg-white tw-text-gray-900">
      {/* Language selector top-right (portal specific) */}
      <div className="tw-fixed tw-top-2 tw-right-2 tw-z-50">
        <PortalLanguageSelect />
      </div>
      <NavBar logoUrl={logoUrl} schoolName={schoolName} />
      {/* Spacer for fixed rounded navbar (height ~ 56 + top margin) */}
      <div className="tw-h-28" />
      <Container className="tw-pb-10">
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 tw-mt-10">
          {/* Left: copy like LandingStudent */}
          <div className="tw-space-y-4">
            <div className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-muted-foreground tw-mt-6">
              {t("portal.landing.public.hero.kicker")}
            </div>
            {/* If guest, show a short motto; otherwise show the main heading */}
            <h1 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-leading-tight">
              {t("portal.landing.public.hero.title")}
            </h1>
            <p className="tw-text-base sm:tw-text-lg tw-text-muted-foreground">
              {landingText}
            </p>
            {/* Left side single CTA (wider) */}
            <div className="tw-pt-4">
              <Button
                variant="primary"
                className="tw-w-full sm:tw-w-auto tw-min-w-[220px] tw-px-12 tw-h-12 tw-text-base"
                onClick={() => navigate("/signup")}
              >
                {t("portal.landing.public.hero.ctaPrimary")}
              </Button>
            </div>
          </div>

          {/* Right: landing image (smaller, no animation, no mask) */}
          <div className="tw-flex tw-items-center tw-justify-center">
            <div className="tw-w-full md:tw-w-11/12 lg:tw-w-4/5">
              {/* use natural image aspect ratio, no absolute cropping */}
              <img
                src={heroImg}
                alt={t("portal.landing.public.img.alt.hero")}
                className="tw-w-full tw-h-auto tw-block"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LandingPublic;
