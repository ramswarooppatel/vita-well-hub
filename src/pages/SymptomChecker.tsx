
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertCircle, 
  ArrowRight, 
  ChevronRight, 
  Thermometer, 
  Clock, 
  Info,
  Stethoscope,
  CalendarClock,
  Video,
  MessageCircle
} from "lucide-react";

export default function SymptomChecker() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const handleNextStep = () => {
    let canProceed = false;
    
    switch (step) {
      case 1:
        canProceed = selectedGender !== null && age !== null;
        break;
      case 2:
        canProceed = symptoms.trim().length > 10;
        break;
      case 3:
        canProceed = duration !== null && severity !== null;
        break;
      default:
        canProceed = false;
    }

    if (canProceed) {
      if (step < 4) {
        setStep(step + 1);
      } else if (step === 4) {
        handleSubmitSymptoms();
      }
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields to proceed.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitSymptoms = () => {
    setAnalyzing(true);
    
    // Simulate API call with progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProgressPercentage(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setAnalyzing(false);
        setAnalysisComplete(true);
      }
    }, 200);
  };

  const handleBookAppointment = () => {
    toast({
      title: "Appointment booking",
      description: "Redirecting to appointment booking page",
    });
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Biological Sex</Label>
        <RadioGroup value={selectedGender || ""} onValueChange={setSelectedGender}>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label htmlFor="age">Age</Label>
        <div className="flex space-x-2">
          {[18, 25, 35, 45, 55, 65, 75].map((value) => (
            <Button
              key={value}
              type="button"
              variant={age === value ? "default" : "outline"}
              className="h-11 w-11"
              onClick={() => setAge(value)}
            >
              {value}
            </Button>
          ))}
          <Button
            type="button"
            variant={age === 85 ? "default" : "outline"}
            className="h-11"
            onClick={() => setAge(85)}
          >
            85+
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSymptoms = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="symptoms">
          Describe your symptoms in detail
        </Label>
        <Textarea
          id="symptoms"
          placeholder="Please explain what you're experiencing. For example: I have had a headache for the past 3 days, along with a slight fever and fatigue..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="min-h-[150px]"
        />
        <p className="text-sm text-muted-foreground">
          Include when symptoms started, their intensity, and any factors that worsen or improve them
        </p>
      </div>
    </div>
  );

  const renderMoreDetails = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>How long have you been experiencing these symptoms?</Label>
        <RadioGroup value={duration || ""} onValueChange={setDuration}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="today" id="today" />
              <Label htmlFor="today">Today</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="few-days" id="few-days" />
              <Label htmlFor="few-days">Few days</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="week" id="week" />
              <Label htmlFor="week">About a week</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="weeks" id="weeks" />
              <Label htmlFor="weeks">Several weeks</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="months" id="months" />
              <Label htmlFor="months">Months or longer</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label>How severe are your symptoms?</Label>
        <RadioGroup value={severity || ""} onValueChange={setSeverity}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="mild" id="mild" />
              <Label htmlFor="mild">Mild - Noticeable but not interfering with daily activities</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate">Moderate - Affecting some daily activities</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="severe" id="severe" />
              <Label htmlFor="severe">Severe - Significantly limiting daily activities</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="very-severe" id="very-severe" />
              <Label htmlFor="very-severe">Very Severe - Unable to perform daily activities</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium">Basic Information</h3>
        <div className="mt-1 pl-4 border-l-2 border-muted">
          <p><span className="text-muted-foreground">Sex:</span> {selectedGender === 'male' ? 'Male' : selectedGender === 'female' ? 'Female' : 'Other'}</p>
          <p><span className="text-muted-foreground">Age:</span> {age}</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Symptoms</h3>
        <div className="mt-1 pl-4 border-l-2 border-muted text-sm">
          <p>{symptoms}</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Details</h3>
        <div className="mt-1 pl-4 border-l-2 border-muted">
          <p>
            <span className="text-muted-foreground">Duration:</span> {
              duration === 'today' ? 'Started today' :
              duration === 'few-days' ? 'Few days' :
              duration === 'week' ? 'About a week' :
              duration === 'weeks' ? 'Several weeks' :
              'Months or longer'
            }
          </p>
          <p>
            <span className="text-muted-foreground">Severity:</span> {
              severity === 'mild' ? 'Mild' :
              severity === 'moderate' ? 'Moderate' :
              severity === 'severe' ? 'Severe' :
              'Very Severe'
            }
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          This symptom checker is not a diagnosis. It is meant to provide general information and is not a substitute for professional medical advice.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          This analysis is not a medical diagnosis. Always consult with a healthcare professional for proper evaluation.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-lg">Possible Conditions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your symptoms, these conditions could be considered:
          </p>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                    <Thermometer className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium">Common Cold</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      A viral infection affecting the upper respiratory tract, typically causing nasal congestion, sore throat, and mild fever.
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">Moderate Match</Badge>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Stethoscope className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-medium">Seasonal Allergies</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      An immune response to specific allergens like pollen or dust, causing symptoms similar to a cold but without fever.
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Strong Match</Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium text-lg">Recommended Actions</h3>
          <div className="space-y-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Monitor Your Symptoms</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep track of your symptoms for the next 24-48 hours. If they worsen or don't improve, consult a healthcare provider.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <CalendarClock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Schedule an Appointment</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your symptoms, it's recommended to schedule a consultation with a healthcare provider.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button className="flex items-center gap-1.5" onClick={handleBookAppointment}>
                    Book Appointment <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="flex items-center gap-1.5">
                    <Video className="h-4 w-4" /> Virtual Consult
                  </Button>
                  <Button variant="secondary" className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" /> Ask a Doctor
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Self-Care Tips</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              <li>Stay hydrated by drinking plenty of fluids</li>
              <li>Get adequate rest to help your body recover</li>
              <li>Over-the-counter medication may help relieve symptoms (follow package directions)</li>
              <li>Consider saline nasal spray for congestion</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="text-center py-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 animate-pulse">
        <Stethoscope className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-medium">Analyzing your symptoms</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Our AI is processing your information to provide possible conditions and recommendations
      </p>
      <Progress value={progressPercentage} className="mt-6 max-w-md mx-auto" />
      <p className="mt-2 text-sm text-muted-foreground">
        This may take a few moments...
      </p>
    </div>
  );

  const getStepContent = () => {
    if (analyzing) {
      return renderAnalyzing();
    }
    
    if (analysisComplete) {
      return renderResults();
    }

    switch (step) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderSymptoms();
      case 3:
        return renderMoreDetails();
      case 4:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Symptom Checker</h1>
          <p className="text-muted-foreground">Answer a few questions to get insights about possible conditions</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Medical Disclaimer</AlertTitle>
          <AlertDescription>
            This tool provides information only and is not a qualified medical opinion. Please consult a healthcare professional for proper diagnosis and treatment.
          </AlertDescription>
        </Alert>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            {!analyzing && !analysisComplete && (
              <>
                <CardTitle>
                  Step {step} of 4: {
                    step === 1 ? "Basic Information" :
                    step === 2 ? "Symptoms Description" :
                    step === 3 ? "Additional Details" :
                    "Review Information"
                  }
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Please provide your basic information to help us understand your health context"}
                  {step === 2 && "Describe your symptoms in as much detail as possible"}
                  {step === 3 && "Help us understand the timeline and severity of your symptoms"}
                  {step === 4 && "Please review the information you've provided"}
                </CardDescription>
              </>
            )}
            {analysisComplete && (
              <>
                <CardTitle>Symptom Analysis Results</CardTitle>
                <CardDescription>
                  Based on the information you've provided, here are some insights
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {getStepContent()}
          </CardContent>
          {!analyzing && !analysisComplete && (
            <CardFooter className="flex justify-between border-t pt-6">
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              <Button 
                className="ml-auto flex items-center"
                onClick={handleNextStep}
              >
                {step < 4 ? (
                  <>Next <ChevronRight className="ml-1 h-4 w-4" /></>
                ) : (
                  "Submit"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Add Badge component that we missed in the imports
function Badge({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
