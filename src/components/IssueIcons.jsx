import L from 'leaflet';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplets,
  Footprints,
  LightbulbOff,
  SearchCheck,
  TrafficCone,
  Trash2,
  XCircle,
} from 'lucide-react';
import { ISSUE_TYPE_META } from '../utils/civicLogic.js';

function getPinGlyphSvg(type) {
  switch (type) {
    case 'Pothole':
      return `<path d="M12 3L2 20h20L12 3zm0 6v5m0 3h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    case 'BrokenStreetlight':
      return `<path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    case 'IllegalDumping':
      return `<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6m5 5v5m4-5v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    case 'WaterLeak':
      return `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    case 'DamagedSidewalk':
      return `<path d="M4 16l4-4 4 4 4-6 4 6M3 20h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    case 'TrafficSignal':
      return `<rect x="7" y="2" width="10" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/>`;
    default:
      return '';
  }
}

export function createIssuePinIcon(type, isSelected) {
  const meta = ISSUE_TYPE_META[type];
  const scale = isSelected ? 'transform: scale(1.16);' : '';
  const ring = isSelected
    ? 'box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.35), 0 8px 18px rgba(15, 23, 42, 0.35);'
    : 'box-shadow: 0 6px 14px rgba(15, 23, 42, 0.28);';

  const html = `
    <div class="civic-pin-marker" style="display:flex;flex-direction:column;align-items:center;${scale}">
      <div style="width:36px;height:36px;border-radius:12px 12px 12px 2px;transform:rotate(-45deg);background:${meta.colorHex};border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;${ring}">
        <svg viewBox="0 0 24 24" width="18" height="18" style="transform:rotate(45deg);color:#ffffff;">
          ${getPinGlyphSvg(type)}
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'civic-pin-wrapper',
    html,
    iconSize: [36, 42],
    iconAnchor: [18, 40],
    popupAnchor: [0, -36],
  });
}

export function createDraftPinIcon() {
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--civic-primary);border:3px solid #FFFFFF;box-shadow:0 8px 20px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
        <div style="width:10px;height:10px;border-radius:9999px;background:#FFFFFF;transform:rotate(45deg);"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'civic-pin-wrapper',
    html,
    iconSize: [38, 44],
    iconAnchor: [19, 42],
  });
}

export function IssueTypeIcon({ type, className = 'w-4 h-4' }) {
  switch (type) {
    case 'Pothole':
      return <AlertTriangle className={className} aria-hidden="true" />;
    case 'BrokenStreetlight':
      return <LightbulbOff className={className} aria-hidden="true" />;
    case 'IllegalDumping':
      return <Trash2 className={className} aria-hidden="true" />;
    case 'WaterLeak':
      return <Droplets className={className} aria-hidden="true" />;
    case 'DamagedSidewalk':
      return <Footprints className={className} aria-hidden="true" />;
    case 'TrafficSignal':
      return <TrafficCone className={className} aria-hidden="true" />;
    default:
      return null;
  }
}

export function IssueStatusIcon({ status, className = 'w-4 h-4' }) {
  switch (status) {
    case 'Submitted':
      return <Clock className={className} aria-hidden="true" />;
    case 'UnderReview':
      return <SearchCheck className={className} aria-hidden="true" />;
    case 'InProgress':
      return <TrafficCone className={className} aria-hidden="true" />;
    case 'Resolved':
      return <CheckCircle2 className={className} aria-hidden="true" />;
    case 'Rejected':
      return <XCircle className={className} aria-hidden="true" />;
    default:
      return null;
  }
}
