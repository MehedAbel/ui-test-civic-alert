import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { ISSUE_TYPE_META, filterIssues } from '../utils/civicLogic.js';
import { IssueDetailDrawer } from './IssueDetailDrawer.jsx';
import { createDraftPinIcon, createIssuePinIcon } from './IssueIcons.jsx';
import { IssueReportModal } from './IssueReportModal.jsx';
import { MapLegend } from './MapLegend.jsx';
import { PinPreviewCard } from './PinPreviewCard.jsx';

const DEFAULT_CENTER = [44.3100, 23.8100];

export function CitizenMapView({ focusIssueId, pinDropTrigger, onClearFocus }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const draftMarkerRef = useRef(null);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Two-stage pin inspection:
  // 1) PinPreviewCard ("View Report"), 2) Full left IssueDetailDrawer
  const [previewIssue, setPreviewIssue] = useState(null);
  const [drawerIssue, setDrawerIssue] = useState(null);

  const [legendOpen, setLegendOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');

  const [pinDropMode, setPinDropMode] = useState(false);
  const [draftCoords, setDraftCoords] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const pinDropModeRef = useRef(pinDropMode);
  pinDropModeRef.current = pinDropMode;

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await apiClient.getAllIssues();
        if (active) setIssues(data);
      } catch (err) {
        if (active) {
          setLoadError(
            err instanceof Error ? err.message : 'Unable to load community map.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (pinDropTrigger > 0) {
      setPreviewIssue(null);
      setDrawerIssue(null);
      setPinDropMode(true);
    }
  }, [pinDropTrigger]);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (el) el.classList.toggle('civic-pin-drop-mode', pinDropMode);
  }, [pinDropMode]);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 14,
      zoomControl: false,
      zoomAnimation: false,
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      referrerPolicy: 'strict-origin-when-cross-origin',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      if (!pinDropModeRef.current) return;
      setDraftCoords({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      });
      setReportModalOpen(true);
    });

    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.stop();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      draftMarkerRef.current = null;
    };
  }, []);

  const filteredIssues = useMemo(
    () => filterIssues(issues, { issueType: typeFilter }),
    [issues, typeFilter]
  );

  // Sync community issue pins
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    const activeId = drawerIssue?.id ?? previewIssue?.id ?? null;

    for (const issue of filteredIssues) {
      const marker = L.marker([issue.latitude, issue.longitude], {
        icon: createIssuePinIcon(issue.issueType, activeId === issue.id),
        title: issue.title,
        alt: `${ISSUE_TYPE_META[issue.issueType].label}: ${issue.title}`,
      });

      marker.on('click', () => {
        setPinDropMode(false);
        setDrawerIssue(null);
        setPreviewIssue(issue);
        mapRef.current?.panTo([issue.latitude, issue.longitude], {
          animate: false,
        });
      });

      marker.addTo(layer);
    }
  }, [filteredIssues, previewIssue, drawerIssue]);

  // Sync draggable draft pin while Create Report modal is open
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (draftMarkerRef.current) {
      map.removeLayer(draftMarkerRef.current);
      draftMarkerRef.current = null;
    }

    if (draftCoords && reportModalOpen) {
      const marker = L.marker([draftCoords.lat, draftCoords.lng], {
        icon: createDraftPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setDraftCoords({
          lat: Number(pos.lat.toFixed(6)),
          lng: Number(pos.lng.toFixed(6)),
        });
      });

      draftMarkerRef.current = marker;
    }
  }, [draftCoords, reportModalOpen]);

  // Focus issue when jumping from My Reports
  useEffect(() => {
    if (!focusIssueId || issues.length === 0) return;
    const found = issues.find((i) => i.id === focusIssueId);
    if (found) {
      setPreviewIssue(null);
      setDrawerIssue(found);
      mapRef.current?.setView([found.latitude, found.longitude], 16, {
        animate: false,
      });
      onClearFocus();
    }
  }, [focusIssueId, issues, onClearFocus]);

  const handleUseCenterPin = () => {
    const center = mapRef.current?.getCenter();
    setDraftCoords(
      center
        ? { lat: Number(center.lat.toFixed(6)), lng: Number(center.lng.toFixed(6)) }
        : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
    );
    setReportModalOpen(true);
  };

  const handleCreated = (created) => {
    setIssues((prev) => [created, ...prev]);
    setReportModalOpen(false);
    setPinDropMode(false);
    setDraftCoords(null);
    setPreviewIssue(null);
    setDrawerIssue(created);
    mapRef.current?.setView([created.latitude, created.longitude], 16, {
      animate: false,
    });
  };

  const handleToggleCreateReport = () => {
    setPreviewIssue(null);
    setDrawerIssue(null);
    setPinDropMode((prev) => !prev);
  };

  return (
    <main className="relative h-[var(--civic-map-h)] w-full overflow-hidden bg-civic-surface-subtle">
      {/* Top-Left "Create a Report" Floating Pill Button */}
      <div
        className={`pointer-events-none absolute top-3.5 z-20 transition-all ${
          drawerIssue ? 'left-14 sm:left-[var(--civic-drawer-offset)]' : 'left-14'
        }`}
      >
        <div className="pointer-events-auto flex flex-col items-start sm:flex-row sm:items-center gap-2">
          <button
            type="button"
            onClick={handleToggleCreateReport}
            className={`rounded-civic-panel px-4 py-2.5 text-sm font-bold shadow-civic-floating transition-colors whitespace-nowrap cursor-pointer ${
              pinDropMode
                ? 'bg-civic-primary text-white'
                : 'bg-civic-surface text-civic-text hover:bg-civic-hover border border-civic-border-soft'
            }`}
          >
            {pinDropMode ? 'Cancel Report Pin' : 'Create a Report'}
          </button>

          {pinDropMode && (
            <div className="flex items-center gap-2 rounded-civic-panel border border-civic-border-accent bg-civic-surface/95 px-3.5 py-2 text-xs font-medium text-civic-text shadow-civic-floating">
              <Crosshair className="w-4 h-4 text-civic-accent shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">
                Click anywhere on the map to place a pin
              </span>
              <button
                type="button"
                onClick={handleUseCenterPin}
                className="rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover px-3 py-1 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
              >
                Drop at Center
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top-Right "Legend" Popover */}
      <MapLegend
        isOpen={legendOpen}
        onToggle={() => setLegendOpen((prev) => !prev)}
        onClose={() => setLegendOpen(false)}
        issues={issues}
        typeFilter={typeFilter}
        onSelectType={setTypeFilter}
      />

      {loadError && (
        <div
          role="alert"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 rounded-civic-panel border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/90 px-4 py-2.5 text-sm text-rose-800 dark:text-rose-200 shadow-civic-floating"
        >
          {loadError}
        </div>
      )}

      {/* Interactive Leaflet Map */}
      <div
        ref={mapContainerRef}
        data-testid="civic-leaflet-map"
        className="civic-map-container h-full w-full z-10"
      />

      {loading && (
        <div className="pointer-events-none absolute bottom-5 left-5 z-20 rounded-civic-panel bg-civic-surface/95 border border-civic-border px-3.5 py-2 text-xs font-medium text-civic-text-muted shadow-civic-floating">
          Loading community pins...
        </div>
      )}

      {/* Stage 1: Compact Pin Preview Popup */}
      {previewIssue && !drawerIssue && (
        <PinPreviewCard
          issue={previewIssue}
          onClose={() => setPreviewIssue(null)}
          onViewReport={() => {
            setDrawerIssue(previewIssue);
            setPreviewIssue(null);
          }}
        />
      )}

      {/* Stage 2: Full Left Slide-Over Detail Panel */}
      <IssueDetailDrawer
        issue={drawerIssue}
        onClose={() => setDrawerIssue(null)}
      />

      <IssueReportModal
        isOpen={reportModalOpen}
        coordinates={draftCoords}
        onClose={() => {
          setReportModalOpen(false);
          setDraftCoords(null);
        }}
        onCreated={handleCreated}
      />
    </main>
  );
}
