import * as React from "react";
import { useNavigate } from "react-router-dom";

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
    "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-duration-200 tw-focus-visible:tw-outline-none tw-focus-visible:tw-ring-2 tw-focus-visible:tw-ring-ring tw-disabled:tw-opacity-50 tw-disabled:tw-pointer-events-none";
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

const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <div className={`tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 ${className}`}>{children}</div>
);

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <nav className="tw-hidden md:tw-flex tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-50 tw-bg-background/80 tw-backdrop-blur-md tw-border-b tw-border-border">
      <div className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-py-4 tw-w-full">
        <div className="tw-flex tw-items-center tw-justify-between">
          {/* Logo */}
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-w-10 tw-h-10 tw-bg-gradient-primary tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-glow">
              <span className="tw-text-base tw-font-bold tw-text-primary-foreground">DA</span>
            </div>
            <div>
              <h1 className="tw-text-xl tw-font-bold">DriveAcademy</h1>
              <p className="tw-text-sm tw-text-muted-foreground">Welcome</p>
            </div>
          </div>

          {/* Motto centered */}
          <div className="tw-flex tw-items-center tw-justify-center tw-text-center">
            <span className="tw-text-sm sm:tw-text-base tw-font-medium tw-text-muted-foreground">Learn. Drive. Shine.</span>
          </div>

          {/* Right actions */}
          <div className="tw-flex tw-items-center tw-gap-2">
            <Button variant="secondary" onClick={() => navigate('/login')}>Log in</Button>
            <Button variant="primary" onClick={() => navigate('/signup')}>Get started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPublic: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <NavBar />
      {/* Spacer for fixed navbar */}
      <div className="tw-h-20 md:tw-h-24" />
      <Container className="tw-pb-10">
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 tw-mt-2">
          {/* Left: copy like LandingStudent */}
          <div className="tw-space-y-4">
            <div className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-muted-foreground">
              Your path to driving success
            </div>
            <h1 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-leading-tight">
              Master driving with expert lessons, real practice, and clear
              <br className="tw-hidden sm:tw-inline" /> progress tracking.
            </h1>
            <p className="tw-text-base sm:tw-text-lg tw-text-muted-foreground">
              Build confidence behind the wheel with structured learning, personalized guidance, and a dashboard that shows your progress every step of the way.
            </p>
          </div>

          {/* Right: image + CTA */}
          <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
            <div className="tw-w-full tw-aspect-[16/10] tw-rounded-xl tw-border tw-border-dashed tw-border-border tw-bg-muted tw-flex tw-items-center tw-justify-center">
              <span className="tw-text-sm tw-text-muted-foreground">Hero Image Placeholder</span>
            </div>
            <Button
              variant="primary"
              className="tw-w-full sm:tw-w-auto"
              onClick={() => navigate('/signup')}
            >
              Get started
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LandingPublic;
