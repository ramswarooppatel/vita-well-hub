
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
  Calendar,
  Clock,
  Video,
  MessageCircle,
  Star,
  MapPin,
  FileText,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");

  const doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      rating: 4.9,
      price: 120,
      nextAvailable: "Today, 4:30 PM",
      experience: "15 years",
      location: "New York, NY",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "General Medicine",
      rating: 4.7,
      price: 90,
      nextAvailable: "Tomorrow, 10:30 AM",
      experience: "8 years",
      location: "Boston, MA",
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialty: "Dermatology",
      rating: 4.8,
      price: 110,
      nextAvailable: "Today, 6:00 PM",
      experience: "12 years",
      location: "Miami, FL",
    },
    {
      id: "4",
      name: "Dr. David Wilson",
      specialty: "Pediatrics",
      rating: 4.9,
      price: 100,
      nextAvailable: "Tomorrow, 2:00 PM",
      experience: "10 years",
      location: "Chicago, IL",
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

  const filteredDoctors = doctors.filter((doctor) => {
    if (searchQuery.trim() === "") return true;
    
    const query = searchQuery.toLowerCase();
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query) ||
      doctor.location.toLowerCase().includes(query)
    );
  });

  const handleBookConsultation = (doctorId: string) => {
    toast({
      title: "Booking initiated",
      description: "You'll be redirected to the booking page.",
    });
  };

  const handleJoinCall = (consultationId: string) => {
    toast({
      title: "Joining video call",
      description: "Connecting to your consultation...",
    });
  };

  const handleViewDetails = (consultationId: string) => {
    toast({
      title: "Viewing consultation details",
      description: "Loading consultation information...",
    });
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
                        ${doctor.price}
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
                      onClick={() => handleBookConsultation(doctor.id)}
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
    </DashboardLayout>
  );
}
