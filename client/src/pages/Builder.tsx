import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { computeBaseTotals, applyAutoRules, computeLineTotal } from "@/lib/pricing-preview";
import { useQuoteStore, type FlagsState, type OutputsState } from "@/state/quoteStore";
import { TEMPLATE_CONFIGS, type CrewLineInput, type GearLineInput } from "@shared/pricing";
import { Plus, Trash2 } from "lucide-react";

const FLAG_FIELDS: ReadonlyArray<{ key: keyof FlagsState; label: string }> = [
  { key: "animations", label: "Animations" },
  { key: "voiceover", label: "Voiceover" },
  { key: "sfx", label: "Special FX" },
];

const OUTPUT_FIELDS: ReadonlyArray<{ key: keyof OutputsState; label: string }> = [
  { key: "portrait", label: "Portrait Cut" },
  { key: "cut15", label: "15s" },
  { key: "cut30", label: "30s" },
  { key: "cut60", label: "60s" },
];

const COMPLEXITY_LABELS = [
  "Portfolio value",
  "Creative complexity",
  "Revision risk",
  "Outsource requirement",
  "Client DIY difficulty",
  "Client scale",
  "Hospitality needs",
  "Client type",
  "Concept ownership",
  "Logistics complexity",
];

function updateCrewLine(lines: CrewLineInput[], index: number, update: Partial<CrewLineInput>) {
  return lines.map((line, idx) => (idx === index ? { ...line, ...update } : line));
}

function updateGearLine(lines: GearLineInput[], index: number, update: Partial<GearLineInput>) {
  return lines.map((line, idx) => (idx === index ? { ...line, ...update } : line));
}

