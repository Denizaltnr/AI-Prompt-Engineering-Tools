import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Sparkles,
  Library,
  LayoutTemplate,
  FlaskConical,
  Gauge,
  ArrowRight,
  Zap,
  Target,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const featureIcons = [Wand2, Sparkles, Library, LayoutTemplate, FlaskConical, Gauge];
const featureHrefs = ["/generator", "/improver", "/library", "/templates", "/sandbox", "/scoring"];
const featureColors = [
  { text: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
  { text: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10" },
  { text: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10" },
  { text: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10" },
  { text: "text-cyan-500 dark:text-cyan-400", bg: "bg-cyan-500/10" },
];
const featureKeys = [
  "generator",
  "improver",
  "library",
  "templates",
  "sandbox",
  "scoring",
] as const;

export default function Home() {
  const { t } = useLanguage();

  const features = featureKeys.map((key, i) => ({
    title: t.home.features[key].title,
    description: t.home.features[key].description,
    icon: featureIcons[i],
    href: featureHrefs[i],
    color: featureColors[i].text,
    bgColor: featureColors[i].bg,
  }));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            {t.home.badge}
          </Badge>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            data-testid="text-hero-title"
          >
            {t.home.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t.home.subtitle}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/generator">
              <Button size="lg" data-testid="button-get-started">
                <Wand2 className="w-4 h-4 mr-2" />
                {t.home.startBtn}
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" data-testid="button-browse-templates">
                {t.home.templatesBtn}
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-8 mb-12 flex-wrap"
        >
          {[
            { icon: Zap, label: t.home.statFast, value: "< 1s" },
            { icon: Target, label: t.home.statScore, value: "0-100" },
            { icon: Brain, label: t.home.statModels, value: "4+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <stat.icon className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{stat.value}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Link href={feature.href}>
                <Card className="hover-elevate cursor-pointer h-full transition-colors">
                  <CardHeader>
                    <div
                      className={`w-10 h-10 rounded-md ${feature.bgColor} flex items-center justify-center mb-2`}
                    >
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-base flex items-center justify-between gap-1">
                      {feature.title}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
