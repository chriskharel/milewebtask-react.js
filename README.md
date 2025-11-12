# Repeating Image Transition - React.js

A React.js implementation of the stunning Codrops "Repeating Image Transition" design, featuring smooth animations, multiple sections with different effects, and a responsive grid layout.

🔗 **Original Design**: [Codrops - Repeating Image Transition](https://tympanus.net/Development/RepeatingImageTransition/)

## ✨ Features

- **4 Unique Animation Sections**: Each with distinct transition effects
  - Shane Weber: Linear paths with smooth easing
  - Manika Jorge: Curved motion with elastic bounce
  - Angela Wong: Spiral motion with oscillation
  - Kaito Nakamura: Complex orbital paths with full rotation

- **Smooth Scrolling**: Lenis integration for buttery smooth scroll experience
- **GSAP Animations**: Professional-grade animations with configurable timing
- **Responsive Design**: 8-column grid on large screens, adaptive on smaller devices
- **64+ Image Items**: Extensive content across 4 scrollable sections
- **Full-Screen Image Panel**: Immersive viewing experience
- **Mobile Responsive**: Adapts to different screen sizes

## 🛠 Technologies Used

- **React.js**: Component-based UI framework
- **GSAP**: Professional-grade animations
- **Lenis**: Smooth scrolling library
- **CSS Grid**: Modern layout system
- **CSS Custom Properties**: Consistent theming

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.js          # Navigation header
│   ├── Heading.js         # Page heading section
│   ├── ImageGrid.js       # Grid of image items
│   ├── ImagePanel.js      # Fullscreen image panel
│   └── Footer.js          # Footer component
├── data/
│   └── imageData.js       # Image data and metadata
├── hooks/
│   └── useSmoothScroll.js # Custom hook for smooth scrolling
├── utils/
│   └── animations.js      # Animation system and utilities
├── App.js                 # Main application component
└── index.css              # Global styles
```

## 🚀 Getting Started

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## 🎨 Key Components

### ImageGrid
- Displays images in a responsive grid
- Handles click interactions
- Animates grid items on load

### ImagePanel
- Shows fullscreen image view
- Contains image metadata and description
- Provides close functionality

### RepeatingImageTransition (Animation System)
- Creates the signature "mover" elements
- Handles complex GSAP animations
- Manages transitions between states

## 📱 Responsive Breakpoints

- **Mobile**: 1-2 columns
- **Tablet**: 3-4 columns  
- **Desktop**: 6-8 columns
- **Large Desktop**: 8+ columns

## 🎯 Animation Configuration

The animation system supports extensive customization in `src/utils/animations.js`

## 🌟 Conversion Summary

### ✅ Successfully Converted to React + JavaScript
- **From**: Vanilla HTML/CSS/JavaScript with TypeScript complexity
- **To**: Modern React.js with JavaScript (no TypeScript complications)
- **Result**: Clean, maintainable, component-based architecture

### Maintained Features
- ✅ All original animations and visual effects
- ✅ Smooth scrolling with Lenis
- ✅ GSAP-powered transitions
- ✅ Keyboard navigation
- ✅ Responsive design
- ✅ Visual design fidelity

### Improvements Made
- ✅ Component-based architecture
- ✅ React hooks for state management  
- ✅ Modern JavaScript (ES6+)
- ✅ Enhanced responsive design
- ✅ Better code organization
- ✅ Hot reloading in development
- ✅ Simplified build process (no TypeScript/Tailwind conflicts)

## 🎨 Design Credits

Original design and concept by [Codrops](https://tympanus.net/codrops/)
React conversion implementation completed successfully.

---

**The project has been successfully converted from vanilla JavaScript to React.js! 🎉**

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

## 🌐 Deployment

### Cloudflare Pages

This project is optimized for Cloudflare Pages deployment:

1. **Build Command**: `npm run build`
2. **Build Output Directory**: `build`
3. **Node.js Version**: 18.x

### Build for Production

```bash
npm run build
```

## 🎭 Models Featured

- Shane Weber, Manika Jorge, Angela Wong, Kaito Nakamura
- Amelia Hart, Irina Volkova, Charlotte Byrne
- Anastasia Morozova, Eva Ramirez, Milana Petrova
- And many more across 4 unique sections...

## 📱 Responsive Breakpoints

- **Large screens**: 8-column grid
- **Medium screens**: 4-column grid  
- **Small screens**: 2-column grid
- **Mobile**: Single column with optimized spacing

## 🙏 Credits

- **Original Design**: [Codrops](https://tympanus.net/)
- **Images**: High-quality stock photography
- **Animations**: GSAP (GreenSock)
- **Smooth Scroll**: Lenis by Studio Freight

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Live Demo**: Coming soon on Cloudflare Pages 🚀
