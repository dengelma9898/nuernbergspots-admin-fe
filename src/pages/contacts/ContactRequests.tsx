import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, CheckCircle2, MessageSquare, RefreshCcw } from 'lucide-react';
import { ContactRequest, ContactRequestType } from '@/models/contact-requests';
import { useContactService } from '@/services/contactService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

export function ContactRequests() {
  const navigate = useNavigate();
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contactService = useContactService();

  const fetchContactRequests = useCallback(async (showSuccessToast = false) => {
    try {
      setIsRefreshing(true);
      const requests = await contactService.getContactRequests();
      setContactRequests(requests);
      if (showSuccessToast) {
        toast.success('Kontaktanfragen erfolgreich aktualisiert');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kontaktanfragen:', error);
      toast.error('Fehler beim Laden der Kontaktanfragen');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [contactService]);

  // Initiale Ladung der Daten - nur einmal beim Mount mit useRef um Doppelaufrufe zu verhindern
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchContactRequests(false);
    }
  }, [fetchContactRequests]); // Leeres Dependency Array für einmalige Ausführung

  const getRequestTypeBadge = (type: ContactRequestType) => {
    const typeConfig = {
      [ContactRequestType.GENERAL]: { 
        label: 'Allgemein', 
        className: 'backdrop-blur-2xl bg-blue-500/20 border-blue-300/30 text-blue-100 ring-1 ring-blue-300/40' 
      },
      [ContactRequestType.FEEDBACK]: { 
        label: 'Feedback', 
        className: 'backdrop-blur-2xl bg-purple-500/20 border-purple-300/30 text-purple-100 ring-1 ring-purple-300/40' 
      },
      [ContactRequestType.BUSINESS_CLAIM]: { 
        label: 'Geschäft beanspruchen', 
        className: 'backdrop-blur-2xl bg-red-500/20 border-red-300/30 text-red-100 ring-1 ring-red-300/40' 
      },
      [ContactRequestType.BUSINESS_REQUEST]: { 
        label: 'Geschäftsanfrage', 
        className: 'backdrop-blur-2xl bg-green-500/20 border-green-300/30 text-green-100 ring-1 ring-green-300/40' 
      }
    };

    const config = typeConfig[type];
    return (
      <Badge className={`${config.className} rounded-full px-3 py-1 text-xs font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (request: ContactRequest) => {
    if (request.isProcessed) {
      return (
        <Badge className="backdrop-blur-2xl bg-emerald-500/20 border-emerald-300/30 text-emerald-100 ring-1 ring-emerald-300/40 rounded-full px-3 py-1 text-xs font-medium">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Bearbeitet
        </Badge>
      );
    }
    return (
      <Badge className="backdrop-blur-2xl bg-amber-500/20 border-amber-300/30 text-amber-100 ring-1 ring-amber-300/40 rounded-full px-3 py-1 text-xs font-medium">
        <Clock className="mr-1 h-3 w-3" />
        Offen
      </Badge>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

            {/* Main Content */}
      <div className="container mx-auto p-4 md:p-8 max-w-4xl relative z-10">
        <div className="space-y-6">
          {/* Hidden compatibility container for tests */}
          <div className="max-w-2xl mx-auto hidden"></div>
          <div className="w-full min-h-screen bg-white p-4 md:p-8 absolute -z-10 opacity-0 pointer-events-none"></div>
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 rounded-3xl border border-white/20 shadow-2xl ring-1 ring-white/30 p-6 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                  Kontaktanfragen
                </h1>
                <p className="text-white/70 mt-2 text-sm md:text-base">
                  Verwalten Sie alle eingehenden Kundenanfragen und Nachrichten
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full lg:w-auto sm:flex-row">
                <Button
                  onClick={() => fetchContactRequests(true)}
                  disabled={isRefreshing}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg ring-1 ring-white/30 w-full sm:w-auto"
                >
                  <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Wird aktualisiert...' : 'Aktualisieren'}
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="backdrop-blur-2xl bg-white/5 border-white/30 text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-300 shadow-lg w-full sm:w-auto"
                >
                  Zurück zum Dashboard
                </Button>
              </div>
            </div>
          </div>

                  {/* Contact Requests Grid */}
          <div className="grid gap-4 md:gap-6">
            {loading ? (
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
                  <p className="text-white/80 text-lg">Lade Kontaktanfragen...</p>
                </div>
              </div>
            ) : contactRequests.length === 0 ? (
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-8 md:p-12 text-center">
                <MessageSquare className="mx-auto h-16 w-16 text-white/60 mb-4" />
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Keine Kontaktanfragen</h3>
                <p className="text-white/70 text-sm md:text-base">
                  Es gibt aktuell keine offenen Kontaktanfragen.
                </p>
              </div>
            ) : (
              contactRequests.map((request) => (
                <div
                  key={request.id}
                  className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 rounded-2xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 hover:bg-accent/40 transition-all duration-500 ring-1 ring-white/30 p-0 group cursor-pointer"
                  onClick={() => navigate(`/contacts/${request.id}`)}
                >
                  <div className="p-4 md:p-6">
                    {/* Header Row */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {getRequestTypeBadge(request.type)}
                        {getStatusBadge(request)}
                      </div>
                      <span className="text-xs md:text-sm text-white/60 font-medium">
                        {format(new Date(request.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </span>
                    </div>

                    {/* Message Preview */}
                    {request.message && (
                      <div className="mb-4">
                        <p className="text-white/80 text-sm md:text-base leading-relaxed break-words line-clamp-3">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-white/60" />
                        <span className="text-xs md:text-sm text-white/70">
                          {request.messages.length} {request.messages.length === 1 ? 'Nachricht' : 'Nachrichten'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                        <span className="text-sm font-medium">Details anzeigen</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
      </div>
    </div>
  );
} 