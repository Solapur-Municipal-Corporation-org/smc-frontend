import {
  AlertTriangle, Baby, BadgeCheck, Banknote, Briefcase, Building, Building2,
  Calculator, ClipboardCheck, CloudRain, Construction, Cpu, Droplet, Droplets,
  FileSignature, FileText, Flame, GraduationCap, HardHat, Heart, HeartHandshake,
  HeartPulse, Home, Landmark, Map, Megaphone, MessageSquare, Package, PawPrint,
  Receipt, Scale, ShieldAlert, Stethoscope, Store, Trash2, Trees, UserCog,
  Users, Wallet, Warehouse, Waves, Wrench, Zap, type LucideIcon,
} from "lucide-react";

/**
 * Central icon registry for all Pune Municipal Corporation-style departments.
 * Keyed by the `icon` string stored on each Department record (backend + mock data),
 * so both the sidebar and dashboard render the same icon set from one place.
 */
export const departmentIconMap: Record<string, LucideIcon> = {
  AlertTriangle, Baby, BadgeCheck, Banknote, Briefcase, Building, Building2,
  Calculator, ClipboardCheck, CloudRain, Construction, Cpu, Droplet, Droplets,
  FileSignature, FileText, Flame, GraduationCap, HardHat, Heart, HeartHandshake,
  HeartPulse, Home, Landmark, Map, Megaphone, MessageSquare, Package, PawPrint,
  Receipt, Scale, ShieldAlert, Stethoscope, Store, Trash2, Trees, UserCog,
  Users, Wallet, Warehouse, Waves, Wrench, Zap,
};

export function DepartmentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = departmentIconMap[name] ?? Landmark;
  return <Icon className={className} />;
}
