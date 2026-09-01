import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Image as ImageIcon,
  Briefcase,
  Euro,
  Mail,
  Phone,
  Link as LinkIcon,
  Home,
} from 'lucide-react';
import { JobOffer } from '@/models/job-offer';
import { JobCategory } from '@/models/job-category';
import { getIconComponent } from '@/utils/iconUtils';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { formatJobOfferDate } from '@/utils/jobOfferFormatUtils';

interface JobOfferCardProps {
  jobOffer: JobOffer;
  onDelete: (id: string) => void;
  category: JobCategory | null;
}

export function JobOfferCard({ jobOffer, onDelete, category }: JobOfferCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
      <Card className={cn(cardPreset, 'flex flex-col gap-0 !py-0 !px-0 overflow-hidden')}>
        {jobOffer.companyLogo ? (
          <div className="relative h-48 w-full">
            <img
              src={jobOffer.companyLogo}
              alt={jobOffer.title}
              className="object-contain w-full h-full bg-muted p-4 border-b border-secondary"
            />
            {jobOffer.images && jobOffer.images.length > 0 && (
              <Badge variant="secondary" className="absolute top-2 right-2">
                <ImageIcon className="mr-1 h-3 w-3" />+{jobOffer.images.length}
              </Badge>
            )}
            {jobOffer.isHighlight && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-950 border-yellow-600">
                ⭐ Highlight
              </Badge>
            )}
          </div>
        ) : null}
        <CardHeader className="!px-4 !pt-4 !pb-2 gap-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-foreground">{jobOffer.title}</CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                {formatJobOfferDate(jobOffer.startDate)}
              </CardDescription>
              {category && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {getIconComponent?.(category.iconName)}
                  <span>{category.name}</span>
                </div>
              )}
            </div>
            <Badge variant={jobOffer.homeOffice ? 'default' : 'secondary'}>
              <Home className="h-4 w-4 mr-1" />
              {jobOffer.homeOffice ? 'Home Office' : 'Vor Ort'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow !px-4 !py-2 gap-0">
          <p className="text-sm text-foreground line-clamp-3 mb-4">{jobOffer.generalDescription}</p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="truncate">{jobOffer.location.address}</span>
            </div>
            <div className="flex items-center text-sm text-foreground">
              <Briefcase className="mr-2 h-4 w-4" />
              {jobOffer.typeOfEmployment}
            </div>
            {jobOffer.wage && (
              <div className="flex items-center text-sm text-foreground">
                <Euro className="mr-2 h-4 w-4" />
                {jobOffer.wage}
              </div>
            )}
            <div className="flex items-center text-sm text-foreground">
              <Mail className="mr-2 h-4 w-4" />
              {jobOffer.contactData.email}
            </div>
            {jobOffer.contactData.phone && (
              <div className="flex items-center text-sm text-foreground">
                <Phone className="mr-2 h-4 w-4" />
                {jobOffer.contactData.phone}
              </div>
            )}
            <div className="flex items-center text-sm text-foreground">
              <LinkIcon className="mr-2 h-4 w-4" />
              <a
                href={jobOffer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Zur Bewerbung
              </a>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center !px-4 !pt-2 !pb-4 gap-0">
          <div className="text-xs text-muted-foreground">
            Erstellt am {formatJobOfferDate(jobOffer.createdAt)}
          </div>
          <div className="flex gap-2">
            <LoadingButton
              variant="outline"
              size="sm"
              className={cn(buttonPreset)}
              onClick={() => navigate(`/job-offers/${jobOffer.id}`)}
            >
              Bearbeiten
            </LoadingButton>
            <LoadingButton variant="destructive" size="sm" onClick={() => onDelete(jobOffer.id)}>
              Löschen
            </LoadingButton>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

interface JobOfferMobileCardProps {
  jobOffer: JobOffer;
  category: JobCategory | null;
  onDelete: (id: string) => void;
}

export function JobOfferMobileCard({ jobOffer, category, onDelete }: JobOfferMobileCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={cn(cardPreset, 'gap-0 !py-0 !px-0 p-4')}>
      <div className="flex flex-col gap-2">
        {jobOffer.isHighlight && (
          <Badge className="w-fit bg-yellow-500 text-yellow-950 border-yellow-600 mb-2">
            ⭐ Highlight
          </Badge>
        )}
        {jobOffer.companyLogo && (
          <img
            src={jobOffer.companyLogo}
            alt={jobOffer.title}
            className="object-contain w-full h-40 rounded bg-muted p-2 mb-2 border border-secondary"
          />
        )}
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-lg text-foreground">{jobOffer.title}</span>
          <Badge variant={jobOffer.homeOffice ? 'default' : 'secondary'} className="ml-2">
            <Home className="h-4 w-4 mr-1" />
            {jobOffer.homeOffice ? 'Home Office' : 'Vor Ort'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm mb-1 text-muted-foreground">
          {category && getIconComponent?.(category.iconName)}
          {category && <span>{category.name}</span>}
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          {formatJobOfferDate(jobOffer.startDate)}
        </div>
        <div className="text-sm text-foreground mb-2">{jobOffer.generalDescription}</div>
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center text-sm text-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{jobOffer.location.address}</span>
          </div>
          <div className="flex items-center text-sm text-foreground">
            <Briefcase className="mr-2 h-4 w-4" />
            {jobOffer.typeOfEmployment}
          </div>
          {jobOffer.wage && (
            <div className="flex items-center text-sm text-foreground">
              <Euro className="mr-2 h-4 w-4" />
              {jobOffer.wage}
            </div>
          )}
          <div className="flex items-center text-sm text-foreground">
            <Mail className="mr-2 h-4 w-4" />
            {jobOffer.contactData.email}
          </div>
          {jobOffer.contactData.phone && (
            <div className="flex items-center text-sm text-foreground">
              <Phone className="mr-2 h-4 w-4" />
              {jobOffer.contactData.phone}
            </div>
          )}
          <div className="flex items-center text-sm text-foreground">
            <LinkIcon className="mr-2 h-4 w-4" />
            <a
              href={jobOffer.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Zur Bewerbung
            </a>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          Erstellt am {formatJobOfferDate(jobOffer.createdAt)}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <LoadingButton
            variant="outline"
            size="sm"
            className={cn(buttonPreset, 'w-full')}
            onClick={() => navigate(`/job-offers/${jobOffer.id}`)}
          >
            Bearbeiten
          </LoadingButton>
          <LoadingButton
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(jobOffer.id)}
          >
            Löschen
          </LoadingButton>
        </div>
      </div>
    </Card>
  );
}
