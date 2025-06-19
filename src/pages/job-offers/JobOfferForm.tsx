import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Plus,
  X,
  ImagePlus,
  Check,
  Link as LinkIcon,
  Linkedin,
  Facebook,
  Instagram
} from 'lucide-react';
import { toast } from 'sonner';
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
} from "@/components/ui/select";
import { LocationSearch, LocationResult } from "@/components/ui/LocationSearch";
import { useJobCategoryService } from '@/services/jobCategoryService';
import { JobCategory } from '@/models/job-category';
import { getIconComponent } from '@/utils/iconUtils';

export function JobOfferForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobOfferService = useJobOfferService();
  const jobCategoryService = useJobCategoryService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string>('');
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
      longitude: 0
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
      phone: ''
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
          lng: formData.location.longitude
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
          houseNumber: ''
        }
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
      setPreviewUrls(jobOffer.images);
      
      if (jobOffer.companyLogo) {
        setCompanyLogoPreview(jobOffer.companyLogo);
      }
    } catch (error) {
      toast.error('Fehler beim Laden des Stellenangebots');
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

      if (selectedImages.length > 0) {
        await jobOfferService.updateImages(jobOffer.id, selectedImages);
      }

      toast.success(`Stellenangebot ${id ? 'aktualisiert' : 'erstellt'}`);
      navigate('/job-offers');
    } catch (error) {
      toast.error(`Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'} des Stellenangebots`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages([...selectedImages, ...files]);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const addArrayItem = (field: 'tasks' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'tasks' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'tasks' | 'benefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;
    
    setFormData(prev => ({
      ...prev,
      location: {
        address: location.address.label,
        latitude: location.position.lat,
        longitude: location.position.lng
      }
    }));
    setSearchValue(location);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
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

        <div className="backdrop-blur-3xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl ring-1 ring-white/30 p-8">
          <div className="text-white text-xl">Lade Stellenangebot...</div>
        </div>
      </div>
    );
  }

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
        {/* Glass Header */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/job-offers')} 
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl px-3 py-2 border"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Zurück zur Übersicht
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                {id ? 'Stellenangebot bearbeiten' : 'Neues Stellenangebot'}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Allgemeine Informationen Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Allgemeine Informationen
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isHighlight"
                    checked={formData.isHighlight}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isHighlight: checked }))}
                  />
                  <Label htmlFor="isHighlight" className="text-white">Als Highlight markieren</Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Firmenlogo</Label>
                  <div className="grid grid-cols-1 gap-4">
                    {companyLogoPreview ? (
                      <div className="relative group">
                        <img
                          src={companyLogoPreview}
                          alt="Firmenlogo Vorschau"
                          className="w-full h-32 object-contain rounded-lg backdrop-blur-2xl bg-white/10 p-4 border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={removeCompanyLogo}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 backdrop-blur-2xl text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600/80 hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center h-32 border-2 border-dashed border-white/20 backdrop-blur-2xl bg-white/5 rounded-lg cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCompanyLogoSelect}
                          className="hidden"
                        />
                        <ImagePlus className="h-6 w-6 text-white/70" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generalDescription" className="text-white">Allgemeine Beschreibung</Label>
                  <Textarea
                    id="generalDescription"
                    value={formData.generalDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, generalDescription: e.target.value }))}
                    required
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neededProfile" className="text-white">Benötigtes Profil</Label>
                  <Textarea
                    id="neededProfile"
                    value={formData.neededProfile}
                    onChange={(e) => setFormData(prev => ({ ...prev, neededProfile: e.target.value }))}
                    required
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Aufgaben</Label>
                  {formData.tasks.map((task, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={task}
                        onChange={(e) => updateArrayItem('tasks', index, e.target.value)}
                        required
                        className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('tasks', index)}
                        className="backdrop-blur-2xl bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30 hover:scale-105 transition-all duration-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('tasks')}
                    className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Aufgabe hinzufügen
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Vorteile</Label>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                        required
                        className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('benefits', index)}
                        className="backdrop-blur-2xl bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30 hover:scale-105 transition-all duration-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('benefits')}
                    className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Vorteil hinzufügen
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobOfferCategoryId" className="text-white">Kategorie</Label>
                  <Select
                    value={formData.jobOfferCategoryId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, jobOfferCategoryId: value }))}
                    required
                  >
                    <SelectTrigger className="backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-3xl bg-black/80 border-white/20">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-white/20">
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
            </div>

            {/* Details Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Details
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                                 <div className="space-y-2">
                   <Label className="text-white">Adresse</Label>
                   <div className="[&_input]:backdrop-blur-2xl [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder:text-white/50">
                     <LocationSearch
                       value={searchValue}
                       onChange={handleLocationSelect}
                       placeholder="Adresse suchen..."
                       debounce={1000}
                     />
                   </div>
                   {formData.location.address && (
                     <div className="text-sm text-white/70">
                       Ausgewählte Adresse: {formData.location.address}
                     </div>
                   )}
                 </div>

                <div className="space-y-2">
                  <Label htmlFor="typeOfEmployment" className="text-white">Beschäftigungsart</Label>
                  <Select
                    value={formData.typeOfEmployment}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, typeOfEmployment: value }))}
                  >
                    <SelectTrigger className="backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Beschäftigungsart auswählen" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-3xl bg-black/80 border-white/20">
                      <SelectItem value="Vollzeit" className="text-white hover:bg-white/20">Vollzeit</SelectItem>
                      <SelectItem value="Teilzeit" className="text-white hover:bg-white/20">Teilzeit</SelectItem>
                      <SelectItem value="Ausbildung" className="text-white hover:bg-white/20">Ausbildung</SelectItem>
                      <SelectItem value="Praktikum" className="text-white hover:bg-white/20">Praktikum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotesForTypeOfEmployment" className="text-white">Zusätzliche Notizen zur Beschäftigungsart</Label>
                  <Textarea
                    id="additionalNotesForTypeOfEmployment"
                    value={formData.additionalNotesForTypeOfEmployment || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      additionalNotesForTypeOfEmployment: e.target.value || null 
                    }))}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="homeOffice"
                    checked={formData.homeOffice}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, homeOffice: checked }))}
                  />
                  <Label htmlFor="homeOffice" className="text-white">Home Office möglich</Label>
                </div>

                {formData.homeOffice && (
                  <div className="space-y-2">
                    <Label htmlFor="additionalNotesHomeOffice" className="text-white">Zusätzliche Notizen zum Home Office</Label>
                    <Textarea
                      id="additionalNotesHomeOffice"
                      value={formData.additionalNotesHomeOffice || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        additionalNotesHomeOffice: e.target.value || null 
                      }))}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="wage" className="text-white">Gehalt</Label>
                  <Input
                    id="wage"
                    value={formData.wage || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      wage: e.target.value || null 
                    }))}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-white">Startdatum</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Kontaktdaten Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Kontaktdaten
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-white">Kontaktperson</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactData.person}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactData: { ...prev.contactData, person: e.target.value }
                    }))}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-white">E-Mail</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactData.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactData: { ...prev.contactData, email: e.target.value }
                    }))}
                    required
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-white">Telefon</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactData.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactData: { ...prev.contactData, phone: e.target.value }
                    }))}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link" className="text-white">Bewerbungslink</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    required
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Social Media
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                  <div className="flex gap-2">
                    <Linkedin className="h-4 w-4 mt-2 text-white/70" />
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.socialMedia?.linkedin || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          linkedin: e.target.value || null
                        }
                      }))}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xing" className="text-white">Xing</Label>
                  <div className="flex gap-2">
                    <LinkIcon className="h-4 w-4 mt-2 text-white/70" />
                    <Input
                      id="xing"
                      type="url"
                      value={formData.socialMedia?.xing || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          xing: e.target.value || null
                        }
                      }))}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-white">Instagram</Label>
                  <div className="flex gap-2">
                    <Instagram className="h-4 w-4 mt-2 text-white/70" />
                    <Input
                      id="instagram"
                      type="url"
                      value={formData.socialMedia?.instagram || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          instagram: e.target.value || null
                        }
                      }))}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-white">Facebook</Label>
                  <div className="flex gap-2">
                    <Facebook className="h-4 w-4 mt-2 text-white/70" />
                    <Input
                      id="facebook"
                      type="url"
                      value={formData.socialMedia?.facebook || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          facebook: e.target.value || null
                        }
                      }))}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bilder Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Bilder
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg backdrop-blur-2xl bg-white/5 border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500/80 backdrop-blur-2xl text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600/80 hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center h-32 border-2 border-dashed border-white/20 backdrop-blur-2xl bg-white/5 rounded-lg cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <ImagePlus className="h-6 w-6 text-white/70" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/job-offers')}
              disabled={isSaving}
              className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving} 
              className="backdrop-blur-2xl bg-gradient-to-r from-green-500/80 to-emerald-600/80 border border-white/20 text-white hover:from-green-600/80 hover:to-emerald-700/80 hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {id ? 'Wird gespeichert...' : 'Wird erstellt...'}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {id ? 'Speichern' : 'Erstellen'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 