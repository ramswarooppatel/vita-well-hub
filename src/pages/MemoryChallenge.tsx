
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { AlertCircle, Clock, Brain } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MEMORY_IMAGES = [
  "🍎", "🍌", "🍒", "🍕", "🚗", "🏠", "🐶", "🐱", 
  "📱", "💻", "🎮", "📚", "⚽", "🏀", "🎸", "🎹"
];

type GameState = "intro" | "memorize" | "recall" | "result";

export default function MemoryChallenge() {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState<GameState>("intro");
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(3); // Start with 3 items
  const [timer, setTimer] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);

  const { data: test, isLoading } = useQuery({
    queryKey: ["cognitive-test", testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cognitive_tests")
        .select("*")
        .eq("id", testId)
        .single();
        
      if (error) {
        toast.error("Error loading test", { description: error.message });
        navigate("/cognitive-tests");
        throw error;
      }
      
      return data;
    },
    enabled: !!testId
  });

  const generateSequence = useCallback((length: number) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * MEMORY_IMAGES.length);
      newSequence.push(MEMORY_IMAGES[randomIndex]);
    }
    return newSequence;
  }, []);

  const startGame = useCallback(() => {
    setGameState("memorize");
    setSequence(generateSequence(level));
    setTimeLeft(10); // 10 seconds to memorize
    setStartTime(Date.now());
    
    const intervalId = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setGameState("recall");
          setUserSequence([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimer(intervalId);
  }, [level, generateSequence]);

  const handleImageClick = (image: string) => {
    if (gameState !== "recall") return;
    
    setUserSequence(prev => {
      const updated = [...prev, image];
      
      // Auto-submit when user has selected enough items
      if (updated.length === sequence.length) {
        setTimeout(() => checkAnswer(updated), 500);
      }
      
      return updated;
    });
  };

  const checkAnswer = (userSeq: string[]) => {
    let correct = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (userSeq[i] === sequence[i]) {
        correct++;
      }
    }
    
    const accuracy = correct / sequence.length;
    const newScore = Math.round(accuracy * 100);
    setScore(newScore);
    
    const completionTime = Math.round((Date.now() - startTime) / 1000);
    
    // Save result to database
    saveResult(newScore, sequence.length, completionTime, {
      sequence,
      userSequence: userSeq
    });
    
    setGameState("result");
  };

  const saveResult = async (score: number, maxScore: number, completionTime: number, answers: any) => {
    try {
      const { error } = await supabase
        .from("test_results")
        .insert({
          test_id: testId,
          score: score,
          max_score: sequence.length * 100 / sequence.length, // Each correct item is worth equal points
          completion_time: completionTime,
          answers
        });
        
      if (error) throw error;
      
      toast.success("Test result saved successfully");
    } catch (error: any) {
      toast.error("Failed to save result", { description: error.message });
      console.error("Error saving result:", error);
    }
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setGameState("intro");
  };

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

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
      <div className="max-w-3xl mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex justify-center items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Memory Challenge - Level {level}
            </CardTitle>
            <CardDescription>
              {gameState === "intro" && "Memorize the sequence of images and recall them in order."}
              {gameState === "memorize" && "Memorize these images in order!"}
              {gameState === "recall" && "Now recall the images in the correct order."}
              {gameState === "result" && "Challenge complete!"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {gameState === "intro" && (
              <div className="text-center space-y-6 py-8">
                <div className="bg-muted p-4 rounded-lg max-w-lg mx-auto">
                  <h3 className="font-medium mb-2">How to Play:</h3>
                  <ul className="text-left space-y-2 text-sm text-muted-foreground">
                    <li>1. You'll be shown {level} images for 10 seconds</li>
                    <li>2. Try to memorize them in the exact order</li>
                    <li>3. Then select the images in the same sequence</li>
                    <li>4. Your score is based on accuracy</li>
                  </ul>
                </div>
                
                <Button size="lg" onClick={startGame}>Start Challenge</Button>
              </div>
            )}
            
            {gameState === "memorize" && (
              <div className="space-y-6">
                <div className="flex justify-center items-center h-12">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-lg font-medium">{timeLeft}s</span>
                  </div>
                </div>
                
                <Progress value={(timeLeft / 10) * 100} className="h-2 mb-8" />
                
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {sequence.map((image, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="text-4xl mb-1">{image}</div>
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                  ))}
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Memorization phase</AlertTitle>
                  <AlertDescription>
                    Remember these images in order. The recall phase will begin when the timer ends.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {gameState === "recall" && (
              <div className="space-y-6">
                <div className="flex justify-center gap-4 mb-8">
                  {userSequence.map((image, index) => (
                    <div key={index} className="w-12 h-12 flex items-center justify-center text-2xl border rounded-lg">
                      {image}
                    </div>
                  ))}
                  {Array(sequence.length - userSequence.length).fill(0).map((_, index) => (
                    <div key={`empty-${index}`} className="w-12 h-12 border border-dashed rounded-lg"></div>
                  ))}
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {MEMORY_IMAGES.map((image, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-16 text-2xl"
                      onClick={() => handleImageClick(image)}
                      disabled={userSequence.length >= sequence.length}
                    >
                      {image}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {gameState === "result" && (
              <div className="text-center space-y-6 py-8">
                <div className="text-6xl mb-4">
                  {score >= 70 ? '🏆' : score >= 40 ? '🎯' : '🔄'}
                </div>
                
                <h3 className="text-2xl font-bold mb-2">
                  {score >= 70 ? 'Great job!' : score >= 40 ? 'Good effort!' : 'Keep practicing!'}
                </h3>
                
                <div className="bg-muted p-4 rounded-lg max-w-lg mx-auto">
                  <p className="text-lg font-medium mb-2">Your Score: {score}%</p>
                  
                  <div className="mb-6">
                    <p className="mb-2 text-sm text-muted-foreground">Accuracy</p>
                    <Progress value={score} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Original Sequence</p>
                      <div className="flex mt-1">
                        {sequence.map((img, i) => (
                          <div key={i} className="w-8 h-8 flex items-center justify-center border rounded mr-1">
                            {img}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">Your Sequence</p>
                      <div className="flex mt-1">
                        {userSequence.map((img, i) => (
                          <div 
                            key={i} 
                            className={`w-8 h-8 flex items-center justify-center border rounded mr-1 ${
                              img === sequence[i] ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 
                              'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800'
                            }`}
                          >
                            {img}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center gap-4">
            {gameState === "result" && (
              <>
                <Button onClick={() => navigate("/cognitive-tests")} variant="outline">
                  Exit
                </Button>
                <Button onClick={nextLevel}>
                  Next Level
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
