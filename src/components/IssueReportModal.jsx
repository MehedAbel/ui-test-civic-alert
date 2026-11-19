import React, { useEffect, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import {
  ISSUE_TYPES,
  ISSUE_TYPE_META,
  formatCoordinates,
  validateIssueSubmission,
} from '../utils/civicLogic.js';
import { CIVIC_INPUT_CLASS, FormField } from './FormField.jsx';

export function IssueReportModal({ isOpen, coordinates, onClose, onCreated }) {
  const [issueType, setIssueType] = useState('Pothole');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  if (!isOpen || !coordinates) return null;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const remaining = Math.max(0, 6 - images.length);
    const next = selected.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...next]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateIssueSubmission({
      title,
      description,
      issueType,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      imageCount: images.length,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('issueType', issueType);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('address', address.trim());
      formData.append('latitude', String(coordinates.lat));
      formData.append('longitude', String(coordinates.lng));
      images.forEach((item) => formData.append('images', item.file));

      const created = await apiClient.createIssue(formData);
      setTitle('');
      setAddress('');
      setDescription('');
      setImages([]);
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[1px] p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="w-full max-w-[var(--civic-modal-max-w)] rounded-civic-card bg-civic-surface border border-civic-border shadow-civic-modal overflow-hidden my-auto px-6 py-6 sm:px-8 sm:py-7">
        <div className="relative text-center pb-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report form"
            className="absolute left-0 top-0 h-8 w-8 rounded-civic-pill flex items-center justify-center text-civic-accent hover:bg-civic-hover cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <h2 id="report-modal-title" className="text-xl font-bold text-civic-text">
            Create Report
          </h2>
          <p className="mt-1 text-xs text-civic-text-subtle font-mono tabular-nums">
            Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[75vh] overflow-y-auto pr-0.5"
        >
          {error && (
            <div
              role="alert"
              className="rounded-civic-control border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-200"
            >
              {error}
            </div>
          )}

          <FormField id="issue-category" label="Category*">
            <select
              id="issue-category"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className={CIVIC_INPUT_CLASS}
            >
              {ISSUE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ISSUE_TYPE_META[type].label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="issue-title" label="Summary Title*">
            <input
              id="issue-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deep pothole in eastbound bike lane"
              className={CIVIC_INPUT_CLASS}
            />
          </FormField>

          <FormField
            id="issue-address"
            label="Nearest Street Address or Landmark"
          >
            <input
              id="issue-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={formatCoordinates(coordinates.lat, coordinates.lng)}
              className={CIVIC_INPUT_CLASS}
            />
          </FormField>

          <FormField id="issue-description" label="Description*">
            <textarea
              id="issue-description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard, severity, and location context..."
              className={CIVIC_INPUT_CLASS}
            />
          </FormField>

          <div>
            <label
              htmlFor="issue-images"
              className="block text-xs font-medium text-civic-text-secondary mb-1"
            >
              Images
            </label>
            <label
              htmlFor="issue-images"
              className="flex flex-col items-center justify-center rounded-civic-panel border border-civic-border-upload bg-civic-input px-4 py-7 text-center cursor-pointer hover:bg-civic-hover transition-colors"
            >
              <span className="text-sm font-medium text-civic-accent">
                {images.length > 0
                  ? `${images.length} ${images.length === 1 ? 'image' : 'images'} selected`
                  : 'Click to select images (up to 6)'}
              </span>
              <input
                id="issue-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {images.length > 0 && (
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {images.map((item, idx) => (
                  <div
                    key={item.previewUrl}
                    className="relative aspect-[4/3] rounded-civic-control overflow-hidden border border-civic-border-strong"
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Upload preview ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      aria-label={`Remove photo ${idx + 1}`}
                      className="absolute top-1 right-1 h-6 w-6 rounded-civic-control bg-black/75 text-white hover:bg-rose-600 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover disabled:opacity-60 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
