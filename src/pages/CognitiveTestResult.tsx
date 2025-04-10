
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { 
  ArrowLeft, Clock, BarChart3, Calendar, Award, Brain 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function CognitiveTestResult() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: result, isLoading } = useQuery({
    queryKey: ["test-result", resultId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_results")
        .select(`
          *,
          cognitive_tests(*)
        `)
        .eq("id", resultId)
        .single();
        
      if (error) {
        toast.error("Failed to load test result", { description: error.message });
        navigate("/cognitive-tests");
        throw error;
      }
      
      return data;
    },
    enabled: !!resultId
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["test-history", result?.test_id],
    queryFn: async () => {
      if (!result?.test_id) return [];
      
      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("test_id", result.test_id)
        .order("created_at", { ascending: true });
        
      if (error) {
        toast.error("Failed to load test history", { description: error.message });
        throw error;
      }
      
      return data.map((item, index) => ({
        ...item,
        attempt: index + 1,
        date: new Date(item.created_at).toLocaleDateString(),
        scorePercentage: (item.score / item.max_score) * 100,
      }));
    },
    enabled: !!result?.test_id
  });
  
  const pieChartData = [
    { name: "Correct", value: result?.score || 0, color: "#10b981" },
    { name: "Incorrect", value: (result?.max_score || 0) - (result?.score || 0), color: "#f43f5e" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/cognitive-tests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
        </Button>
        
        <h1 className="text-3xl font-bold">{result?.cognitive_tests?.test_name} Results</h1>
        <p className="text-muted-foreground">
          Test completed on {new Date(result?.created_at).toLocaleDateString()} at {new Date(result?.created_at).toLocaleTimeString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Result Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your test performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Score Summary</h3>
                      <div className="aspect-square max-w-[240px] mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={0}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Score</span>
                              <span className="text-sm font-medium">{result?.score}/{result?.max_score}</span>
                            </div>
                            <Progress value={(result?.score / result?.max_score) * 100} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Completion Time</span>
                              <span className="text-sm font-medium">
                                {Math.floor((result?.completion_time || 0) / 60)}m {(result?.completion_time || 0) % 60}s
                              </span>
                            </div>
                            <Progress 
                              value={100 - ((result?.completion_time || 0) / (result?.cognitive_tests?.test_duration || 1) * 100)} 
                              className="h-2" 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-md p-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Award className="h-4 w-4" />
                                <span>Performance</span>
                              </div>
                              <p className="text-xl font-medium">
                                {Math.round((result?.score / result?.max_score) * 100)}%
                              </p>
                            </div>
                            
                            <div className="border rounded-md p-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Clock className="h-4 w-4" />
                                <span>Speed</span>
                              </div>
                              <p className="text-xl font-medium">
                                {result?.cognitive_tests?.test_duration ? 
                                  `${Math.round((result?.completion_time / result?.cognitive_tests?.test_duration) * 100)}%` : 
                                  'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Badge variant="outline" className="mb-2">
                          {result?.cognitive_tests?.category?.charAt(0).toUpperCase() + result?.cognitive_tests?.category?.slice(1) || 'Unknown'} Test
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {result?.cognitive_tests?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="pt-6 space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Test Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Test Type:</span>
                          <span className="font-medium">{result?.cognitive_tests?.test_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{result?.cognitive_tests?.category?.charAt(0).toUpperCase() + result?.cognitive_tests?.category?.slice(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium">{result?.cognitive_tests?.difficulty_level}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Questions:</span>
                          <span className="font-medium">
                            {result?.max_score ? result.max_score / (100 / result.max_score) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completion Time:</span>
                          <span className="font-medium">
                            {Math.floor((result?.completion_time || 0) / 60)}m {(result?.completion_time || 0) % 60}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date Taken:</span>
                          <span className="font-medium">{new Date(result?.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {result?.answers && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Answer Review</h3>
                      <div className="space-y-4">
                        {result.answers.sequence && result.answers.userSequence && (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Memory Challenge Sequence</p>
                            
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Original Sequence:</p>
                              <div className="flex flex-wrap gap-2">
                                {result.answers.sequence.map((item: string, i: number) => (
                                  <div key={`orig-${i}`} className="w-10 h-10 flex items-center justify-center border rounded-md">
                                    <span className="text-lg">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Your Sequence:</p>
                              <div className="flex flex-wrap gap-2">
                                {result.answers.userSequence.map((item: string, i: number) => (
                                  <div
                                    key={`user-${i}`}
                                    className={`w-10 h-10 flex items-center justify-center border rounded-md ${
                                      item === result.answers.sequence[i] 
                                        ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' 
                                        : 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800'
                                    }`}
                                  >
                                    <span className="text-lg">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="progress" className="pt-6">
                  {historyLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : history && history.length > 1 ? (
                    <div className="space-y-6">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={history}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="attempt" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="scorePercentage" 
                              name="Score (%)" 
                              stroke="#8884d8" 
                              activeDot={{ r: 8 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Test History</h3>
                        <div className="space-y-3">
                          {history.map((item) => (
                            <div 
                              key={item.id} 
                              className={`border rounded-lg p-3 ${
                                item.id === resultId ? 'border-primary bg-primary/5' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{item.date}</span>
                                </div>
                                <Badge>
                                  {Math.round((item.score / item.max_score) * 100)}%
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Score: {item.score}/{item.max_score}</span>
                                  <span>
                                    Time: {Math.floor(item.completion_time / 60)}m {item.completion_time % 60}s
                                  </span>
                                </div>
                                <Progress value={(item.score / item.max_score) * 100} className="h-1.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-medium">Not Enough Data</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Take this test more times to see your progress over time
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center pb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold">
                      {Math.round((result?.score / result?.max_score) * 100)}%
                    </span>
                  </div>
                  {(result?.score / result?.max_score) >= 0.8 && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                      <Award className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium">
                  {(result?.score / result?.max_score) >= 0.8 ? 'Excellent!' : 
                   (result?.score / result?.max_score) >= 0.6 ? 'Good Job!' : 
                   (result?.score / result?.max_score) >= 0.4 ? 'Nice Effort!' : 
                   'Keep Practicing!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {(result?.score / result?.max_score) >= 0.8 ? 'Your memory skills are impressive!' : 
                   (result?.score / result?.max_score) >= 0.6 ? 'You have good recall abilities.' : 
                   (result?.score / result?.max_score) >= 0.4 ? 'Your memory is developing well.' : 
                   'Regular practice will improve your memory.'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Strengths & Areas for Improvement</h4>
                <ul className="space-y-2 text-sm">
                  {(result?.score / result?.max_score) >= 0.5 ? (
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span>Good pattern recognition and sequence recall</span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        !
                      </div>
                      <span>Work on improving sequence memorization</span>
                    </li>
                  )}
                  
                  {(result?.completion_time || 0) < (result?.cognitive_tests?.test_duration || 0) / 2 ? (
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span>Excellent processing speed</span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        !
                      </div>
                      <span>Try to improve recall speed with practice</span>
                    </li>
                  )}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-primary mt-0.5" />
                    <span>Try the next difficulty level for a greater challenge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-primary mt-0.5" />
                    <span>Practice daily memory exercises for 10-15 minutes</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/cognitive-tests")}
            >
              All Tests
            </Button>
            <Button 
              className="flex-1"
              onClick={() => navigate(`/cognitive-tests/${result?.test_id}`)}
            >
              Retake Test
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
