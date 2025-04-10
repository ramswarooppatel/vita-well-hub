
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock } from "lucide-react";

interface Test {
  id: string;
  test_name: string;
  description: string;
  category: string;
  difficulty_level: string;
  test_duration: number;
  instructions: string;
}

interface TestCardProps {
  test: Test;
  onStart: () => void;
}

export function TestCard({ test, onStart }: TestCardProps) {
  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'memory': return '🧠';
      case 'attention': return '👁️';
      case 'problem_solving': return '🧩';
      case 'language': return '💬';
      default: return '📝';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>{getCategoryIcon(test.category)}</span>
              {test.test_name}
            </CardTitle>
            <CardDescription className="mt-1">{test.description}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(test.difficulty_level)}>
            {test.difficulty_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4" />
            <span>Category: {test.category.charAt(0).toUpperCase() + test.category.slice(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Duration: {Math.floor(test.test_duration / 60)} minutes</span>
          </div>
        </div>
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-sm font-medium mb-1">Instructions:</p>
          <p className="text-sm text-muted-foreground">{test.instructions}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full">
          Start Test
        </Button>
      </CardFooter>
    </Card>
  );
}
