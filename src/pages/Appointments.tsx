
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Clock, Users, MapPin } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

interface AppointmentFormValues {
  speciality: string;
  doctor: string;
  date: Date;
  time: string;
  appointmentType: string;
}

type Doctor = {
  id: string;
  name: string;
  speciality: string;
  image?: string;
  availableDates: Date[];
  availableTimes: string[];
};

export default function Appointments() {
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [step, setStep] = useState(1);
  const [appointmentSuccessful, setAppointmentSuccessful] = useState(false);
  
  // Simulate doctors data
  const doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      speciality: "Cardiology",
      availableDates: [
        new Date(2025, 3, 15),
        new Date(2025, 3, 16),
        new Date(2025, 3, 18),
        new Date(2025, 3, 20),
      ],
      availableTimes: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      speciality: "General Medicine",
      availableDates: [
        new Date(2025, 3, 14),
        new Date(2025, 3, 15),
        new Date(2025, 3, 17),
        new Date(2025, 3, 19),
      ],
      availableTimes: ["8:30 AM", "11:00 AM", "1:30 PM", "4:00 PM"],
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      speciality: "Dermatology",
      availableDates: [
        new Date(2025, 3, 15),
        new Date(2025, 3, 17),
        new Date(2025, 3, 19),
        new Date(2025, 3, 21),
      ],
      availableTimes: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
    },
  ];
  
  const specialities = ["Cardiology", "General Medicine", "Dermatology", "Pediatrics", "Orthopedics"];

  const form = useForm<AppointmentFormValues>({
    defaultValues: {
      speciality: "",
      doctor: "",
      date: new Date(),
      time: "",
      appointmentType: "in-person",
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    // In a real app, you would submit this to your backend
    console.log(values);
    setAppointmentSuccessful(true);
    toast({
      title: "Appointment booked successfully",
      description: `Your appointment with ${selectedDoctor?.name} on ${format(values.date, "PPP")} at ${values.time} has been confirmed.`,
    });
  };

  const handleSpecialityChange = (value: string) => {
    form.setValue("speciality", value);
    form.setValue("doctor", "");
    setSelectedDoctor(null);
  };

  const handleDoctorChange = (value: string) => {
    const doctor = doctors.find(doc => doc.id === value);
    setSelectedDoctor(doctor || null);
    form.setValue("doctor", value);
  };

  const filteredDoctors = doctors.filter(
    doc => !form.getValues("speciality") || doc.speciality === form.getValues("speciality")
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground">Schedule an appointment with our healthcare professionals</p>
        </div>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new">New Appointment</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new">
            {appointmentSuccessful ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="mt-6 text-2xl font-semibold">Appointment Confirmed</h2>
                    <p className="mt-2 text-muted-foreground mb-6">
                      Your appointment has been successfully booked. Check your email for details.
                    </p>
                    <div className="mb-6 p-4 rounded-lg bg-muted/40">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Doctor</span>
                          <span className="font-medium">{selectedDoctor?.name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Speciality</span>
                          <span className="font-medium">{selectedDoctor?.speciality}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Date & Time</span>
                          <span className="font-medium">
                            {format(form.getValues("date"), "PPP")} at {form.getValues("time")}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Appointment Type</span>
                          <span className="font-medium capitalize">
                            {form.getValues("appointmentType")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => setAppointmentSuccessful(false)}>Book Another Appointment</Button>
                      <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                        Return to Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Booking Steps</h3>
                      <span className="text-sm text-muted-foreground">Step {step} of 3</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(step / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {step === 1 && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="speciality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Speciality</FormLabel>
                                <Select
                                  onValueChange={(value) => handleSpecialityChange(value)}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a speciality" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {specialities.map((speciality) => (
                                      <SelectItem key={speciality} value={speciality}>
                                        {speciality}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="doctor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Doctor</FormLabel>
                                <Select
                                  onValueChange={handleDoctorChange}
                                  defaultValue={field.value}
                                  disabled={!form.getValues("speciality")}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {filteredDoctors.map((doctor) => (
                                      <SelectItem key={doctor.id} value={doctor.id}>
                                        {doctor.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="appointmentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Appointment Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select appointment type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="in-person">In-Person</SelectItem>
                                    <SelectItem value="virtual">Virtual</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {step === 2 && selectedDoctor && (
                        <div className="space-y-4">
                          <Card className="border-0 shadow-none bg-muted/40">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                  {selectedDoctor.image ? (
                                    <img
                                      src={selectedDoctor.image}
                                      alt={selectedDoctor.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xl font-semibold text-primary">
                                      {selectedDoctor.name.split(' ').map(name => name[0]).join('')}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{selectedDoctor.name}</h3>
                                  <p className="text-sm text-muted-foreground">{selectedDoctor.speciality}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Appointment Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date < new Date() ||
                                        !selectedDoctor.availableDates.some(
                                          (d) => d.toDateString() === date.toDateString()
                                        )
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Appointment Time</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={!form.getValues("date")}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a time slot" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectedDoctor.availableTimes.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Review Your Appointment</h3>
                          
                          <Card className="bg-muted/40 border-0 shadow-none">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{selectedDoctor?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedDoctor?.speciality}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{format(form.getValues("date"), "PPP")}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{form.getValues("time")}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium capitalize">
                                      {form.getValues("appointmentType")} Appointment
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {form.getValues("appointmentType") === "virtual" 
                                        ? "Video consultation link will be sent to your email"
                                        : "Health Center, Building A, Floor 3"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Additional Information</p>
                            <Input placeholder="Any specific concerns or notes for the doctor" />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-2">
                        {step > 1 && (
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                          >
                            Previous
                          </Button>
                        )}
                        
                        {step < 3 ? (
                          <Button 
                            type="button"
                            className="ml-auto"
                            onClick={() => {
                              // Validate current step before proceeding
                              if (step === 1) {
                                if (!form.getValues("speciality") || !form.getValues("doctor")) {
                                  toast({
                                    title: "Please complete all fields",
                                    description: "Speciality and doctor selection are required",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                              } else if (step === 2) {
                                if (!form.getValues("date") || !form.getValues("time")) {
                                  toast({
                                    title: "Please complete all fields",
                                    description: "Date and time selection are required",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                              }
                              setStep(step + 1);
                            }}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button type="submit" className="ml-auto">
                            Confirm Appointment
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  View and manage your upcoming appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">SJ</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Dr. Sarah Johnson</h3>
                          <p className="text-sm text-muted-foreground">Cardiologist</p>
                          <div className="flex items-center gap-1 mt-1 text-sm">
                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>March 15, 2025 • 10:30 AM</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">MC</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Dr. Michael Chen</h3>
                          <p className="text-sm text-muted-foreground">General Practitioner</p>
                          <div className="flex items-center gap-1 mt-1 text-sm">
                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>March 22, 2025 • 2:00 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
