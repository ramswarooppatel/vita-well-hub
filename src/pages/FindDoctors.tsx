/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Search,
  MapPin,
  Star,
  Filter,
  Stethoscope,
  Calendar as CalendarIcon,
  User,
  Clock,
  ChevronDown,
  Heart,
  MessageSquare,
  BadgeCheck,
  ThumbsUp,
  Video,
} from "lucide-react";

// Define types
interface Doctor extends Profile {
  specialty?: string;
  education?: string[];
  experience?: number;
  rating?: number;
  reviews_count?: number;
  languages?: string[];
  consultation_fee?: number;
  available_slots?: string[];
  is_virtual?: boolean;
  is_verified?: boolean;
  is_featured?: boolean;
  is_available?: boolean;
  location?: string;
  bio?: string;
  hospital?: string;
}

interface Specialty {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Specialty options
const specialties: Specialty[] = [
  { id: "general-practitioner", name: "General Practitioner", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "cardiology", name: "Cardiology", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "neurology", name: "Neurology", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "pediatrics", name: "Pediatrics", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "orthopedics", name: "Orthopedics", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "dermatology", name: "Dermatology", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "ophthalmology", name: "Ophthalmology", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "psychiatry", name: "Psychiatry", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "gynecology", name: "Gynecology", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "urology", name: "Urology", icon: <Stethoscope className="w-4 h-4" /> },
];

// Time slot selection options
const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM"
];

// For demo data
const generateRandomDoctors = (): Doctor[] => {
  const locations = [
    "San Francisco, CA",
    "New York, NY",
    "Boston, MA",
    "Chicago, IL",
    "Seattle, WA",
    "Austin, TX",
    "Los Angeles, CA"
  ];
  
  const hospitals = [
    "Memorial Hospital",
    "City Medical Center",
    "General Hospital",
    "University Medical Center",
    "St. Mary's Hospital",
    "Grace Medical Center",
    "Mercy Hospital"
  ];
  
  const doctors: Doctor[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const specialtyIndex = Math.floor(Math.random() * specialties.length);
    const specialty = specialties[specialtyIndex];
    
    doctors.push({
        id: `doc-${i}`,
        first_name: ["Dr. John", "Dr. Sarah", "Dr. Michael", "Dr. Emily", "Dr. David"][i % 5],
        last_name: ["Smith", "Johnson", "Williams", "Brown", "Davis"][i % 5],
        gender: i % 2 === 0 ? "male" : "female",
        specialty: specialty.name,
        education: [
            "MD, Harvard Medical School",
            "Residency, Mayo Clinic",
            i % 3 === 0 ? "Fellowship, Johns Hopkins Hospital" : undefined
        ].filter(Boolean) as string[],
        experience: 5 + (i % 15),
        rating: 3.5 + (i % 5) * 0.3,
        reviews_count: 10 + (i * 7),
        languages: ["English", i % 2 === 0 ? "Spanish" : "French"],
        consultation_fee: 50 + (i * 5),
        is_virtual: i % 3 === 0,
        is_verified: i % 5 !== 0,
        is_featured: i <= 3,
        is_available: i % 4 !== 0,
        location: locations[i % locations.length],
        hospital: hospitals[i % hospitals.length],
        bio: "Experienced medical professional dedicated to providing quality patient care. Specializing in preventative medicine and holistic treatments.",
        contact_number: `(555) ${100 + i}-${2000 + i}`,
        address: `${100 + i} Medical Center Drive`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: "doctor",
        date_of_birth: "",
        avatar_url: ""
    });
  }
  
  return doctors;
};

