import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BusinessAnalytics } from "@/models/business";

interface PricingCalculatorProps {
  analytics: BusinessAnalytics[];
}

interface PricingModel {
  baseFee: number;
  scanThreshold: number;
  scanFee: number;
  maxFee: number | null;
}

export function PricingCalculator({ analytics }: PricingCalculatorProps) {
  const [pricingModel, setPricingModel] = useState<PricingModel>({
    baseFee: 29.99,
    scanThreshold: 100,
    scanFee: 0.10,
    maxFee: 99.99
  });

  const [hasMaxFee, setHasMaxFee] = useState(true);
  const [projectedRevenue, setProjectedRevenue] = useState<{
    total: number;
    perBusiness: Record<string, number>;
  }>({ total: 0, perBusiness: {} });

  useEffect(() => {
    calculateProjectedRevenue();
  }, [pricingModel, hasMaxFee, analytics]);

  const calculateProjectedRevenue = () => {
    let total = 0;
    const perBusiness: Record<string, number> = {};

    analytics.forEach(business => {
      let fee = pricingModel.baseFee;
      
      if (business.monthlyScans > pricingModel.scanThreshold) {
        const additionalScans = business.monthlyScans - pricingModel.scanThreshold;
        fee += additionalScans * pricingModel.scanFee;
      }

      if (hasMaxFee && pricingModel.maxFee && fee > pricingModel.maxFee) {
        fee = pricingModel.maxFee;
      }

      perBusiness[business.businessName] = fee;
      total += fee;
    });

    setProjectedRevenue({ total, perBusiness });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Preismodell Rechner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Grundgebühr (€/Monat)</Label>
            <Slider
              value={[pricingModel.baseFee]}
              onValueChange={([value]) => setPricingModel(prev => ({ ...prev, baseFee: value }))}
              min={0}
              max={100}
              step={0.01}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {pricingModel.baseFee.toFixed(2)}€
            </div>
          </div>

          <div>
            <Label>Scan-Schwelle</Label>
            <Slider
              value={[pricingModel.scanThreshold]}
              onValueChange={([value]) => setPricingModel(prev => ({ ...prev, scanThreshold: value }))}
              min={0}
              max={1000}
              step={10}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {pricingModel.scanThreshold} Scans
            </div>
          </div>

          <div>
            <Label>Gebühr pro zusätzlichem Scan (€)</Label>
            <Slider
              value={[pricingModel.scanFee]}
              onValueChange={([value]) => setPricingModel(prev => ({ ...prev, scanFee: value }))}
              min={0}
              max={1}
              step={0.01}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {pricingModel.scanFee.toFixed(2)}€
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={hasMaxFee}
              onCheckedChange={setHasMaxFee}
            />
            <Label>Maximale Gebühr aktivieren</Label>
          </div>

          {hasMaxFee && (
            <div>
              <Label>Maximale Gebühr (€/Monat)</Label>
              <Slider
                value={[pricingModel.maxFee || 0]}
                onValueChange={([value]) => setPricingModel(prev => ({ ...prev, maxFee: value }))}
                min={0}
                max={200}
                step={0.01}
              />
              <div className="text-sm text-muted-foreground mt-1">
                {pricingModel.maxFee?.toFixed(2)}€
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-2">Prognostizierte Einnahmen</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Gesamt pro Monat:</span>
              <span className="font-bold">{projectedRevenue.total.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span>Durchschnitt pro Partner:</span>
              <span className="font-bold">
                {(projectedRevenue.total / analytics.length).toFixed(2)}€
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Gebühren pro Partner:</h4>
            <div className="space-y-1">
              {Object.entries(projectedRevenue.perBusiness).map(([business, fee]) => (
                <div key={business} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{business}</span>
                  <span>{fee.toFixed(2)}€</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 