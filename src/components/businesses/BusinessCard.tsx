import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Tag,
  Pencil,
  Image as ImageIcon,
} from 'lucide-react';
import { Business, BusinessStatus } from '@/models/business';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  categoryNames: string;
  onEdit: (business: Business) => void;
  index?: number;
}

const getStatusBadge = (status: BusinessStatus) => {
  switch (status) {
    case BusinessStatus.ACTIVE:
      return {
        label: 'Aktiv',
        icon: <CheckCircle2 className="h-4 w-4" />,
        variant: 'default' as const,
      };
    case BusinessStatus.PENDING:
      return {
        label: 'Ausstehend',
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'outline' as const,
      };
    case BusinessStatus.INACTIVE:
      return {
        label: 'Inaktiv',
        icon: <XCircle className="h-4 w-4" />,
        variant: 'secondary' as const,
      };
    default:
      return {
        label: 'Unbekannt',
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'secondary' as const,
      };
  }
};

const formatAddress = (address: Business['address']) => {
  return `${address.street} ${address.houseNumber}, ${address.postalCode} ${address.city}`;
};

const formatOpeningHours = (hours: Record<string, Array<{ from: string; to: string }>>) => {
  if (!hours) return 'Keine Öffnungszeiten angegeben';
  const days = Object.keys(hours);
  if (days.length === 0) return 'Keine Öffnungszeiten angegeben';
  return `${days.length} Tage mit Öffnungszeiten`;
};

const formatDate = (date: string) => {
  return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
};

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  categoryNames,
  onEdit,
  index = 0,
}) => {
  const status = getStatusBadge(business.status);

  return (
    <AnimatedCard index={index} className={cn(glassCard, 'overflow-hidden')}>
      {business.imageUrls && business.imageUrls.length > 0 && (
        <div className="relative h-48 w-full">
          <img
            src={business.imageUrls[0]}
            alt={business.name}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          {business.imageUrls.length > 1 && (
            <div className="absolute top-3 right-3 bg-background/80 border border-secondary text-foreground rounded-xl px-2 py-1 text-xs font-medium flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />+{business.imageUrls.length - 1}
            </div>
          )}
          {business.isPromoted && (
            <div className="absolute top-3 left-3 bg-yellow-500/80 border border-yellow-400/50 text-white rounded-xl px-2 py-1 text-xs font-medium flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Highlight
            </div>
          )}
        </div>
      )}
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3 flex-1">
            {business.logoUrl && (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-secondary bg-muted">
                <img
                  src={business.logoUrl}
                  alt={`${business.name} Logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{business.name}</h3>
              <p className="text-sm text-muted-foreground">
                Kategorien: {categoryNames}
              </p>
            </div>
          </div>
          <Badge variant={status.variant} className="text-xs flex items-center gap-1 px-2 py-1 shrink-0">
            {status.icon}
            <span>{status.label}</span>
          </Badge>
        </div>

        <p className="text-sm text-foreground/80 line-clamp-3 mb-4">{business.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-foreground/90">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="truncate">{formatAddress(business.address)}</span>
          </div>
          {business.contact.phoneNumber && (
            <div className="flex items-center text-sm text-foreground/90">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
              {business.contact.phoneNumber}
            </div>
          )}
          {business.contact.email && (
            <div className="flex items-center text-sm text-foreground/90">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              {business.contact.email}
            </div>
          )}
          {business.contact.website && (
            <div className="flex items-center text-sm text-foreground/90">
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
              <a
                href={business.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors hover:underline"
              >
                Website besuchen
              </a>
            </div>
          )}
          <div className="flex items-center text-sm text-foreground/90">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            {formatOpeningHours(business.detailedOpeningHours)}
          </div>
          {business.keywordIds && business.keywordIds.length > 0 && (
            <div className="flex items-center text-sm text-foreground/90">
              <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
              {business.keywordIds.length} Keywords
            </div>
          )}
          {business.nuernbergspotsReview?.reviewText && (
            <div className="flex items-center text-sm text-foreground/90">
              <Star className="mr-2 h-4 w-4 text-yellow-400" />
              Nuernbergspots Review vorhanden
            </div>
          )}
          {business.isPromoted && (
            <div className="flex items-center text-sm">
              <Star className="mr-2 h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">Highlight Partner</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-secondary">
          <div className="text-xs text-muted-foreground">
            Erstellt am {formatDate(business.createdAt)}
          </div>
          <div className="flex gap-2">
            <AnimatedButton
              variant="outline"
              size="icon"
              onClick={() => onEdit(business)}
              className={cn(glassButton)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Bearbeiten</span>
            </AnimatedButton>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