export default function Builder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    draft,
    updateBasic,
    setCrew,
    setGear,
    setOOP,
    setComplexityAnswers,
    setBusiness,
    setMeta,
    setQuote,
  } = useQuoteStore();

  const projectSelected = Boolean(draft.projectType);

  const toggleFlag = (key: keyof FlagsState, checked: boolean) => {
    updateBasic({ flags: { ...draft.basic.flags, [key]: checked } });
  };

  const toggleOutput = (key: keyof OutputsState, checked: boolean) => {
    updateBasic({ outputs: { ...draft.basic.outputs, [key]: checked } });
  };

  const addCrewLine = () => {
    setCrew([
      ...draft.crew,
      { role: "New Role", qty: 1, days: 1, ratePerDay: 1_000_000 },
    ]);
  };

  const removeCrewLine = (index: number) => {
    setCrew(draft.crew.filter((_, idx) => idx !== index));
  };

  const addGearLine = () => {
    setGear([
      ...draft.gear,
      { name: "New Item", qty: 1, days: 1, ratePerDay: 250_000 },
    ]);
  };

  const removeGearLine = (index: number) => {
    setGear(draft.gear.filter((_, idx) => idx !== index));
  };

  const basePreview = computeBaseTotals(draft.crew, draft.gear, draft.oop);

  useEffect(() => {
    if (!draft.projectType) return;
    const template = TEMPLATE_CONFIGS[draft.projectType];
    const { crew: newCrew, gear: newGear, changed } = applyAutoRules({
      projectType: draft.projectType,
      crew: draft.crew,
      gear: draft.gear,
      flags: draft.basic.flags,
      outputs: draft.basic.outputs,
      template,
    });

    if (changed) {
      if (newCrew !== draft.crew) {
        setCrew(newCrew);
      }
      if (newGear !== draft.gear) {
        setGear(newGear);
      }
    }
  }, [draft.projectType, draft.basic.flags, draft.basic.outputs, draft.crew, draft.gear, setCrew, setGear]);

  const handlePreview = async () => {
    if (!draft.projectType) {
      toast({ title: "Select a project type", description: "Pick a project type on the home screen before building a quote.", variant: "destructive" });
      navigate("/");
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
    };

    try {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/quote/preview", payload);
      const data = await res.json();
      setQuote(data);
      toast({ title: "Pricing ready", description: "Review the numbers on the summary screen." });
      navigate("/summary");
    } catch (error) {
      console.error(error);
      toast({ title: "Preview failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Project Builder</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the essentials, adjust crew & gear, and preview pricing. All changes are saved locally.
          </p>
        </div>

        {!projectSelected && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="py-4 text-sm text-amber-800">
              Start from the home screen to select a project type and load default presets.
              <Button variant="ghost" className="pl-2" onClick={() => navigate("/")}>Go Home</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Inputs</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      value={draft.basic.durationMin}
                      onChange={(event) =>
                        updateBasic({ durationMin: Number(event.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery">Delivery timeline (days)</Label>
                    <Input
                      id="delivery"
                      type="number"
                      min={1}
                      value={draft.basic.deliveryDays}
                      onChange={(event) =>
                        updateBasic({ deliveryDays: Number(event.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Complexity flags</Label>
                    <div className="mt-2 space-y-2">
                      {FLAG_FIELDS.map((field) => (
                        <label key={field.key} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={Boolean(draft.basic.flags[field.key])}
                            onCheckedChange={(value) =>
                              toggleFlag(field.key, Boolean(value))
                            }
                          />
                          {field.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Deliverables</Label>
                    <div className="mt-2 space-y-2">
                      {OUTPUT_FIELDS.map((field) => (
                        <label key={field.key} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={Boolean(draft.basic.outputs[field.key])}
                            onCheckedChange={(value) =>
                              toggleOutput(field.key, Boolean(value))
                            }
                          />
                          {field.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="brief">Project brief</Label>
                  <Textarea
                    id="brief"
                    rows={3}
                    value={draft.basic.brief}
                    onChange={(event) => updateBasic({ brief: event.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Complexity (0 – 5)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                {draft.complexityAnswers.map((value, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{COMPLEXITY_LABELS[index]}</Label>
                      <span className="text-sm font-semibold text-slate-900 min-w-[2ch] text-center">
                        {value}
                      </span>
                    </div>
                    <Slider
                      value={[value]}
                      min={0}
                      max={5}
                      step={1}
                      onValueChange={([newValue]) => {
                        const answers = [...draft.complexityAnswers];
                        answers[index] = newValue;
                        setComplexityAnswers(answers);
                      }}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0 - Low</span>
                      <span>5 - High</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Crew</CardTitle>
                <Button variant="outline" size="icon" onClick={addCrewLine}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Rate / Day</TableHead>
                      <TableHead>Line Total</TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draft.crew.map((line, index) => {
                      const lineTotal = computeLineTotal(line);
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={line.role}
                              onChange={(event) =>
                                setCrew(updateCrewLine(draft.crew, index, { role: event.target.value }))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={line.qty}
                              onChange={(event) =>
                                setCrew(
                                  updateCrewLine(draft.crew, index, {
                                    qty: Number(event.target.value),
                                  }),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={line.days}
                              onChange={(event) =>
                                setCrew(
                                  updateCrewLine(draft.crew, index, {
                                    days: Number(event.target.value),
                                  }),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={line.ratePerDay}
                              onChange={(event) =>
                                setCrew(
                                  updateCrewLine(draft.crew, index, {
                                    ratePerDay: Number(event.target.value),
                                  }),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            Rp {lineTotal.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeCrewLine(index)}>
                              <Trash2 className="h-4 w-4 text-slate-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Gear &amp; OOP</CardTitle>
                <Button variant="outline" size="icon" onClick={addGearLine}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Rate / Day</TableHead>
                      <TableHead>Line Total</TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draft.gear.map((line, index) => {
                      const lineTotal = computeLineTotal(line);
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={line.name}
                              onChange={(event) =>
                                setGear(updateGearLine(draft.gear, index, { name: event.target.value }))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={line.qty}
                              onChange={(event) =>
                                setGear(
                                  updateGearLine(draft.gear, index, {
                                    qty: Number(event.target.value),
                                  }),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={line.days}
                              onChange={(event) =>
                                setGear(
                                  updateGearLine(draft.gear, index, {
                                    days: Number(event.target.value),
                                  }),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={line.ratePerDay}
                              onChange={(event) =>
                                setGear(
                                  updateGearLine(draft.gear, index, {
                                    ratePerDay: Number(event.target.value),
                                  }),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            Rp {lineTotal.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeGearLine(index)}>
                              <Trash2 className="h-4 w-4 text-slate-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label>Transport (Rp)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.oop.transport ?? ""}
                      onChange={(event) =>
                        setOOP({ ...draft.oop, transport: Number(event.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>F&amp;B (Rp)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.oop.fnb ?? ""}
                      onChange={(event) =>
                        setOOP({ ...draft.oop, fnb: Number(event.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Misc (Rp)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.oop.misc ?? ""}
                      onChange={(event) =>
                        setOOP({ ...draft.oop, misc: Number(event.target.value) })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Base crew</span>
                  <span className="font-medium text-slate-900">Rp {Math.round(basePreview.baseCrew).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Base gear</span>
                  <span className="font-medium text-slate-900">Rp {Math.round(basePreview.baseGear).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Out-of-pocket</span>
                  <span className="font-medium text-slate-900">Rp {Math.round(basePreview.baseOOP).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-slate-700">Base cost estimate</span>
                  <span className="text-base font-semibold text-slate-900">Rp {Math.round(basePreview.baseCost).toLocaleString("id-ID")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Skill level</Label>
                  <Select
                    value={draft.business.skillLevel ?? "intermediate"}
                    onValueChange={(value) => setBusiness({ skillLevel: value as typeof draft.business.skillLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Monthly income goal (optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.business.incomeGoal ?? ""}
                    onChange={(event) =>
                      setBusiness({ incomeGoal: Number(event.target.value) || undefined })
                    }
                  />
                </div>
                <div>
                  <Label>Living cost (optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.business.livingCost ?? ""}
                    onChange={(event) =>
                      setBusiness({ livingCost: Number(event.target.value) || undefined })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="client">Client name</Label>
                  <Input
                    id="client"
                    value={draft.meta.clientName ?? ""}
                    onChange={(event) => setMeta({ clientName: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Project title</Label>
                  <Input
                    id="title"
                    value={draft.meta.projectTitle ?? ""}
                    onChange={(event) => setMeta({ projectTitle: event.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button onClick={handlePreview} disabled={isLoading || !projectSelected}>
                {isLoading ? "Calculating..." : "Preview Price"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>Change project type</Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
