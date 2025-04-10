
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Video, 
  FileText, 
  AlertCircle, 
  Activity, 
  Shield, 
  Users, 
  ArrowRight 
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Book Appointments",
      description: "Schedule appointments with doctors, labs, and specialists with just a few clicks.",
      icon: Calendar,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Virtual Consultations",
      description: "Speak with healthcare professionals from the comfort of your home via video call.",
      icon: Video,
      color: "bg-wellness/10 text-wellness-600"
    },
    {
      title: "Digital Records",
      description: "Store and access your medical records securely in one centralized location.",
      icon: FileText,
      color: "bg-health/10 text-health-600"
    },
    {
      title: "Symptom Checker",
      description: "Get initial guidance on potential conditions based on your symptoms.",
      icon: AlertCircle,
      color: "bg-urgent/10 text-urgent-600"
    },
    {
      title: "Health Monitoring",
      description: "Connect your wearables and track your health metrics in real-time.",
      icon: Activity,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Secure & Private",
      description: "Your health information is protected with enterprise-grade security protocols.",
      icon: Shield,
      color: "bg-health/10 text-health-600"
    }
  ];

  const testimonials = [
    {
      quote: "VitaWellHub has transformed how I manage my family's healthcare. Booking appointments and tracking medical records has never been easier!",
      name: "Sarah Johnson",
      title: "Parent of three"
    },
    {
      quote: "As someone with a chronic condition, having all my medical information in one place has been a game changer. The virtual consultations save me so much time.",
      name: "Michael Chen",
      title: "Software Engineer"
    },
    {
      quote: "The symptom checker gave me peace of mind when I wasn't sure if I needed to see a doctor. Turns out I did, and I was able to book an appointment right away.",
      name: "Emily Rodriguez",
      title: "College Student"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 relative bg-gradient-to-br from-background to-primary/5">
          <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-700/50"></div>
          <div className="container max-w-5xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your Health Journey,{" "}
              <span className="text-primary">Simplified</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              VitaWellHub brings together appointments, telemedicine, records, and wellness
              tools in one seamless platform designed for your healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate("/dashboard")}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/telemedicine")}
              >
                Book a Consultation
              </Button>
            </div>

            <div className="mt-16 relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
              <Card className="overflow-hidden border shadow-lg max-w-3xl mx-auto">
                <CardContent className="p-0">
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
                      alt="VitaWellHub Dashboard Preview"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Healthcare Features</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to manage your health and wellness in one secure platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="card-hover h-full">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join thousands of satisfied users managing their healthcare with VitaWellHub
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="card-hover h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4 text-primary">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-xl">★</span>
                      ))}
                    </div>
                    <blockquote className="text-lg mb-6 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 health-gradient text-white">
          <div className="container max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join VitaWellHub today and experience healthcare designed around your needs.
              Get started with your personalized health dashboard in minutes.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate("/dashboard")}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Partners & Trust Section */}
        <section className="py-16 px-4">
          <div className="container max-w-6xl mx-auto text-center">
            <h3 className="text-lg font-medium mb-6 text-muted-foreground">Trusted by Healthcare Providers</h3>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-32 bg-muted/50 rounded flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">Partner {i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
