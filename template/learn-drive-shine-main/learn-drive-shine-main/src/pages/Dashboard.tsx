import { CalendarDays, Clock, DollarSign, TrendingUp, Bell, Car, BookOpen, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const upcomingLessons = [
    {
      id: 1,
      type: "Driving",
      instructor: "Maria Popescu",
      date: "Tomorrow",
      time: "14:00",
      vehicle: "Dacia Logan - B123XYZ"
    },
    {
      id: 2,
      type: "Theory",
      instructor: "Ion Vasilescu",
      date: "Mon, Oct 23",
      time: "10:00",
      vehicle: "Classroom A"
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "Payment Due",
      message: "Your next payment of 1,200 MDL is due in 3 days",
      type: "warning",
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Lesson Confirmed",
      message: "Your driving lesson with Maria Popescu has been confirmed",
      type: "success",
      time: "1 day ago"
    },
    {
      id: 3,
      title: "Theory Test Available",
      message: "New practice test on traffic signs is now available",
      type: "info",
      time: "2 days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow animate-fade-in">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 p-8 md:p-12 text-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Student Portal Active
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">
                Welcome back, Alex! 🚗
              </h1>
              <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
                Ready to accelerate your driving journey? Check your progress and upcoming lessons below.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" className="animate-bounce-gentle">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Practice Theory
                </Button>
                <Button variant="secondary" size="lg">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Book Lesson
                </Button>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-lg" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
          <StatCard
            title="Next Lesson"
            value="Tomorrow"
            description="2:00 PM - Driving"
            icon={CalendarDays}
            variant="primary"
          />
          <StatCard
            title="Course Progress"
            value="68%"
            description="Theory & Driving Combined"
            icon={TrendingUp}
            trend={{ value: "12%", isPositive: true }}
          />
          <StatCard
            title="Outstanding Balance"
            value="1,200 MDL"
            description="Due in 3 days"
            icon={DollarSign}
            variant="warning"
          />
          <StatCard
            title="Lessons Completed"
            value="24/40"
            description="16 lessons remaining"
            icon={CheckCircle}
            trend={{ value: "3", isPositive: true }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Lessons */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-card border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  Upcoming Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/70 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        {lesson.type === "Driving" ? (
                          <Car className="w-6 h-6 text-primary" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{lesson.type} Lesson</h3>
                          <Badge variant="outline" className="text-xs">
                            {lesson.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          with {lesson.instructor}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lesson.vehicle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{lesson.date}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.time}
                      </p>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4" variant="outline">
                  View All Lessons
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-card border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs">Practice Test</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <CalendarDays className="w-5 h-5" />
                    <span className="text-xs">Book Lesson</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-xs">Make Payment</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs">View Progress</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-secondary/30 rounded-lg border border-border/20 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-foreground">
                        {notification.title}
                      </h4>
                      <Badge
                        variant={notification.type === "warning" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground opacity-75">
                      {notification.time}
                    </p>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-sm">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;