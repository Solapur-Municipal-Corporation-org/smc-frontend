import { IconType } from "react-icons";
import {
  FiGrid,
  FiBookOpen,
  FiDollarSign,
  FiTrendingUp,
  FiBriefcase,
  FiFileText,
  FiUsers,
  FiShield,
  FiTruck,
  FiDroplet,
  FiHeart,
  FiHome,
  FiTool,
  FiZap,
  FiTrash2,
  FiBook,
  FiAward,
  FiMap,
  FiClipboard,
  FiSettings,
  FiActivity,
  FiPhoneCall,
  FiGlobe,
  FiLayers,
  FiPackage,
  FiUserCheck,
  FiCpu,
  FiAlertTriangle,
  FiSun,
} from "react-icons/fi";

/**
 * Pastel tile "themes" so department cards read like a set of app icons
 * (light background + matching mid-tone icon color), similar to the
 * reference mobile home screen shared for this project.
 */
export interface DeptTheme {
  bg: string; // tile background
  fg: string; // icon color
  ring: string; // subtle border tint
}

const THEMES: DeptTheme[] = [
  { bg: "#E7EEFC", fg: "#2F5AD6", ring: "#D6E1FA" }, // blue
  { bg: "#FDF1E1", fg: "#C98A1E", ring: "#F8E5C4" }, // cream / gold
  { bg: "#F3EAFB", fg: "#7A3FC9", ring: "#E7D6F7" }, // purple
  { bg: "#FDE9EC", fg: "#D6497A", ring: "#F8D3DA" }, // pink
  { bg: "#E6F6EE", fg: "#1F9D63", ring: "#CFEDDD" }, // green
  { bg: "#FFF0E5", fg: "#DD7A2B", ring: "#FBDDC2" }, // orange
  { bg: "#E6F4F8", fg: "#1E8FA8", ring: "#CBE9F1" }, // teal
  { bg: "#F0F0FB", fg: "#5A5FCB", ring: "#DEDFF6" }, // indigo
];

/**
 * Keyword -> icon lookup. Matched against the (lower-cased) department
 * name / primary functions so real SMC departments get a sensible,
 * recognisable icon instead of a generic placeholder.
 */
const KEYWORD_ICONS: Array<{ keywords: string[]; icon: IconType }> = [
  { keywords: ["water", "jal", "sewer", "drain"], icon: FiDroplet },
  { keywords: ["finance", "account", "audit", "budget", "tax", "revenue"], icon: FiDollarSign },
  { keywords: ["health", "medical", "hospital", "sanitation", "hygiene"], icon: FiHeart },
  { keywords: ["education", "school", "college"], icon: FiBookOpen },
  { keywords: ["engineering", "construction", "civil", "public works", "pwd"], icon: FiTool },
  { keywords: ["electric", "power", "energy", "street light"], icon: FiZap },
  { keywords: ["solid waste", "garbage", "waste"], icon: FiTrash2 },
  { keywords: ["fire", "disaster", "emergency"], icon: FiAlertTriangle },
  { keywords: ["property", "estate", "land"], icon: FiHome },
  { keywords: ["transport", "traffic", "vehicle", "rto"], icon: FiTruck },
  { keywords: ["law", "legal", "court"], icon: FiShield },
  { keywords: ["hr", "human resource", "establishment", "personnel"], icon: FiUsers },
  { keywords: ["it", "information technology", "computer", "digital", "software"], icon: FiCpu },
  { keywords: ["planning", "development", "urban"], icon: FiMap },
  { keywords: ["welfare", "social"], icon: FiUserCheck },
  { keywords: ["licen", "trade"], icon: FiClipboard },
  { keywords: ["sports", "culture", "garden", "park"], icon: FiAward },
  { keywords: ["admin", "general"], icon: FiSettings },
  { keywords: ["market", "commerce"], icon: FiPackage },
  { keywords: ["communication", "pr", "public relations"], icon: FiPhoneCall },
  { keywords: ["survey", "gis", "map"], icon: FiGlobe },
  { keywords: ["horticulture", "environment", "climate"], icon: FiSun },
  { keywords: ["record", "document", "correspondence"], icon: FiFileText },
  { keywords: ["store", "procurement", "purchase"], icon: FiLayers },
  { keywords: ["performance", "monitoring", "growth"], icon: FiTrendingUp },
  { keywords: ["service", "activity"], icon: FiActivity },
];

/**
 * Exact icon per department code — the 42 real SMC departments, each with
 * its own distinct, purpose-matched emoji (checked against every
 * department name individually so nothing collides or falls back to a
 * generic icon). This is checked first; the keyword table below only
 * kicks in for a department that isn't one of these 42 (e.g. a new one
 * added later through Department Master).
 */
