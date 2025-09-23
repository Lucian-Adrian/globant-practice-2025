import * as React from "react";

const PortalNavBar: React.FC = () => (
  <>
    <nav className="tw-hidden md:tw-flex tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-50 tw-bg-background/80 tw-backdrop-blur-md tw-border-b tw-border-border">
      <div className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-py-4 tw-w-full">
        <div className="tw-flex tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-w-10 tw-h-10 tw-bg-gradient-primary tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-glow">
              <span className="tw-text-base tw-font-bold tw-text-primary-foreground">DA</span>
            </div>
            <div>
              <h1 className="tw-text-xl tw-font-bold">DriveAcademy</h1>
              <p className="tw-text-sm tw-text-muted-foreground">Student Portal</p>
            </div>
          </div>

          <div className="tw-flex tw-items-center tw-gap-2">
            {[ 
              { path: "/dashboard", label: "Dashboard" },
              { path: "/lessons", label: "Lessons" },
              { path: "/progress", label: "Progress" },
              { path: "/practice", label: "Practice" },
              { path: "/payments", label: "Payments" },
            ].map((item) => (
              <a key={item.path} href={item.path} className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-duration-200 hover:tw-bg-secondary hover:tw-scale-105 tw-text-muted-foreground hover:tw-text-foreground">
                <span className="tw-w-4 tw-h-4 tw-rounded-sm tw-bg-foreground/40"></span>
                {item.label}
              </a>
            ))}
          </div>

          <div className="tw-w-10 tw-h-10 tw-bg-gradient-card tw-rounded-full tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-primary/20">
            <div className="tw-w-8 tw-h-8 tw-bg-primary tw-rounded-full tw-flex tw-items-center tw-justify-center">
              <span className="tw-text-xs tw-font-bold tw-text-primary-foreground">JS</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div className="tw-h-20 md:tw-h-24" />
  </>
);

export default PortalNavBar;
