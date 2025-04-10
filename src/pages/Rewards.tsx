
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RewardsSystem } from "@/components/gamification/RewardsSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Gift, BarChart3, Users, Lock, Medal, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Rewards() {
  const level = 3;
  const points = 350;
  
  const availableRewards = [
    {
      id: 1,
      name: "Free Consultation",
      description: "A free 30-minute consultation with a specialist of your choice",
      pointsRequired: 500,
      icon: <Gift className="h-5 w-5" />,
    },
    {
      id: 2,
      name: "Priority Booking",
      description: "Skip the queue for appointment booking for 1 month",
      pointsRequired: 300,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 3,
      name: "Premium Content",
      description: "Access to exclusive health content and guides",
      pointsRequired: 200,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: 4,
      name: "Health Kit",
      description: "A physical health monitoring kit delivered to your home",
      pointsRequired: 1000,
      icon: <Stethoscope className="h-5 w-5" />,
    },
  ];
  
  const leaderboard = [
    { id: 1, name: "Alex Johnson", points: 1250, level: 8, avatar: "AJ" },
    { id: 2, name: "Sandra Miller", points: 980, level: 6, avatar: "SM" },
    { id: 3, name: "John Doe", points: 350, level: 3, avatar: "JD", isCurrentUser: true },
    { id: 4, name: "Emily Chen", points: 320, level: 2, avatar: "EC" },
    { id: 5, name: "Michael Brown", points: 290, level: 2, avatar: "MB" },
  ];

  const Calendar = Award; // Using Award icon as a placeholder
  const FileText = Award; // Using Award icon as a placeholder 
  const Stethoscope = Award; // Using Award icon as a placeholder

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Rewards & Gamification</h1>
            <p className="text-muted-foreground">
              Track your progress, earn rewards, and compete with others
            </p>
          </div>
        </div>

        <Tabs defaultValue="rewards">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="redeem" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span>Redeem</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <RewardsSystem />
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                      Your Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center">
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <span className="text-4xl font-bold text-primary">{level}</span>
                      </div>
                      <h3 className="text-xl font-semibold">
                        {level < 3 ? "Health Novice" :
                         level < 5 ? "Wellness Explorer" :
                         level < 8 ? "Health Master" : "Wellness Champion"}
                      </h3>
                      <Badge variant="outline" className="mt-1">{points} points</Badge>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Level {level}</span>
                        <span>Level {level + 1}</span>
                      </div>
                      <Progress value={75} />
                      <p className="text-xs text-center text-muted-foreground mt-1">
                        150 more points to reach Level {level + 1}
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="font-medium mb-2">Current Perks</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <Medal className="h-4 w-4 text-primary" />
                          Priority customer support
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Medal className="h-4 w-4 text-primary" />
                          10% discount on telemedicine consultations
                        </li>
                        {level >= 3 && (
                          <li className="flex items-center gap-2 text-sm">
                            <Medal className="h-4 w-4 text-primary" />
                            Access to exclusive content
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="pt-1">
                      <h4 className="font-medium mb-2">Next Level Perks</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          Early access to new features
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          15% discount on all services
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      Referral Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">Invite friends and both earn 50 points when they join</p>
                    <Button className="w-full">Invite Friends</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="redeem">
            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
                <CardDescription>
                  Redeem your points for these exclusive rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRewards.map((reward) => (
                    <Card key={reward.id} className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            {reward.icon}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium">{reward.name}</h3>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <Badge variant="outline">{reward.pointsRequired} points</Badge>
                          <Button 
                            disabled={points < reward.pointsRequired}
                            size="sm"
                          >
                            Redeem
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Community Leaderboard</CardTitle>
                <CardDescription>
                  See how you compare with others in the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div 
                      key={user.id} 
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        user.isCurrentUser ? "bg-primary/5 border" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 text-center font-semibold">
                          #{index + 1}
                        </div>
                        <div className="flex-shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={user.isCurrentUser ? "bg-primary text-white" : ""}>
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.name}
                            {user.isCurrentUser && <span className="text-sm text-muted-foreground ml-2">(You)</span>}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Level {user.level}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                            <span className="text-muted-foreground">{user.points} points</span>
                          </div>
                        </div>
                      </div>
                      {index < 3 && (
                        <Trophy className={`h-5 w-5 ${
                          index === 0 ? "text-yellow-500" : 
                          index === 1 ? "text-gray-400" : 
                          "text-amber-600"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Import at the top with other imports
const Avatar = ({ className, children }) => (
  <div className={`flex items-center justify-center rounded-full bg-muted ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children, className }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full ${className}`}>
    {children}
  </div>
);
