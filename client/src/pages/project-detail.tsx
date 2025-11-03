import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Download, 
  FileText,
  TrendingUp,
  Users,
  Wrench,
  Calendar,
  DollarSign
} from "lucide-react";
import type { Project } from "@shared/schema";
import { format } from "date-fns";
import { generatePDF } from "@/lib/pdf-generator";

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:id");
  const [, setLocation] = useLocation();
  
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", params?.id],
    enabled: !!params?.id,
  });

  const handleDownloadPDF = () => {
    if (!project) return;
    generatePDF(project);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-6 text-center">
          <CardHeader>
            <CardTitle>Project Tidak Ditemukan</CardTitle>
            <CardDescription>Project yang kamu cari tidak ada</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/dashboard")}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const crewCosts = project.crewCosts as Array<{ role: string; hourlyRate: number; hours: number }> || [];
  const equipmentCosts = project.equipmentCosts as Array<{ item: string; cost: number }> || [];
  const totalCrewCost = crewCosts.reduce((sum, c) => sum + (c.hourlyRate * c.hours), 0);
  const totalEquipmentCost = equipmentCosts.reduce((sum, e) => sum + e.cost, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-8"
          data-testid="button-back-dashboard"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.projectTitle}</h1>
            {project.clientName && (
              <p className="text-lg text-muted-foreground">{project.clientName}</p>
            )}
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(new Date(project.createdAt), "d MMMM yyyy")}
            </div>
          </div>
          <Button onClick={handleDownloadPDF} className="gap-2" data-testid="button-download-pdf">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {/* Pricing Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Base Cost</p>
                <p className="text-2xl font-bold tabular-nums">
                  Rp {parseFloat(project.baseCost).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Complexity Multiplier</p>
                <p className="text-2xl font-bold tabular-nums">
                  {parseFloat(project.complexityMultiplier).toFixed(2)}x
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Final Price</p>
                <p className="text-3xl font-bold tabular-nums text-primary">
                  Rp {parseFloat(project.finalPrice).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complexity Ratings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Complexity Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(project.complexityRatings as Record<string, number>).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key.replace(/_/g, " ")}</span>
                  <Badge variant="secondary" className="font-mono">
                    {value}/10
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crew Costs */}
        {crewCosts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Crew Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crewCosts.map((crew, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{crew.role}</p>
                      <p className="text-sm text-muted-foreground">
                        Rp {crew.hourlyRate.toLocaleString("id-ID")}/jam × {crew.hours} jam
                      </p>
                    </div>
                    <p className="font-bold tabular-nums">
                      Rp {(crew.hourlyRate * crew.hours).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span>Total Crew</span>
                  <span className="tabular-nums">Rp {totalCrewCost.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment Costs */}
        {equipmentCosts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Equipment Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipmentCosts.map((equipment, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <p className="font-medium">{equipment.item}</p>
                    <p className="font-bold tabular-nums">
                      Rp {equipment.cost.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span>Total Equipment</span>
                  <span className="tabular-nums">Rp {totalEquipmentCost.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {project.quotationNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{project.quotationNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
