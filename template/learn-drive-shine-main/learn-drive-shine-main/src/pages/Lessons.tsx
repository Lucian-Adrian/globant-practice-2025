import { useState } from "react";
import { Calendar, Clock, User, Car, Filter, List, CheckCircle, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Lessons = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const lessons = [
    {
      id: 1,
      type: "Driving",
      instructor: "Maria Popescu",
      date: "2024-10-22",
      time: "14:00",
      duration: "2 hours",
      vehicle: "Dacia Logan - B123XYZ",
      status: "confirmed",
      location: "Starting Point: School Parking"
    },
    {
      id: 2,
      type: "Theory",
      instructor: "Ion Vasilescu",
      date: "2024-10-23",
      time: "10:00",
      duration: "1 hour",
      vehicle: "Classroom A",
      status: "confirmed",
      location: "Main Building, Floor 2"
    },
    {
      id: 3,
      type: "Driving",
      instructor: "Ana Ionescu",
      date: "2024-10-20",
      time: "16:00",
      duration: "2 hours",
      vehicle: "Ford Focus - B456ABC",
      status: "completed",
      location: "City Center Route"
    },
    {
      id: 4,
      type: "Theory",
      instructor: "Ion Vasilescu",
      date: "2024-10-18",
      time: "09:00",
      duration: "1 hour",
      vehicle: "Classroom B",
      status: "missed",
      location: "Main Building, Floor 1"
    },
    {
      id: 5,
      type: "Driving",
      instructor: "Maria Popescu",
      date: "2024-10-25",
      time: "11:00",
      duration: "2 hours",
      vehicle: "Dacia Logan - B123XYZ",
      status: "pending",
      location: "Highway Practice Route"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-primary text-primary-foreground">Completed</Badge>;
      case "missed":
        return <Badge variant="destructive">Missed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case "missed":
        return <X className="w-4 h-4 text-destructive" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    if (selectedFilter === "all") return true;
    return lesson.status === selectedFilter;
  });

  const upcomingLessons = lessons.filter(lesson => 
    lesson.status === "confirmed" || lesson.status === "pending"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Your Lessons
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your driving and theory lessons, track your progress, and never miss a session.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up">
          <Card className="bg-gradient-card border border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {upcomingLessons.length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {lessons.filter(l => l.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {lessons.filter(l => l.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">
                {lessons.filter(l => l.status === "missed").length}
              </div>
              <div className="text-sm text-muted-foreground">Missed</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="list" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendar View
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1">
                {["all", "confirmed", "completed", "pending", "missed"].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="capitalize"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="list" className="space-y-4">
            {filteredLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className={cn(
                  "bg-gradient-card border border-border/50 hover:shadow-card transition-all duration-300 hover:scale-[1.02]",
                  lesson.status === "confirmed" && "ring-2 ring-success/20",
                  lesson.status === "missed" && "ring-2 ring-destructive/20"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {lesson.type === "Driving" ? (
                          <Car className="w-6 h-6 text-primary" />
                        ) : (
                          <Calendar className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {lesson.type} Lesson
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          with {lesson.instructor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(lesson.status)}
                      {getStatusBadge(lesson.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(lesson.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.time} ({lesson.duration})</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{lesson.vehicle}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                      📍 {lesson.location}
                    </p>
                  </div>

                  {lesson.status === "confirmed" && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                      <Button size="sm" variant="destructive">
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle>October 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Calendar view coming soon!</p>
                  <p className="text-sm mt-2">For now, use the list view to see all your lessons.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Book New Lesson */}
        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Ready for your next lesson?</h3>
            <p className="mb-4 opacity-90">Book a new driving or theory session with your instructor.</p>
            <Button variant="secondary" size="lg" className="animate-bounce-gentle">
              Book New Lesson
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Lessons;