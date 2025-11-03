import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileVideo, Building2, ShoppingBag, Shirt, Camera, Youtube, Clapperboard, ArrowRight, BarChart3, FileText, Zap } from "lucide-react";
import type { ProjectType } from "@shared/schema";

const projectTypeConfig = {
  company_profile: {
    icon: Building2,
    title: "Company Profile Video",
    description: "Corporate branding & company introduction",
    color: "text-blue-600 dark:text-blue-400"
  },
  ads_commercial: {
    icon: ShoppingBag,
    title: "Ads/Commercial Video",
    description: "Product advertising & marketing campaigns",
    color: "text-purple-600 dark:text-purple-400"
  },
  fashion: {
    icon: Shirt,
    title: "Fashion Video",
    description: "Fashion lookbooks & brand campaigns",
    color: "text-pink-600 dark:text-pink-400"
  },
  event_documentation: {
    icon: Camera,
    title: "Event Documentation",
    description: "Conferences, weddings & special events",
    color: "text-green-600 dark:text-green-400"
  },
  youtube: {
    icon: Youtube,
    title: "YouTube Video",
    description: "Content creation & digital media",
    color: "text-red-600 dark:text-red-400"
  },
  animation_video: {
    icon: Clapperboard,
    title: "Animation Video",
    description: "Explainer & motion graphic storytelling",
    color: "text-amber-600 dark:text-amber-400"
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-card/30">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Stop Guessing Your Prices</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Price Your Video Projects with{" "}
              <span className="text-primary">Confidence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Systematic pricing based on project complexity, crew costs, and market data. Generate professional quotations in minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="gap-2" data-testid="button-create-project">
                <Link href="/new">
                  <FileVideo className="w-5 h-5" />
                  Create New Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-view-dashboard">
                <Link href="/dashboard">
                  <BarChart3 className="w-5 h-5" />
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to create professional, data-driven quotations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="hover-elevate transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileVideo className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Choose Project Type</CardTitle>
                <CardDescription>
                  Select from {Object.keys(projectTypeConfig).length} video categories with tailored complexity questionnaires
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Rate Complexity</CardTitle>
                <CardDescription>
                  Answer smart questions about portfolio value, creative needs, and client scale
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Generate Quotation</CardTitle>
                <CardDescription>
                  Get base cost, recommended price, and market insights. Export as PDF instantly
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Project Types */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Select Your Project Type</h3>
            <p className="text-muted-foreground">Each type has adaptive complexity questions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(projectTypeConfig) as ProjectType[]).map((type) => {
              const config = projectTypeConfig[type];
              const Icon = config.icon;
              
              return (
                <Card 
                  key={type} 
                  className="group hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
                  data-testid={`card-project-type-${type}`}
                >
                  <Link href={`/new?type=${type}`}>
                    <CardHeader>
                      <Icon className={`w-10 h-10 mb-3 ${config.color}`} />
                      <CardTitle className="text-lg">{config.title}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-primary font-medium">
                        Start Pricing
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
