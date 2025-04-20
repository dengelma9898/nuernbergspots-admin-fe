import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../models/users';
import { useUserService } from '../services/userService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User,
  Calendar,
  MapPin,
  Store,
  Heart,
  History,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, value, helpText }: { icon: any, label: string, value: string | number, helpText?: string }) => (
  <Card className="hover:bg-accent/50 transition-colors">
    <CardContent className="pt-6">
      <div className="flex items-center space-x-4">
        <Icon className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

export function Profile() {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userService = useUserService();

  const fetchCurrentUser = useCallback(async () => {
    const userId = getUserId();
    if (!userId || isLoading) return;

    try {
      setIsLoading(true);
      const userData = await userService.getUserProfile(userId);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
      toast.error('Die Benutzerdaten konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, [getUserId, userService, isLoading]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold">Mein Profil</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser?.profilePictureUrl} />
                <AvatarFallback>
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{currentUser?.name || 'Benutzer'}</CardTitle>
                <Badge variant="secondary">{currentUser?.userType}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                icon={User}
                label="E-Mail"
                value={currentUser?.email || '-'}
                helpText="Hauptkontakt"
              />
              <StatCard
                icon={Store}
                label="Management ID"
                value={currentUser?.managementId || '-'}
                helpText="Business Identifikation"
              />
              <StatCard
                icon={MapPin}
                label="Stadt"
                value={currentUser?.currentCityId || '-'}
                helpText="Aktueller Standort"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Store}
            label="Besuchte Geschäfte"
            value={currentUser?.businessHistory?.length || 0}
            helpText="Gesamtbesuche"
          />
          <StatCard
            icon={Heart}
            label="Favorisierte Events"
            value={currentUser?.favoriteEventIds?.length || 0}
            helpText="Interessante Events"
          />
          <StatCard
            icon={Store}
            label="Favorisierte Businesses"
            value={currentUser?.favoriteBusinessIds?.length || 0}
            helpText="Lieblingsgeschäfte"
          />
          <StatCard
            icon={Calendar}
            label="Mitglied seit"
            value={currentUser?.memberSince ? new Date(currentUser.memberSince).toLocaleDateString() : '-'}
            helpText="Registrierungsdatum"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Letzte Aktivitäten</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentUser?.businessHistory?.slice(0, 5).map((visit, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{visit.businessName}</p>
                      <p className="text-sm text-muted-foreground">Benefit: {visit.benefit}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.visitedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!currentUser?.businessHistory || currentUser.businessHistory.length === 0) && (
                <p className="text-center text-muted-foreground">Keine Aktivitäten vorhanden</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        {(currentUser?.preferences?.length || currentUser?.language) && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Präferenzen</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentUser.language && (
                  <div>
                    <p className="font-medium mb-2">Sprache</p>
                    <Badge variant="secondary">{currentUser.language}</Badge>
                  </div>
                )}
                {currentUser.preferences?.length && currentUser.preferences.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Interessen</p>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.preferences.map((pref, index) => (
                        <Badge key={index} variant="outline">{pref}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 