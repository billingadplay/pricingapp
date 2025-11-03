import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ShoppingBag, Shirt, Camera, Youtube } from "lucide-react";
import type { ProjectType } from "@shared/schema";

const projectTypeConfig = {
  company_profile: {
    icon: Building2,
    title: "Company Profile Video",
    description: "Corporate branding, company introduction, dan business presentation",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-600/10"
  },
  ads_commercial: {
    icon: ShoppingBag,
    title: "Ads/Commercial Video",
    description: "Product advertising, marketing campaigns, dan promotional content",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-600/10"
  },
  fashion: {
    icon: Shirt,
    title: "Fashion Video",
    description: "Fashion lookbooks, brand campaigns, dan product showcases",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-600/10"
  },
  event_documentation: {
    icon: Camera,
    title: "Event Documentation",
    description: "Conferences, weddings, seminars, dan special events",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-600/10"
  },
  youtube: {
    icon: Youtube,
    title: "YouTube Video",
    description: "Content creation, vlogs, tutorials, dan digital media",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-600/10"
  }
};

interface ProjectTypeSelectorProps {
  onSelect: (type: ProjectType) => void;
}

export function ProjectTypeSelector({ onSelect }: ProjectTypeSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {(Object.keys(projectTypeConfig) as ProjectType[]).map((type) => {
        const config = projectTypeConfig[type];
        const Icon = config.icon;
        
        return (
          <Card 
            key={type}
            className="group hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 border-2 hover:border-primary/50"
            onClick={() => onSelect(type)}
            data-testid={`card-select-${type}`}
          >
            <CardHeader className="space-y-4">
              <div className={`w-14 h-14 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${config.color}`} />
              </div>
              <div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                  {config.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {config.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
