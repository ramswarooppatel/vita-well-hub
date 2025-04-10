
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, Award, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof badgeIcons;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
};

const badgeIcons = {
  trophy: Trophy,
  medal: Medal,
  star: Star,
  award: Award,
  gift: Gift,
};

export function RewardsSystem() {
  const { toast } = useToast();
  const [points, setPoints] = useState(350);
  const [level, setLevel] = useState(3);
  const [referrals, setReferrals] = useState(2);

  const badges: Badge[] = [
    {
      id: "first_test",
      name: "First Step",
      description: "Completed your first cognitive test",
      icon: "medal",
      unlocked: true,
    },
    {
      id: "test_master",
      name: "Test Master",
      description: "Complete 10 different cognitive tests",
      icon: "trophy",
      unlocked: false,
      progress: 3,
      maxProgress: 10,
    },
    {
      id: "perfect_score",
      name: "Perfect Score",
      description: "Achieve a perfect score in any test",
      icon: "star",
      unlocked: true,
    },
    {
      id: "health_tracker",
      name: "Health Enthusiast",
      description: "Log health metrics for 7 consecutive days",
      icon: "award",
      unlocked: false,
      progress: 4,
      maxProgress: 7,
    },
    {
      id: "referral_pro",
      name: "Referral Pro",
      description: "Refer 5 friends to join the platform",
      icon: "gift",
      unlocked: false,
      progress: 2,
      maxProgress: 5,
    },
  ];

  // Level progress calculation
  const currentLevelPoints = (level - 1) * 100;
  const nextLevelPoints = level * 100;
  const levelProgress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  const generateReferralCode = () => {
    const code = "HEALTH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    navigator.clipboard.writeText(code)
      .then(() => {
        toast({
          title: "Referral Code Generated!",
          description: `Code ${code} copied to clipboard. Share with friends for 50 bonus points per signup!`,
        });
      })
      .catch(() => {
        toast({
          title: "Referral Code Generated!",
          description: `Your code is: ${code}. Share with friends for 50 bonus points per signup!`,
        });
      });
  };

  const shareOnSocial = (platform: string) => {
    const message = `Join me on VitaWellHub and get started on your wellness journey! Use my referral code for bonus points.`;
    const url = "https://vitawellhub.com/register?ref=USER123";
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            Your Rewards
          </CardTitle>
          <CardDescription>Track your achievements and level progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{points}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold">{level}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Level</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{referrals}</div>
              <div className="text-sm text-muted-foreground">Referrals</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Progress to Level {level + 1}</span>
              <span className="text-sm">{points - currentLevelPoints}/{nextLevelPoints - currentLevelPoints} points</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Badges & Achievements</h3>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`border rounded-md p-3 flex items-center gap-3 ${
                    badge.unlocked ? "bg-primary/5" : "opacity-70"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    badge.unlocked ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {badge.icon && React.createElement(badgeIcons[badge.icon], {
                      className: `h-5 w-5 ${badge.unlocked ? "text-primary" : "text-muted-foreground"}`,
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{badge.name}</h4>
                      {badge.unlocked && <Badge variant="outline" className="text-xs">Unlocked</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {!badge.unlocked && badge.progress !== undefined && (
                      <Progress 
                        value={(badge.progress / (badge.maxProgress || 1)) * 100} 
                        className="h-1 mt-1" 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="mr-2 h-5 w-5 text-primary" />
            Refer & Earn
          </CardTitle>
          <CardDescription>
            Invite friends to join VitaWellHub and earn points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-md text-center">
            <p className="text-sm">Earn <span className="font-bold">50 points</span> for each friend who joins using your referral</p>
          </div>
          
          <Button onClick={generateReferralCode} className="w-full">
            Generate Referral Code
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">or share directly</div>
          
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => shareOnSocial("facebook")}
            >
              Facebook
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => shareOnSocial("twitter")}
            >
              Twitter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => shareOnSocial("linkedin")}
            >
              LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
