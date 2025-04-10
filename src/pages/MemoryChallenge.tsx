// Fix the toast import and add user_id to test results submission
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

type TestData = {
  id: string;
  test_name: string;
  description: string;
  instructions: string;
  test_duration: number;
  category: string;
  difficulty_level: string;
};

// Add the user authentication check and add user_id to the test results submission
export default function MemoryChallenge() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();  // Add this to get current user

  const { data: testData, isLoading } = useQuery(
    ["cognitive-test", testId],
    async () => {
      const { data, error } = await supabase
        .from("cognitive_tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (error) {
        toast.error("Failed to load test", { description: error.message });
        navigate("/cognitive-tests");
        throw error;
      }

      return data as TestData;
    },
    {
      enabled: !!testId,
    }
  );

  useEffect(() => {
    if (isLoading) return;

    // Generate a sequence of numbers when the component mounts
    const newSequence = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 9).toString()
    );
    setSequence(newSequence);
  }, [isLoading]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const startGame = () => {
    setUserSequence([]);
    setInput("");
    setTimeElapsed(0);
    setIsRunning(true);
  };

  const stopGame = () => {
    setIsRunning(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const submitAnswer = () => {
    setUserSequence((prevSequence) => [...prevSequence, input]);
    setInput("");
  };

  // Fix the test result submission to include user_id
  const submitTestResult = async () => {
    if (!testData || !user) return;
    
    setSubmitting(true);
    
    try {
      // Calculate the score
      const score = userSequence.filter((item, index) => 
        index < sequence.length && item === sequence[index]
      ).length;
      
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          test_id: testId,
          user_id: user.id, // Add user_id here
          score: score,
          max_score: sequence.length,
          completion_time: timeElapsed,
          answers: { 
            sequence, 
            userSequence 
          }
        })
        .select('id')
        .single();
      
      if (error) {
        toast.error("Failed to submit results", { description: error.message });
        setSubmitting(false);
        return;
      }
      
      toast.success("Test completed!", { description: "Redirecting to your results..." });
      
      // Navigate to the results page
      setTimeout(() => {
        navigate(`/cognitive-tests/results/${data.id}`);
      }, 1500);
      
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
      setSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{testData?.test_name || "Memory Challenge"}</h1>
            <p className="text-muted-foreground">
              Test your memory by recalling the sequence
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>
              {testData?.instructions ||
                "Click start to see the sequence. Then, enter the sequence in the input box."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Button onClick={startGame} disabled={isRunning}>
                    Start
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={stopGame}
                    disabled={!isRunning}
                  >
                    Stop
                  </Button>
                </div>

                <div>
                  <Label htmlFor="sequence">Sequence</Label>
                  <Input
                    id="sequence"
                    value={isRunning ? sequence.join(" ") : ""}
                    readOnly
                  />
                </div>

                <div>
                  <Label htmlFor="input">Enter Sequence</Label>
                  <Input
                    id="input"
                    value={input}
                    onChange={handleInputChange}
                    disabled={!isRunning}
                  />
                  <Button
                    onClick={submitAnswer}
                    disabled={!isRunning || input === ""}
                  >
                    Submit
                  </Button>
                </div>

                <div>
                  <Label>Time Elapsed</Label>
                  <Input value={timeElapsed.toString()} readOnly />
                </div>

                <div>
                  <Label>Your Sequence</Label>
                  <div className="flex gap-2">
                    {userSequence.map((num, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {num}
                        {sequence[index] === num ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Progress</Label>
                  <Progress
                    value={(userSequence.length / sequence.length) * 100}
                  />
                </div>

                <Button onClick={submitTestResult} disabled={submitting}>
                  Submit Test
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
