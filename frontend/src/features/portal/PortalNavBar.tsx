import * as React from "react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SportsMotorsportsIcon from '@mui/icons-material/SportsMotorsports';
import PaymentIcon from '@mui/icons-material/Payment';

function getStudentInitials(): string {
  try {
    const raw = localStorage.getItem('student_profile');
    if (!raw) return 'ST';
    const p = JSON.parse(raw);
    const f = (p.first_name || '').trim();
    const l = (p.last_name || '').trim();
    const initials = `${f ? f[0] : ''}${l ? l[0] : ''}`.toUpperCase();
    return initials || 'ST';
  } catch {
    return 'ST';
  }
}

const PortalNavBar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((v) => !v);
  const logout = () => {
    try {
      localStorage.removeItem('student_access_token');
      localStorage.removeItem('student_refresh_token');
      localStorage.removeItem('student_profile');
    } catch {}
    window.location.href = '/login';
  };

  return (
    <>
      <nav className="tw-hidden md:tw-flex tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-50 tw-bg-background/80 tw-backdrop-blur-md tw-border-b tw-border-border">
        <div className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-py-4 tw-w-full">
          <div className="tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-items-center tw-gap-3">
              <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-glow">
                <img src="/assets/logo.png" alt="DriveAdmin logo" className="tw-w-10 tw-h-10 tw-object-contain tw-rounded-xl" />
              </div>
              <div>
                <h1 className="tw-text-xl tw-font-bold">DriveAdmin</h1>
                <p className="tw-text-sm tw-text-muted-foreground">Student Portal</p>
              </div>
            </div>

            <div className="tw-flex tw-items-center tw-gap-2">
              {[
                { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon className="tw-w-4 tw-h-4" color="inherit" /> },
                { path: "/lessons", label: "Lessons", icon: <MenuBookIcon className="tw-w-4 tw-h-4" color="inherit" /> },
                { path: "/progress", label: "Progress", icon: <TrendingUpIcon className="tw-w-4 tw-h-4" color="inherit" /> },
                { path: "/practice", label: "Practice", icon: <SportsMotorsportsIcon className="tw-w-4 tw-h-4" color="inherit" /> },
                { path: "/payments", label: "Payments", icon: <PaymentIcon className="tw-w-4 tw-h-4" color="inherit" /> },
              ].map((item) => (
                <a key={item.path} href={item.path} className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-duration-200 hover:tw-bg-secondary hover:tw-scale-105 tw-text-muted-foreground hover:tw-text-foreground">
                  <span className="tw-flex tw-items-center tw-justify-center" aria-hidden="true">{item.icon}</span>
                  <span className="tw-select-none">{item.label}</span>
                </a>
              ))}
            </div>

            <div className="tw-relative">
              <button onClick={toggle} className="tw-w-10 tw-h-10 tw-bg-gradient-card tw-rounded-full tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-primary/20">
                <div className="tw-w-8 tw-h-8 tw-bg-primary tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <span className="tw-text-xs tw-font-bold tw-text-primary-foreground">{getStudentInitials()}</span>
                </div>
              </button>
              {open && (
                <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-44 tw-rounded-lg tw-border tw-border-border tw-bg-background tw-shadow-lg">
                  <button onClick={logout} className="tw-w-full tw-text-left tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-secondary tw-text-red-600">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="tw-h-20 md:tw-h-24" />
    </>
  );
};

export default PortalNavBar;
