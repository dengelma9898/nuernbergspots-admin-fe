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
    return <div className="flex justify-center items-center h-64">Lade Stellenangebot...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/job-offers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? 'Stellenangebot bearbeiten' : 'Neues Stellenangebot'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isHighlight"
                  checked={formData.isHighlight}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isHighlight: checked }))}
                />
                <Label htmlFor="isHighlight">Als Highlight markieren</Label>
              </div>

              <div className="space-y-2">
                <Label>Firmenlogo</Label>
                <div className="grid grid-cols-1 gap-4">
                  {companyLogoPreview ? (
                    <div className="relative group">
                      <img
                        src={companyLogoPreview}
                        alt="Firmenlogo Vorschau"
                        className="w-full h-32 object-contain rounded-lg bg-white p-4"
                      />
                      <button
                        type="button"
                        onClick={removeCompanyLogo}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
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
                <Label htmlFor="generalDescription">Allgemeine Beschreibung</Label>
                <Textarea
                  id="generalDescription"
                  value={formData.generalDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, generalDescription: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neededProfile">Benötigtes Profil</Label>
                <Textarea
                  id="neededProfile"
                  value={formData.neededProfile}
                  onChange={(e) => setFormData(prev => ({ ...prev, neededProfile: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Aufgaben</Label>
                {formData.tasks.map((task, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={task}
                      onChange={(e) => updateArrayItem('tasks', index, e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('tasks', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('tasks')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Aufgabe hinzufügen
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Vorteile</Label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('benefits', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('benefits')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Vorteil hinzufügen
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobOfferCategoryId">Kategorie</Label>
                <Select
                  value={formData.jobOfferCategoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, jobOfferCategoryId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          {getIconComponent?.(cat.iconName)}
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adresse</Label>
                <LocationSearch
                  value={searchValue}
                  onChange={handleLocationSelect}
                  placeholder="Adresse suchen..."
                  debounce={1000}
                />
                {formData.location.address && (
                  <div className="text-sm text-muted-foreground">
                    Ausgewählte Adresse: {formData.location.address}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeOfEmployment">Beschäftigungsart</Label>
                <Select
                  value={formData.typeOfEmployment}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, typeOfEmployment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Beschäftigungsart auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vollzeit">Vollzeit</SelectItem>
                    <SelectItem value="Teilzeit">Teilzeit</SelectItem>
                    <SelectItem value="Ausbildung">Ausbildung</SelectItem>
                    <SelectItem value="Praktikum">Praktikum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotesForTypeOfEmployment">Zusätzliche Notizen zur Beschäftigungsart</Label>
                <Textarea
                  id="additionalNotesForTypeOfEmployment"
                  value={formData.additionalNotesForTypeOfEmployment || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    additionalNotesForTypeOfEmployment: e.target.value || null 
                  }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="homeOffice"
                  checked={formData.homeOffice}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, homeOffice: checked }))}
                />
                <Label htmlFor="homeOffice">Home Office möglich</Label>
              </div>

              {formData.homeOffice && (
                <div className="space-y-2">
                  <Label htmlFor="additionalNotesHomeOffice">Zusätzliche Notizen zum Home Office</Label>
                  <Textarea
                    id="additionalNotesHomeOffice"
                    value={formData.additionalNotesHomeOffice || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      additionalNotesHomeOffice: e.target.value || null 
                    }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="wage">Gehalt</Label>
                <Input
                  id="wage"
                  value={formData.wage || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    wage: e.target.value || null 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Startdatum</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Kontaktperson</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactData.person}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactData: { ...prev.contactData, person: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">E-Mail</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactData: { ...prev.contactData, email: e.target.value }
                  }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefon</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactData.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactData: { ...prev.contactData, phone: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Bewerbungslink</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="flex gap-2">
                  <Linkedin className="h-4 w-4 mt-2" />
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="xing">Xing</Label>
                <div className="flex gap-2">
                  <LinkIcon className="h-4 w-4 mt-2" />
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex gap-2">
                  <Instagram className="h-4 w-4 mt-2" />
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="flex gap-2">
                  <Facebook className="h-4 w-4 mt-2" />
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bilder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/job-offers')}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSaving}>
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
  );
} 