import { TrendingUp, BookOpen, Car, Clock, Award, Target, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Progress = () => {
  const overallProgress = 68;
  const theoryProgress = 85;
  const practicalProgress = 52;

  const milestones = [
    {
      id: 1,
      title: "Theory Classes",
      description: "Complete all theory lessons",
      progress: 17,
      total: 20,
      completed: true,
      icon: BookOpen,
      color: "success"
    },
    {
      id: 2,
      title: "Driving Hours",
      description: "Complete required driving practice",
      progress: 24,
      total: 40,
      completed: false,
      icon: Car,
      color: "primary"
    },
    {
      id: 3,
      title: "Theory Exam",
      description: "Pass the theoretical examination",
      progress: 0,
      total: 1,
      completed: false,
      icon: Award,
      color: "warning"
    },
    {
      id: 4,
      title: "Practical Exam",
      description: "Pass the practical driving test",
      progress: 0,
      total: 1,
      completed: false,
      icon: Target,
      color: "warning"
    }
  ];

  const recentAchievements = [
    {
      id: 1,
      title: "First Highway Drive",
      date: "2 days ago",
      description: "Successfully completed your first highway driving lesson",
      icon: "🛣️"
    },
    {
      id: 2,
      title: "Parallel Parking Master",
      date: "1 week ago",
      description: "Mastered parallel parking technique",
      icon: "🅿️"
    },
    {
      id: 3,
      title: "Night Driving",
      date: "2 weeks ago",
      description: "Completed your first night driving session",
      icon: "🌙"
    }
  ];

  const skillsProgress = [
    { skill: "Traffic Rules", progress: 95 },
    { skill: "Vehicle Control", progress: 70 },
    { skill: "Parking", progress: 85 },
    { skill: "Highway Driving", progress: 45 },
    { skill: "City Navigation", progress: 60 },
    { skill: "Emergency Procedures", progress: 30 }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-success";
    if (progress >= 50) return "text-primary";
    return "text-warning";
  };

  const getMilestoneColor = (color: string) => {
    switch (color) {
      case "success": return "bg-success text-success-foreground";
      case "primary": return "bg-primary text-primary-foreground";
      case "warning": return "bg-warning text-warning-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Your Progress
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your journey to becoming a licensed driver. Every lesson brings you closer to success! 🚗
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="bg-gradient-primary text-primary-foreground shadow-glow animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold">{overallProgress}%</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Course Completion</h2>
                <p className="opacity-90">You're doing great! Keep up the excellent work.</p>
              </div>
              <ProgressBar value={overallProgress} className="h-3 bg-white/20" />
              <p className="text-sm opacity-75">
                {Math.round((40 * overallProgress) / 100)} of 40 total lessons completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theory vs Practical */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border border-border/50 shadow-card hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Theory Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getProgressColor(theoryProgress)}`}>
                  {theoryProgress}%
                </div>
                <p className="text-sm text-muted-foreground">Theory knowledge</p>
              </div>
              <ProgressBar value={theoryProgress} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Lessons</p>
                  <p className="font-semibold">17/20</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tests Passed</p>
                  <p className="font-semibold">15/17</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border border-border/50 shadow-card hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Practical Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getProgressColor(practicalProgress)}`}>
                  {practicalProgress}%
                </div>
                <p className="text-sm text-muted-foreground">Driving skills</p>
              </div>
              <ProgressBar value={practicalProgress} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Hours</p>
                  <p className="font-semibold">24/40</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Routes</p>
                  <p className="font-semibold">8/12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <Card className="bg-gradient-card border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Course Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {milestones.map((milestone) => {
                const Icon = milestone.icon;
                const progressPercentage = (milestone.progress / milestone.total) * 100;
                
                return (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border border-border/20 hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getMilestoneColor(milestone.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                        <div className="flex items-center gap-2">
                          {milestone.completed && <CheckCircle className="w-4 h-4 text-success" />}
                          <Badge variant={milestone.completed ? "default" : "secondary"}>
                            {milestone.progress}/{milestone.total}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      <ProgressBar value={progressPercentage} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Skills Progress */}
        <Card className="bg-gradient-card border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Skills Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {skillsProgress.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{skill.skill}</span>
                    <span className={`font-semibold ${getProgressColor(skill.progress)}`}>
                      {skill.progress}%
                    </span>
                  </div>
                  <ProgressBar value={skill.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="bg-gradient-card border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border border-border/20 hover:bg-secondary/50 transition-colors animate-scale-in"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground/75 mt-1">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Section */}
        <Card className="bg-gradient-success text-success-foreground shadow-glow">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl">🎯</div>
              <h3 className="text-2xl font-bold">You're Almost There!</h3>
              <p className="opacity-90 max-w-md mx-auto">
                With {100 - overallProgress}% remaining, you're well on your way to getting your license. 
                Keep practicing and stay focused!
              </p>
              <Button variant="secondary" size="lg" className="animate-bounce-gentle">
                Book Next Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;