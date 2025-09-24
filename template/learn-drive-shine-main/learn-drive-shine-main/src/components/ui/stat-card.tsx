import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  variant?: "default" | "primary" | "success" | "warning";
}

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = "default"
}: StatCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-primary text-primary-foreground shadow-glow";
      case "success":
        return "bg-gradient-success text-success-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-gradient-card border border-border/50";
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card",
      getVariantStyles(),
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "text-current opacity-90"
            )}>
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className={cn(
                  "text-sm",
                  variant === "default" ? "text-muted-foreground" : "text-current opacity-75"
                )}>
                  {description}
                </p>
              )}
              {trend && (
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    {trend.isPositive ? "+" : ""}{trend.value}
                  </span>
                  <span className={cn(
                    "text-xs",
                    variant === "default" ? "text-muted-foreground" : "text-current opacity-75"
                  )}>
                    from last month
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            variant === "default" 
              ? "bg-primary/10 text-primary" 
              : "bg-white/20 text-current"
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </CardContent>
    </Card>
  );
};