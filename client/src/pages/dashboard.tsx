import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Search,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  ShoppingBag,
  Shirt,
  Camera,
  Youtube,
  Clapperboard,
  ArrowRight
} from "lucide-react";
import type { Project, ProjectType } from "@shared/schema";
import { useState } from "react";
import { format } from "date-fns";

const projectTypeIcons = {
  company_profile: Building2,
  ads_commercial: ShoppingBag,
  fashion: Shirt,
  event_documentation: Camera,
  youtube: Youtube,
  animation_video: Clapperboard
};

const projectTypeLabels = {
  company_profile: "Company Profile",
  ads_commercial: "Ads/Commercial",
  fashion: "Fashion",
  event_documentation: "Event Documentation",
  youtube: "YouTube",
  animation_video: "Animation Video"
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = projects.filter(p => 
    p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate stats
  const totalProjects = projects.length;
  const totalRevenue = projects.reduce((sum, p) => sum + parseFloat(p.finalPrice || "0"), 0);
  const avgPrice = totalProjects > 0 ? totalRevenue / totalProjects : 0;
  const avgMultiplier = totalProjects > 0 
    ? projects.reduce((sum, p) => sum + parseFloat(p.complexityMultiplier || "1"), 0) / totalProjects 
    : 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Project Dashboard</h1>
            <p className="text-muted-foreground">Manage semua quotation & pricing kamu</p>
          </div>
          <Button asChild className="gap-2" data-testid="button-new-project">
            <Link href="/new">
              <Plus className="w-4 h-4" />
              Project Baru
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Quotations created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">
                Rp {(totalRevenue / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">
                Rp {(avgPrice / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per project
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Complexity</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{avgMultiplier.toFixed(2)}x</div>
              <p className="text-xs text-muted-foreground mt-1">
                Multiplier
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari project atau client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-projects"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "Tidak ada hasil" : "Belum ada project"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Coba keyword lain atau hapus filter" 
                : "Mulai buat project pertama kamu"}
            </p>
            {!searchQuery && (
              <Button asChild className="gap-2">
                <Link href="/new">
                  <Plus className="w-4 h-4" />
                  Buat Project Baru
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => {
              const Icon = projectTypeIcons[project.projectType as ProjectType];
              const typeLabel = projectTypeLabels[project.projectType as ProjectType];
              
              return (
                <Card 
                  key={project.id} 
                  className="group hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
                  data-testid={`card-project-${project.id}`}
                >
                  <Link href={`/project/${project.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Badge variant="secondary" className="gap-1.5">
                          <Icon className="w-3 h-3" />
                          {typeLabel}
                        </Badge>
                        <Badge variant="outline" className="font-mono">
                          {parseFloat(project.complexityMultiplier).toFixed(2)}x
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-1">{project.projectTitle}</CardTitle>
                      {project.clientName && (
                        <CardDescription className="line-clamp-1">
                          {project.clientName}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tabular-nums">
                          Rp {(parseFloat(project.finalPrice) / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(project.createdAt), "d MMM yyyy")}
                      </div>
                      <div className="flex items-center text-sm text-primary font-medium pt-2">
                        Lihat Detail
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
