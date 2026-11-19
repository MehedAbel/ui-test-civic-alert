import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { resolveAssetUrl } from '../services/apiClient.js';
import {
  nextCarouselIndex,
  prevCarouselIndex,
  resolveSwipeDirection,
} from '../utils/civicLogic.js';

export function IssueCarousel({
  images,
  title,
  aspectClass = 'aspect-[4/3]',
  showThumbnails = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState({});
  const pointerStartX = useRef(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const total = images.length;
  const safeIndex = total > 0 ? Math.min(currentIndex, total - 1) : 0;
  const currentImage = total > 0 ? images[safeIndex] : null;

  const handleNext = () => {
    setCurrentIndex((prev) => nextCarouselIndex(prev, total));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => prevCarouselIndex(prev, total));
  };

  const handleTouchStart = (e) => {
    pointerStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    if (pointerStartX.current === null || total <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? pointerStartX.current;
    const dir = resolveSwipeDirection(pointerStartX.current, endX);
    pointerStartX.current = null;
    if (dir === 'next') handleNext();
    if (dir === 'prev') handlePrev();
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse') {
      pointerStartX.current = e.clientX;
    }
  };

  const handlePointerUp = (e) => {
    if (
      e.pointerType !== 'mouse' ||
      pointerStartX.current === null ||
      total <= 1
    ) {
      pointerStartX.current = null;
      return;
    }
    const dir = resolveSwipeDirection(pointerStartX.current, e.clientX);
    pointerStartX.current = null;
    if (dir === 'next') handleNext();
    if (dir === 'prev') handlePrev();
  };

  const handleKeyDown = (e) => {
    if (total <= 1) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  if (total === 0) {
    return (
      <div
        className={`${aspectClass} w-full rounded-civic-panel border border-civic-border bg-civic-surface-subtle flex flex-col items-center justify-center gap-2 text-civic-text-subtle`}
      >
        <ImageOff className="w-6 h-6" aria-hidden="true" />
        <span className="text-xs font-medium">No photos attached to this report</span>
      </div>
    );
  }

  const isBroken = currentImage ? failedUrls[currentImage.imageUrl] : true;

  return (
    <div className="space-y-2.5">
      <div
        className={`relative ${aspectClass} w-full overflow-hidden rounded-civic-panel border border-civic-border bg-civic-canvas select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-civic-primary`}
        tabIndex={total > 1 ? 0 : -1}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Photos for ${title}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        data-testid="issue-image-carousel"
      >
        {currentImage && !isBroken ? (
          <img
            src={resolveAssetUrl(currentImage.imageUrl)}
            alt={`${title} — photo ${safeIndex + 1} of ${total}`}
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() =>
              setFailedUrls((prev) => ({
                ...prev,
                [currentImage.imageUrl]: true,
              }))
            }
            className="h-full w-full object-cover transition-opacity duration-200"
          />
        ) : (
          <div className="h-full w-full bg-civic-surface-subtle flex flex-col items-center justify-center gap-2 text-civic-text-muted px-4 text-center">
            <ImageOff className="w-6 h-6" aria-hidden="true" />
            <span className="text-xs font-medium">
              {currentImage?.fileName ?? title}
            </span>
          </div>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-civic-control bg-civic-surface/95 text-civic-text-secondary hover:bg-civic-hover shadow-md flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-primary cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-civic-control bg-civic-surface/95 text-civic-text-secondary hover:bg-civic-hover shadow-md flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-primary cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="pointer-events-none absolute bottom-2.5 right-3 rounded-civic-control bg-black/75 px-2 py-0.5 text-[11px] font-mono tabular-nums text-white">
              <span data-testid="carousel-counter">
                {safeIndex + 1} / {total}
              </span>
            </div>
          </>
        )}
      </div>

      {showThumbnails && total > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => {
            const active = idx === safeIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`h-16 w-16 shrink-0 rounded-civic-control overflow-hidden border-2 transition-all cursor-pointer ${
                  active
                    ? 'border-civic-primary ring-2 ring-civic-primary/30'
                    : 'border-civic-border-soft opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={resolveAssetUrl(img.imageUrl)}
                  alt={`${title} thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