const DEPT_CODE_EMOJI: Record<string, string> = {
  DEPT01: "🗂️", // General Administration Department
  DEPT02: "🏛️", // Municipal Commissioner Office
  DEPT03: "🏢", // Additional Commissioner Office
  DEPT04: "📐", // City Engineer Department
  DEPT05: "🚧", // Public Works Department (PWD)
  DEPT06: "🚰", // Water Supply Department
  DEPT07: "🌀", // Sewerage Department
  DEPT08: "🌧️", // Storm Water Drain Department
  DEPT09: "🗑️", // Solid Waste Management (SWM)
  DEPT10: "🏥", // Health Department
  DEPT11: "⚕️", // Medical Department
  DEPT12: "📜", // Birth & Death Registration Department
  DEPT13: "🚒", // Fire & Emergency Services
  DEPT14: "🗺️", // Town Planning Department
  DEPT15: "🏗️", // Building Permission Department
  DEPT16: "🏠", // Estate Department
  DEPT17: "🌳", // Garden & Parks Department
  DEPT18: "⚡", // Electrical Department
  DEPT19: "⚙️", // Mechanical Department
  DEPT20: "💰", // Accounts & Finance Department
  DEPT21: "🏦", // Treasury Department
  DEPT22: "🔍", // Audit Department
  DEPT23: "🧾", // Property Tax Department
  DEPT24: "💧", // Water Tax Department
  DEPT25: "📋", // License Department
  DEPT26: "🏪", // Market Department
  DEPT27: "🚫", // Encroachment Removal Department
  DEPT28: "⚖️", // Legal Department
  DEPT29: "💻", // Information Technology (IT) Department
  DEPT30: "🧑‍💼", // Human Resource (HR) Department
  DEPT31: "💵", // Payroll Department
  DEPT32: "📦", // Stores & Purchase Department
  DEPT33: "📑", // Tender Department
  DEPT34: "📚", // Education Department
  DEPT35: "🤝", // Social Welfare Department
  DEPT36: "👶", // Women & Child Welfare Department
  DEPT37: "🚨", // Disaster Management Department
  DEPT38: "🐾", // Veterinary Department
  DEPT39: "🏘️", // Slum Improvement Department
  DEPT40: "🌆", // Smart City / Urban Development Department
  DEPT41: "📢", // Public Relations Department
  DEPT42: "🛎️", // Citizen Facilitation / Ward Offices
};

/**
 * Keyword -> emoji fallback for any department outside the 42 above (e.g.
 * a new one added later). Matched against the (lower-cased) department
 * name / primary functions.
 */
const KEYWORD_EMOJI: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ["water", "jal", "sewer", "drain"], emoji: "💧" },
  { keywords: ["finance", "account", "audit", "budget", "tax", "revenue"], emoji: "💰" },
  { keywords: ["health", "medical", "hospital"], emoji: "🏥" },
  { keywords: ["sanitation", "hygiene"], emoji: "🧼" },
  { keywords: ["education", "school", "college"], emoji: "📚" },
  { keywords: ["engineer", "construction", "civil", "public works", "pwd"], emoji: "🛠️" },
  { keywords: ["electric", "power", "energy", "street light"], emoji: "⚡" },
  { keywords: ["solid waste", "garbage", "waste"], emoji: "🗑️" },
  { keywords: ["fire", "disaster", "emergency"], emoji: "🚒" },
  { keywords: ["property", "estate", "land"], emoji: "🏠" },
  { keywords: ["transport", "traffic", "vehicle", "rto"], emoji: "🚦" },
  { keywords: ["law", "legal", "court"], emoji: "⚖️" },
  { keywords: ["commissioner"], emoji: "🏛️" },
  { keywords: ["hr", "human resource", "establishment", "personnel"], emoji: "🧑‍💼" },
  { keywords: ["it", "information technology", "computer", "digital", "software"], emoji: "💻" },
  { keywords: ["planning", "development", "urban"], emoji: "🗺️" },
  { keywords: ["welfare", "social"], emoji: "🤝" },
  { keywords: ["licen", "trade"], emoji: "📋" },
  { keywords: ["sports", "culture"], emoji: "🏆" },
  { keywords: ["garden", "park", "horticulture"], emoji: "🌳" },
  { keywords: ["admin", "general"], emoji: "🗂️" },
  { keywords: ["market", "commerce"], emoji: "🏪" },
  { keywords: ["communication", "pr", "public relations"], emoji: "📢" },
  { keywords: ["survey", "gis"], emoji: "🌐" },
  { keywords: ["environment", "climate"], emoji: "☀️" },
  { keywords: ["record", "document", "correspondence"], emoji: "📄" },
  { keywords: ["store", "procurement", "purchase"], emoji: "📦" },
  { keywords: ["performance", "monitoring", "growth"], emoji: "📈" },
  { keywords: ["security", "vigilance", "police"], emoji: "🛡️" },
  { keywords: ["service", "activity"], emoji: "🗂️" },
];

export function getDeptEmoji(name: string, primaryFunctions?: string, departmentCode?: string): string {
  if (departmentCode && DEPT_CODE_EMOJI[departmentCode]) {
    return DEPT_CODE_EMOJI[departmentCode];
  }
  const haystack = `${name} ${primaryFunctions || ""}`.toLowerCase();
  for (const entry of KEYWORD_EMOJI) {
    if (entry.keywords.some((kw) => haystack.includes(kw))) {
      return entry.emoji;
    }
  }
  return "🏛️";
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDeptIcon(name: string, primaryFunctions?: string): IconType {
  const haystack = `${name} ${primaryFunctions || ""}`.toLowerCase();
  for (const entry of KEYWORD_ICONS) {
    if (entry.keywords.some((kw) => haystack.includes(kw))) {
      return entry.icon;
    }
  }
  return FiGrid;
}

export function getDeptTheme(seed: string): DeptTheme {
  return THEMES[hashString(seed) % THEMES.length];
}
