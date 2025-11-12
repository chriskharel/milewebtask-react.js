import { gsap } from 'gsap';

export const defaultConfig = {
  clipPathDirection: 'top-bottom',
  autoAdjustHorizontalClipPath: true,
  steps: 6,
  stepDuration: 0.35,
  stepInterval: 0.05,
  moverPauseBeforeExit: 0.14,
  rotationRange: 0,
  wobbleStrength: 0,
  panelRevealEase: 'sine.inOut',
  gridItemEase: 'sine',
  moverEnterEase: 'sine.in',
  moverExitEase: 'sine',
  panelRevealDurationFactor: 2,
  clickedItemDurationFactor: 2,
  gridItemStaggerFactor: 0.3,
  moverBlendMode: false,
  pathMotion: 'linear',
  sineAmplitude: 50,
  sineFrequency: Math.PI,
};

// Linear interpolation helper
export const lerp = (a, b, t) => a + (b - a) * t;

// Get clip paths for direction using inset() syntax (matching original)
function getClipPathsForDirection(direction) {
  switch (direction) {
    case 'bottom-top':
      return {
        from: 'inset(0% 0% 100% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(100% 0% 0% 0%)',
      };
    case 'left-right':
      return {
        from: 'inset(0% 100% 0% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 0% 0% 100%)',
      };
    case 'right-left':
      return {
        from: 'inset(0% 0% 0% 100%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 100% 0% 0%)',
      };
    case 'top-bottom':
    default:
      return {
        from: 'inset(100% 0% 0% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 0% 100% 0%)',
      };
  }
}

