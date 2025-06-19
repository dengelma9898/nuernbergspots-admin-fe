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
  <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-3xl">
    <div className="p-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 backdrop-blur-2xl bg-white/20 rounded-2xl border border-white/30">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
          <p className="text-sm text-white/70">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {helpText && <p className="text-xs text-white/60">{helpText}</p>}
        </div>
      </div>
    </div>
  </div>
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
      
      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '500ms'}}></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '700ms'}}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '300ms'}}></div>

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Mein Profil
              </h1>
            </div>
          </div>

          {/* Profile Card */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/30 p-1">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentUser?.profilePictureUrl} />
                    <AvatarFallback className="backdrop-blur-2xl bg-white/20 text-white text-xl font-bold">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    {currentUser?.name || 'Benutzer'}
                  </h2>
                  <div className="backdrop-blur-2xl bg-white/20 text-white border-white/30 px-3 py-1 rounded-xl text-sm font-medium">
                    {currentUser?.userType}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 backdrop-blur-2xl bg-white/20 rounded-xl border border-white/30">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">E-Mail</p>
                      <p className="text-lg font-bold text-white">{currentUser?.email || '-'}</p>
                      <p className="text-xs text-white/60">Hauptkontakt</p>
                    </div>
                  </div>
                </div>
                <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 backdrop-blur-2xl bg-white/20 rounded-xl border border-white/30">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Management ID</p>
                      <p className="text-lg font-bold text-white">{currentUser?.managementId || '-'}</p>
                      <p className="text-xs text-white/60">Business Identifikation</p>
                    </div>
                  </div>
                </div>
                <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 backdrop-blur-2xl bg-white/20 rounded-xl border border-white/30">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Stadt</p>
                      <p className="text-lg font-bold text-white">{currentUser?.currentCityId || '-'}</p>
                      <p className="text-xs text-white/60">Aktueller Standort</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div>
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 mb-6">
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Statistiken
              </h2>
            </div>
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
          </div>

          {/* Recent Activity */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 backdrop-blur-2xl bg-white/20 rounded-xl border border-white/30">
                  <History className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Letzte Aktivitäten
                </h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {currentUser?.businessHistory?.slice(0, 5).map((visit, index) => (
                  <div 
                    key={index}
                    className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-4 hover:scale-105 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium text-white">{visit.businessName}</p>
                        <p className="text-sm text-white/70">Benefit: {visit.benefit}</p>
                      </div>
                      <p className="text-sm text-white/70">
                        {new Date(visit.visitedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!currentUser?.businessHistory || currentUser.businessHistory.length === 0) && (
                  <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
                    <p className="text-white/70">Keine Aktivitäten vorhanden</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          {(currentUser?.preferences?.length || currentUser?.language) && (
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="p-2 backdrop-blur-2xl bg-white/20 rounded-xl border border-white/30">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Präferenzen
                  </h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentUser.language && (
                    <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-4">
                      <p className="font-medium mb-2 text-white">Sprache</p>
                      <div className="backdrop-blur-2xl bg-white/20 text-white border-white/30 px-3 py-1 rounded-xl text-sm font-medium inline-block">
                        {currentUser.language}
                      </div>
                    </div>
                  )}
                  {currentUser.preferences?.length && currentUser.preferences.length > 0 && (
                    <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-4">
                      <p className="font-medium mb-2 text-white">Interessen</p>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.preferences.map((pref, index) => (
                          <div key={index} className="backdrop-blur-2xl bg-white/15 text-white border-white/30 px-3 py-1 rounded-xl text-sm">
                            {pref}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 