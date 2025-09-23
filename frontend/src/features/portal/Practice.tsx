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

const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = "" }) => (
  <div className={`tw-w-full tw-rounded-full tw-bg-muted ${className}`}>
    <div className="tw-h-full tw-bg-primary tw-rounded-full" style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, height: "100%" }} />
  </div>
);

const Practice: React.FC = () => {
  const modules = [
    { id: 1, title: "Traffic Signs", desc: "Learn and practice road signs.", progress: 80 },
    { id: 2, title: "Right of Way", desc: "Understand intersections and priority rules.", progress: 65 },
    { id: 3, title: "Parking", desc: "Parallel, perpendicular and angle parking.", progress: 30 },
    { id: 4, title: "Highway Driving", desc: "Merging, lane changes and speed control.", progress: 45 },
  ];

  const quizzes = [
    { id: 1, title: "Traffic Signs Quiz", questions: 20, best: 18 },
    { id: 2, title: "Rules & Safety", questions: 15, best: 12 },
    { id: 3, title: "Parking Scenarios", questions: 10, best: 7 },
  ];

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
      <Container className="tw-py-8 tw-space-y-8">
        {/* Header */}
        <div className="tw-text-center tw-space-y-4 tw-animate-fade-in">
          <h1 className="tw-text-4xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-primary tw-to-primary">Practice</h1>
          <p className="tw-text-xl tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">Sharpen your theory and practical knowledge with focused modules and quizzes.</p>
        </div>

        {/* Modules */}
        <div className="tw-grid md:tw-grid-cols-2 tw-gap-6">
          {modules.map((m) => (
            <Card key={m.id} className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card hover:tw-scale-[1.01] tw-transition-transform">
              <CardHeader>
                <CardTitle className="tw-flex tw-items-center tw-justify-between">
                  <span>{m.title}</span>
                  <span className="tw-text-sm tw-text-muted-foreground">{m.progress}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="tw-space-y-3">
                <p className="tw-text-sm tw-text-muted-foreground">{m.desc}</p>
                <ProgressBar value={m.progress} className="tw-h-2" />
                <div className="tw-flex tw-gap-2">
                  <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90">Continue</button>
                  <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-border tw-border-input hover:tw-bg-secondary">Restart</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quizzes */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader>
            <CardTitle>Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tw-grid md:tw-grid-cols-3 tw-gap-4">
              {quizzes.map((q) => (
                <div key={q.id} className="tw-p-4 tw-rounded-lg tw-border tw-border-border/30 tw-bg-secondary/40 hover:tw-bg-secondary/60 tw-transition-colors">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <h4 className="tw-font-semibold">{q.title}</h4>
                    <span className="tw-text-xs tw-bg-primary tw-text-primary-foreground tw-rounded-md tw-px-2 tw-py-0.5">Best: {q.best}/{q.questions}</span>
                  </div>
                  <p className="tw-text-sm tw-text-muted-foreground">{q.questions} questions</p>
                  <div className="tw-mt-3 tw-flex tw-gap-2">
                    <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-9 tw-px-3 tw-text-xs tw-font-medium tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90">Start</button>
                    <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-9 tw-px-3 tw-text-xs tw-font-medium tw-border tw-border-input hover:tw-bg-secondary">Review</button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Practice;