// Calculate element center
function getElementCenter(el) {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// Generate motion path between start and end elements
function generateMotionPath(startRect, endRect, steps, config) {
  const path = [];
  const fullSteps = steps + 2;
  
  const startCenter = {
    x: startRect.left + startRect.width / 2,
    y: startRect.top + startRect.height / 2,
  };
  
  const endCenter = {
    x: endRect.left + endRect.width / 2,
    y: endRect.top + endRect.height / 2,
  };

  for (let i = 0; i < fullSteps; i++) {
    const t = i / (fullSteps - 1);
    const width = lerp(startRect.width, endRect.width, t);
    const height = lerp(startRect.height, endRect.height, t);
    const centerX = lerp(startCenter.x, endCenter.x, t);
    const centerY = lerp(startCenter.y, endCenter.y, t);

    // Apply sine offset (for sine motion)
    const sineOffset =
      config.pathMotion === 'sine'
        ? Math.sin(t * config.sineFrequency) * config.sineAmplitude
        : 0;

    // Add random wobble
    const wobbleX = (Math.random() - 0.5) * config.wobbleStrength;
    const wobbleY = (Math.random() - 0.5) * config.wobbleStrength;

    path.push({
      left: centerX - width / 2 + wobbleX,
      top: centerY - height / 2 + sineOffset + wobbleY,
      width,
      height,
    });
  }

  return path.slice(1, -1);
}

// Compute stagger delays for grid item exit animations
function computeStaggerDelays(clickedItem, items, config) {
  const baseCenter = getElementCenter(clickedItem);
  const distances = Array.from(items).map((el) => {
    const center = getElementCenter(el);
    return Math.hypot(center.x - baseCenter.x, center.y - baseCenter.y);
  });
  const max = Math.max(...distances);
  return distances.map((d) => (d / max) * config.gridItemStaggerFactor);
}

export class RepeatingImageTransition {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
    this.isAnimating = false;
    this.currentItem = null;
  }

  // Hide frame overlay (header/footer)
  hideFrame(frameElements) {
    if (!frameElements || frameElements.length === 0) return;
    gsap.to(frameElements, {
      opacity: 0,
      duration: 0.5,
      ease: 'sine.inOut',
      pointerEvents: 'none',
    });
  }

  // Show frame overlay
  showFrame(frameElements) {
    if (!frameElements || frameElements.length === 0) return;
    gsap.to(frameElements, {
      opacity: 1,
      duration: 0.5,
      ease: 'sine.inOut',
      pointerEvents: 'auto',
    });
  }

  // Position panel based on click side
  positionPanelBasedOnClick(clickedItem, panel) {
    const centerX = getElementCenter(clickedItem).x;
    const windowHalf = window.innerWidth / 2;
    const isLeftSide = centerX < windowHalf;

    if (isLeftSide) {
      panel.classList.add('panel--right');
    } else {
      panel.classList.remove('panel--right');
    }

    // Auto-adjust horizontal clip-path direction
    if (this.config.autoAdjustHorizontalClipPath) {
      if (
        this.config.clipPathDirection === 'left-right' ||
        this.config.clipPathDirection === 'right-left'
      ) {
        this.config.clipPathDirection = isLeftSide ? 'left-right' : 'right-left';
      }
    }
  }

  async animateToPanel(gridItem, panel, otherGridItems, frameElements = []) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentItem = gridItem;

    // Position panel based on click
    this.positionPanelBasedOnClick(gridItem, panel);

    // Hide frame overlay
    this.hideFrame(frameElements);

    // Get positions and dimensions
    const gridItemRect = gridItem.getBoundingClientRect();
    const gridItemImage = gridItem.querySelector('.grid__item-image');
    const panelImg = panel.querySelector('.panel__img');
    const panelImgRect = panelImg ? panelImg.getBoundingClientRect() : panel.getBoundingClientRect();

    // Extract image URL
    const imgURL = gridItemImage
      ? window.getComputedStyle(gridItemImage).backgroundImage
      : 'none';

    // Get clip paths for direction
    const clipPaths = getClipPathsForDirection(this.config.clipPathDirection);

    // Animate grid items
    const allItems = Array.from(otherGridItems);
    allItems.push(gridItem);
    const delays = computeStaggerDelays(gridItem, allItems, this.config);

    // Animate all grid items
    gsap.to(allItems, {
      opacity: 0,
      scale: (i, el) => (el === gridItem ? 1 : 0.8),
      duration: (i, el) =>
        el === gridItem
          ? this.config.stepDuration * this.config.clickedItemDurationFactor
          : 0.3,
      ease: this.config.gridItemEase,
      clipPath: (i, el) => (el === gridItem ? clipPaths.from : 'none'),
      delay: (i) => delays[i],
    });

    // Generate motion path
    const path = generateMotionPath(gridItemRect, panelImgRect, this.config.steps, this.config);

    // Create and animate movers
    const movers = [];
    path.forEach((step, index) => {
      const mover = document.createElement('div');
      mover.className = 'mover';

      // Set initial style
      const style = {
        backgroundImage: imgURL,
        position: 'fixed',
        left: `${step.left}px`,
        top: `${step.top}px`,
        width: `${step.width}px`,
        height: `${step.height}px`,
        clipPath: clipPaths.from,
        zIndex: 1000 + index,
        backgroundPosition: '50% 50%',
        backgroundSize: 'cover',
        pointerEvents: 'none',
      };

      if (this.config.moverBlendMode) {
        style.mixBlendMode = this.config.moverBlendMode;
      }

      Object.assign(mover.style, style);

      // Set rotation
      gsap.set(mover, {
        rotationZ: gsap.utils.random(-this.config.rotationRange, this.config.rotationRange),
      });

      document.body.appendChild(mover);
      movers.push(mover);

      const delay = index * this.config.stepInterval;

      // Animate mover
      gsap
        .timeline({ delay })
        .fromTo(
          mover,
          { opacity: 0.4, clipPath: clipPaths.hide },
          {
            opacity: 1,
            clipPath: clipPaths.reveal,
            duration: this.config.stepDuration,
            ease: this.config.moverEnterEase,
          }
        )
        .to(
          mover,
          {
            clipPath: clipPaths.from,
            duration: this.config.stepDuration,
            ease: this.config.moverExitEase,
          },
          `+=${this.config.moverPauseBeforeExit}`
        );
    });

    // Schedule mover cleanup
    const cleanupDelay =
      this.config.steps * this.config.stepInterval +
      this.config.stepDuration * 2 +
      this.config.moverPauseBeforeExit;
    
    gsap.delayedCall(cleanupDelay, () => {
      movers.forEach((m) => m.remove());
    });

    // Reveal panel
    const panelContent = panel.querySelector('.panel__content');
    gsap.set(panelContent, { opacity: 0 });
    gsap.set(panel, { opacity: 1, pointerEvents: 'auto' });

    gsap
      .timeline({
        defaults: {
          duration: this.config.stepDuration * this.config.panelRevealDurationFactor,
          ease: this.config.panelRevealEase,
        },
      })
      .fromTo(
        panelImg,
        { clipPath: clipPaths.hide },
        {
          clipPath: clipPaths.reveal,
          pointerEvents: 'auto',
          delay: this.config.steps * this.config.stepInterval,
        }
      )
      .fromTo(
        panelContent,
        { y: 25 },
        {
          duration: 1,
          ease: 'expo',
          opacity: 1,
          y: 0,
          delay: this.config.steps * this.config.stepInterval,
          onComplete: () => {
            this.isAnimating = false;
          },
        },
        '<-=.2'
      );

    return new Promise((resolve) => {
      const totalDuration =
        this.config.steps * this.config.stepInterval +
        this.config.stepDuration * 2 +
        this.config.moverPauseBeforeExit +
        this.config.stepDuration * this.config.panelRevealDurationFactor;
      setTimeout(() => resolve(), totalDuration * 1000);
    });
  }

  async animateToGrid(panel, gridItems, frameElements = []) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const allItems = Array.from(gridItems);

    gsap
      .timeline({
        defaults: { duration: this.config.stepDuration, ease: 'expo' },
        onComplete: () => {
          panel.classList.remove('panel--right');
          this.isAnimating = false;
        },
      })
      .to(panel, { opacity: 0 })
      .add(() => this.showFrame(frameElements), 0)
      .set(panel, { opacity: 0, pointerEvents: 'none' })
      .set(panel.querySelector('.panel__img'), {
        clipPath: 'inset(0% 0% 100% 0%)',
      })
      .set(allItems, { clipPath: 'none', opacity: 0, scale: 0.8 }, 0)
      .to(
        allItems,
        {
          opacity: 1,
          scale: 1,
          delay: (i) => {
            if (!this.currentItem) return 0;
            const delays = computeStaggerDelays(this.currentItem, allItems, this.config);
            return delays[i];
          },
        },
        '>'
      );

    return new Promise((resolve) => {
      setTimeout(() => resolve(), this.config.stepDuration * 2000);
    });
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  get isCurrentlyAnimating() {
    return this.isAnimating;
  }
}
