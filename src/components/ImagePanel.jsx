import React, { useRef, useEffect, useCallback } from 'react';
import { panelContent } from '../data/imageData.js';

const ImagePanel = ({ item, isOpen, onClose }) => {
  const panelRef = useRef(null);
  const imgRef = useRef(null);

  // Use callback ref to ensure image is set immediately when item changes
  const setImgRef = useCallback((node) => {
    imgRef.current = node;
    if (node) {
      // Always set background image, even if no item (use default)
      const bgValue = item ? `url(${item.imageUrl})` : 'url(/assets/img1.webp)';
      node.style.backgroundImage = bgValue;
      node.setAttribute('data-image-url', item ? item.imageUrl : '/assets/img1.webp');
    }
  }, [item]);
  
  // Update image when item changes - match original implementation
  useEffect(() => {
    if (imgRef.current) {
      // Directly set background image like in original (line 232 of index.js)
      const bgValue = item ? `url(${item.imageUrl})` : 'url(/assets/img1.webp)';
      imgRef.current.style.backgroundImage = bgValue;
      imgRef.current.setAttribute('data-image-url', item ? item.imageUrl : '/assets/img1.webp');
    }
  }, [item]);

  useEffect(() => {
    // Only handle closing state
    if (!isOpen && panelRef.current) {
      const timer = setTimeout(() => {
        if (panelRef.current && !isOpen) {
          panelRef.current.style.opacity = '0';
          panelRef.current.style.pointerEvents = 'none';
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Always render the panel (like in original), just hide it when no item
  // This prevents React from unmounting/remounting which causes image to disappear

  // Use default image if no item (like original HTML)
  const imageUrl = item ? item.imageUrl : '/assets/img1.webp';
  let title, description;
  
  if (item) {
    // Use special content for first item, otherwise use item data
    const displayTitle = item.id === 1 ? panelContent.title : item.title;
    const displayDescription = item.id === 1 ? panelContent.description : null;
    title = displayTitle;
    description = displayDescription || `Model: ${item.model}`;
  } else {
    title = 'murmur—207';
    description = 'Beneath the soft static of this lies a fragmented recollection of motion—faded pulses echoing through time-warped layers of light and silence. A stillness wrapped in artifact.';
  }

  return (
    <figure ref={panelRef} className="panel" role="img" aria-labelledby="panel-caption">
      <div
        ref={setImgRef}
        className="panel__img"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
          '--bg-image': `url(${imageUrl})`
        }}
        data-image-url={imageUrl}
      />
      <figcaption className="panel__content" id="panel-caption">
        <h3 className="m-0 text-base font-medium">{title}</h3>
        <p className="m-0 max-w-[150px] text-pretty">{description}</p>
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
