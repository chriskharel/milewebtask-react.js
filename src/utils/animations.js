import { gsap } from 'gsap';

export const defaultConfig = {
  clipPathDirection: 'top-bottom',
  autoAdjustHorizontalClipPath: false,
  steps: 6,
  stepDuration: 0.35,
  stepInterval: 0.05,
  moverPauseBeforeExit: 0.14,
  rotationRange: 0,
  panelRevealEase: 'sine.inOut',
  moverEnterEase: 'sine.in',
  moverExitEase: 'sine',
  panelRevealDurationFactor: 2,
  moverBlendMode: false,
  pathMotion: 'linear',
  sineAmplitude: 50,
};

// Helper to get clip path based on direction
function getClipPath(direction, progress) {
  const progressPercent = progress * 100;
  
  switch (direction) {
    case 'top-bottom':
      return `polygon(0% 0%, 100% 0%, 100% ${progressPercent}%, 0% ${progressPercent}%)`;
    case 'bottom-top':
      return `polygon(0% ${100 - progressPercent}%, 100% ${100 - progressPercent}%, 100% 100%, 0% 100%)`;
    case 'left-right':
      return `polygon(0% 0%, ${progressPercent}% 0%, ${progressPercent}% 100%, 0% 100%)`;
    case 'right-left':
      return `polygon(${100 - progressPercent}% 0%, 100% 0%, 100% 100%, ${100 - progressPercent}% 100%)`;
    default:
      return `polygon(0% 0%, 100% 0%, 100% ${progressPercent}%, 0% ${progressPercent}%)`;
  }
}

// Calculate path position based on motion type
function getPathPosition(start, end, progress, config, moverIndex = 0) {
  const { pathMotion, sineAmplitude, rotationRange } = config;
  
  // Base linear interpolation
  const baseX = start.x + (end.x - start.x) * progress;
  const baseY = start.y + (end.y - start.y) * progress;
  
  // Calculate rotation (decreases as progress increases)
  let rotation = 0;
  if (rotationRange) {
    // Use mover index for variation, but keep it deterministic
    const variation = (moverIndex % 3 - 1) * 0.3;
    rotation = rotationRange * variation * (1 - progress);
  }
  
  if (pathMotion === 'linear') {
    return {
      x: baseX,
      y: baseY,
      rotation: rotation
    };
  } else if (pathMotion === 'sine') {
    // Create a sine wave arc perpendicular to the direction of travel
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    
    // Perpendicular direction
    const perpAngle = angle + Math.PI / 2;
    
    // Sine wave offset (creates arc)
    const sineValue = Math.sin(progress * Math.PI);
    const offsetDistance = sineValue * (sineAmplitude || 50);
    
    const offsetX = Math.cos(perpAngle) * offsetDistance;
    const offsetY = Math.sin(perpAngle) * offsetDistance;
    
    return {
      x: baseX + offsetX,
      y: baseY + offsetY,
      rotation: rotation
    };
  }
  
  return {
    x: baseX,
    y: baseY,
    rotation: rotation
  };
}

