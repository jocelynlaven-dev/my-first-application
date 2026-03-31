import { motion } from "framer-motion";
import { type PersonaResponse } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Landmark, LineChart, Hourglass, Smile, Wrench,
  Sun, Target, Heart, Users, HelpCircle,
  Minus, Compass, BookOpen, Trophy, FlaskConical,
  Palette, Laugh, Home, Briefcase, Clock,
  Scale, Shield, Star, Baby, Zap, Sparkles,
  type LucideIcon
} from "lucide-react";

type PersonaMeta = {
  icon: LucideIcon;
  colorClass: string;
};

const PERSONA_META: Record<string, PersonaMeta> = {
  "The Stoic":              { icon: Landmark,     colorClass: "bg-slate-700"   },
  "The Capital Allocator":  { icon: LineChart,    colorClass: "bg-indigo-700"  },
  "Future You":             { icon: Hourglass,    colorClass: "bg-emerald-700" },
  "The 10-Year-Old":        { icon: Smile,        colorClass: "bg-amber-600"   },
  "The Pragmatist":         { icon: Wrench,       colorClass: "bg-rose-700"    },
  "The Optimist":           { icon: Sun,          colorClass: "bg-yellow-600"  },
  "The Realist":            { icon: Target,       colorClass: "bg-blue-700"    },
  "The Therapist":          { icon: Heart,        colorClass: "bg-purple-600"  },
  "The Best Friend":        { icon: Users,        colorClass: "bg-pink-600"    },
  "The Skeptic":            { icon: HelpCircle,   colorClass: "bg-gray-600"    },
  "The Minimalist":         { icon: Minus,        colorClass: "bg-stone-600"   },
  "The Adventurer":         { icon: Compass,      colorClass: "bg-orange-600"  },
  "The Historian":          { icon: BookOpen,     colorClass: "bg-amber-800"   },
  "The Coach":              { icon: Trophy,       colorClass: "bg-green-700"   },
  "The Scientist":          { icon: FlaskConical, colorClass: "bg-cyan-700"    },
  "The Artist":             { icon: Palette,      colorClass: "bg-violet-600"  },
  "The Comedian":           { icon: Laugh,        colorClass: "bg-lime-600"    },
  "The Grandparent":        { icon: Home,         colorClass: "bg-rose-600"    },
  "The CEO":                { icon: Briefcase,    colorClass: "bg-sky-700"     },
  "The Time Traveler":      { icon: Clock,        colorClass: "bg-teal-700"    },
  "The Negotiator":         { icon: Scale,        colorClass: "bg-blue-600"    },
  "The Risk Manager":       { icon: Shield,       colorClass: "bg-red-700"     },
  "The Spiritual Guide":    { icon: Star,         colorClass: "bg-indigo-500"  },
  "The Busy Parent":        { icon: Baby,         colorClass: "bg-pink-700"    },
  "The Lazy Genius":        { icon: Zap,          colorClass: "bg-yellow-700"  },
};

const DEFAULT_META: PersonaMeta = { icon: Sparkles, colorClass: "bg-slate-600" };

interface PersonaCardProps {
  response: PersonaResponse;
  delay?: number;
}

export function PersonaCard({ response, delay = 0 }: PersonaCardProps) {
  const meta = PERSONA_META[response.persona] ?? DEFAULT_META;
  const { icon: Icon, colorClass } = meta;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] bg-card/80 backdrop-blur-md p-8 shadow-sm ring-1 ring-primary/5 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500",
        "flex flex-col h-full border border-white/40"
      )}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-pattern-dots" />
      <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 transition-opacity group-hover:opacity-30", colorClass)} />

      <div className="relative flex items-center gap-4 mb-8">
        <div className={cn(
          "p-4 rounded-2xl border border-white/20 shadow-sm text-white/90",
          colorClass,
          "bg-opacity-80"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-display text-xl font-medium text-foreground/90 leading-tight">{response.persona}</h3>
      </div>

      <div className="relative space-y-5 text-base leading-relaxed text-muted-foreground flex-grow">
        <div>
          <h4 className="font-display text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-2 font-semibold">Core Essence</h4>
          <p className="text-foreground font-serif italic text-lg leading-snug border-l-2 border-primary/10 pl-4">{response.summary}</p>
        </div>

        <div>
          <h4 className="font-display text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-2 font-semibold">Their Counsel</h4>
          <div className="bg-primary/[0.04] p-4 rounded-2xl border border-primary/10">
            <p className="text-foreground/80 text-sm leading-relaxed">{response.advice}</p>
          </div>
        </div>
      </div>

      <div className="relative mt-6 pt-5 border-t border-primary/10">
        <div className="flex items-start gap-3 text-sm font-medium text-primary/80 bg-primary/5 p-4 rounded-2xl italic border border-primary/10 shadow-sm">
          <span className="font-display text-2xl leading-none opacity-30 text-primary mt-0.5">?</span>
          <p className="leading-snug">{response.question}</p>
        </div>
      </div>
    </motion.div>
  );
}
