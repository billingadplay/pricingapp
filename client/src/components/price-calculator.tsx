import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  DollarSign, 
  TrendingUp,
  Target,
  Briefcase,
  Award,
  Users as UsersIcon,
  Plus,
  X,
  Info,
  Lightbulb
} from "lucide-react";
import type { ProjectType, SkillLevel, MarketBenchmark } from "@shared/schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface PricingData {
  projectTitle: string;
  clientName: string;
  baseCost: number;
  recommendedPrice: number;
  finalPrice: number;
  monthlyIncomeGoal?: number;
  livingCost?: number;
  skillLevel?: SkillLevel;
  crew: CrewMember[];
  equipment: Equipment[];
}

interface PriceCalculatorProps {
  projectType: ProjectType;
  complexityMultiplier: number;
  complexityRatings: Record<string, number>;
  onBack: () => void;
  onContinue: (data: PricingData) => void;
}

interface CrewMember {
  role: string;
  hourlyRate: number;
  hours: number;
}

interface Equipment {
  item: string;
  cost: number;
}

export function PriceCalculator({
  projectType,
  complexityMultiplier,
  complexityRatings,
  onBack,
  onContinue
}: PriceCalculatorProps) {
  const [projectTitle, setProjectTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [baseCost, setBaseCost] = useState(5000000);
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState<number>();
  const [livingCost, setLivingCost] = useState<number>();
  const [skillLevel, setSkillLevel] = useState<SkillLevel>();
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showRefinement, setShowRefinement] = useState(false);

  // Fetch market benchmarks
  const { data: benchmarks = [] } = useQuery<MarketBenchmark[]>({
    queryKey: ["/api/market-benchmarks", projectType],
  });

  const marketAverage = useMemo(() => {
    const relevantBenchmarks = benchmarks.filter(b => 
      b.projectType === projectType &&
      (!skillLevel || b.skillLevel === skillLevel)
    );
    
    if (relevantBenchmarks.length === 0) return null;
    
    const avgPrice = relevantBenchmarks.reduce((sum, b) => sum + parseFloat(b.price), 0) / relevantBenchmarks.length;
    return avgPrice;
  }, [benchmarks, projectType, skillLevel]);

  // Calculate prices
  const calculatedPrice = baseCost * complexityMultiplier;
  
  const totalCrewCost = crew.reduce((sum, c) => sum + (c.hourlyRate * c.hours), 0);
  const totalEquipmentCost = equipment.reduce((sum, e) => sum + e.cost, 0);
  const additionalCosts = totalCrewCost + totalEquipmentCost;

  const recommendedPrice = useMemo(() => {
    let price = calculatedPrice + additionalCosts;
    
    // Factor in personal goals if provided
    if (monthlyIncomeGoal && livingCost) {
      const targetPerProject = (monthlyIncomeGoal + livingCost) / 4; // Assume 4 projects per month
      price = Math.max(price, targetPerProject);
    }
    
    // Skill level adjustment
    if (skillLevel === "pro") {
      price *= 1.2;
    } else if (skillLevel === "beginner") {
      price *= 0.8;
    }
    
    return price;
  }, [calculatedPrice, additionalCosts, monthlyIncomeGoal, livingCost, skillLevel]);

  const addCrewMember = () => {
    setCrew([...crew, { role: "", hourlyRate: 100000, hours: 8 }]);
  };

  const removeCrewMember = (index: number) => {
    setCrew(crew.filter((_, i) => i !== index));
  };

  const updateCrewMember = (index: number, field: keyof CrewMember, value: string | number) => {
    const updated = [...crew];
    updated[index] = { ...updated[index], [field]: value };
    setCrew(updated);
  };

  const addEquipment = () => {
    setEquipment([...equipment, { item: "", cost: 500000 }]);
  };

  const removeEquipment = (index: number) => {
    setEquipment(equipment.filter((_, i) => i !== index));
  };

  const updateEquipment = (index: number, field: keyof Equipment, value: string | number) => {
    const updated = [...equipment];
    updated[index] = { ...updated[index], [field]: value };
    setEquipment(updated);
  };

  const handleContinue = () => {
    if (!projectTitle) return;
    onContinue({ 
      projectTitle, 
      clientName,
      baseCost,
      recommendedPrice,
      finalPrice: recommendedPrice,
      monthlyIncomeGoal,
      livingCost,
      skillLevel,
      crew,
      equipment
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8"
          data-testid="button-back-complexity"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Edit Complexity Ratings
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Price Calculator</h1>
          <p className="text-muted-foreground">
            Hitung harga project berdasarkan complexity dan goals kamu
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    placeholder="e.g., Company Profile PT ABC"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    data-testid="input-project-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name (Optional)</Label>
                  <Input
                    id="clientName"
                    placeholder="e.g., PT ABC Indonesia"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    data-testid="input-client-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseCost">Base Cost (Rp)</Label>
                  <Input
                    id="baseCost"
                    type="number"
                    value={baseCost}
                    onChange={(e) => setBaseCost(Number(e.target.value))}
                    data-testid="input-base-cost"
                  />
                  <p className="text-xs text-muted-foreground">
                    Biaya dasar sebelum complexity multiplier
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Refinement Options */}
            <Collapsible open={showRefinement} onOpenChange={setShowRefinement}>
              <Card>
                <CollapsibleTrigger className="w-full" asChild>
                  <CardHeader className="cursor-pointer hover-elevate">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Personal Goals & Refinement
                      </CardTitle>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                    <CardDescription>
                      Tambahkan goals pribadi untuk recommended price yang lebih akurat
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyGoal">Monthly Income Goal (Rp)</Label>
                      <Input
                        id="monthlyGoal"
                        type="number"
                        placeholder="e.g., 20000000"
                        value={monthlyIncomeGoal || ""}
                        onChange={(e) => setMonthlyIncomeGoal(e.target.value ? Number(e.target.value) : undefined)}
                        data-testid="input-monthly-goal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="livingCost">Monthly Living Cost (Rp)</Label>
                      <Input
                        id="livingCost"
                        type="number"
                        placeholder="e.g., 8000000"
                        value={livingCost || ""}
                        onChange={(e) => setLivingCost(e.target.value ? Number(e.target.value) : undefined)}
                        data-testid="input-living-cost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skillLevel">Skill Level</Label>
                      <Select value={skillLevel} onValueChange={(v) => setSkillLevel(v as SkillLevel)}>
                        <SelectTrigger id="skillLevel" data-testid="select-skill-level">
                          <SelectValue placeholder="Pilih skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="pro">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Crew Costs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    Crew Costs
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={addCrewMember} data-testid="button-add-crew">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {crew.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada crew. Klik + untuk menambah
                  </p>
                ) : (
                  crew.map((member, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Role"
                        value={member.role}
                        onChange={(e) => updateCrewMember(idx, "role", e.target.value)}
                        className="flex-1"
                        data-testid={`input-crew-role-${idx}`}
                      />
                      <Input
                        type="number"
                        placeholder="Rate/hr"
                        value={member.hourlyRate}
                        onChange={(e) => updateCrewMember(idx, "hourlyRate", Number(e.target.value))}
                        className="w-28"
                        data-testid={`input-crew-rate-${idx}`}
                      />
                      <Input
                        type="number"
                        placeholder="Hours"
                        value={member.hours}
                        onChange={(e) => updateCrewMember(idx, "hours", Number(e.target.value))}
                        className="w-20"
                        data-testid={`input-crew-hours-${idx}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeCrewMember(idx)}
                        data-testid={`button-remove-crew-${idx}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Equipment Costs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Equipment Costs</CardTitle>
                  <Button size="sm" variant="outline" onClick={addEquipment} data-testid="button-add-equipment">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {equipment.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada equipment. Klik + untuk menambah
                  </p>
                ) : (
                  equipment.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Item name"
                        value={item.item}
                        onChange={(e) => updateEquipment(idx, "item", e.target.value)}
                        className="flex-1"
                        data-testid={`input-equipment-name-${idx}`}
                      />
                      <Input
                        type="number"
                        placeholder="Cost"
                        value={item.cost}
                        onChange={(e) => updateEquipment(idx, "cost", Number(e.target.value))}
                        className="w-32"
                        data-testid={`input-equipment-cost-${idx}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeEquipment(idx)}
                        data-testid={`button-remove-equipment-${idx}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Display */}
          <div className="space-y-6">
            {/* Market Benchmark */}
            {marketAverage && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Market Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Videographers lain charge rata-rata:
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    Rp {(marketAverage / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on {benchmarks.filter(b => b.projectType === projectType).length} similar projects
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Price Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Cost</span>
                    <span className="font-mono">Rp {(baseCost / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Complexity Multiplier</span>
                    <span className="font-mono">{complexityMultiplier.toFixed(2)}x</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Calculated Price</span>
                    <span className="font-mono">Rp {(calculatedPrice / 1000).toFixed(0)}K</span>
                  </div>
                  {totalCrewCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Crew Costs</span>
                      <span className="font-mono">Rp {(totalCrewCost / 1000).toFixed(0)}K</span>
                    </div>
                  )}
                  {totalEquipmentCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Equipment Costs</span>
                      <span className="font-mono">Rp {(totalEquipmentCost / 1000).toFixed(0)}K</span>
                    </div>
                  )}
                  <Separator />
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium">Recommended Price</span>
                      <div className="text-right">
                        <p className="text-3xl font-bold tabular-nums text-primary">
                          Rp {(recommendedPrice / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ~Rp {recommendedPrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {(monthlyIncomeGoal || skillLevel) && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="w-3 h-3" />
                      <span>Adjusted for personal goals</span>
                    </div>
                    {monthlyIncomeGoal && livingCost && (
                      <p className="text-xs text-muted-foreground">
                        Target per project: Rp {((monthlyIncomeGoal + livingCost) / 4 / 1000).toFixed(0)}K
                      </p>
                    )}
                    {skillLevel && (
                      <Badge variant="secondary" className="gap-1">
                        <Award className="w-3 h-3" />
                        {skillLevel === "pro" ? "+20%" : skillLevel === "beginner" ? "-20%" : "No adjustment"}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Continue Button */}
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!projectTitle}
              className="w-full gap-2"
              data-testid="button-continue-quotation"
            >
              Buat Quotation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
