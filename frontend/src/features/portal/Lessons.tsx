import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PortalNavBar from "./PortalNavBar";
import { studentRawFetch } from "../../api/httpClient";
import { 
    LessonCard, 
    LessonStatusBadge, 
    CalendarView, 
    TimeSlotSelector,
    InstructorAvatar,
    type LessonData,
    type LessonStatus,
    type TimeSlot,
    type InstructorData
} from "../../shared/components/lessons";

const iconProps = "tw-w-4 tw-h-4";
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const CarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
        <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
        <path d="M5 16h14" />
        <circle cx="7" cy="16" r="2" />
        <circle cx="17" cy="16" r="2" />
    </svg>
);
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
        <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />
    </svg>
);
const ListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <circle cx="4" cy="6" r="1" />
        <circle cx="4" cy="12" r="1" />
        <circle cx="4" cy="18" r="1" />
    </svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
    <div className={`tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 ${className}`}>{children}</div>
);
const Card: React.FC<React.PropsWithChildren<{ className?: string; onClick?: () => void; hover?: boolean }>> = ({ className = "", children, onClick, hover = true }) => (
    <div
        className={`tw-rounded-2xl tw-border tw-border-border tw-bg-background tw-transition-all tw-duration-200 ${hover ? 'hover:tw-shadow-lg hover:-tw-translate-y-1 tw-cursor-pointer' : ''} ${onClick ? 'card-hover' : ''} ${className}`}
        onClick={onClick}
    >
        {children}
    </div>
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
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "destructive" | "secondary"; size?: "sm" | "md" | "lg" }> = ({ className = "", children, variant = "default", size = "md", ...props }) => {
    const sizes = { sm: "tw-h-8 tw-px-3 tw-text-xs", md: "tw-h-10 tw-px-4", lg: "tw-h-11 tw-px-6" } as const;
    const variants = {
        default: "tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90",
        outline: "tw-border tw-border-input hover:tw-bg-secondary",
        destructive: "tw-bg-destructive tw-text-destructive-foreground hover:tw-bg-destructive/90",
        secondary: "tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90",
    } as const;
    return (
        <button className={`tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};
const SkeletonCard: React.FC = () => (
    <div className="tw-animate-pulse tw-bg-gray-200 tw-rounded-2xl tw-p-6 tw-space-y-4">
        <div className="tw-flex tw-justify-between tw-items-start">
            <div className="tw-space-y-2">
                <div className="tw-h-4 tw-bg-gray-300 tw-rounded tw-w-24"></div>
                <div className="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-32"></div>
            </div>
            <div className="tw-h-6 tw-bg-gray-300 tw-rounded-full tw-w-16"></div>
        </div>
        <div className="tw-space-y-2">
            <div className="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-full"></div>
            <div className="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-3/4"></div>
        </div>
    </div>
);

// --- Mock Data for Demo Section ---
const demoInstructors: InstructorData[] = [
    { id: '1', name: 'Maria Popescu', avatar: undefined, specialties: ['driving'], rating: 4.8, available: true, experience: 8, languages: ['Romanian', 'English'] },
    { id: '2', name: 'Ion Vasilescu', avatar: undefined, specialties: ['theory'], rating: 4.6, available: true, experience: 12, languages: ['Romanian'] },
    { id: '3', name: 'Ana Ionescu', avatar: undefined, specialties: ['driving', 'theory'], rating: 4.9, available: false, nextAvailable: '2024-10-24T09:00:00', experience: 6, languages: ['Romanian', 'English', 'French'] }
];
const demoTimeSlots: TimeSlot[] = [
    { id: 'slot1', time: '09:00', available: true, duration: 120, instructor: 'Maria Popescu', type: 'driving' },
    { id: 'slot2', time: '11:00', available: false, duration: 60, instructor: 'Ion Vasilescu', type: 'theory' },
    { id: 'slot3', time: '14:00', available: true, duration: 120, instructor: 'Ana Ionescu', type: 'driving' },
];
const demoLessons: LessonData[] = [
    { id: 1, type: "Driving", instructor: "Maria Popescu", date: "2024-10-22", time: "14:00", duration: "2 hours", vehicle: "Dacia Logan - B123XYZ", status: "confirmed", location: "Starting Point: School Parking" },
    { id: 2, type: "Theory", instructor: "Ion Vasilescu", date: "2024-10-23", time: "10:00", duration: "1 hour", vehicle: "Classroom A", status: "confirmed", location: "Main Building, Floor 2" },
    { id: 3, type: "Driving", instructor: "Ana Ionescu", date: "2024-10-20", time: "16:00", duration: "2 hours", vehicle: "Ford Focus - B456ABC", status: "completed", location: "City Center Route" },
];


const Lessons: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // State from 'dev' version for real data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lessons, setLessons] = useState<any[]>([]);

    // State from 'gabi' version for UI interaction
    const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [tab, setTab] = useState<"list" | "calendar">("list");
    
    // Robust filter state management from 'dev'
    const initialFilterParam = (searchParams.get('filter') || 'all').toLowerCase();
    const mapParamToFilter = (p: string) => {
        if (p === 'upcoming') return 'scheduled';
        if (["all","scheduled","completed","canceled"].includes(p)) return p;
        return 'all';
    };
    const [selectedFilter, setSelectedFilter] = useState(mapParamToFilter(initialFilterParam));

    // Effect to sync URL with filter state from 'dev'
    useEffect(() => {
        const p = (searchParams.get('filter') || 'all').toLowerCase();
        setSelectedFilter(mapParamToFilter(p));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Data fetching effect from 'dev'
    useEffect(() => {
        let mounted = true;
        const run = async () => {
            try {
                const resp = await studentRawFetch('/api/student/dashboard/', { headers: { 'Content-Type': 'application/json' } });
                if (resp.status === 401) {
                    navigate('/login');
                    return;
                }
                const body = await resp.json().catch(() => ({}));
                if (!resp.ok) throw new Error(body?.detail || body?.message || 'Failed to load lessons');
                if (mounted) {
                    setLessons(Array.isArray(body?.lessons) ? body.lessons : []);
                }
            } catch (e:any) {
                if (mounted) setError(e?.message || 'Network error');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        run();
        return () => { mounted = false; };
    }, [navigate]);

    // Keyboard handling effect from 'gabi'
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
                setSelectedLesson(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    // Helper functions and memoized data from 'dev'
    const normalizedStatus = (s: string) => (s || '').toUpperCase();
    const isScheduled = (s: string) => normalizedStatus(s) === 'SCHEDULED';
    const isCompleted = (s: string) => normalizedStatus(s) === 'COMPLETED';
    const isCanceled = (s: string) => normalizedStatus(s).includes('CANCEL');

    const filteredLessons = useMemo(() => {
        return lessons.filter((lesson:any) => {
            if (selectedFilter === 'all') return true;
            if (selectedFilter === 'scheduled') return isScheduled(lesson.status);
            if (selectedFilter === 'completed') return isCompleted(lesson.status);
            if (selectedFilter === 'canceled') return isCanceled(lesson.status);
            return true;
        });
    }, [lessons, selectedFilter]);

    const upcomingLessons = useMemo(() => lessons.filter((l:any) => isScheduled(l.status)), [lessons]);
    const completedLessons = useMemo(() => lessons.filter((l:any) => isCompleted(l.status)), [lessons]);
    const missedLessons = useMemo(() => lessons.filter((l:any) => isCanceled(l.status)), [lessons]);

    // Data transformation function to adapt API data to LessonData for UI components
    const transformLessonData = (lesson: any): LessonData => {
        const dt = lesson?.scheduled_time ? new Date(lesson.scheduled_time) : null;
        const statusMap: { [key: string]: LessonStatus } = {
            'SCHEDULED': 'confirmed',
            'COMPLETED': 'completed',
            'CANCELED': 'cancelled',
            'CANCELED_BY_INSTRUCTOR': 'cancelled',
            'CANCELED_BY_STUDENT': 'cancelled'
        };
        
        return {
            id: lesson.id,
            type: ((lesson?.enrollment?.course?.type || '').toUpperCase() === 'THEORY') ? 'Theory' : 'Driving',
            instructor: lesson?.instructor ? `${lesson.instructor.first_name} ${lesson.instructor.last_name}` : 'N/A',
            date: dt ? dt.toISOString().split('T')[0] : 'N/A',
            time: dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            duration: `${lesson.duration_minutes || '--'} min`,
            vehicle: lesson?.vehicle?.license_plate || (lesson?.enrollment?.course?.name || 'N/A'),
            status: statusMap[normalizedStatus(lesson.status)] || 'pending',
            location: lesson.notes || 'No location specified'
        };
    };

    // Loading and error states from 'dev'
    if (loading) {
        return <div className="tw-min-h-screen tw-bg-background tw-text-foreground tw-flex tw-items-center tw-justify-center"><span>Loading lessons...</span></div>;
    }
    if (error) {
        return (
            <div className="tw-min-h-screen tw-bg-background tw-text-foreground tw-flex tw-items-center tw-justify-center">
                <div className="tw-text-center">
                    <p className="tw-text-red-600 tw-font-medium">{error}</p>
                    <a className="tw-text-primary tw-underline" href="/login">Go to Login</a>
                </div>
            </div>
        );
    }

    return (
        <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
            <PortalNavBar />
            <Container className="tw-py-8 tw-space-y-8">
                {/* Header */}
                <div className="tw-text-center tw-space-y-4 tw-animate-fade-in">
                    <h1 className="tw-text-4xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-primary tw-to-primary">
                        Your Lessons
                    </h1>
                    <p className="tw-text-xl tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">
                        Manage your driving and theory lessons, track your progress, and never miss a session.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-animate-fade-in-up">
                    {[
                        { label: "Upcoming", value: upcomingLessons.length, color: "tw-text-primary" },
                        { label: "Completed", value: completedLessons.length, color: "tw-text-success" },
                        { label: "Missed", value: missedLessons.length, color: "tw-text-destructive" },
                    ].map((s:any) => (
                        <Card key={s.label} className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
                            <CardContent className="tw-p-4 tw-text-center">
                                <div className={`tw-text-2xl tw-font-bold ${s.color}`}>{s.value}</div>
                                <div className="tw-text-sm tw-text-muted-foreground">{s.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs + Filters */}
                <div className="tw-space-y-4 sm:tw-space-y-6">
                    <div className="tw-flex tw-flex-col lg:tw-flex-row tw-justify-between tw-items-start lg:tw-items-center tw-gap-4">
                        <div className="tw-grid tw-grid-cols-2 tw-w-full sm:tw-w-auto tw-border tw-border-input tw-rounded-lg tw-overflow-hidden">
                            <button onClick={() => setTab("list")} className={`tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-3 sm:tw-px-4 tw-py-2 tw-text-sm tw-touch-manipulation ${tab === "list" ? "tw-bg-secondary" : "tw-bg-transparent"}`}>
                                <ListIcon />
                                <span className="hidden sm:inline">List View</span>
                                <span className="sm:hidden">List</span>
                            </button>
                            <button onClick={() => setTab("calendar")} className={`tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-3 sm:tw-px-4 tw-py-2 tw-text-sm tw-touch-manipulation ${tab === "calendar" ? "tw-bg-secondary" : "tw-bg-transparent"}`}>
                                <CalendarIcon />
                                <span className="hidden sm:inline">Calendar View</span>
                                <span className="sm:hidden">Calendar</span>
                            </button>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <FilterIcon className="tw-text-muted-foreground" />
                            <div className="tw-flex tw-gap-1">
                                {["all", "scheduled", "completed", "canceled"].map((filter) => (
                                    <Button
                                        key={filter}
                                        variant={selectedFilter === filter ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedFilter(filter)}
                                        className="tw-capitalize"
                                    >
                                        {filter === 'scheduled' ? 'upcoming' : filter === 'canceled' ? 'missed' : filter}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {tab === "list" && (
                        <div className="tw-space-y-4">
                            {loading ? (
                                Array.from({length: 3}).map((_, index) => <SkeletonCard key={index} />)
                            ) : (
                                filteredLessons.map((lesson) => {
                                    const lessonForCard = transformLessonData(lesson);
                                    return (
                                        <LessonCard
                                            key={lesson.id}
                                            lesson={lessonForCard}
                                            onClick={() => {setSelectedLesson(lessonForCard); setIsModalOpen(true);}}
                                            showActions={isScheduled(lesson.status)}
                                            onReschedule={() => console.log('Reschedule:', lessonForCard)}
                                            onCancel={() => console.log('Cancel:', lessonForCard)}
                                        />
                                    );
                                })
                            )}
                        </div>
                    )}

                    {tab === "calendar" && (
                        <CalendarView 
                            lessons={lessons.map(transformLessonData)}
                            selectedDate={selectedDate}
                            onDateSelect={(date) => setSelectedDate(date)}
                            onLessonClick={(lesson) => {setSelectedLesson(lesson); setIsModalOpen(true);}}
                            showWeekends={true}
                        />
                    )}
                </div>

                {/* Reusable Components Demo Section from 'gabi' */}
                <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
                    <CardHeader><CardTitle>🧩 Reusable Components Demo</CardTitle></CardHeader>
                    <CardContent className="tw-space-y-6">
                        <div>
                            <h4 className="tw-font-semibold tw-mb-3">Lesson Status Badges</h4>
                            <div className="tw-flex tw-flex-wrap tw-gap-2">
                                <LessonStatusBadge status="confirmed" /><LessonStatusBadge status="pending" /><LessonStatusBadge status="completed" /><LessonStatusBadge status="cancelled" /><LessonStatusBadge status="missed" /><LessonStatusBadge status="rescheduled" />
                            </div>
                        </div>
                        <div>
                            <h4 className="tw-font-semibold tw-mb-3">Instructor Avatars</h4>
                            <div className="tw-space-y-4">
                                {demoInstructors.map(instructor => (
                                    <InstructorAvatar key={instructor.id} instructor={instructor} size="lg" showStatus={true} showRating={true} showSpecialties={true} onClick={(i) => console.log('Selected instructor:', i)} />
                                ))}
                            </div>
                        </div>
                        {selectedDate && (
                            <div>
                                <h4 className="tw-font-semibold tw-mb-3">Time Slot Selector</h4>
                                <TimeSlotSelector date={selectedDate} timeSlots={demoTimeSlots} onSlotSelect={(slot) => console.log('Selected slot:', slot)} showInstructor={true} filterByType="all" />
                            </div>
                        )}
                        <div>
                            <h4 className="tw-font-semibold tw-mb-3">Compact Lesson Cards</h4>
                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                                {demoLessons.slice(0, 3).map(lesson => (
                                    <LessonCard key={`compact-${lesson.id}`} lesson={lesson} compact={true} onClick={(l) => console.log('Clicked compact lesson:', l)} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Book New Lesson */}
                <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
                    <CardContent className="tw-p-6 tw-text-center">
                        <h3 className="tw-text-xl tw-font-bold tw-mb-2">Ready for your next lesson?</h3>
                        <p className="tw-mb-4 tw-opacity-90">Book a new driving or theory session with your instructor.</p>
                        <Button variant="secondary" size="lg" className="tw-animate-bounce-gentle" onClick={() => navigate('/book-lesson')}>
                            Book New Lesson
                        </Button>
                    </CardContent>
                </Card>
            </Container>

            {/* Lesson Details Modal from 'gabi' */}
            {isModalOpen && selectedLesson && (
                <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-animate-fade-in">
                    <div className="tw-bg-background tw-rounded-2xl tw-shadow-2xl tw-max-w-md tw-w-full tw-max-h-[90vh] tw-overflow-y-auto tw-animate-slide-in">
                        <div className="tw-p-4 sm:tw-p-6">
                            <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                                <h3 className="tw-text-lg sm:tw-text-xl tw-font-bold">{selectedLesson.type} Lesson Details</h3>
                                <Button onClick={() => {setIsModalOpen(false); setSelectedLesson(null);}} variant="outline" size="sm" className="tw-h-8 tw-w-8 tw-p-0 tw-touch-manipulation">
                                    <XIcon />
                                </Button>
                            </div>
                            <div className="tw-space-y-4">
                                {/* Details rendering */}
                                <div className="tw-flex tw-items-center tw-gap-3"><UserIcon className="tw-text-muted-foreground tw-flex-shrink-0" /><div className="tw-min-w-0"><p className="tw-font-medium tw-text-sm sm:tw-text-base">Instructor</p><p className="tw-text-sm tw-text-muted-foreground tw-truncate">{selectedLesson.instructor}</p></div></div>
                                <div className="tw-flex tw-items-center tw-gap-3"><CalendarIcon className="tw-text-muted-foreground tw-flex-shrink-0" /><div className="tw-min-w-0"><p className="tw-font-medium tw-text-sm sm:tw-text-base">Date & Time</p><p className="tw-text-sm tw-text-muted-foreground">{new Date(selectedLesson.date).toLocaleDateString()} at {selectedLesson.time}</p></div></div>
                                <div className="tw-flex tw-items-center tw-gap-3"><ClockIcon className="tw-text-muted-foreground tw-flex-shrink-0" /><div className="tw-min-w-0"><p className="tw-font-medium tw-text-sm sm:tw-text-base">Duration</p><p className="tw-text-sm tw-text-muted-foreground">{selectedLesson.duration}</p></div></div>
                                <div className="tw-flex tw-items-center tw-gap-3"><CarIcon className="tw-text-muted-foreground tw-flex-shrink-0" /><div className="tw-min-w-0"><p className="tw-font-medium tw-text-sm sm:tw-text-base">Vehicle/Room</p><p className="tw-text-sm tw-text-muted-foreground tw-truncate">{selectedLesson.vehicle}</p></div></div>
                                <div className="tw-flex tw-items-center tw-gap-3"><div className="tw-w-4 tw-h-4 tw-text-muted-foreground tw-flex-shrink-0">📍</div><div className="tw-min-w-0"><p className="tw-font-medium tw-text-sm sm:tw-text-base">Location</p><p className="tw-text-sm tw-text-muted-foreground tw-truncate">{selectedLesson.location}</p></div></div>
                                <div className="tw-flex tw-items-center tw-gap-3"><div className="tw-w-4 tw-h-4 tw-flex-shrink-0">📊</div><div className="tw-min-w-0"><p className="tw-font-medium tw-text-sm sm:tw-text-base">Status</p><div className="tw-mt-1"><LessonStatusBadge status={selectedLesson.status} /></div></div></div>
                            </div>
                            <div className="tw-mt-6 tw-pt-4 tw-border-t tw-border-border">
                                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2">
                                    {selectedLesson.status === "confirmed" && (
                                        <>
                                            <Button size="sm" variant="outline" className="tw-flex-1 tw-touch-manipulation">Reschedule</Button>
                                            <Button size="sm" variant="destructive" className="tw-flex-1 tw-touch-manipulation">Cancel</Button>
                                        </>
                                    )}
                                    <Button onClick={() => {setIsModalOpen(false); setSelectedLesson(null);}} size="sm" className="tw-flex-1 tw-touch-manipulation">Close</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lessons;