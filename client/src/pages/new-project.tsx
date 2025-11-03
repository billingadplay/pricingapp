import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Sparkles, TrendingUp, Users, DollarSign } from "lucide-react";
import { complexityQuestions, type ProjectType, type ComplexityQuestion } from "@shared/schema";
import { ProjectTypeSelector } from "@/components/project-type-selector";
import { PriceCalculator, type PricingData } from "@/components/price-calculator";
import { QuotationGenerator } from "@/components/quotation-generator";

type Step = "type" | "complexity" | "pricing" | "quotation";

export default function NewProject() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("type");
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [complexityRatings, setComplexityRatings] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  
  // Get applicable questions based on project type
  const applicableQuestions = useMemo(() => {
    if (!projectType) return [];
    return complexityQuestions.filter(
      q => !q.applicableTypes || q.applicableTypes.includes(projectType)
    );
  }, [projectType]);

  const currentQuestion = applicableQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / applicableQuestions.length) * 100;

  const handleTypeSelect = (type: ProjectType) => {
    setProjectType(type);
    setStep("complexity");
  };

  const handleRatingChange = (value: number) => {
    if (!currentQuestion) return;
    setComplexityRatings(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < applicableQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep("pricing");
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const canProceed = currentQuestion ? complexityRatings[currentQuestion.id] !== undefined : false;

  // Calculate complexity multiplier
  const complexityMultiplier = useMemo(() => {
    const ratings = Object.entries(complexityRatings);
    if (ratings.length === 0) return 1.0;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    applicableQuestions.forEach(q => {
      const rating = complexityRatings[q.id];
      if (rating !== undefined) {
        weightedSum += (rating / 10) * q.weight;
        totalWeight += q.weight;
      }
    });
    
    return totalWeight > 0 ? 1 + (weightedSum / totalWeight) : 1.0;
  }, [complexityRatings, applicableQuestions]);

  if (step === "type") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-8"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Buat Project Baru</h1>
            <p className="text-lg text-muted-foreground">
              Pilih tipe video project kamu untuk mulai pricing
            </p>
          </div>

          <ProjectTypeSelector onSelect={handleTypeSelect} />
        </div>
      </div>
    );
  }

  if (step === "complexity") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={() => setStep("type")}
            className="mb-8"
            data-testid="button-back-type"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ganti Tipe Project
          </Button>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Pertanyaan {currentQuestionIndex + 1} dari {applicableQuestions.length}
              </span>
              <Badge variant="secondary">
                {Math.round(progress)}% Selesai
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{currentQuestion.question}</CardTitle>
                    {currentQuestion.description && (
                      <CardDescription className="text-base">
                        {currentQuestion.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Rating (1-10)</Label>
                    <Badge variant="outline" className="text-lg font-bold tabular-nums min-w-[3rem] justify-center">
                      {complexityRatings[currentQuestion.id] || 5}
                    </Badge>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[complexityRatings[currentQuestion.id] || 5]}
                    onValueChange={([value]) => handleRatingChange(value)}
                    className="py-4"
                    data-testid={`slider-${currentQuestion.id}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rendah</span>
                    <span>Sedang</span>
                    <span>Tinggi</span>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                  {currentQuestionIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevQuestion}
                      className="gap-2"
                      data-testid="button-prev-question"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Sebelumnya
                    </Button>
                  )}
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!canProceed}
                    className="gap-2 flex-1"
                    data-testid="button-next-question"
                  >
                    {currentQuestionIndex < applicableQuestions.length - 1 ? (
                      <>
                        Selanjutnya
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Lihat Hasil Pricing
                        <DollarSign className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complexity Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preview Complexity Multiplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums">{complexityMultiplier.toFixed(2)}x</span>
                    <span className="text-sm text-muted-foreground">dari base cost</span>
                  </div>
                </div>
                <TrendingUp className={`w-6 h-6 ${complexityMultiplier > 1.5 ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "pricing") {
    return (
      <PriceCalculator
        projectType={projectType!}
        complexityMultiplier={complexityMultiplier}
        complexityRatings={complexityRatings}
        onBack={() => setStep("complexity")}
        onContinue={(data) => {
          setPricingData(data);
          setStep("quotation");
        }}
      />
    );
  }

  if (step === "quotation" && pricingData) {
    return (
      <QuotationGenerator
        projectType={projectType!}
        complexityMultiplier={complexityMultiplier}
        complexityRatings={complexityRatings}
        pricingData={pricingData}
        onBack={() => setStep("pricing")}
      />
    );
  }

  return null;
}