export class RepeatingImageTransition {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
    this.isAnimating = false;
  }

  async animateToPanel(gridItem, panel, otherGridItems) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const timeline = gsap.timeline();

    // Get positions and dimensions
    const gridItemRect = gridItem.getBoundingClientRect();
    const panelImg = panel.querySelector('.panel__img');
    const panelImgRect = panelImg ? panelImg.getBoundingClientRect() : panel.getBoundingClientRect();
    
    // Calculate target position (center of panel image area)
    const targetX = panelImgRect.left + panelImgRect.width / 2;
    const targetY = panelImgRect.top + panelImgRect.height / 2;
    
    const startPos = {
      x: gridItemRect.left + gridItemRect.width / 2,
      y: gridItemRect.top + gridItemRect.height / 2
    };
    
    const endPos = {
      x: targetX,
      y: targetY
    };

    // Set initial panel state
    const clipPathDir = this.config.clipPathDirection || 'top-bottom';
    const initialClipPath = getClipPath(clipPathDir, 0);
    
    gsap.set(panel, { 
      opacity: 1, 
      pointerEvents: 'auto',
      clipPath: initialClipPath
    });

    // Hide grid items
    gsap.set([gridItem, ...otherGridItems], { opacity: 0 });

    // Create mover elements
    const movers = this.createMovers(gridItem, this.config.steps);
    
    // Animate each mover
    movers.forEach((mover, index) => {
      const delay = index * this.config.stepInterval;
      const moverWidth = gridItemRect.width;
      const moverHeight = gridItemRect.height;
      
      // Set initial position
      gsap.set(mover, {
        x: gridItemRect.left,
        y: gridItemRect.top,
        width: moverWidth,
        height: moverHeight,
        opacity: 0,
        rotation: 0,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
      });

      // Enter animation
      const enterDuration = this.config.stepDuration || 0.35;
      const enterEase = this.config.moverEnterEase || 'sine.in';
      
      timeline.to(mover, {
        opacity: 1,
        duration: enterDuration * 0.3,
        ease: enterEase
      }, delay);

      // Move animation with path
      const moveProgress = { value: 0 };
      const moveDuration = enterDuration * 0.7;
      
      timeline.to(moveProgress, {
        value: 1,
        duration: moveDuration,
        ease: 'none',
        onUpdate: () => {
          const pos = getPathPosition(startPos, endPos, moveProgress.value, this.config, index);
          gsap.set(mover, {
            x: pos.x - moverWidth / 2,
            y: pos.y - moverHeight / 2,
            rotation: pos.rotation
          });
        }
      }, delay + enterDuration * 0.3);

      // Exit animation
      const pauseTime = this.config.moverPauseBeforeExit || 0.14;
      const exitEase = this.config.moverExitEase || 'sine';
      
      timeline.to(mover, {
        opacity: 0,
        scale: 0.8,
        duration: enterDuration * 0.5,
        ease: exitEase,
        onComplete: () => {
          mover.remove();
        }
      }, delay + enterDuration + moveDuration + pauseTime);
    });

    // Reveal panel with clip path animation
    const revealDuration = (this.config.stepDuration || 0.35) * (this.config.panelRevealDurationFactor || 2);
    const revealEase = this.config.panelRevealEase || 'sine.inOut';
    const revealStartTime = this.config.steps * this.config.stepInterval + (this.config.stepDuration || 0.35);
    
    const revealProgress = { value: 0 };
    timeline.to(revealProgress, {
      value: 1,
      duration: revealDuration,
      ease: revealEase,
      onUpdate: () => {
        const clipPath = getClipPath(clipPathDir, revealProgress.value);
        gsap.set(panel, { clipPath });
      },
      onComplete: () => {
        this.isAnimating = false;
      }
    }, revealStartTime);

    return new Promise(resolve => {
      timeline.call(() => resolve(), null, timeline.totalDuration());
    });
  }

  async animateToGrid(panel, gridItems) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const timeline = gsap.timeline();
    const clipPathDir = this.config.clipPathDirection || 'top-bottom';
    const revealDuration = (this.config.stepDuration || 0.35) * (this.config.panelRevealDurationFactor || 2);
    const revealEase = this.config.panelRevealEase || 'sine.inOut';

    // Hide panel with clip path
    const hideProgress = { value: 1 };
    timeline.to(hideProgress, {
      value: 0,
      duration: revealDuration,
      ease: revealEase,
      onUpdate: () => {
        const clipPath = getClipPath(clipPathDir, hideProgress.value);
        gsap.set(panel, { clipPath });
      },
      onComplete: () => {
        gsap.set(panel, { opacity: 0, pointerEvents: 'none' });
      }
    });

    // Show grid items
    timeline.to(gridItems, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'sine.out',
      stagger: 0.02,
      onComplete: () => {
        this.isAnimating = false;
      }
    }, revealDuration * 0.3);

    return new Promise(resolve => {
      timeline.call(() => resolve(), null, timeline.totalDuration());
    });
  }

  createMovers(sourceElement, count) {
    const movers = [];
    const sourceImage = sourceElement.querySelector('.grid__item-image');
    const backgroundImage = sourceImage ? 
      window.getComputedStyle(sourceImage).backgroundImage : 
      'none';

    for (let i = 0; i < count; i++) {
      const mover = document.createElement('div');
      mover.className = 'mover';
      mover.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        background-image: ${backgroundImage};
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        pointer-events: none;
        z-index: 1999;
        opacity: 0;
      `;

      if (this.config.moverBlendMode && typeof this.config.moverBlendMode === 'string') {
        mover.style.mixBlendMode = this.config.moverBlendMode;
      }

      document.body.appendChild(mover);
      movers.push(mover);
    }

    return movers;
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  get isCurrentlyAnimating() {
    return this.isAnimating;
  }
}
