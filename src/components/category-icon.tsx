import {
  Code,
  LineChart,
  Palette,
  Briefcase,
  Megaphone,
  Camera,
  Music,
  Sparkles,
  Languages,
  Cpu,
  BookOpen,
} from "lucide-react";

const MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "web-development": Code,
  "data-science": LineChart,
  design: Palette,
  business: Briefcase,
  marketing: Megaphone,
  photography: Camera,
  music: Music,
  "personal-development": Sparkles,
  languages: Languages,
  "it-software": Cpu,
};

export function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = MAP[slug] ?? BookOpen;
  return <Icon className={className} />;
}
