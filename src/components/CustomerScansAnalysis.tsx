import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { BusinessCustomerScans } from '@/models/business';

interface CustomerScansAnalysisProps {
  businesses: BusinessCustomerScans[];
}

export function CustomerScansAnalysis({ businesses }: CustomerScansAnalysisProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  // Generiere die letzten 12 Monate für die Monatsauswahl
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: de })
      };
    });
  }, []);

  // Filtere Scans für den ausgewählten Monat
  const filteredScans = useMemo(() => {
    if (!selectedBusiness) return [];
    
    const business = businesses.find(b => b.businessName === selectedBusiness);
    if (!business) return [];

    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));

    return business.customerScans.filter(scan => {
      const scanDate = new Date(scan.scannedAt);
      return isWithinInterval(scanDate, { start: monthStart, end: monthEnd });
    });
  }, [selectedBusiness, selectedMonth, businesses]);

  // Berechne Statistiken für die gefilterten Scans
  const statistics = useMemo(() => {
    if (filteredScans.length === 0) return {
      totalScans: 0,
      averagePrice: 0,
      averageNumberOfPeople: 0,
      uniqueCustomers: new Set().size
    };

    const uniqueCustomers = new Set(filteredScans.map(scan => scan.customerId));
    const totalPrice = filteredScans.reduce((sum, scan) => sum + (scan.price || 0), 0);
    const totalPeople = filteredScans.reduce((sum, scan) => sum + (scan.numberOfPeople || 1), 0);

    return {
      totalScans: filteredScans.length,
      averagePrice: totalPrice / filteredScans.length,
      averageNumberOfPeople: totalPeople / filteredScans.length,
      uniqueCustomers: uniqueCustomers.size
    };
  }, [filteredScans]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Detaillierte Scan-Analyse</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Partner auswählen</label>
          <Select
            value={selectedBusiness}
            onValueChange={setSelectedBusiness}
          >
            <SelectTrigger>
              <SelectValue placeholder="Partner auswählen" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((business) => (
                <SelectItem key={business.businessName} value={business.businessName}>
                  {business.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Monat auswählen</label>
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger>
              <SelectValue placeholder="Monat auswählen" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedBusiness && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Gesamtscans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalScans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Unique Kunden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.uniqueCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ø Preis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averagePrice.toFixed(2)}€</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ø Personen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageNumberOfPeople.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedBusiness && filteredScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Details</CardTitle>
            <CardDescription>
              Alle Scans für {format(new Date(selectedMonth), 'MMMM yyyy', { locale: de })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Uhrzeit</TableHead>
                  <TableHead>Kunden-ID</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Personen</TableHead>
                  <TableHead>Benefit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.map((scan, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {format(new Date(scan.scannedAt), 'dd.MM.yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(scan.scannedAt), 'HH:mm')}
                    </TableCell>
                    <TableCell>{scan.customerId}</TableCell>
                    <TableCell>{scan.price ? `${scan.price.toFixed(2)}€` : '-'}</TableCell>
                    <TableCell>{scan.numberOfPeople || 1}</TableCell>
                    <TableCell>{scan.benefit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 