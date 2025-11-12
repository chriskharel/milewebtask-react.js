import React from 'react';

const ImageGrid = ({ items, onItemClick, animationConfig }) => {
  const handleItemClick = (item, event) => {
    const target = event.currentTarget;
    onItemClick(item, target, event);
  };

  return (
    <div className="grid">
      {items.map((item) => (
        <figure
          key={item.id}
          className="grid__item group"
          onClick={(e) => handleItemClick(item, e)}
          role="img"
          aria-labelledby={`caption-${item.id}`}
          data-steps={animationConfig?.steps}
          data-rotation-range={animationConfig?.rotationRange}
          data-step-interval={animationConfig?.stepInterval}
          data-mover-pause-before-exit={animationConfig?.moverPauseBeforeExit}
          data-mover-enter-ease={animationConfig?.moverEnterEase}
          data-mover-exit-ease={animationConfig?.moverExitEase}
          data-panel-reveal-ease={animationConfig?.panelRevealEase}
          data-step-duration={animationConfig?.stepDuration}
          data-path-motion={animationConfig?.pathMotion}
          data-sine-amplitude={animationConfig?.sineAmplitude}
          data-clip-path-direction={animationConfig?.clipPathDirection}
          data-auto-adjust-horizontal-clip-path={animationConfig?.autoAdjustHorizontalClipPath}
          data-panel-reveal-duration-factor={animationConfig?.panelRevealDurationFactor}
          data-mover-blend-mode={animationConfig?.moverBlendMode}
        >
          <div
            className="grid__item-image transition-opacity duration-150 ease-out"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          />
          <figcaption
            className="grid__item-caption"
            id={`caption-${item.id}`}
          >
            <h3 className="text-base font-medium m-0 text-right">{item.title}</h3>
            <p className="hidden">Model: {item.model}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

export default ImageGrid;
