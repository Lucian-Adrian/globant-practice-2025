import * as React from "react";
import PortalNavBar from "./PortalNavBar";

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

const Badge: React.FC<React.PropsWithChildren<{ variant?: "default" | "secondary" | "warning" }>> = ({ children, variant = "secondary" }) => {
  const variants = {
    default: "tw-bg-primary tw-text-primary-foreground",
    secondary: "tw-bg-secondary tw-text-secondary-foreground",
    warning: "tw-bg-warning tw-text-warning-foreground",
  } as const;
  return <span className={`tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5 ${variants[variant]}`}>{children}</span>;
};

const Payments: React.FC = () => {
  const balance = 1200;
  const history = [
    { id: 1, date: "2024-10-01", description: "Initial Payment", amount: 2000, method: "CARD", status: "Completed" },
    { id: 2, date: "2024-10-07", description: "Driving Lesson #12", amount: 300, method: "CASH", status: "Completed" },
    { id: 3, date: "2024-10-14", description: "Driving Lesson #15", amount: 300, method: "CARD", status: "Completed" },
    { id: 4, date: "2024-10-18", description: "Late Fee", amount: 100, method: "CASH", status: "Pending" },
  ];

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
      <Container className="tw-py-8 tw-space-y-8">
        {/* Header */}
        <div className="tw-text-center tw-space-y-4 tw-animate-fade-in">
          <h1 className="tw-text-4xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-primary tw-to-primary">Payments</h1>
          <p className="tw-text-xl tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">View your balance, make payments, and review your payment history.</p>
        </div>

        <div className="tw-grid lg:tw-grid-cols-3 tw-gap-6">
          {/* Summary */}
          <Card className="lg:tw-col-span-1 tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
            <CardContent className="tw-p-8 tw-space-y-3 tw-text-center">
              <p className="tw-opacity-90">Outstanding Balance</p>
              <div className="tw-text-4xl tw-font-bold">{balance} MDL</div>
              <div className="tw-flex tw-justify-center tw-gap-2">
                <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90">Pay Now</button>
                <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-border tw-border-input hover:tw-bg-secondary tw-text-primary-foreground">View Invoice</button>
              </div>
              <p className="tw-text-xs tw-opacity-80">Next due date: Oct 25</p>
            </CardContent>
          </Card>

          {/* Details & Methods */}
          <div className="lg:tw-col-span-2 tw-space-y-6">
            <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
              <CardHeader>
                <CardTitle>Saved Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="tw-space-y-4">
                <div className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-bg-secondary/40 tw-rounded-lg tw-border tw-border-border/30">
                  <div>
                    <p className="tw-font-semibold">Visa •••• 4242</p>
                    <p className="tw-text-sm tw-text-muted-foreground">Expires 10/26</p>
                  </div>
                  <div className="tw-flex tw-gap-2">
                    <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-9 tw-px-3 tw-text-xs tw-font-medium tw-border tw-border-input hover:tw-bg-secondary">Set Default</button>
                    <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-9 tw-px-3 tw-text-xs tw-font-medium tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90">Use</button>
                  </div>
                </div>
                <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-border tw-border-dashed tw-border-input hover:tw-bg-secondary">+ Add Method</button>
              </CardContent>
            </Card>

            <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="tw-grid tw-gap-3">
                  {history.map((h) => (
                    <div key={h.id} className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-bg-secondary/30 tw-rounded-lg tw-border tw-border-border/20">
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-font-medium">{h.description}</span>
                        <span className="tw-text-xs tw-text-muted-foreground">{new Date(h.date).toLocaleDateString()} • {h.method}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <span className="tw-font-semibold">{h.amount} MDL</span>
                        <Badge variant={h.status === "Pending" ? "warning" : "secondary"}>{h.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Payments;
