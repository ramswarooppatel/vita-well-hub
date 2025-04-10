
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, Calendar, MapPin, Video } from "lucide-react";

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  image?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
}

export function AppointmentCard({ appointment, onReschedule, onCancel }: AppointmentCardProps) {
  const { id, doctorName, specialty, date, time, location, isVirtual, image } = appointment;
  
  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt={doctorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-semibold text-primary">
                  {doctorName.split(' ').map(name => name[0]).join('')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-medium">{doctorName}</h3>
                <p className="text-sm text-muted-foreground">{specialty}</p>
              </div>
              
              <div className="flex items-center">
                {isVirtual ? (
                  <span className="pill-badge bg-wellness/20 text-wellness-700 dark:bg-wellness/30 dark:text-wellness-300">
                    <Video size={14} className="mr-1" /> Virtual
                  </span>
                ) : (
                  <span className="pill-badge bg-primary/20 text-primary-600 dark:bg-primary/30 dark:text-primary-300">
                    In-Person
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar size={14} className="mr-1" /> {date}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock size={14} className="mr-1" /> {time}
              </div>
              <div className="flex items-center text-sm text-muted-foreground sm:col-span-2">
                <MapPin size={14} className="mr-1" /> {location}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2 bg-muted/30 px-4 py-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onReschedule(id)}
        >
          Reschedule
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground"
          onClick={() => onCancel(id)}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
