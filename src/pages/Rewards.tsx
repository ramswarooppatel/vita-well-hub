
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RewardsSystem } from "@/components/gamification/RewardsSystem";
import { RewardHistory } from "@/components/gamification/RewardHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Award, Star, Users, Gift, 
  Calendar, FileText, Stethoscope, Activity
} from "lucide-react";

export default function Rewards() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Rewards & Achievements</h1>
          <p className="text-muted-foreground">
            Track your progress and earn rewards for healthy habits
          </p>
        </div>

        <Tabs defaultValue="rewards">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rewards" className="space-y-6 pt-4">
            <RewardsSystem />
            
            {/* Add new RewardHistory component */}
            <RewardHistory />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5 text-primary" />
                    Health Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Badge variant="outline">200 pts</Badge>
                      </div>
                      <div>
                        <p className="font-medium">Complete Health Assessment</p>
                        <p className="text-sm text-muted-foreground">Fill your complete health profile</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Badge variant="outline">150 pts</Badge>
                      </div>
                      <div>
                        <p className="font-medium">Appointment Streak</p>
                        <p className="text-sm text-muted-foreground">Attend 3 appointments in a row</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-primary" />
                    Cognitive Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Badge variant="outline">100 pts</Badge>
                      </div>
                      <div>
                        <p className="font-medium">Memory Master</p>
                        <p className="text-sm text-muted-foreground">Score 100% on a memory test</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Badge variant="outline">250 pts</Badge>
                      </div>
                      <div>
                        <p className="font-medium">Cognitive Explorer</p>
                        <p className="text-sm text-muted-foreground">Complete all test categories</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Badge variant="outline">50 pts</Badge>
                      </div>
                      <div>
                        <p className="font-medium">First Referral</p>
                        <p className="text-sm text-muted-foreground">Refer your first friend</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Badge variant="outline">350 pts</Badge>
                      </div>
                      <div>
                        <p className="font-medium">Health Advocate</p>
                        <p className="text-sm text-muted-foreground">Refer 5+ friends to the platform</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="challenges" className="space-y-6 pt-4">
            {/* Challenge content would go here */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Challenges coming soon</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Weekly and monthly health challenges will be available soon
                  </p>
                  <Button disabled>Join Challenge</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leaderboard" className="space-y-6 pt-4">
            {/* Leaderboard content would go here */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Leaderboard coming soon</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compete with others on health achievements
                  </p>
                  <Button disabled>View Rankings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
