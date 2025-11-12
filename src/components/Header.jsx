import React from 'react';

const Header = () => {
  return (
    <header className="frame">
      <h1 className="frame__title">Repeating Image Transition</h1>
      <nav className="frame__links">
        <a className="line" href="https://tympanus.net/codrops/?p=92571">More info,</a>
        <a className="line" href="https://github.com/chriskharel/milewebtask-react.js/">Code,</a>
        <a className="line" href="https://tympanus.net/codrops/demos/">All demos</a>
      </nav>
      <nav className="frame__tags">
        <a className="line" href="https://tympanus.net/codrops/demos/?tag=page-transition">page-transition,</a>
        <a className="line" href="https://tympanus.net/codrops/demos/?tag=repetition">repetition,</a>
        <a className="line" href="https://tympanus.net/codrops/demos/?tag=grid">grid</a>
      </nav>
      <div id="cdawrap" style={{ gridArea: 'sponsor' }}>
        <a href="https://spline.design" className="line" target="_blank" rel="noopener noreferrer">
          Design, animate, and ship real-time 3D experiences with Spline.
        </a>
      </div>
    </header>
  );
};

export default Header;
