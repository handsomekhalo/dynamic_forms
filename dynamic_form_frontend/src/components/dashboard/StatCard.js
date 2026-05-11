import React from "react";
import { Card } from "@/components/ui/card";

export default function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <Card className="p-5 bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold mt-1.5 text-foreground">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1.5">{trend}</p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-primary/8">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}