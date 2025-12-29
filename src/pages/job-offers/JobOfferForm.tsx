import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Plus,
  X,
  ImagePlus,
  Check,
  Link as LinkIcon,
  Linkedin,
  Facebook,
  Instagram,
} from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { JobOffer, JobOfferCreation } from '@/models/job-offer';
import { useJobOfferService } from '@/services/jobOfferService';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
import { useJobCategoryService } from '@/services/jobCategoryService';
import { JobCategory } from '@/models/job-category';
import { getIconComponent } from '@/utils/iconUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function JobOfferFormSkeleton() {
  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
          {/* Glass Header Skeleton */}
          <Card className={cn(glassCard, 'p-4 sm:p-6 mb-6 sm:mb-8')}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-44 rounded-xl" />
                <Skeleton className="h-8 w-64 rounded" />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Allgemeine Informationen Card Skeleton */}
            <Card className={cn(glassCard, 'overflow-hidden')}>
              <div className="p-4 sm:p-6 border-b border-secondary">
                <Skeleton className="h-6 w-48 rounded" />
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {/* Title field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>

                {/* Highlight toggle */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-10 rounded-full" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>

                {/* Company logo */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>

                {/* Description fields */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-24 w-full rounded" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-24 w-full rounded" />
                </div>

                {/* Tasks list */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Skeleton className="h-10 flex-1 rounded" />
                      <Skeleton className="h-10 w-10 rounded" />
                    </div>
                  ))}
                  <Skeleton className="h-10 w-40 rounded" />
                </div>

                {/* Benefits list */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Skeleton className="h-10 flex-1 rounded" />
                      <Skeleton className="h-10 w-10 rounded" />
                    </div>
                  ))}
                  <Skeleton className="h-10 w-36 rounded" />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>
            </Card>

            {/* Details Card Skeleton */}
            <Card className={cn(glassCard, 'overflow-hidden')}>
              <div className="p-4 sm:p-6 border-b border-secondary">
                <Skeleton className="h-6 w-16 rounded" />
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {/* Location */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded" />
              </div>

              {/* Employment type */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded" />
              </div>

              {/* Additional notes */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-56 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-24 w-full bg-white/10 backdrop-blur-xl rounded" />
              </div>

                {/* Home office toggle */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-10 rounded-full" />
                  <Skeleton className="h-4 w-36 rounded" />
                </div>

                {/* Wage */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>

                {/* Start date */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>
            </Card>

            {/* Contact Card Skeleton */}
            <Card className={cn(glassCard, 'overflow-hidden')}>
              <div className="p-4 sm:p-6 border-b border-secondary">
                <Skeleton className="h-6 w-24 rounded" />
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Social Media Card Skeleton */}
            <Card className={cn(glassCard, 'overflow-hidden')}>
              <div className="p-4 sm:p-6 border-b border-secondary">
                <Skeleton className="h-6 w-28 rounded" />
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-4 mt-2 rounded" />
                      <Skeleton className="h-10 flex-1 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Images Card Skeleton */}
            <Card className={cn(glassCard, 'overflow-hidden')}>
              <div className="p-4 sm:p-6 border-b border-secondary">
                <Skeleton className="h-6 w-12 rounded" />
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-32 w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-28 rounded" />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export function JobOfferForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobOfferService = useJobOfferService();
  const jobCategoryService = useJobCategoryService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // Bestehende Bilder vom Backend
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string>('');
  
  // Zentrale Bildvalidierung für neue Bilder (max 1 MB pro Bild)
  const imageUpload = useValidatedImageUpload({
    maxImages: 10, // Max 10 Bilder insgesamt
    maxSizeMB: 1,
  });
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [formData, setFormData] = useState<JobOfferCreation>({
    title: '',
    companyLogo: '',
    generalDescription: '',
    neededProfile: '',
    tasks: [''],
    benefits: [''],
    images: [],
    location: {
      address: '',
      latitude: 0,
      longitude: 0,
    },
    typeOfEmployment: '',
    additionalNotesForTypeOfEmployment: null,
    homeOffice: false,
    additionalNotesHomeOffice: null,
    wage: null,
    startDate: '',
    contactData: {
      person: '',
      email: '',
      phone: '',
    },
    link: '',
    socialMedia: null,
    isHighlight: false,
    jobOfferCategoryId: '',
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  useEffect(() => {
    jobCategoryService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (id) {
      loadJobOffer();
    }
  }, [id]);

  useEffect(() => {
    if (formData.location.address) {
      setSearchValue({
        id: 'current',
        title: formData.location.address,
        resultType: 'place',
        position: {
          lat: formData.location.latitude,
          lng: formData.location.longitude,
        },
        address: {
          label: formData.location.address,
          countryCode: '',
          countryName: '',
          stateCode: '',
          state: '',
          county: '',
          city: '',
          district: '',
          street: '',
          postalCode: '',
          houseNumber: '',
        },
      });
    }
  }, [formData.location]);

  const loadJobOffer = async () => {
    try {
      setIsLoading(true);
      const jobOffer = await jobOfferService.getJobOffer(id!);
      setFormData({
        title: jobOffer.title,
        companyLogo: jobOffer.companyLogo,
        generalDescription: jobOffer.generalDescription,
        neededProfile: jobOffer.neededProfile,
        tasks: jobOffer.tasks,
        benefits: jobOffer.benefits,
        images: jobOffer.images,
        location: jobOffer.location,
        typeOfEmployment: jobOffer.typeOfEmployment,
        additionalNotesForTypeOfEmployment: jobOffer.additionalNotesForTypeOfEmployment || null,
        homeOffice: jobOffer.homeOffice,
        additionalNotesHomeOffice: jobOffer.additionalNotesHomeOffice || null,
        wage: jobOffer.wage || null,
        startDate: jobOffer.startDate,
        contactData: jobOffer.contactData,
        link: jobOffer.link,
        socialMedia: jobOffer.socialMedia || null,
        isHighlight: jobOffer.isHighlight || false,
        jobOfferCategoryId: jobOffer.jobOfferCategoryId || '',
      });
      setExistingImageUrls(jobOffer.images);

      if (jobOffer.companyLogo) {
        setCompanyLogoPreview(jobOffer.companyLogo);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Stellenangebots:', error);
      showUserFriendlyError(error, toast);
      navigate('/job-offers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCompanyLogoPreview(previewUrl);
    }
  };

  const removeCompanyLogo = () => {
    if (companyLogoPreview) {
      URL.revokeObjectURL(companyLogoPreview);
    }
    setCompanyLogoFile(null);
    setCompanyLogoPreview('');
    setFormData(prev => ({ ...prev, companyLogo: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      let jobOffer: JobOffer;

      if (id) {
        jobOffer = await jobOfferService.updateJobOffer(id, formData);
      } else {
        jobOffer = await jobOfferService.createJobOffer(formData);
      }

      if (companyLogoFile) {
        await jobOfferService.updateCompanyLogo(jobOffer.id, companyLogoFile);
      }

      if (imageUpload.files.length > 0) {
        await jobOfferService.updateImages(jobOffer.id, imageUpload.files);
      }

      toast.success(`Stellenangebot ${id ? 'aktualisiert' : 'erstellt'}`);
      navigate('/job-offers');
    } catch (error) {
      console.error(`Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'} des Stellenangebots:`, error);
      showUserFriendlyError(error, toast);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    imageUpload.handleFileChange(e);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // Entferne bestehendes Bild
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      // Entferne neues Bild
      imageUpload.removeImage(index);
    }
  };

  const addArrayItem = (field: 'tasks' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'tasks' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field: 'tasks' | 'benefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;

    setFormData(prev => ({
      ...prev,
      location: {
        address: location.address.label,
        latitude: location.position.lat,
        longitude: location.position.lng,
      },
    }));
    setSearchValue(location);
  };

  if (isLoading) {
    return <JobOfferFormSkeleton />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
          {/* Glass Header */}
          <motion.div
            className={cn(glassCard, 'p-4 sm:p-6 mb-6 sm:mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3">
                <AnimatedButton
                  variant="ghost"
                  onClick={() => navigate('/job-offers')}
                  className="rounded-xl px-3 py-2"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Zurück zur Übersicht
                </AnimatedButton>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {id ? 'Stellenangebot bearbeiten' : 'Neues Stellenangebot'}
                </h1>
              </div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Allgemeine Informationen Card */}
              <motion.div variants={fadeInUp}>
                <Card className={cn(glassCard, 'overflow-hidden')}>
                  <div className="p-4 sm:p-6 border-b border-secondary">
                    <h2 className="text-xl font-bold text-foreground">
                      Allgemeine Informationen
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground">
                        Titel
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className={cn(glassInput)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isHighlight"
                        checked={formData.isHighlight}
                        onCheckedChange={checked =>
                          setFormData(prev => ({ ...prev, isHighlight: checked }))
                        }
                      />
                      <Label htmlFor="isHighlight" className="text-foreground">
                        Als Highlight markieren
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Firmenlogo</Label>
                      <div className="grid grid-cols-1 gap-4">
                        {companyLogoPreview ? (
                          <div className="relative group">
                            <img
                              src={companyLogoPreview}
                              alt="Firmenlogo Vorschau"
                              className={cn(glassCard, 'w-full h-32 object-contain p-4')}
                            />
                            <AnimatedButton
                              type="button"
                              size="icon"
                              onClick={removeCompanyLogo}
                              className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <X className="h-4 w-4" />
                            </AnimatedButton>
                          </div>
                        ) : (
                          <label className={cn(glassCard, 'flex items-center justify-center h-32 border-2 border-dashed cursor-pointer hover:border-secondary/50 transition-all duration-300')}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCompanyLogoSelect}
                              className="hidden"
                            />
                            <ImagePlus className="h-6 w-6 text-muted-foreground" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="generalDescription" className="text-foreground">
                        Allgemeine Beschreibung
                      </Label>
                      <Textarea
                        id="generalDescription"
                        value={formData.generalDescription}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, generalDescription: e.target.value }))
                        }
                        required
                        className={cn(glassInput)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neededProfile" className="text-foreground">
                        Benötigtes Profil
                      </Label>
                      <Textarea
                        id="neededProfile"
                        value={formData.neededProfile}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, neededProfile: e.target.value }))
                        }
                        required
                        className={cn(glassInput)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Aufgaben</Label>
                      {formData.tasks.map((task, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={task}
                            onChange={e => updateArrayItem('tasks', index, e.target.value)}
                            required
                            className={cn(glassInput)}
                          />
                          <AnimatedButton
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem('tasks', index)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            <X className="h-4 w-4" />
                          </AnimatedButton>
                        </div>
                      ))}
                      <AnimatedButton
                        type="button"
                        variant="outline"
                        onClick={() => addArrayItem('tasks')}
                        className={cn(glassButton)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Aufgabe hinzufügen
                      </AnimatedButton>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Vorteile</Label>
                      {formData.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={e => updateArrayItem('benefits', index, e.target.value)}
                            required
                            className={cn(glassInput)}
                          />
                          <AnimatedButton
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem('benefits', index)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            <X className="h-4 w-4" />
                          </AnimatedButton>
                        </div>
                      ))}
                      <AnimatedButton
                        type="button"
                        variant="outline"
                        onClick={() => addArrayItem('benefits')}
                        className={cn(glassButton)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Vorteil hinzufügen
                      </AnimatedButton>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobOfferCategoryId" className="text-foreground">
                        Kategorie
                      </Label>
                      <Select
                        value={formData.jobOfferCategoryId}
                        onValueChange={value =>
                          setFormData(prev => ({ ...prev, jobOfferCategoryId: value }))
                        }
                        required
                      >
                        <SelectTrigger className={cn(glassInput)}>
                          <SelectValue placeholder="Kategorie auswählen" />
                        </SelectTrigger>
                        <SelectContent className={cn(glassCard)}>
                          {categories.map(cat => (
                            <SelectItem
                              key={cat.id}
                              value={cat.id}
                              className="cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                {getIconComponent?.(cat.iconName)}
                                {cat.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Details Card */}
              <motion.div variants={fadeInUp}>
                <Card className={cn(glassCard, 'overflow-hidden')}>
                  <div className="p-4 sm:p-6 border-b border-secondary">
                    <h2 className="text-xl font-bold text-foreground">
                      Details
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Adresse</Label>
                      <div className="[&_input]:backdrop-blur-2xl [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder:text-white/50">
                        <LocationSearch
                          value={searchValue}
                          onChange={handleLocationSelect}
                          placeholder="Adresse suchen..."
                          debounce={1000}
                        />
                      </div>
                      {formData.location.address && (
                        <div className="text-sm text-muted-foreground">
                          Ausgewählte Adresse: {formData.location.address}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="typeOfEmployment" className="text-foreground">
                        Beschäftigungsart
                      </Label>
                      <Select
                        value={formData.typeOfEmployment}
                        onValueChange={value =>
                          setFormData(prev => ({ ...prev, typeOfEmployment: value }))
                        }
                      >
                        <SelectTrigger className={cn(glassInput)}>
                          <SelectValue placeholder="Beschäftigungsart auswählen" />
                        </SelectTrigger>
                        <SelectContent className={cn(glassCard)}>
                          <SelectItem value="Vollzeit" className="cursor-pointer">
                            Vollzeit
                          </SelectItem>
                          <SelectItem value="Teilzeit" className="cursor-pointer">
                            Teilzeit
                          </SelectItem>
                          <SelectItem value="Ausbildung" className="cursor-pointer">
                            Ausbildung
                          </SelectItem>
                          <SelectItem value="Praktikum" className="cursor-pointer">
                            Praktikum
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalNotesForTypeOfEmployment" className="text-foreground">
                        Zusätzliche Notizen zur Beschäftigungsart
                      </Label>
                      <Textarea
                        id="additionalNotesForTypeOfEmployment"
                        value={formData.additionalNotesForTypeOfEmployment || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            additionalNotesForTypeOfEmployment: e.target.value || null,
                          }))
                        }
                        className={cn(glassInput)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="homeOffice"
                        checked={formData.homeOffice}
                        onCheckedChange={checked =>
                          setFormData(prev => ({ ...prev, homeOffice: checked }))
                        }
                      />
                      <Label htmlFor="homeOffice" className="text-foreground">
                        Home Office möglich
                      </Label>
                    </div>

                    {formData.homeOffice && (
                      <div className="space-y-2">
                        <Label htmlFor="additionalNotesHomeOffice" className="text-foreground">
                          Zusätzliche Notizen zum Home Office
                        </Label>
                        <Textarea
                          id="additionalNotesHomeOffice"
                          value={formData.additionalNotesHomeOffice || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              additionalNotesHomeOffice: e.target.value || null,
                            }))
                          }
                          className={cn(glassInput)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="wage" className="text-foreground">
                        Gehalt
                      </Label>
                      <Input
                        id="wage"
                        value={formData.wage || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            wage: e.target.value || null,
                          }))
                        }
                        className={cn(glassInput)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-foreground">
                        Startdatum
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                        className={cn(glassInput)}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Kontaktdaten Card */}
              <motion.div variants={fadeInUp}>
                <Card className={cn(glassCard, 'overflow-hidden')}>
                  <div className="p-4 sm:p-6 border-b border-secondary">
                    <h2 className="text-xl font-bold text-foreground">
                      Kontaktdaten
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson" className="text-foreground">
                        Kontaktperson
                      </Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactData.person}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            contactData: { ...prev.contactData, person: e.target.value },
                          }))
                        }
                        className={cn(glassInput)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-foreground">
                        E-Mail
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactData.email}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            contactData: { ...prev.contactData, email: e.target.value },
                          }))
                        }
                        required
                        className={cn(glassInput)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-foreground">
                        Telefon
                      </Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactData.phone}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            contactData: { ...prev.contactData, phone: e.target.value },
                          }))
                        }
                        className={cn(glassInput)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link" className="text-foreground">
                        Bewerbungslink
                      </Label>
                      <Input
                        id="link"
                        type="url"
                        value={formData.link}
                        onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                        required
                        className={cn(glassInput)}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Social Media Card */}
              <motion.div variants={fadeInUp}>
                <Card className={cn(glassCard, 'overflow-hidden')}>
                  <div className="p-4 sm:p-6 border-b border-secondary">
                    <h2 className="text-xl font-bold text-foreground">
                      Social Media
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="text-foreground">
                        LinkedIn
                      </Label>
                      <div className="flex gap-2">
                        <Linkedin className="h-4 w-4 mt-2 text-muted-foreground" />
                        <Input
                          id="linkedin"
                          type="url"
                          value={formData.socialMedia?.linkedin || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                linkedin: e.target.value || null,
                              },
                            }))
                          }
                          className={cn(glassInput)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="xing" className="text-foreground">
                        Xing
                      </Label>
                      <div className="flex gap-2">
                        <LinkIcon className="h-4 w-4 mt-2 text-muted-foreground" />
                        <Input
                          id="xing"
                          type="url"
                          value={formData.socialMedia?.xing || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                xing: e.target.value || null,
                              },
                            }))
                          }
                          className={cn(glassInput)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-foreground">
                        Instagram
                      </Label>
                      <div className="flex gap-2">
                        <Instagram className="h-4 w-4 mt-2 text-muted-foreground" />
                        <Input
                          id="instagram"
                          type="url"
                          value={formData.socialMedia?.instagram || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                instagram: e.target.value || null,
                              },
                            }))
                          }
                          className={cn(glassInput)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="text-foreground">
                        Facebook
                      </Label>
                      <div className="flex gap-2">
                        <Facebook className="h-4 w-4 mt-2 text-muted-foreground" />
                        <Input
                          id="facebook"
                          type="url"
                          value={formData.socialMedia?.facebook || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                facebook: e.target.value || null,
                              },
                            }))
                          }
                          className={cn(glassInput)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Bilder Card */}
              <motion.div variants={fadeInUp}>
                <Card className={cn(glassCard, 'overflow-hidden')}>
                  <div className="p-4 sm:p-6 border-b border-secondary">
                    <h2 className="text-xl font-bold text-foreground">
                      Bilder
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    {imageUpload.error && (
                      <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50')}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{imageUpload.error.title}</AlertTitle>
                        <AlertDescription className="mt-2">
                          <p>{imageUpload.error.message}</p>
                          {imageUpload.error.actionHint && (
                            <p className="mt-2 text-sm opacity-90">{imageUpload.error.actionHint}</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Bestehende Bilder */}
                      {existingImageUrls.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`Bild ${index + 1}`}
                            className={cn(glassCard, 'w-full h-32 object-cover')}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, true)}
                            className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                            aria-label="Bild entfernen"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {/* Neue Bilder */}
                      {imageUpload.previewUrls.map((url, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className={cn(glassCard, 'w-full h-32 object-cover')}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, false)}
                            className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                            aria-label="Bild entfernen"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {(existingImageUrls.length + imageUpload.previewUrls.length) < 10 && (
                        <label className={cn(glassCard, 'flex items-center justify-center h-32 border-2 border-dashed cursor-pointer hover:border-secondary/50 transition-all duration-300')}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                        </label>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              className="mt-6 flex flex-col sm:flex-row justify-end gap-4"
              variants={fadeInUp}
            >
              <AnimatedButton
                type="button"
                variant="outline"
                onClick={() => navigate('/job-offers')}
                disabled={isSaving}
                className={cn(glassButton)}
              >
                Abbrechen
              </AnimatedButton>
              <LoadingButton
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSaving ? (
                  <>
                    {id ? 'Wird gespeichert...' : 'Wird erstellt...'}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {id ? 'Speichern' : 'Erstellen'}
                  </>
                )}
              </LoadingButton>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </PageTransition>
  );
}
