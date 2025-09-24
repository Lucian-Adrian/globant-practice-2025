import { useState } from "react";
import { BookOpen, Car, Play, ExternalLink, Target, Clock, Trophy, ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Practice = () => {
  const [selectedCountry, setSelectedCountry] = useState("md");
  const [selectedLanguage, setSelectedLanguage] = useState("ro");

  const theoryTests = [
    {
      id: 1,
      title: "Traffic Signs",
      description: "Learn and practice all traffic signs",
      questions: 45,
      timeLimit: "30 min",
      difficulty: "Easy",
      completed: true,
      score: 92
    },
    {
      id: 2,
      title: "Traffic Rules",
      description: "Master the rules of the road",
      questions: 60,
      timeLimit: "45 min",
      difficulty: "Medium",
      completed: true,
      score: 88
    },
    {
      id: 3,
      title: "Driving Scenarios",
      description: "Practice real-world driving situations",
      questions: 50,
      timeLimit: "40 min",
      difficulty: "Hard",
      completed: false,
      score: null
    },
    {
      id: 4,
      title: "Emergency Procedures",
      description: "Know what to do in emergency situations",
      questions: 30,
      timeLimit: "25 min",
      difficulty: "Medium",
      completed: false,
      score: null
    }
  ];

  const practiceStats = {
    testsCompleted: 15,
    averageScore: 90,
    timeSpent: "12h 30m",
    streak: 7
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-success text-success-foreground";
      case "Medium": return "bg-warning text-warning-foreground";
      case "Hard": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const handleStartTheoryTest = () => {
    const testUrl = `https://auto-test.online/test/?country=${selectedCountry}&language=${selectedLanguage}`;
    window.open(testUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Practice Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sharpen your skills with theory tests and driving practice sessions. Perfect practice makes perfect! 📚
          </p>
        </div>

        {/* Practice Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
          <Card className="bg-gradient-card border border-border/50 text-center">
            <CardContent className="p-4">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{practiceStats.testsCompleted}</div>
              <div className="text-sm text-muted-foreground">Tests Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border border-border/50 text-center">
            <CardContent className="p-4">
              <Target className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{practiceStats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border border-border/50 text-center">
            <CardContent className="p-4">
              <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{practiceStats.timeSpent}</div>
              <div className="text-sm text-muted-foreground">Time Practiced</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border border-border/50 text-center">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-foreground">{practiceStats.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="theory" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="theory" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Theory Practice
            </TabsTrigger>
            <TabsTrigger value="driving" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Driving Practice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theory" className="space-y-6">
            {/* Theory Test Configuration */}
            <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Online Theory Practice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="opacity-90">
                  Practice with real driving theory tests. Configure your preferences and start learning!
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-90">Country</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-primary-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="md">Moldova</SelectItem>
                        <SelectItem value="ro">Romania</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-90">Language</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-primary-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ro">Română</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleStartTheoryTest}
                  variant="secondary" 
                  size="lg" 
                  className="w-full animate-bounce-gentle"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Theory Practice
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Available Tests */}
            <Card className="bg-gradient-card border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle>Practice Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {theoryTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/20 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{test.title}</h3>
                          <Badge className={getDifficultyColor(test.difficulty)}>
                            {test.difficulty}
                          </Badge>
                          {test.completed && (
                            <Badge className="bg-success text-success-foreground">
                              Completed: {test.score}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📝 {test.questions} questions</span>
                          <span>⏱️ {test.timeLimit}</span>
                        </div>
                      </div>
                      <Button 
                        variant={test.completed ? "outline" : "default"}
                        onClick={handleStartTheoryTest}
                      >
                        {test.completed ? "Retake" : "Start"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="driving" className="space-y-6">
            {/* Driving Practice Redirect */}
            <Card className="bg-gradient-card border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-6 h-6 text-primary" />
                  Driving Practice Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Car className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ready for hands-on practice?</h3>
                  <p className="text-muted-foreground mb-6">
                    Driving practice sessions are scheduled through your regular lessons. 
                    Book your next session to get behind the wheel!
                  </p>
                  <Button size="lg" className="animate-bounce-gentle">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    View Lessons Schedule
                  </Button>
                </div>

                {/* Practice Tips */}
                <div className="grid md:grid-cols-2 gap-4 mt-8">
                  <Card className="bg-secondary/30 border-border/30">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground mb-2">🎯 Practice Tips</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Focus on one skill at a time</li>
                        <li>• Practice in different weather conditions</li>
                        <li>• Master parking before moving to traffic</li>
                        <li>• Ask questions during lessons</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-secondary/30 border-border/30">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground mb-2">📋 Next Steps</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Complete remaining 16 hours</li>
                        <li>• Practice highway driving</li>
                        <li>• Master parallel parking</li>
                        <li>• Prepare for practical exam</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Motivational Section */}
        <Card className="bg-gradient-success text-success-foreground shadow-glow">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl">📚</div>
              <h3 className="text-2xl font-bold">Keep Learning!</h3>
              <p className="opacity-90 max-w-md mx-auto">
                Regular practice is the key to success. Even 15 minutes a day can make a huge difference!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" onClick={handleStartTheoryTest}>
                  Quick Theory Test
                </Button>
                <Button variant="secondary" size="lg">
                  Schedule Driving Lesson
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Practice;