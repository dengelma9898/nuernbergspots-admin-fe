import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { showSuccessMessage } from '@/utils/errorUtils';
import { downloadCsv } from '@/utils/csvExport';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { useJobOffersManagement } from '@/hooks/useJobOffersManagement';
import { JobOfferCard, JobOfferMobileCard } from '@/components/job-offers/JobOfferCards';
import { JobOffersPageSkeleton } from '@/components/job-offers/JobOfferSkeletons';

export function JobOffersContent() {
  const {
    navigate,
    loading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    homeOfficeFilter,
    setHomeOfficeFilter,
    categories,
    filteredJobOffers,
    handleDelete,
  } = useJobOffersManagement();

  const handleExportCsv = () => {
    if (filteredJobOffers.length === 0) return;
    downloadCsv(
      `job-offers-export-${new Date().toISOString().slice(0, 10)}`,
      filteredJobOffers.map(jobOffer => ({
        id: jobOffer.id,
        title: jobOffer.title,
        typeOfEmployment: jobOffer.typeOfEmployment,
        homeOffice: jobOffer.homeOffice,
        location: jobOffer.location.address,
        startDate: jobOffer.startDate,
        createdAt: jobOffer.createdAt,
      }))
    );
    showSuccessMessage(toast, {
      title: 'Export gestartet',
      description: `${filteredJobOffers.length} Stellenangebote als CSV exportiert.`,
    });
  };

  if (loading) {
    return <JobOffersPageSkeleton />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
        <motion.div
          className={cn(cardPreset, 'p-6 mb-6')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
            <LoadingButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className={cn(buttonPreset, 'rounded-full')}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Zurück zum Dashboard</span>
            </LoadingButton>
            <h1 className="text-xl sm:text-2xl font-bold break-words w-full sm:w-auto text-foreground">
              Stellenangebote
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
              <LoadingButton
                variant="outline"
                onClick={handleExportCsv}
                disabled={filteredJobOffers.length === 0}
                className={cn(buttonPreset, 'w-full sm:w-auto gap-2')}
              >
                <Download className="h-4 w-4" />
                CSV Export
              </LoadingButton>
              <LoadingButton
                onClick={() => navigate('/job-offers/create')}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Stellenangebot hinzufügen
              </LoadingButton>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cn(cardPreset, 'p-6 mb-6')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="relative flex-1 mb-2 md:mb-0">
              <Input
                placeholder="Nach Stellenangebot suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={cn(inputPreset, 'rounded-lg px-1')}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger
                className={cn(inputPreset, 'w-full sm:w-[180px] rounded-lg mb-2 md:mb-0')}
              >
                <SelectValue placeholder="Beschäftigungsart" />
              </SelectTrigger>
              <SelectContent className={cn(cardPreset)}>
                <SelectItem value="all" className="cursor-pointer">
                  Alle Arten
                </SelectItem>
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
            <Select value={homeOfficeFilter} onValueChange={setHomeOfficeFilter}>
              <SelectTrigger className={cn(inputPreset, 'w-full sm:w-[180px] rounded-lg')}>
                <SelectValue placeholder="Home Office" />
              </SelectTrigger>
              <SelectContent className={cn(cardPreset)}>
                <SelectItem value="all" className="cursor-pointer">
                  Alle Optionen
                </SelectItem>
                <SelectItem value="yes" className="cursor-pointer">
                  Mit Home Office
                </SelectItem>
                <SelectItem value="no" className="cursor-pointer">
                  Ohne Home Office
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {filteredJobOffers.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(cardPreset, 'p-8 text-center')}>
              <div className="text-muted-foreground text-lg">Keine Stellenangebote gefunden.</div>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="block md:hidden space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredJobOffers.map(jobOffer => {
                const category =
                  categories.find(cat => cat.id === jobOffer.jobOfferCategoryId) || null;
                return (
                  <motion.div key={jobOffer.id} variants={fadeInUp}>
                    <JobOfferMobileCard
                      jobOffer={jobOffer}
                      category={category}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
            <motion.div
              className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredJobOffers.map(jobOffer => (
                <motion.div key={jobOffer.id} variants={fadeInUp}>
                  <JobOfferCard
                    jobOffer={jobOffer}
                    onDelete={handleDelete}
                    category={
                      categories.find(cat => cat.id === jobOffer.jobOfferCategoryId) || null
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
