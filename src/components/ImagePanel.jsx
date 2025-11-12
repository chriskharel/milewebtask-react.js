import React, { useRef, useEffect } from 'react';
import { panelContent } from '../data/imageData.js';

const ImagePanel = ({ item, isOpen, onClose, layout = 'right' }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      if (isOpen) {
        // Panel will be animated by the animation system
        // Update panel class based on layout
        panelRef.current.className = `panel panel--${layout}`;
      } else {
        // Hide panel when not open
        panelRef.current.style.opacity = '0';
        panelRef.current.style.pointerEvents = 'none';
      }
    }
  }, [isOpen, layout]);

  if (!item) return null;

  // Use special content for first item, otherwise use item data
  const displayTitle = item.id === 1 ? panelContent.title : item.title;
  const displayDescription = item.id === 1 ? panelContent.description : null;

  return (
    <figure ref={panelRef} className={`panel panel--${layout}`} role="img" aria-labelledby="panel-caption">
      <div
        className="panel__img"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      />
      <figcaption className="panel__content" id="panel-caption">
        <h3 className="m-0 text-base font-medium">{displayTitle}</h3>
        {displayDescription ? (
          <p className="m-0 max-w-[150px] text-pretty">{displayDescription}</p>
        ) : (
          <p className="m-0 max-w-[150px]">Model: {item.model}</p>
        )}
        <button
          type="button"
          className="panel__close hover:text-link-hover focus:outline-none focus:text-link-hover"
          onClick={onClose}
          aria-label="Close preview"
        >
          Close
        </button>
      </figcaption>
    </figure>
  );
};

export default ImagePanel;
