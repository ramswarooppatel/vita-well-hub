
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Award, Brain, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TestResult } from "@/types/database";

export function ProgressStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["cognitive-stats"],
    queryFn: async () => {
      // Get total number of tests
      const { data: tests, error: testsError } = await supabase
        .from("cognitive_tests")
        .select("id");
      
      if (testsError) throw testsError;
      
      // Get user's completed tests
      const { data: results, error: resultsError } = await supabase
        .from("test_results")
        .select("test_id, score, max_score");
      
      if (resultsError) throw resultsError;
      
      // Calculate statistics
      const totalTests = tests?.length || 0;
      const completedTests = results?.length || 0;
      const uniqueCompletedTests = new Set((results as TestResult[] || []).map(r => r.test_id)).size;
      
      let totalScore = 0;
      let totalPossible = 0;
      
      (results as TestResult[] || []).forEach(r => {
        totalScore += r.score;
        totalPossible += r.max_score;
      });
      
      const avgPerformance = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
      
      return {
        totalTests,
        completedTests,
        uniqueCompletedTests,
        completionRate: totalTests > 0 ? (uniqueCompletedTests / totalTests) * 100 : 0,
        avgPerformance
      };
    },
    initialData: {
      totalTests: 0,
      completedTests: 0,
      uniqueCompletedTests: 0,
      completionRate: 0,
      avgPerformance: 0
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Award className="mr-2 h-5 w-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Tests Completed</span>
            <span className="text-sm font-medium">{stats.uniqueCompletedTests}/{stats.totalTests}</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Average Performance</span>
            <span className="text-sm font-medium">{Math.round(stats.avgPerformance)}%</span>
          </div>
          <Progress value={stats.avgPerformance} className="h-2" />
        </div>
        
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Tests Taken</p>
                <p className="text-xs text-muted-foreground">{stats.completedTests} attempts</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Best Score</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(stats.avgPerformance)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
