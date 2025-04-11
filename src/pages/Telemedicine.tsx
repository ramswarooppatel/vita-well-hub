
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MessageCircle,
  Star,
  MapPin,
  FileText,
  Search,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Calendar components
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  rating: number;
  price: number;
  nextAvailable: string;
  experience: string;
  location: string;
}

export default function Telemedicine() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [appointmentType, setAppointmentType] = useState("in-person");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      rating: 4.9,
      price: 1500,
      nextAvailable: "Today, 4:30 PM",
      experience: "15 years",
      location: "New Delhi, India",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "General Medicine",
      rating: 4.7,
      price: 900,
      nextAvailable: "Tomorrow, 10:30 AM",
      experience: "8 years",
      location: "Mumbai, India",
    },
    {
      id: "3",
      name: "Dr. Priya Sharma",
      specialty: "Dermatology",
      rating: 4.8,
      price: 1200,
      nextAvailable: "Today, 6:00 PM",
      experience: "12 years",
      location: "Bangalore, India",
    },
    {
      id: "4",
      name: "Dr. Rajesh Patel",
      specialty: "Pediatrics",
      rating: 4.9,
      price: 1000,
      nextAvailable: "Tomorrow, 2:00 PM",
      experience: "10 years",
      location: "Chennai, India",
    },
  ];

  const upcomingConsultations = [
    {
      id: "1",
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "March 15, 2025",
      time: "4:30 PM",
      type: "Video",
    },
  ];

  const pastConsultations = [
    {
      id: "1",
      doctorName: "Dr. Michael Chen",
      specialty: "General Medicine",
      date: "February 20, 2025",
      time: "2:00 PM",
      type: "Chat",
    },
  ];

  const availableTimeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM", 
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", 
    "5:00 PM", "5:30 PM"
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    if (searchQuery.trim() === "") return true;
    
    const query = searchQuery.toLowerCase();
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query) ||
      doctor.location.toLowerCase().includes(query)
    );
  });

  const handleBookConsultation = (doctor: Doctor) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book a consultation",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setSelectedDoctor(doctor);
    setBookingDialogOpen(true);
  };

  const handleJoinCall = (consultationId: string) => {
    toast({
      title: "Joining video call",
      description: "Connecting to your consultation...",
    });
    // In a real app, this would navigate to a video call interface
  };

  const handleViewDetails = (consultationId: string) => {
    toast({
      title: "Viewing consultation details",
      description: "Loading consultation information...",
    });
    // In a real app, this would show detailed consultation info
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot) {
      toast({
        title: "Incomplete details",
        description: "Please select date and time for your appointment",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      // Format the appointment date by combining the selected date and time slot
      const appointmentDate = new Date(selectedDate);
      const [hours, minutes, period] = selectedTimeSlot.split(/:| /);
      let hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      if (period === "PM" && hour !== 12) {
        hour += 12;
      } else if (period === "AM" && hour === 12) {
        hour = 0;
      }
      
      appointmentDate.setHours(hour, minute, 0, 0);
      
      // In a real app with Supabase, we would save to the database
      // const { data, error } = await supabase
      //   .from('appointments')
      //   .insert({
      //     user_id: user.id,
      //     doctor_id: selectedDoctor.id,
      //     appointment_date: appointmentDate.toISOString(),
      //     doctor_name: selectedDoctor.name,
      //     specialty: selectedDoctor.specialty,
      //     is_virtual: appointmentType === "virtual",
      //     notes: appointmentNotes,
      //     status: "scheduled",
      //   });
      
      // For demo purposes, show success without DB interaction
      toast({
        title: "Appointment Booked Successfully",
        description: `Your appointment with ${selectedDoctor.name} has been scheduled for ${format(appointmentDate, "MMMM d, yyyy")} at ${selectedTimeSlot}.`,
      });
      
      setBookingDialogOpen(false);
      // After booking, simulate a navigation to appointments page
      // navigate("/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Telemedicine</h1>
          <p className="text-muted-foreground">
            Connect with healthcare professionals from the comfort of your home
          </p>
        </div>

        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="doctors">Find Doctors</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, or location"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="card-hover overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {doctor.image ? (
                            <img
                              src={doctor.image}
                              alt={doctor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-primary">
                              {doctor.name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")}
                            </span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{doctor.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            {doctor.specialty} • {doctor.experience} exp
                          </CardDescription>
                          <div className="flex items-center mt-1.5">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 text-sm font-medium">
                              {doctor.rating}
                            </span>
                            <span className="mx-2 text-muted-foreground">•</span>
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="ml-1 text-sm text-muted-foreground">
                              {doctor.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/5">
                        ₹{doctor.price}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm mb-4">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Next available: {doctor.nextAvailable}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Video className="h-3 w-3" /> Video Consult
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> Chat Consult
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-muted/30 px-6 py-4">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(doctor.id)}
                    >
                      View Profile
                    </Button>
                    <Button
                      onClick={() => handleBookConsultation(doctor)}
                    >
                      Book Consultation
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {filteredDoctors.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No doctors match your search criteria</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Consultations</CardTitle>
                <CardDescription>
                  Your scheduled telemedicine appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingConsultations.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {consultation.doctorName
                                .split(" ")
                                .map((name) => name[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {consultation.doctorName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {consultation.specialty}
                            </p>
                            <div className="flex items-center mt-1 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              <span>{consultation.date}</span>
                              <span className="mx-1">•</span>
                              <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              <span>{consultation.time}</span>
                              <span className="mx-1">•</span>
                              <Video className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              <span>{consultation.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end sm:self-center">
                          <Button
                            onClick={() => handleJoinCall(consultation.id)}
                          >
                            Join Call
                          </Button>
                          <Button variant="outline">Reschedule</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">
                      You have no upcoming consultations
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => document.querySelector('[value="doctors"]')?.dispatchEvent(new MouseEvent('click'))}
                    >
                      Find a Doctor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Consultations</CardTitle>
                <CardDescription>
                  Review your previous telemedicine appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastConsultations.length > 0 ? (
                  <div className="space-y-4">
                    {pastConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="font-semibold text-muted-foreground">
                              {consultation.doctorName
                                .split(" ")
                                .map((name) => name[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {consultation.doctorName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {consultation.specialty}
                            </p>
                            <div className="flex items-center mt-1 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              <span>{consultation.date}</span>
                              <span className="mx-1">•</span>
                              <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              <span>{consultation.time}</span>
                              <span className="mx-1">•</span>
                              {consultation.type === "Video" ? (
                                <Video className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              ) : (
                                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              )}
                              <span>{consultation.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end sm:self-center">
                          <Button
                            variant="outline"
                            className="flex items-center gap-1.5"
                          >
                            <FileText className="h-4 w-4" />
                            View Summary
                          </Button>
                          <Button variant="secondary">Book Again</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      You have no past consultations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment booking dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor && (
                <>
                  Schedule an appointment with {selectedDoctor.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-6 py-4">
              {/* Doctor info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary/50" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {selectedDoctor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                  <p className="text-sm mt-1">₹{selectedDoctor.price} per visit</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Appointment type */}
              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Button
                    type="button"
                    variant={appointmentType === "in-person" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 min-w-[120px]"
                    onClick={() => setAppointmentType("in-person")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    In-person
                  </Button>
                  <Button
                    type="button"
                    variant={appointmentType === "virtual" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 min-w-[120px]"
                    onClick={() => setAppointmentType("virtual")}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Virtual
                  </Button>
                  <Button
                    type="button"
                    variant={appointmentType === "chat" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 min-w-[120px]"
                    onClick={() => setAppointmentType("chat")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
              
              {/* Date selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <div className="flex justify-center border rounded-md p-4">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="p-3 pointer-events-auto"
                    disabled={(date) => {
                      // Disable past dates, Sundays, and more than 30 days in the future
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      const thirtyDaysLater = new Date();
                      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
                      return (
                        date < now ||
                        date > thirtyDaysLater ||
                        date.getDay() === 0 // Sunday
                      );
                    }}
                  />
                </div>
              </div>
              
              {/* Time slots */}
              <div className="space-y-2">
                <Label>Select Time</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTimeSlot === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeSlot(time)}
                      className="text-xs sm:text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes for the doctor (optional)</Label>
                <Textarea 
                  placeholder="Describe your symptoms or reason for visit..."
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <Separator />
              
              {/* Summary */}
              <div className="bg-muted/50 p-4 rounded-md space-y-2">
                <h4 className="font-medium">Appointment Summary</h4>
                <div className="grid grid-cols-2 text-sm gap-2">
                  <div className="text-muted-foreground">Doctor</div>
                  <div>{selectedDoctor.name}</div>
                  <div className="text-muted-foreground">Date</div>
                  <div>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Not selected"}</div>
                  <div className="text-muted-foreground">Time</div>
                  <div>{selectedTimeSlot || "Not selected"}</div>
                  <div className="text-muted-foreground">Type</div>
                  <div>
                    {appointmentType === "virtual" ? "Video Consultation" : 
                     appointmentType === "chat" ? "Chat Consultation" : 
                     "In-person Visit"}
                  </div>
                  <div className="text-muted-foreground">Fee</div>
                  <div>₹{selectedDoctor.price}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBookingDialogOpen(false)}
              className="w-full sm:w-auto order-1 sm:order-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBooking} 
              disabled={!selectedDate || !selectedTimeSlot || isBooking}
              className="w-full sm:w-auto"
            >
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
