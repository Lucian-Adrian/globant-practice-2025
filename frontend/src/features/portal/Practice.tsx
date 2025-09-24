import * as React from "react";
import PortalNavBar from "./PortalNavBar";
import { useNavigate } from "react-router-dom";

// Simple UI primitives matching current portal styling
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

const TabButton: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ active = false, onClick, children }) => (
  <button
    className={`tw-flex tw-items-center tw-justify-center tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors
      ${active ? "tw-bg-primary tw-text-primary-foreground" : "tw-bg-secondary tw-text-foreground hover:tw-bg-secondary/80"}`}
    onClick={onClick}
  >
    {children}
  </button>
);

// Supported countries and languages per requirements
const COUNTRY_LANGUAGES: Record<string, { label: string; languages: { id: string; name: string }[] } > = {
  md: { label: 'Moldova', languages: [
    { id: 'ro', name: 'Română' },
    { id: 'ru', name: 'Русский' },
  ]},
  ua: { label: 'Ukraine', languages: [
    { id: 'ru', name: 'Русский' },
    { id: 'uk', name: 'Українська' },
  ]},
  ru: { label: 'Russia', languages: [
    { id: 'ru', name: 'Русский' },
  ]},
};

const Practice: React.FC = () => {
  const navigate = useNavigate();
  // Keep only what the user requested: 2 sections (Theory, Driving)
  // Theory section: country, language, and start button that redirects to external site
  const [activeTab, setActiveTab] = React.useState<'theory' | 'driving'>("theory");
  const [country, setCountry] = React.useState<string>("md");
  const [language, setLanguage] = React.useState<string>("ro");

  // When country changes, ensure language is valid for that country
  React.useEffect(() => {
    const langs = COUNTRY_LANGUAGES[country]?.languages || [];
    if (!langs.find(l => l.id === language)) {
      setLanguage(langs[0]?.id || "en");
    }
  }, [country]);

  const handleStartTheory = () => {
    const url = `https://auto-test.online/test/?country=${encodeURIComponent(country)}&language=${encodeURIComponent(language)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
      <Container className="tw-py-8 tw-space-y-8">
        {/* Header (template-like, minimal) */}
        <div className="tw-text-center tw-space-y-4 tw-animate-fade-in">
          <h1 className="tw-text-4xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-primary tw-to-primary">Practice</h1>
          <p className="tw-text-xl tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">
            Practice your theory or prepare for your driving sessions.
          </p>
        </div>

        {/* Tabs */}
        <div className="tw-flex tw-gap-2 tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-center">
          <TabButton active={activeTab === 'theory'} onClick={() => setActiveTab('theory')}>Theory Practice</TabButton>
          <TabButton active={activeTab === 'driving'} onClick={() => setActiveTab('driving')}>Driving Practice</TabButton>
        </div>

        {/* Theory Practice - keep only country, language, start button + redirect */}
        {activeTab === 'theory' && (
          <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
            <CardHeader>
              <CardTitle>Online Theory Practice</CardTitle>
            </CardHeader>
            <CardContent className="tw-space-y-6">
              <p className="tw-opacity-90">Configure your preferences and start practicing official-like theory tests.</p>
              <div className="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <div className="tw-space-y-2">
                  <label className="tw-text-sm tw-font-medium tw-opacity-90" htmlFor="country">Country</label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="tw-w-full tw-rounded-md tw-border tw-border-white/20 tw-bg-white/10 tw-text-primary-foreground tw-px-3 tw-py-2 focus:tw-outline-none"
                  >
                    {Object.entries(COUNTRY_LANGUAGES).map(([id, cfg]) => (
                      <option key={id} value={id}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                <div className="tw-space-y-2">
                  <label className="tw-text-sm tw-font-medium tw-opacity-90" htmlFor="language">Language</label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="tw-w-full tw-rounded-md tw-border tw-border-white/20 tw-bg-white/10 tw-text-primary-foreground tw-px-3 tw-py-2 focus:tw-outline-none"
                  >
                    {(COUNTRY_LANGUAGES[country]?.languages || []).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartTheory}
                className="tw-w-full tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-4 tw-text-sm tw-font-medium tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90"
              >
                Start Theory Practice
              </button>
            </CardContent>
          </Card>
        )}

        {/* Driving Practice - keep minimal content, no extra boxes */}
        {activeTab === 'driving' && (
          <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
            <CardHeader>
              <CardTitle>Driving Practice Sessions</CardTitle>
            </CardHeader>
            <CardContent className="tw-space-y-4 tw-text-center">
              <p className="tw-text-muted-foreground">
                Driving practice is managed through your scheduled lessons.
              </p>
              <a
                href="/lessons"
                className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-6 tw-text-sm tw-font-medium tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90"
              >
                View Lessons Schedule
              </a>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-3">
              <button onClick={() => navigate('/book-lesson')} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-4 tw-text-sm tw-font-medium tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90">Book a lesson</button>
              <button onClick={() => navigate('/payments')} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-4 tw-text-sm tw-font-medium tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90">Make payment</button>
              <button onClick={() => navigate('/progress')} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-4 tw-text-sm tw-font-medium tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90">Show progress</button>
              <button onClick={() => navigate('/lessons?filter=upcoming')} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-4 tw-text-sm tw-font-medium tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90">Upcoming lessons</button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Practice;
