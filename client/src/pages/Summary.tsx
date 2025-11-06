import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, TrendingUp, Download, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuoteStore } from "@/state/quoteStore";
import { formatCurrency, formatPercentage } from "@/lib/currency";
import type { QuoteOutput } from "@shared/pricing";

export default function Summary() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const {
    draft,
    setQuote,
    setBusiness,
    setContingency,
  } = useQuoteStore();

  const quote = draft.quote;
  const [marginPct, setMarginPct] = useState(draft.business.profitMarginPct ?? 0.1);
  const [contingencyPct, setContingencyPct] = useState(draft.contingencyPct ?? 0.05);
  const isInitial = useRef(true);
  const [isLoading, setIsLoading] = useState(false);

  const subtotalRows = useMemo(() => {
    if (!quote) return [];
    return [
      { label: "Base Crew", value: quote.baseCrew },
      { label: "Base Gear", value: quote.baseGear },
      { label: "Out-of-pocket", value: quote.baseOOP },
      { label: "Base Cost", value: quote.baseCost },
      { label: "Subtotal", value: quote.subtotal },
      { label: `Contingency (${(quote.contingencyPct * 100).toFixed(1)}%)`, value: quote.contingency },
      { label: "Grand Total", value: quote.grandTotal },
      ...(quote.clientPrice !== undefined
        ? [{ label: "Client Price", value: quote.clientPrice }]
        : []),
      ...(quote.nettProfit !== undefined
        ? [{ label: "Estimated Nett Profit", value: quote.nettProfit }]
        : []),
    ];
  }, [quote]);

  const developmentLines: QuoteOutput["breakdown"]["development"] =
    quote?.breakdown.development ?? ([] as QuoteOutput["breakdown"]["development"]);
  const productionLines: QuoteOutput["breakdown"]["production"] =
    quote?.breakdown.production ?? ([] as QuoteOutput["breakdown"]["production"]);

  useEffect(() => {
    setBusiness({ profitMarginPct: marginPct });
  }, [marginPct, setBusiness]);

  useEffect(() => {
    setContingency(contingencyPct);
  }, [contingencyPct, setContingency]);

  useEffect(() => {
    if (!quote) return;
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      if (!draft.projectType) return;
      const payload = {
        projectType: draft.projectType,
        basic: draft.basic,
        crew: draft.crew,
        gear: draft.gear,
        oop: draft.oop,
        complexity: { answers: draft.complexityAnswers },
        business: { ...draft.business, profitMarginPct: marginPct },
        contingencyPct: contingencyPct,
      };
      try {
        setIsLoading(true);
        const res = await apiRequest("POST", "/api/quote/preview", payload);
        const data = await res.json();
        if (!controller.signal.aborted) {
          setQuote(data);
        }
      } catch (error) {
        console.error(error);
        toast({ title: "Failed to update pricing", description: (error as Error).message, variant: "destructive" });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    const timeout = setTimeout(run, 250);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [
    marginPct,
    contingencyPct,
    draft.projectType,
    draft.basic,
    draft.crew,
    draft.gear,
    draft.oop,
    draft.complexityAnswers,
    setQuote,
    toast,
  ]);

  const handleSave = async () => {
    if (!draft.projectType || !quote) {
      toast({ title: "Nothing to save", description: "Preview a quote first.", variant: "destructive" });
      navigate("/builder");
      return;
    }

    const payload = {
      projectType: draft.projectType,
      basic: draft.basic,
      crew: draft.crew,
      gear: draft.gear,
      oop: draft.oop,
      complexity: { answers: draft.complexityAnswers },
      business: draft.business,
      contingencyPct: draft.contingencyPct,
      meta: draft.meta,
    };

    try {
      const res = await apiRequest("POST", "/api/projects", payload);
      await res.json();
      toast({ title: "Project saved", description: "The quote was stored successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Save failed", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleExport = async () => {
    if (!quote) {
      toast({ title: "Preview first", description: "Generate the quote before exporting.", variant: "destructive" });
      return;
    }
    try {
      const res = await apiRequest("POST", "/api/export/pdf", {
        quote,
        meta: draft.meta,
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "quote.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "PDF ready", description: "Quote exported successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Export failed", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (!quote) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-600">Build a quote first to see the summary.</p>
        <Button onClick={() => navigate("/builder")}>Go to Builder</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 print:max-w-full print:px-12 print:py-8">
        {/* Header */}
        <header className="print:mb-4">
          <h1 className="text-3xl font-bold text-slate-900 print:text-2xl">Pricing Summary</h1>
          <p className="mt-1 text-sm text-slate-600 print:hidden">
            Review the breakdown, adjust your margin, and export when ready.
          </p>
        </header>

        {/* Controls (hidden in print) */}
        <div className="grid gap-6 print:hidden md:grid-cols-2">
          {/* Profit Margin Control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profit Margin</CardTitle>
              <CardDescription>Adjust your markup percentage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Markup</span>
                <span className="text-lg font-semibold text-slate-900">
                  {formatPercentage(marginPct, 1)}
                </span>
              </div>
              <Slider
                value={[marginPct]}
                min={0}
                max={0.5}
                step={0.01}
                onValueChange={([value]) => setMarginPct(Number(value.toFixed(2)))}
                className="py-2"
              />
              <p className="text-xs text-slate-500">
                Slide to adjust profit margin (0-50%)
              </p>
            </CardContent>
          </Card>

          {/* Contingency Control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contingency Buffer</CardTitle>
              <CardDescription>Safety margin for unexpected costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contingency" className="text-sm text-slate-600">
                  Contingency Percentage
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="contingency"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={(contingencyPct * 100).toFixed(1)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) / 100;
                      if (value >= 0 && value <= 0.2) {
                        setContingencyPct(value);
                      }
                    }}
                    className="w-24"
                  />
                  <span className="text-sm text-slate-600">%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Recommended: 5-10% for most projects
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading && (
          <Alert className="print:hidden">
            <Info className="h-4 w-4" />
            <AlertTitle>Recalculating</AlertTitle>
            <AlertDescription>Updating totals based on your changes...</AlertDescription>
          </Alert>
        )}

        {/* Breakdown Tables */}
        <div className="grid gap-6 print:gap-4 md:grid-cols-2 print:grid-cols-2">
          {/* Crew Table */}
          <Card className="print:shadow-none print:border-slate-300">
            <CardHeader className="print:pb-3">
              <CardTitle className="text-base font-semibold">Development (Crew)</CardTitle>
            </CardHeader>
            <CardContent className="print:px-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-300">
                    <TableHead className="text-xs font-semibold print:py-2">Role</TableHead>
                    <TableHead className="text-right text-xs font-semibold print:py-2">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {developmentLines.map((line, index) => (
                    <TableRow key={index} className="border-slate-200">
                      <TableCell className="py-2 text-sm print:py-1.5 print:text-xs">{line.role}</TableCell>
                      <TableCell className="py-2 text-right text-sm font-medium print:py-1.5 print:text-xs">
                        {formatCurrency(line.lineTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Gear & Logistics Table */}
          <Card className="print:shadow-none print:border-slate-300">
            <CardHeader className="print:pb-3">
              <CardTitle className="text-base font-semibold">Production (Gear & Logistics)</CardTitle>
            </CardHeader>
            <CardContent className="print:px-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-300">
                    <TableHead className="text-xs font-semibold print:py-2">Item</TableHead>
                    <TableHead className="text-right text-xs font-semibold print:py-2">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionLines.map((line, index) => (
                    <TableRow key={index} className="border-slate-200">
                      <TableCell className="py-2 text-sm print:py-1.5 print:text-xs">{line.name}</TableCell>
                      <TableCell className="py-2 text-right text-sm font-medium print:py-1.5 print:text-xs">
                        {formatCurrency(line.lineTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Totals Summary */}
        <Card className="border-2 border-slate-200 print:shadow-none print:border-slate-400">
          <CardHeader className="print:pb-3">
            <CardTitle className="text-lg font-bold">Cost Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 print:space-y-0.5">
            {subtotalRows.map((row, index) => {
              const isHighlight = index >= subtotalRows.length - 2;
              const isGrandTotal = row.label === "Grand Total";
              const isClientPrice = row.label === "Client Price";

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between border-b border-slate-100 py-2 last:border-0 print:py-1.5 ${
                    isGrandTotal ? "border-t-2 border-slate-300 pt-3 print:pt-2" : ""
                  } ${isClientPrice ? "bg-slate-50 -mx-6 px-6 print:bg-slate-100 print:-mx-4 print:px-4" : ""}`}
                >
                  <span
                    className={`text-sm ${
                      isHighlight ? "font-semibold text-slate-900" : "text-slate-700"
                    } ${isClientPrice ? "font-bold" : ""} print:text-xs`}
                  >
                    {row.label}
                  </span>
                  <span
                    className={`text-sm ${
                      isHighlight ? "font-bold text-slate-900" : "font-medium text-slate-700"
                    } ${isClientPrice ? "text-lg text-slate-900" : ""} print:text-xs`}
                  >
                    {formatCurrency(row.value)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Market Insights Placeholder */}
        <Alert className="border-blue-200 bg-blue-50 print:border-blue-300">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Market Insights (Coming Soon)</AlertTitle>
          <AlertDescription className="text-sm text-blue-800">
            We're building a feature to compare your quote against industry benchmarks. Soon you'll see:
            <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
              <li>Median pricing for similar projects (50th percentile)</li>
              <li>Premium tier benchmarks (80th percentile)</li>
              <li>Position of your quote relative to market data</li>
              <li>Insights based on project type, duration, and complexity</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 print:hidden">
          <Button onClick={handleSave} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            Save Project
          </Button>
          <Button variant="outline" onClick={handleExport} size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="ghost" onClick={() => navigate("/builder")} size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Builder
          </Button>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block print:mt-8 print:border-t print:border-slate-300 print:pt-4">
          <p className="text-xs text-slate-600 text-center">
            Generated with PriceRight • Professional Videography Pricing Tool
          </p>
        </div>
      </div>
    </div>
  );
}
