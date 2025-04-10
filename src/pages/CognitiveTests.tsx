import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Clock, Trophy, BarChart3, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TestCard } from "@/components/cognitive/TestCard";
import { ProgressStats } from "@/components/cognitive/ProgressStats";

export default function CognitiveTests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("available");

  const { data: tests, isLoading } = useQuery({
    queryKey: ["cognitive-tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cognitive_tests")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        toast.error("Failed to load tests", { description: error.message });
        throw error;
      }
      
      return data;
    }
  });

  const { data: results, isLoading: isLoadingResults } = useQuery({
    queryKey: ["test-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_results")
        .select(`*, cognitive_tests(*)`)
        .order("created_at", { ascending: false });
        
      if (error) {
        toast.error("Failed to load test results", { description: error.message });
        throw error;
      }
      
      return data;
    }
  });

  const startTest = (testId: string) => {
    navigate(`/cognitive-tests/${testId}`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Cognitive Tests</h1>
            <p className="text-muted-foreground">Challenge your mind with our cognitive assessment tests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Cognitive Assessment Tests
                </CardTitle>
                <CardDescription>
                  These tests help measure different aspects of your cognitive function
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="available" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">Available Tests</TabsTrigger>
                    <TabsTrigger value="completed">Your Results</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="available" className="pt-4">
                    {isLoading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {tests?.map(test => (
                          <TestCard 
                            key={test.id} 
                            test={test} 
                            onStart={() => startTest(test.id)} 
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed" className="pt-4">
                    {isLoadingResults ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : results?.length ? (
                      <div className="space-y-4">
                        {results.map(result => (
                          <Card key={result.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  {result.cognitive_tests?.test_name}
                                </CardTitle>
                                <Badge variant={result.score / result.max_score > 0.7 ? "default" : "outline"}>
                                  Score: {result.score}/{result.max_score}
                                </Badge>
                              </div>
                              <CardDescription>
                                Completed on {new Date(result.created_at).toLocaleDateString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>Completion time: {Math.floor(result.completion_time / 60)}m {result.completion_time % 60}s</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/cognitive-tests/results/${result.id}`)}>
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <h3 className="text-lg font-medium">No tests completed yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Take a test to see your results here
                        </p>
                        <Button onClick={() => setActiveTab("available")}>
                          Browse Available Tests
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <ProgressStats />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Cognitive Health</p>
                      <p className="text-sm text-muted-foreground">Regular testing helps maintain brain health</p>
                    </div>
                  </li>
                  <Separator />
                  <li className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Early Detection</p>
                      <p className="text-sm text-muted-foreground">Identify potential cognitive issues early</p>
                    </div>
                  </li>
                  <Separator />
                  <li className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Performance Tracking</p>
                      <p className="text-sm text-muted-foreground">Monitor improvements over time</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
