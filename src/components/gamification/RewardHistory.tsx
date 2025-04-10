
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Award, 
  Gift, 
  Calendar, 
  ArrowUp 
} from "lucide-react";

// Sample reward history data
// In a real app, this would come from an API or database
const rewardHistoryData = [
  {
    id: "1",
    type: "achievement",
    title: "First Test Completion",
    points: 100,
    date: "2025-03-15",
    status: "completed",
  },
  {
    id: "2",
    type: "referral",
    title: "Friend Referral Bonus",
    points: 50,
    date: "2025-03-12",
    status: "completed",
  },
  {
    id: "3",
    type: "streak",
    title: "7-Day Login Streak",
    points: 75,
    date: "2025-03-10",
    status: "completed",
  },
  {
    id: "4",
    type: "test",
    title: "Perfect Memory Test Score",
    points: 150,
    date: "2025-03-05",
    status: "completed",
  },
  {
    id: "5",
    type: "challenge",
    title: "Monthly Challenge",
    points: 200,
    date: "2025-04-01",
    status: "in-progress",
  }
];

// Helper function to render the appropriate icon based on reward type
const getRewardIcon = (type: string) => {
  switch (type) {
    case "achievement":
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case "referral":
      return <Gift className="h-4 w-4 text-pink-500" />;
    case "streak":
      return <Star className="h-4 w-4 text-blue-500" />;
    case "test":
      return <Award className="h-4 w-4 text-green-500" />;
    case "challenge":
      return <Calendar className="h-4 w-4 text-purple-500" />;
    default:
      return <ArrowUp className="h-4 w-4 text-gray-500" />;
  }
};

export function RewardHistory() {
  return (
    <div className="bg-card rounded-md border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Reward History</h3>
        <p className="text-sm text-muted-foreground">Track your earned points and achievements</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewardHistoryData.map((reward) => (
              <TableRow key={reward.id}>
                <TableCell>
                  <div className="flex items-center">
                    {getRewardIcon(reward.type)}
                    <span className="ml-2 capitalize">{reward.type}</span>
                  </div>
                </TableCell>
                <TableCell>{reward.title}</TableCell>
                <TableCell>{new Date(reward.date).toLocaleDateString()}</TableCell>
                <TableCell>+{reward.points}</TableCell>
                <TableCell>
                  <Badge 
                    variant={reward.status === "completed" ? "outline" : "secondary"}
                    className={reward.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : ""}
                  >
                    {reward.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
