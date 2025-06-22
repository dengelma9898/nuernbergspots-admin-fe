import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, 
  Building2, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  Tag,
  Store
} from 'lucide-react';
import { toast } from 'sonner';
import { BusinessUser } from '@/models/users';
import { useUserService } from '@/services/userService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const BusinessUserReview: React.FC = () => {
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const userService = useUserService();
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getBusinessUsersInReview();
      setUsers(fetchedUsers.filter(user => user.needsReview));
    } catch (error) {
      toast.error("Fehler beim Laden der Benutzer", {
        description: "Die Benutzer konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await userService.updateBusinessUserReviewStatus(userId, false);
      toast.success("Benutzer verifiziert", {
        description: "Der Benutzer wurde erfolgreich verifiziert.",
      });
      loadUsers();
    } catch (error) {
      toast.error("Fehler bei der Verifizierung", {
        description: "Der Benutzer konnte nicht verifiziert werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await userService.updateBusinessUserReviewStatus(userId, false);
      toast.success("Benutzer abgelehnt", {
        description: "Der Benutzer wurde erfolgreich abgelehnt.",
      });
      loadUsers();
    } catch (error) {
      toast.error("Fehler bei der Ablehnung", {
        description: "Der Benutzer konnte nicht abgelehnt werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
        
        {/* Animated Blur Circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8 overflow-x-hidden">
          {/* Glass Header Skeleton */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 bg-white/10 backdrop-blur-xl rounded-full" />
                <span className="sr-only">Zurück zum Dashboard</span>
              </div>
              <Skeleton className="h-8 w-64 bg-white/10 backdrop-blur-xl rounded" />
            </div>
          </div>

          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Stats Card Skeleton */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6">
              <Skeleton className="h-4 w-48 bg-white/10 backdrop-blur-xl rounded" />
            </div>

            {/* User Cards Skeletons */}
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    {/* Header Skeleton */}
                    <div className="border-b border-white/10 pb-4 mb-4">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="space-y-1 min-w-0">
                          <Skeleton className="h-6 w-32 bg-white/10 backdrop-blur-xl rounded" />
                          <Skeleton className="h-3 w-24 bg-white/10 backdrop-blur-xl rounded" />
                        </div>
                        <Skeleton className="h-6 w-40 bg-white/10 backdrop-blur-xl rounded-xl" />
                      </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 min-w-0">
                          {/* E-Mail Skeleton */}
                          <div className="flex items-center text-sm">
                            <Skeleton className="h-8 w-8 bg-white/10 backdrop-blur-xl rounded-lg mr-3" />
                            <Skeleton className="h-4 w-48 bg-white/10 backdrop-blur-xl rounded" />
                          </div>
                          {/* Business IDs Skeleton */}
                          <div className="flex items-center text-sm">
                            <Skeleton className="h-8 w-8 bg-white/10 backdrop-blur-xl rounded-lg mr-3" />
                            <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
                          </div>
                        </div>
                        <div className="space-y-2 min-w-0 text-right">
                          {/* Status Skeleton */}
                          <div className="flex items-center justify-end">
                            <Skeleton className="h-4 w-16 bg-white/10 backdrop-blur-xl rounded" />
                            <Skeleton className="h-8 w-8 bg-white/10 backdrop-blur-xl rounded-lg ml-3" />
                          </div>
                          {/* Date Skeleton */}
                          <div className="flex items-center justify-end">
                            <Skeleton className="h-3 w-32 bg-white/10 backdrop-blur-xl rounded" />
                          </div>
                        </div>
                      </div>

                      {/* Business Names Section Skeleton */}
                      <div className="border-t border-white/10 pt-4">
                        <Skeleton className="h-4 w-40 bg-white/10 backdrop-blur-xl rounded mb-3" />
                        <div className="space-y-2">
                          {[...Array(2)].map((_, j) => (
                            <div key={j} className="flex items-center backdrop-blur-2xl bg-white/10 border border-white/20 p-3 rounded-xl">
                              <Skeleton className="h-8 w-8 bg-white/10 backdrop-blur-xl rounded-lg mr-3" />
                              <Skeleton className="h-4 w-40 bg-white/10 backdrop-blur-xl rounded" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions Skeleton */}
                    <div className="pt-6 flex flex-col sm:flex-row justify-end gap-2">
                      <div className="w-full sm:w-auto">
                        <Skeleton className="h-8 w-full sm:w-24 bg-white/10 backdrop-blur-xl rounded-xl" />
                      </div>
                      <div className="w-full sm:w-auto">
                        <Skeleton className="h-8 w-full sm:w-28 bg-white/10 backdrop-blur-xl rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
      
      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8 overflow-x-hidden">
        {/* Glass Header */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')} 
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-full p-2 border"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="sr-only">Zurück zum Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight break-words">
              Geschäftsinhaber prüfen
            </h1>
          </div>
        </div>

        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Stats Card */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6">
            <div className="text-sm text-white/80">
              {users.length} Benutzer zur Überprüfung gefunden
            </div>
          </div>

          {/* User Cards */}
          <div className="grid grid-cols-1 gap-6">
            {users.map(user => (
              <div key={user.id} className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-105 transition-all duration-500 overflow-hidden" data-slot="card">
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="border-b border-white/10 pb-4 mb-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="text-lg font-semibold text-white">Business User</div>
                        <div className="text-xs text-white/60 break-all truncate max-w-xs sm:max-w-none">
                          ID: {user.id}
                        </div>
                      </div>
                      <div className="backdrop-blur-2xl bg-orange-500/20 border border-orange-400/30 text-orange-200 rounded-xl px-3 py-1 text-xs font-medium whitespace-nowrap">
                        Überprüfung erforderlich
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center text-sm break-all truncate max-w-full">
                          <div className="backdrop-blur-2xl bg-white/10 rounded-lg p-2 mr-3">
                            <Mail className="h-4 w-4 text-white/80" />
                          </div>
                          <span className="font-medium text-white">{user.email}</span>
                        </div>
                        {user.businessIds && user.businessIds.length > 0 && (
                          <div className="flex items-center text-sm text-white/80">
                            <div className="backdrop-blur-2xl bg-white/10 rounded-lg p-2 mr-3">
                              <Building2 className="h-4 w-4 text-white/80" />
                            </div>
                            {user.businessIds.length} {user.businessIds.length === 1 ? 'Geschäft' : 'Geschäfte'} zugewiesen
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 min-w-0 text-right">
                        <div className="flex items-center text-sm justify-end">
                          <span className={`${user.isDeleted ? 'text-red-300' : 'text-green-300'} font-medium`}>
                            {user.isDeleted ? 'Gelöscht' : 'Aktiv'}
                          </span>
                          <div className="backdrop-blur-2xl bg-white/10 rounded-lg p-2 ml-3">
                            <Tag className="h-4 w-4 text-white/80" />
                          </div>
                        </div>
                        <div className="flex items-center text-xs justify-end text-white/60">
                          Registriert am {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>

                    {user.businessNames && user.businessNames.length > 0 && (
                      <div className="border-t border-white/10 pt-4">
                        <div className="text-sm font-medium mb-3 text-white/90">Beanspruchte Geschäfte:</div>
                        <div className="space-y-2">
                          {user.businessNames.map(name => (
                            <div key={name} className="flex items-center text-sm backdrop-blur-2xl bg-white/10 border border-white/20 p-3 rounded-xl break-all truncate max-w-full">
                              <div className="backdrop-blur-2xl bg-white/10 rounded-lg p-2 mr-3">
                                <Store className="h-4 w-4 text-white/80" />
                              </div>
                              <span className="font-medium text-white">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-6 flex flex-col sm:flex-row justify-end gap-2" data-slot="card-footer">
                    <div className="w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReject(user.id)}
                        className="text-destructive w-full sm:w-auto relative overflow-hidden"
                        style={{ 
                          backdropFilter: 'blur(8px)', 
                          background: 'rgba(239, 68, 68, 0.2)', 
                          borderColor: 'rgba(248, 113, 113, 0.4)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                          e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.6)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Ablehnen
                      </Button>
                    </div>
                    <div className="w-full sm:w-auto">
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(user.id)}
                        className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto relative overflow-hidden"
                        style={{ 
                          backdropFilter: 'blur(8px)', 
                          background: 'linear-gradient(to right, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))', 
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to right, rgba(22, 163, 74, 0.9), rgba(5, 150, 105, 0.9))';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to right, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verifizieren
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-8 text-center">
              <div className="text-white/80">
                Keine Benutzer zur Überprüfung gefunden.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 