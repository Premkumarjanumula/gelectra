
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, MapPin, Ticket, PlusCircle, Edit, Trash2, Users, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EventForm } from '@/components/event-form';
import type { Event } from '@/lib/types';

// Hardcoded major past events
const hardcodedPastEvents: Omit<Event, 'id' | 'createdAt'>[] = [
    {
        title: 'HAVANA 2.0',
        details: 'The second edition of our flagship tech fest, featuring international workshops, keynote sessions, and intense competitions. It set a new benchmark for technical festivals on campus.',
        date: '2024-03-15',
        location: 'GITAM Hyderabad Campus',
        imageUrl: '/images/havana-2.jpg',
    },
    {
        title: 'HAVANA 1.0',
        details: 'The inaugural edition of HAVANA, which brought together bright minds for a two-day celebration of technology and innovation, sparking a new wave of creativity at GITAM.',
        date: '2023-03-20',
        location: 'GITAM Hyderabad Campus',
        imageUrl: '/images/havana-1.jpg',
    },
];

export default function RegistrationsPage() {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching events: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(event => new Date(event.date) >= today);
  
  // Combine dynamic past events with the hardcoded ones
  const dynamicPastEvents = events.filter(event => new Date(event.date) < today);
  const allPastEvents = [...dynamicPastEvents, ...hardcodedPastEvents.map((e, i) => ({...e, id: `hardcoded-${i}`, createdAt: new Timestamp(0,0)}))];


  return (
    <div className="container mx-auto py-16 sm:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold tracking-tight">Events & Registrations</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join our upcoming events. Learn, build, and connect with fellow tech enthusiasts.
        </p>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        {isAdmin && user && (
          <div className="mb-8 text-right">
            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Event</Button>
          </div>
        )}
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{editingEvent ? 'Edit' : 'Add'} Event</DialogTitle>
          </DialogHeader>
          <EventForm 
            event={editingEvent} 
            onFinished={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Upcoming Events Section */}
      <section>
        <h2 className="font-headline text-3xl font-bold mb-8">Upcoming Events</h2>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 flex flex-col">
                <CardHeader className="relative p-6">
                   <CardTitle className="font-headline text-2xl mb-2">{event.title}</CardTitle>
                   <CardDescription className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                   <CardDescription className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {event.location}</CardDescription>
                   {isAdmin && (
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                      <Button variant="secondary" size="icon" onClick={() => handleEdit(event)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the event.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(event.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-grow">
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.details}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-2 w-full">
                  {event.registrationLink && (
                    <Button asChild className="w-full">
                      <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                        {event.linkText || 'Register Now'} <Ticket className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                  {event.whatsappLink && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={event.whatsappLink} target="_blank" rel="noopener noreferrer">
                        Join Group <Users className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-muted-foreground/20 rounded-lg">
             <h3 className="font-headline text-2xl">No Upcoming Events</h3>
             <p className="text-muted-foreground mt-2">Check back soon for new events!</p>
          </div>
        )}
      </section>

      {/* Past Events Section */}
      <section className="mt-24">
        <h2 className="font-headline text-3xl font-bold mb-8 text-center">A Look Back at Our Past Events</h2>
        {isLoading && !allPastEvents.length ? (
          <div className="space-y-12 max-w-4xl mx-auto">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : allPastEvents.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-12">
            {allPastEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 border-border/10 relative">
                {event.imageUrl ? (
                    <div className="relative aspect-[3/2]">
                      <Image src={event.imageUrl} alt={event.title} fill className="object-cover" data-ai-hint="tech conference students" />
                    </div>
                  ) : (
                  <div className="bg-secondary flex items-center justify-center h-48">
                    <FileText className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                 <div className="relative p-8">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                       <div className="bg-primary/80 backdrop-blur-sm text-primary-foreground font-headline text-xl px-6 py-2 rounded-full shadow-lg">
                            {event.title}
                       </div>
                    </div>
                    <CardContent className="p-0 pt-8 text-center">
                        <p className="text-muted-foreground text-lg">{event.details}</p>
                    </CardContent>
                 </div>
                 {isAdmin && !event.id.startsWith('hardcoded-') && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <Button variant="secondary" size="icon" onClick={() => handleEdit(event as Event)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the event.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(event.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
              </Card>
            ))}
          </div>
        ) : (
           <div className="text-center py-16 border-2 border-dashed border-muted-foreground/20 rounded-lg max-w-4xl mx-auto">
             <h3 className="font-headline text-2xl">No Past Events Yet</h3>
             <p className="text-muted-foreground mt-2">Our event history will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
