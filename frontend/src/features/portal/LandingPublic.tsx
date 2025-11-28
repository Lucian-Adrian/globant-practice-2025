import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsLoggedIn } from "../../auth/useIsLoggedIn";
import PortalLanguageSelect from "./PortalLanguageSelect.jsx";
import { useI18nForceUpdate } from "../../i18n/index.jsx";
import { API_PREFIX, buildHeaders } from "../../api/httpClient.js";

// Public backend base (env override allowed). Default matches dev docker compose exposed port (HTTP).
const PUBLIC_BACKEND_BASE = (import.meta as any)?.env?.VITE_BACKEND_PUBLIC_BASE || 'http://localhost:8000';

// Normalize media URLs coming from backend (may contain internal hostname like backend:8000 or bare /media path)
function fixHost(u: string): string {
  if (!u) return '';
  let out = u.trim();
  // If it's a blob/object URL leave it untouched
  if (out.startsWith('blob:')) return out;
  // Replace internal docker hostnames with PUBLIC_BACKEND_BASE keeping HTTP (avoid forcing HTTPS causing SSL errors)
  out = out
    .replace('http://backend:8000', PUBLIC_BACKEND_BASE)
    .replace('https://backend:8000', PUBLIC_BACKEND_BASE) // if backend reported https but we only serve http locally
    .replace('http://0.0.0.0:8000', PUBLIC_BACKEND_BASE)
    .replace('https://0.0.0.0:8000', PUBLIC_BACKEND_BASE)
    .replace('http://localhost:8000', PUBLIC_BACKEND_BASE) // unify scheme/host
    .replace('https://localhost:8000', PUBLIC_BACKEND_BASE);
  // Prefix bare media path
  if (out.startsWith('/media/')) out = `${PUBLIC_BACKEND_BASE}${out}`;
  return out;
}

interface LandingTextMap { [key: string]: string; en: string; ro: string; ru: string; }
interface SchoolConfigPortal {
  school_logo: string;
  school_logo_url: string;
  school_name: string;
  landing_image: string;
  landing_image_url: string;
  landing_text: LandingTextMap;
  social_links: Record<string, string>;
}
// Keep a tiny mock so the page works without backend
const mockConfig: SchoolConfigPortal = {
  school_logo: "/assets/logo.png",
  school_logo_url: "/assets/logo.png",        // <--- adăugat
  school_name: "DriveAdmin",
  landing_image: "/assets/landing.png",
  landing_image_url: "/assets/landing.png",   // <--- adăugat
  landing_text: {
    en: "Learn to drive with confidence. Flexible schedules, professional instructors, modern vehicles.",
    ro: "Învață să conduci cu încredere. Orar flexibil, instructori profesioniști, mașini moderne.",
    ru: "Учитесь водить уверенно. Гибкий график, профессиональные инструкторы, современные авто.",
  },
  social_links: {},
};
type SchoolConfig = SchoolConfigPortal;

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

  const [config, setConfig] = React.useState<SchoolConfig | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_PREFIX}/school/config/`);
        if (!res.ok) {
          const resAuth = await fetch(`${API_PREFIX}/school/config/`, { headers: buildHeaders() });
          if (!resAuth.ok) throw new Error('Failed fetching config');
          const dataAuth: any = await resAuth.json();
          if (mounted) setConfig(dataAuth);
        } else {
          const data: any = await res.json();
          if (mounted) setConfig(data);
        }
      } catch (e) {
        if (mounted) setConfig(mockConfig);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const lang = (i18n?.language || "en").split("-")[0];
  const landingText =
    (config?.landing_text as any)?.[lang] ??
    config?.landing_text?.en ??
    t("portal.landing.public.hero.subtitle");

  const normalizeImg = (val: any, fallback: string) => {
    if (!val) return fallback;
    if (typeof val === "string") return val || fallback;
    if (typeof val === "object") {
      const candidate = val.url || val.src || val.path || "";
      return candidate || fallback;
    }
    return fallback;
  };

  // Prefer *_url din backend; fallback pe câmpurile vechi și apoi pe mock
  const rawHero = (config as any)?.landing_image_url ?? (config as any)?.landing_image ?? mockConfig.landing_image_url;
  const rawLogo = (config as any)?.school_logo_url ?? (config as any)?.school_logo ?? mockConfig.school_logo_url;

  let heroImg = fixHost(normalizeImg(rawHero, mockConfig.landing_image));
  let logoUrl = fixHost(normalizeImg(rawLogo, mockConfig.school_logo));

  // (Diagnostics removed)

  const schoolName = config?.school_name || mockConfig.school_name;

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
