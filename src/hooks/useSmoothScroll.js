import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';

export const useSmoothScroll = () => {
  useEffect(() => {
    // Initialize Lenis for smooth scroll effects
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 1,
    });

    // Add lenis class to html
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    // Ensure body allows scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    // RAF loop for Lenis
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Sync with GSAP ticker
    const gsapHandler = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(gsapHandler);

    // Turn off GSAP's default lag smoothing to avoid conflicts with Lenis
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelAnimationFrame(rafId);
      gsap.ticker.remove(gsapHandler);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      lenis.destroy();
    };
  }, []);
};
