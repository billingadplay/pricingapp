import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Download,
  Check,
  FileText,
  Sparkles
} from "lucide-react";
import type { ProjectType } from "@shared/schema";
import type { PricingData } from "@/components/price-calculator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";

interface QuotationGeneratorProps {
  projectType: ProjectType;
  complexityMultiplier: number;
  complexityRatings: Record<string, number>;
  pricingData: PricingData;
  onBack: () => void;
}

const templates = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean and formal layout untuk corporate clients",
    preview: "bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20"
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold design untuk creative agencies",
    preview: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant untuk semua project",
    preview: "bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-950/20 dark:to-zinc-950/20"
  }
];

export function QuotationGenerator({
  projectType,
  complexityMultiplier,
  complexityRatings,
  pricingData,
  onBack
}: QuotationGeneratorProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [notes, setNotes] = useState("");

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success!",
        description: "Project quotation berhasil dibuat",
      });
      
      // Generate PDF
      generatePDF(data);
      
      // Redirect to project detail
      setLocation(`/project/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal membuat project. Coba lagi.",
        variant: "destructive",
      });
    }
  });

  const handleSaveAndExport = () => {
    createProjectMutation.mutate({
      projectType,
      projectTitle: pricingData.projectTitle,
      clientName: pricingData.clientName || null,
      complexityRatings,
      complexityMultiplier: complexityMultiplier.toString(),
      baseCost: pricingData.baseCost.toString(),
      recommendedPrice: pricingData.recommendedPrice.toString(),
      finalPrice: pricingData.finalPrice.toString(),
      monthlyIncomeGoal: pricingData.monthlyIncomeGoal?.toString(),
      livingCost: pricingData.livingCost?.toString(),
      skillLevel: pricingData.skillLevel || null,
      selectedTemplate,
      quotationNotes: notes || null,
      crewCosts: pricingData.crew,
      equipmentCosts: pricingData.equipment,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8"
          data-testid="button-back-pricing"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Edit Pricing
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Quotation</h1>
          <p className="text-muted-foreground">
            Pilih template dan export sebagai PDF
          </p>
        </div>

        {/* Template Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Pilih Template
            </CardTitle>
            <CardDescription>
              Pilih design template untuk quotation PDF kamu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover-elevate ${
                    selectedTemplate === template.id 
                      ? "border-primary border-2" 
                      : "border-2 border-transparent"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                  data-testid={`template-${template.id}`}
                >
                  <CardHeader className="space-y-3">
                    <div className={`h-24 rounded-md ${template.preview} border`} />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {selectedTemplate === template.id && (
                          <Badge className="gap-1">
                            <Check className="w-3 h-3" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quotation Preview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quotation Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Info */}
            <div>
              <h3 className="font-semibold mb-3">Project Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Title</span>
                  <span className="font-medium">{pricingData.projectTitle}</span>
                </div>
                {pricingData.clientName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{pricingData.clientName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Type</span>
                  <Badge variant="secondary">{projectType.replace(/_/g, " ")}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <h3 className="font-semibold mb-3">Pricing Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Cost</span>
                  <span className="font-mono">Rp {(pricingData.baseCost / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Complexity Multiplier</span>
                  <span className="font-mono">{complexityMultiplier.toFixed(2)}x</span>
                </div>
                {pricingData.crew.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crew Costs</span>
                    <span className="font-mono">
                      Rp {(pricingData.crew.reduce((sum, c) => sum + (c.hourlyRate * c.hours), 0) / 1000).toFixed(0)}K
                    </span>
                  </div>
                )}
                {pricingData.equipment.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equipment Costs</span>
                    <span className="font-mono">
                      Rp {(pricingData.equipment.reduce((sum, e) => sum + e.cost, 0) / 1000).toFixed(0)}K
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-semibold">Total Price</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums text-primary">
                      Rp {(pricingData.finalPrice / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rp {pricingData.finalPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <h3 className="font-semibold mb-3">Additional Notes (Optional)</h3>
              <Textarea
                placeholder="Tambahkan catatan atau terms & conditions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                data-testid="textarea-notes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={handleSaveAndExport}
            disabled={createProjectMutation.isPending}
            className="flex-1 gap-2"
            data-testid="button-save-export"
          >
            {createProjectMutation.isPending ? (
              "Menyimpan..."
            ) : (
              <>
                <Download className="w-4 h-4" />
                Save & Export PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
