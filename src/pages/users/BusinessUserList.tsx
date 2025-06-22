import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessUserService, BusinessUser } from '@/services/businessUserService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Trash2, Pencil, ArrowLeft } from 'lucide-react';

export function BusinessUserList() {
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const businessUserService = useBusinessUserService();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBusinessUsers = async () => {
      try {
        const users = await businessUserService.getBusinessUsers();
        setBusinessUsers(users);
      } catch (error) {
        console.error('Fehler beim Laden der Business-User:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessUsers();
  }, [businessUserService]);

  if (isLoading) {
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/')} 
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-full p-2 border"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <span className="sr-only">Zurück</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight break-words">
                Business-User verwalten
              </h1>
            </div>
          </div>

          {/* Mobile Loading Skeletons */}
          <div className="block md:hidden space-y-4 max-w-4xl mx-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 w-full">
                {/* E-Mail Skeleton */}
                <div className="mb-3">
                  <Skeleton className="h-4 w-48 bg-white/10 backdrop-blur-xl rounded" />
                </div>
                {/* Status Badge Skeleton */}
                <div className="flex items-center mb-4">
                  <Skeleton className="h-6 w-32 bg-white/10 backdrop-blur-xl rounded-xl" />
                </div>
                {/* Button Skeleton */}
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-32 bg-white/10 backdrop-blur-xl rounded-xl" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Loading Skeleton */}
          <div className="hidden md:block max-w-6xl mx-auto">
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              {/* Table Header Skeleton */}
              <div className="p-6 border-b border-white/10">
                <Skeleton className="h-6 w-48 bg-white/10 backdrop-blur-xl rounded" />
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Table Header Row Skeleton */}
                  <div className="border-b border-white/10 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-8">
                        <Skeleton className="h-4 w-16 bg-white/10 backdrop-blur-xl rounded" />
                        <Skeleton className="h-4 w-16 bg-white/10 backdrop-blur-xl rounded" />
                        <Skeleton className="h-4 w-20 bg-white/10 backdrop-blur-xl rounded" />
                      </div>
                    </div>
                  </div>
                  {/* Table Body Rows Skeleton */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-b border-white/5 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-8 items-center">
                          {/* E-Mail Column */}
                          <div className="flex-1 min-w-0">
                            <Skeleton className="h-4 w-48 bg-white/10 backdrop-blur-xl rounded" />
                          </div>
                          {/* Status Column */}
                          <div className="flex-shrink-0">
                            <Skeleton className="h-6 w-32 bg-white/10 backdrop-blur-xl rounded-xl" />
                          </div>
                        </div>
                        {/* Actions Column */}
                        <div className="flex-shrink-0">
                          <Skeleton className="h-8 w-28 bg-white/10 backdrop-blur-xl rounded-xl" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/')} 
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-full p-2 border"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <span className="sr-only">Zurück</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight break-words">
                Business-User verwalten
              </h1>
            </div>
          </div>

        {/* Mobile Card-Ansicht */}
        {businessUsers.length === 0 ? (
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-8 text-center block md:hidden">
            <div className="text-white/80">Keine Business-User vorhanden</div>
          </div>
        ) : (
          <div className="block md:hidden space-y-4 max-w-4xl mx-auto">
            {businessUsers.map((user) => (
              <div key={user.id} className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-105 transition-all duration-500 p-4 w-full max-w-full overflow-hidden">
                <div className="mb-3">
                  <span className="text-sm font-medium text-white break-all whitespace-normal">{user.email}</span>
                </div>
                <div className="flex items-center mb-4">
                                     {user.isDeleted ? (
                     <Badge variant="destructive" className="bg-destructive backdrop-blur-2xl border border-red-400/30 text-red-200 rounded-xl flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                       <Trash2 className="h-3 w-3" />
                       Gelöscht
                     </Badge>
                   ) : user.needsReview ? (
                     <Badge variant="secondary" className="bg-secondary backdrop-blur-2xl border border-orange-400/30 text-orange-200 rounded-xl flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                       <AlertCircle className="h-3 w-3" />
                       Überprüfung erforderlich
                     </Badge>
                   ) : (
                     <Badge variant="default" className="bg-primary backdrop-blur-2xl border border-green-400/30 text-green-200 rounded-xl flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                       <CheckCircle2 className="h-3 w-3" />
                       Aktiv
                     </Badge>
                   )}
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/business-users/${user.id}/edit`)}
                    className="min-w-[120px] backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    <Pencil className="mr-1 h-4 w-4" /> Bearbeiten
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop/Table Ansicht */}
        <div className="hidden md:block max-w-6xl mx-auto">
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Business-User Übersicht</h2>
            </div>
            <div className="overflow-x-auto">
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/90 font-medium">E-Mail</TableHead>
                    <TableHead className="text-white/90 font-medium">Status</TableHead>
                    <TableHead className="text-white/90 font-medium">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessUsers.map((user) => (
                    <TableRow key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <TableCell className="text-white font-medium">{user.email}</TableCell>
                      <TableCell>
                                                 <div className="flex items-center gap-2">
                           {user.isDeleted ? (
                             <Badge variant="destructive" className="bg-destructive backdrop-blur-2xl border border-red-400/30 text-red-200 rounded-xl flex items-center gap-1">
                               <Trash2 className="h-3 w-3" />
                               Gelöscht
                             </Badge>
                           ) : user.needsReview ? (
                             <Badge variant="secondary" className="bg-secondary backdrop-blur-2xl border border-orange-400/30 text-orange-200 rounded-xl flex items-center gap-1">
                               <AlertCircle className="h-3 w-3" />
                               Überprüfung erforderlich
                             </Badge>
                           ) : (
                             <Badge variant="default" className="bg-primary backdrop-blur-2xl border border-green-400/30 text-green-200 rounded-xl flex items-center gap-1">
                               <CheckCircle2 className="h-3 w-3" />
                               Aktiv
                             </Badge>
                           )}
                         </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/business-users/${user.id}/edit`)}
                          className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 