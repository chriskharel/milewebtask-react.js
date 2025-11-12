import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import Heading from './components/Heading.jsx';
import ImageGrid from './components/ImageGrid.jsx';
import ImagePanel from './components/ImagePanel.jsx';
import Footer from './components/Footer.jsx';
import { sections } from './data/imageData.js';
import { useSmoothScroll } from './hooks/useSmoothScroll.js';
import { RepeatingImageTransition } from './utils/animations.js';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [panelLayout, setPanelLayout] = useState('right'); // 'left' or 'right'
  
  const animationSystem = useRef(new RepeatingImageTransition());

  useSmoothScroll();

  useEffect(() => {
    // Add js class to html element
    document.documentElement.classList.add('js');
    
    // Ensure body and html allow scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.classList.remove('loading');
    }, 1500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleItemClick = async (item, clickedElement, animationConfig = {}, event) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedItem(item);
    
    // Detect click position to determine panel layout
    const clickX = event.clientX;
    const viewportWidth = window.innerWidth;
    const isLeftSide = clickX < viewportWidth / 2;
    setPanelLayout(isLeftSide ? 'left' : 'right');
    
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
    
    const panelElement = document.querySelector('.panel');
    
    if (panelElement) {
      await animationSystem.current.animateToPanel(clickedElement, panelElement, otherGridItems, frameElements);
    }
    
    setIsPanelOpen(true);
    setIsAnimating(false);
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
              onItemClick={(item, element, event) => handleItemClick(item, element, section.animationConfig, event)}
              animationConfig={section.animationConfig}
            />
          </React.Fragment>
        ))}
        <ImagePanel 
          item={selectedItem}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          layout={panelLayout}
        />
        <Footer />
      </main>
    </div>
  );
}

export default App;
