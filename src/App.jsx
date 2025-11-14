import React, { useEffect, useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import Header from './components/Header.jsx';
import Heading from './components/Heading.jsx';
import ImageGrid from './components/ImageGrid.jsx';
import ImagePanel from './components/ImagePanel.jsx';
import Footer from './components/Footer.jsx';
import { sections } from './data/imageData.js';
import { useSmoothScroll } from './hooks/useSmoothScroll.js';
import { RepeatingImageTransition } from './utils/animations.js';
import { preloadImages } from './utils/utils.js';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const animationSystem = useRef(new RepeatingImageTransition());

  useSmoothScroll();

  useEffect(() => {
    // Add js class to html element
    document.documentElement.classList.add('js');
    
    // Ensure body and html allow scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Preload images then initialize
    preloadImages('.grid__item-image, .panel__img').then(() => {
      setIsLoading(false);
      document.body.classList.remove('loading');
    });

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleItemClick = async (item, clickedElement, animationConfig = {}) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // If panel is already open, reset it first
    let panelElement = document.querySelector('.panel');
    if (panelElement && isPanelOpen) {
      // Kill any ongoing GSAP animations on the panel and related elements
      gsap.killTweensOf(panelElement);
      const panelImg = panelElement.querySelector('.panel__img');
      const panelContent = panelElement.querySelector('.panel__content');
      if (panelImg) gsap.killTweensOf(panelImg);
      if (panelContent) gsap.killTweensOf(panelContent);
      
      // Reset panel state immediately
      gsap.set(panelElement, { 
        opacity: 0, 
        pointerEvents: 'none'
      });
      if (panelImg) {
        gsap.set(panelImg, {
          clipPath: 'inset(0% 0% 100% 0%)'
        });
      }
      if (panelContent) {
        gsap.set(panelContent, {
          opacity: 0,
          y: 25
        });
      }
      
      // Wait a frame for cleanup
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    setSelectedItem(item);
    setIsPanelOpen(true); // Set panel open immediately so it doesn't get hidden
    
    // Wait for React to render the panel with the new item
    // Use requestAnimationFrame to ensure DOM is updated
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
    
    // Read data attributes from clicked element and merge with section config
    const dataConfig = {
      steps: clickedElement.dataset.steps ? parseInt(clickedElement.dataset.steps) : undefined,
      rotationRange: clickedElement.dataset.rotationRange ? parseFloat(clickedElement.dataset.rotationRange) : undefined,
      stepInterval: clickedElement.dataset.stepInterval ? parseFloat(clickedElement.dataset.stepInterval) : undefined,
      moverPauseBeforeExit: clickedElement.dataset.moverPauseBeforeExit ? parseFloat(clickedElement.dataset.moverPauseBeforeExit) : undefined,
      moverEnterEase: clickedElement.dataset.moverEnterEase,
      moverExitEase: clickedElement.dataset.moverExitEase,
      panelRevealEase: clickedElement.dataset.panelRevealEase,
      stepDuration: clickedElement.dataset.stepDuration ? parseFloat(clickedElement.dataset.stepDuration) : undefined,
      pathMotion: clickedElement.dataset.pathMotion,
      sineAmplitude: clickedElement.dataset.sineAmplitude ? parseFloat(clickedElement.dataset.sineAmplitude) : undefined,
      clipPathDirection: clickedElement.dataset.clipPathDirection,
      autoAdjustHorizontalClipPath: clickedElement.dataset.autoAdjustHorizontalClipPath === 'true',
      panelRevealDurationFactor: clickedElement.dataset.panelRevealDurationFactor ? parseFloat(clickedElement.dataset.panelRevealDurationFactor) : undefined,
      moverBlendMode: clickedElement.dataset.moverBlendMode || false,
      wobbleStrength: clickedElement.dataset.wobbleStrength ? parseFloat(clickedElement.dataset.wobbleStrength) : undefined,
    };
    
    // Remove undefined values and merge with section config
    const finalConfig = { ...animationConfig };
    Object.keys(dataConfig).forEach(key => {
      if (dataConfig[key] !== undefined) {
        finalConfig[key] = dataConfig[key];
      }
    });
    
    // Update animation system config
    if (Object.keys(finalConfig).length > 0) {
      animationSystem.current.updateConfig(finalConfig);
    }
    
    // Get all grid items except the clicked one
    const allGridItems = Array.from(document.querySelectorAll('.grid__item'));
    const otherGridItems = allGridItems.filter(el => el !== clickedElement);
    
    // Get frame elements (header and footer)
    const frameElements = Array.from(document.querySelectorAll('.frame, .heading'));
    
    // Wait for panel to be rendered and image to be set
    panelElement = document.querySelector('.panel');
    let panelImg = panelElement?.querySelector('.panel__img');
    let attempts = 0;
    const maxAttempts = 30;
    const expectedImageUrl = item.imageUrl;
    
    // Wait for panel image to be rendered with background image
    while ((!panelElement || !panelImg || !panelImg.style.backgroundImage || 
            (!panelImg.style.backgroundImage.includes(expectedImageUrl) && 
             panelImg.getAttribute('data-image-url') !== expectedImageUrl)) && attempts < maxAttempts) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      panelElement = document.querySelector('.panel');
      panelImg = panelElement?.querySelector('.panel__img');
      attempts++;
    }
    
    // Ensure image is set before animation - match original implementation
    if (panelElement && panelImg) {
      // Set background image directly like in original (line 232: panel.querySelector('.panel__img').style.backgroundImage = imgURL;)
      panelImg.style.backgroundImage = `url(${expectedImageUrl})`;
      
      // Verify the element is still in the DOM before animating
      if (!document.body.contains(panelElement)) {
        console.error('Panel element removed from DOM before animation');
        setIsAnimating(false);
        return;
      }
      
      try {
        await animationSystem.current.animateToPanel(clickedElement, panelElement, otherGridItems, frameElements);
        setIsAnimating(false);
      } catch (error) {
        console.error('Animation error:', error);
        setIsAnimating(false);
      }
    } else {
      console.error('Panel or panel image not found after waiting');
      setIsAnimating(false);
    }
  };

  const handleClosePanel = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Get all grid items
    const allGridItems = Array.from(document.querySelectorAll('.grid__item'));
    const panelElement = document.querySelector('.panel');
    
    // Get frame elements (header and footer)
    const frameElements = Array.from(document.querySelectorAll('.frame, .heading'));
    
    if (panelElement) {
      await animationSystem.current.animateToGrid(panelElement, allGridItems, frameElements);
    }
    
    setIsPanelOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
    setIsAnimating(false);
  }, [isAnimating]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPanelOpen && !isAnimating) {
        handleClosePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, isAnimating, handleClosePanel]);

  return (
    <div className={isLoading ? 'loading' : ''}>
      <main className="p-[1.5rem]">
        <Header />
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            <Heading title={section.title} meta={section.meta} />
            <ImageGrid 
              items={section.items} 
              onItemClick={(item, element) => handleItemClick(item, element, section.animationConfig)}
              animationConfig={section.animationConfig}
            />
          </React.Fragment>
        ))}
        <ImagePanel 
          item={selectedItem}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
        />
        <Footer />
      </main>
    </div>
  );
}

export default App;
