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

  const fetchContactRequests = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const requests = await contactService.getContactRequests();
      setContactRequests(requests);
      toast.success('Kontaktanfragen erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Laden der Kontaktanfragen:', error);
      toast.error('Fehler beim Laden der Kontaktanfragen');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [contactService]);

  // Initiale Ladung der Daten
  useEffect(() => {
    fetchContactRequests();
  }, []); // Leeres Dependency Array für einmalige Ausführung

  const getRequestTypeBadge = (type: ContactRequestType) => {
    const typeConfig = {
      [ContactRequestType.GENERAL]: { label: 'Allgemein', variant: 'default' },
      [ContactRequestType.FEEDBACK]: { label: 'Feedback', variant: 'secondary' },
      [ContactRequestType.BUSINESS_CLAIM]: { label: 'Geschäft beanspruchen', variant: 'destructive' },
      [ContactRequestType.BUSINESS_REQUEST]: { label: 'Geschäftsanfrage', variant: 'outline' }
    };

    const config = typeConfig[type];
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (request: ContactRequest) => {
    if (request.isProcessed) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Bearbeitet
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
        <Clock className="mr-1 h-3 w-3" />
        Offen
      </Badge>
    );
  };

  return (
    <div className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">Kontaktanfragen</h1>
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:gap-2">
            <Button
              onClick={fetchContactRequests}
              variant="outline"
              disabled={isRefreshing}
              className="flex items-center w-full sm:w-auto"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Wird aktualisiert...' : 'Aktualisieren'}
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Zurück zum Dashboard
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-8">Lade Kontaktanfragen...</div>
          ) : contactRequests.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">Keine Kontaktanfragen</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Es gibt aktuell keine offenen Kontaktanfragen.
              </p>
            </div>
          ) : (
            contactRequests.map((request) => (
              <Card key={request.id} className="rounded-xl shadow-sm border p-0 hover:bg-accent/40 transition-colors">
                <div className="px-4 pt-3 pb-2 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      {getRequestTypeBadge(request.type)}
                      {getStatusBadge(request)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </span>
                  </div>
                  {request.message && (
                    <p className="text-sm text-muted-foreground mt-1 break-words">
                      {request.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 pb-3 pt-2 gap-2">
                  <span className="text-xs text-muted-foreground">
                    {request.messages.length} {request.messages.length === 1 ? 'Nachricht' : 'Nachrichten'}
                  </span>
                  <Button
                    onClick={() => navigate(`/contacts/${request.id}`)}
                    variant="ghost"
                    size="sm"
                    className="px-2 h-8"
                  >
                    <span className="font-medium">Details anzeigen</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 