const FindDoctors = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [appointmentType, setAppointmentType] = useState("in-person");
  const [showVirtualOnly, setShowVirtualOnly] = useState(searchParams.get("virtual") === "true");
  const [sortOption, setSortOption] = useState("recommended");
  const [appointmentBookingDoctor, setAppointmentBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchDoctors();
  }, []);
  
  useEffect(() => {
    // Update URL parameters when filters change
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (selectedSpecialty && selectedSpecialty !== "all") params.set("specialty", selectedSpecialty);
    if (showVirtualOnly) params.set("virtual", "true");
    setSearchParams(params);
    
    // Apply filters
    applyFilters();
  }, [searchQuery, selectedSpecialty, selectedLocation, showVirtualOnly, sortOption, setSearchParams]);
  
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from database
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('role', 'doctor');
      
      // if (error) throw error;
      
      // For demo, use generated data
      const mockDoctors = generateRandomDoctors();
      setDoctors(mockDoctors);
      setFilteredDoctors(mockDoctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        variant: "destructive",
        title: "Error fetching doctors",
        description: "There was an error loading the doctors list.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...doctors];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.first_name?.toLowerCase().includes(query) || 
        doctor.last_name?.toLowerCase().includes(query) ||
        doctor.specialty?.toLowerCase().includes(query) ||
        doctor.hospital?.toLowerCase().includes(query)
      );
    }
    
    // Apply specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => 
        doctor.specialty?.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }
    
    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(doctor => 
        doctor.location?.includes(selectedLocation)
      );
    }
    
    // Apply virtual consultation filter
    if (showVirtualOnly) {
      filtered = filtered.filter(doctor => doctor.is_virtual);
    }
    
    // Apply sorting
    switch (sortOption) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "experience":
        filtered.sort((a, b) => (b.experience || 0) - (a.experience || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.consultation_fee || 0) - (a.consultation_fee || 0));
        break;
      case "recommended":
      default:
        // Sort by a combination of rating, featured status, and review count
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          
          const scoreA = (a.rating || 0) * (Math.log(a.reviews_count || 1) + 1);
          const scoreB = (b.rating || 0) * (Math.log(b.reviews_count || 1) + 1);
          return scoreB - scoreA;
        });
    }
    
    setFilteredDoctors(filtered);
  };
  
  const handleSpecialtySelect = (value: string) => {
    setSelectedSpecialty(value === "all" ? "" : value);
  };
  
  const handleLocationSelect = (value: string) => {
    setSelectedLocation(value === "all" ? "" : value);
  };
  
  const handleSortChange = (value: string) => {
    setSortOption(value);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };
  
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTimeSlot || !appointmentBookingDoctor) {
      toast({
        variant: "destructive",
        title: "Incomplete appointment details",
        description: "Please select a date and time for your appointment.",
      });
      return;
    }
    
    try {
      // Format the date and time for database insertion
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
      
      // In a real app, save to database
      // const { data, error } = await supabase
      //   .from('appointments')
      //   .insert({
      //     user_id: user.id,
      //     doctor_id: appointmentBookingDoctor.id,
      //     appointment_date: appointmentDate.toISOString(),
      //     specialty: appointmentBookingDoctor.specialty,
      //     is_virtual: appointmentType === "virtual",
      //     status: "scheduled",
      //   });
      
      // if (error) throw error;
      
      // For demo, just show success
      toast({
        title: "Appointment Booked",
        description: `Your appointment with ${appointmentBookingDoctor.first_name} ${appointmentBookingDoctor.last_name} has been scheduled for ${format(appointmentDate, "MMMM d, yyyy")} at ${selectedTimeSlot}.`,
      });
      
      setBookingDialogOpen(false);
      // Redirect to appointments page
      navigate("/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "There was an error booking your appointment. Please try again.",
      });
    }
  };
  
  // Find a specialty by its name (case insensitive)
  const getSpecialtyByName = (name: string) => {
    return specialties.find(s => s.name.toLowerCase() === name.toLowerCase());
  };
  
  // Render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  // Handle booking appointment click
  const openBookingDialog = (doctor: Doctor) => {
    setAppointmentBookingDoctor(doctor);
    setBookingDialogOpen(true);
  };
  
  return (
    <>
      <Helmet>
        <title>Find Doctors | VitaWellHub</title>
      </Helmet>
      
      <DashboardLayout>
        <div className="container py-6">
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold">Find Doctors</h1>
            <p className="text-muted-foreground">Connect with top medical professionals for your healthcare needs</p>
            
            {/* Search and filter section */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-12">
                  {/* Search field */}
                  <div className="relative md:col-span-5">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  {/* Specialty selector */}
                  <div className="md:col-span-3">
                    <Select
                      value={selectedSpecialty}
                      onValueChange={handleSpecialtySelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Specialties</SelectLabel>
                          <SelectItem value="all">All Specialties</SelectItem>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty.id} value={specialty.name}>
                              <div className="flex items-center">
                                {specialty.icon}
                                <span className="ml-2">{specialty.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Location selector */}
                  <div className="md:col-span-3">
                    <Select
                      value={selectedLocation}
                      onValueChange={handleLocationSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Locations</SelectLabel>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="New York">New York</SelectItem>
                          <SelectItem value="San Francisco">San Francisco</SelectItem>
                          <SelectItem value="Boston">Boston</SelectItem>
                          <SelectItem value="Chicago">Chicago</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Seattle">Seattle</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filter button */}
                  <Button
                    variant={showVirtualOnly ? "default" : "outline"}
                    className="md:col-span-1"
                    onClick={() => setShowVirtualOnly(!showVirtualOnly)}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {showVirtualOnly ? "Virtual" : "All"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters sidebar */}
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sort by */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sort by</Label>
                    <Select
                      value={sortOption}
                      onValueChange={handleSortChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recommended">Recommended</SelectItem>
                        <SelectItem value="rating">Highest Rating</SelectItem>
                        <SelectItem value="experience">Most Experience</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Specialty filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Specialty</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <Button
                        variant={selectedSpecialty === "" ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedSpecialty("")}
                      >
                        All Specialties
                      </Button>
                      {specialties.map((specialty) => (
                        <Button
                          key={specialty.id}
                          variant={selectedSpecialty === specialty.name ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedSpecialty(specialty.name)}
                        >
                          {specialty.icon}
                          <span className="ml-2">{specialty.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Consultation type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Consultation type</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={!showVirtualOnly ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowVirtualOnly(false)}
                      >
                        All
                      </Button>
                      <Button
                        variant={showVirtualOnly ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowVirtualOnly(true)}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Virtual
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Reset filters button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSpecialty("");
                      setSelectedLocation("");
                      setShowVirtualOnly(false);
                      setSortOption("recommended");
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
              
              {/* Doctors list */}
              <div className="lg:col-span-3 space-y-4">
                {/* Results summary */}
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {filteredDoctors.length} doctors found
                    {selectedSpecialty && ` for ${selectedSpecialty}`}
                    {showVirtualOnly && ", virtual only"}
                  </p>
                </div>
                
                {/* Loading state */}
                {loading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-6 flex flex-col md:flex-row gap-4">
                            <div className="w-24 h-24">
                              <Skeleton className="w-24 h-24 rounded-full" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-48" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-full" />
                              <div className="flex gap-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* No results */}
                {!loading && filteredDoctors.length === 0 && (
                  <Card className="overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="py-12">
                        <Search className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                        <h3 className="mt-4 text-lg font-medium">No doctors found</h3>
                        <p className="text-muted-foreground mt-2">
                          Try adjusting your filters or search criteria
                        </p>
                        <Button onClick={() => {
                          setSearchQuery("");
                          setSelectedSpecialty("");
                          setSelectedLocation("");
                          setShowVirtualOnly(false);
                        }} className="mt-4">
                          Reset Filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Doctors list */}
                {!loading && filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 flex flex-col md:flex-row gap-6">
                        {/* Doctor photo and quick actions */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-12 h-12 text-primary/50" />
                            </div>
                            {doctor.is_verified && (
                              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                                <BadgeCheck className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {doctor.is_featured && (
                            <Badge className="mt-1">Featured</Badge>
                          )}
                          
                          {doctor.is_virtual && (
                            <Badge variant="secondary" className="mt-1">
                              <Video className="w-3 h-3 mr-1" />
                              Virtual
                            </Badge>
                          )}
                        </div>
                        
                        {/* Doctor details */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                            <div>
                              <h3 className="text-xl font-medium flex items-center gap-2">
                                {doctor.first_name} {doctor.last_name}
                                {doctor.is_verified && (
                                  <BadgeCheck className="w-4 h-4 text-primary" />
                                )}
                              </h3>
                              
                              <p className="text-muted-foreground">{doctor.specialty}</p>
                            </div>
                            
                            <div className="flex flex-col items-start md:items-end gap-1">
                              {renderStars(doctor.rating || 0)}
                              <span className="text-sm text-muted-foreground">
                                {doctor.reviews_count} reviews
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            {doctor.experience && (
                              <Badge variant="outline" className="bg-muted/50">
                                {doctor.experience} years experience
                              </Badge>
                            )}
                            
                            {doctor.languages?.map((language) => (
                              <Badge key={language} variant="outline" className="bg-muted/50">
                                {language}
                              </Badge>
                            ))}
                            
                            {doctor.is_available && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                Available Today
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mt-3 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {doctor.hospital}, {doctor.location}
                            </div>
                          </div>
                          
                          {doctor.bio && (
                            <p className="mt-2 text-sm line-clamp-2">{doctor.bio}</p>
                          )}
                          
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Consultation Fee</p>
                              <p className="font-medium">${doctor.consultation_fee}</p>
                            </div>
                            
                            <div className="flex-1"></div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                // Handle view profile (could open a dialog or navigate to profile)
                                toast({
                                  title: "Profile",
                                  description: `Viewing profile of ${doctor.first_name} ${doctor.last_name}`,
                                });
                              }}
                            >
                              View Profile
                            </Button>
                            
                            <Button 
                              size="sm" 
                              className="gap-1"
                              onClick={() => openBookingDialog(doctor)}
                            >
                              <CalendarIcon className="w-4 h-4" />
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      
      {/* Appointment booking dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              {appointmentBookingDoctor && (
                <>
                  Schedule an appointment with {appointmentBookingDoctor.first_name} {appointmentBookingDoctor.last_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {appointmentBookingDoctor && (
            <div className="space-y-6 py-4">
              {/* Doctor info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary/50" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {appointmentBookingDoctor.first_name} {appointmentBookingDoctor.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{appointmentBookingDoctor.specialty}</p>
                  <p className="text-sm mt-1">${appointmentBookingDoctor.consultation_fee} per visit</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Appointment type */}
              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={appointmentType === "in-person" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setAppointmentType("in-person")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    In-person
                  </Button>
                  <Button
                    type="button"
                    variant={appointmentType === "virtual" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    disabled={!appointmentBookingDoctor.is_virtual}
                    onClick={() => setAppointmentType("virtual")}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Virtual
                  </Button>
                </div>
                {appointmentType === "virtual" && !appointmentBookingDoctor.is_virtual && (
                  <p className="text-xs text-muted-foreground">
                    This doctor doesn't offer virtual appointments
                  </p>
                )}
              </div>
              
              {/* Date selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <div className="flex justify-center border rounded-md p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
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
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTimeSlot === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Summary */}
              <div className="bg-muted/50 p-4 rounded-md space-y-2">
                <h4 className="font-medium">Appointment Summary</h4>
                <div className="grid grid-cols-2 text-sm gap-2">
                  <div className="text-muted-foreground">Doctor</div>
                  <div>{appointmentBookingDoctor.first_name} {appointmentBookingDoctor.last_name}</div>
                  <div className="text-muted-foreground">Date</div>
                  <div>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Not selected"}</div>
                  <div className="text-muted-foreground">Time</div>
                  <div>{selectedTimeSlot || "Not selected"}</div>
                  <div className="text-muted-foreground">Type</div>
                  <div>{appointmentType === "virtual" ? "Virtual Consultation" : "In-person Visit"}</div>
                  <div className="text-muted-foreground">Fee</div>
                  <div>${appointmentBookingDoctor.consultation_fee}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookAppointment} disabled={!selectedDate || !selectedTimeSlot}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FindDoctors;