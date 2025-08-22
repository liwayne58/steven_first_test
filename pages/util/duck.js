/**
 * Duck.js - A simple walking duck animation for web pages
 * 
 * This module creates a cute duck that walks across the bottom of your webpage.
 * You can customize the duck's appearance, speed, and behavior.
 */

class Duck {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      duckSize: options.duckSize || 50, // Duck height in pixels
      speed: options.speed || 2, // Duck walking speed (pixels per frame)
      containerId: options.containerId || 'duck-container',
      startPosition: options.startPosition || 'left', // 'left' or 'right'
      walkSound: options.walkSound || null, // Path to quack sound file
      soundInterval: options.soundInterval || 10000, // How often to quack (in ms) - not used anymore
      duckImage: options.duckImage || null, // Custom duck image path
      bottomOffset: options.bottomOffset || 20, // Distance from bottom of container
      onClick: options.onClick || (() => this.quack()), // Default click action
      pauseOnHover: options.pauseOnHover !== undefined ? options.pauseOnHover : true,
      draggable: options.draggable !== undefined ? options.draggable : true // Allow duck to be dragged
    };

    // Animation state
    this.state = {
      position: 0,
      direction: this.config.startPosition === 'right' ? -1 : 1,
      isWalking: true,
      frame: 0,
      container: null,
      duckElement: null,
      soundTimer: null,
      animationFrame: null,
      containerWidth: 0
    };

    // Sound state
    this.isQuacking = false;
    this.lastQuackTime = 0;
    this.quackCooldown = 1000; // Minimum time between quacks (ms)
    
    // Initialize sound if provided
    this.quackSound = null;
    if (this.config.walkSound) {
      this.quackSound = new Audio(this.config.walkSound);
      this.quackSound.preload = 'auto';
    }

    // Initialize the duck
    this.init();
  }

  /**
   * Initialize the duck and container
   */
  init() {
    // Create or find the container
    let container = document.getElementById(this.config.containerId);
    
    if (!container) {
      // Create a container if it doesn't exist
      container = document.createElement('div');
      container.id = this.config.containerId;
      document.body.appendChild(container);
    }

    // Style the container - make it cover the entire viewport
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none'; // Allow clicks to pass through container
    container.style.zIndex = '999';
    container.style.overflow = 'visible'; // Allow duck to be visible when dragged outside

    // Create the duck element
    const duck = document.createElement('div');
    duck.className = 'walking-duck';
    
    // Style the duck
    duck.style.position = 'absolute';
    duck.style.height = `${this.config.duckSize}px`;
    duck.style.width = `${this.config.duckSize * 1.2}px`;
    duck.style.bottom = `${this.config.bottomOffset}px`;
    duck.style.left = '0';
    duck.style.backgroundSize = 'contain';
    duck.style.backgroundPosition = 'center bottom';
    duck.style.backgroundRepeat = 'no-repeat';
    duck.style.pointerEvents = 'auto'; // Make duck clickable
    duck.style.cursor = 'pointer';
    
    // Set duck image
    if (this.config.duckImage) {
      duck.style.backgroundImage = `url(${this.config.duckImage})`;
    } else {
      // Default duck using emoji as fallback
      duck.style.fontSize = `${this.config.duckSize}px`;
      duck.style.lineHeight = `${this.config.duckSize}px`;
      duck.textContent = '🦆';
      duck.style.transform = 'scaleX(-1)'; // Default facing right (the emoji naturally faces left, so we flip it)
    }
    
    // Add the duck to the container
    container.appendChild(duck);
    
    // Store references
    this.state.container = container;
    this.state.duckElement = duck;
    this.state.containerWidth = container.offsetWidth;
    
    // Set initial position
    if (this.config.startPosition === 'right') {
      this.state.position = this.state.containerWidth - this.config.duckSize;
      if (!this.config.duckImage) {
        duck.style.transform = 'scaleX(1)'; // Flip duck to face left (since emoji naturally faces left)
      }
    }
    duck.style.left = `${this.state.position}px`;
    
    // Always position at bottom initially regardless of container height
    duck.style.bottom = `${this.config.bottomOffset}px`;
    duck.style.top = 'auto'; // Ensure top isn't set

    // Add event listeners
    // Remove click handler that plays sound
    duck.addEventListener('click', () => {}); // Empty click handler
    
    if (this.config.pauseOnHover) {
      duck.addEventListener('mouseenter', () => this.pause());
      duck.addEventListener('mouseleave', () => this.resume());
    }
    
    // Make duck draggable if enabled
    if (this.config.draggable) {
      this.makeDuckDraggable(duck);
    }

    // Start the animation
    this.startAnimation();
    
    // We don't want periodic quacking
    // Removing the startSoundTimer call
    
    // Handle window resizing
    window.addEventListener('resize', () => {
      this.state.containerWidth = this.state.container.offsetWidth;
    });
  }

  /**
   * Start the duck animation
   */
  startAnimation() {
    if (this.state.animationFrame) {
      cancelAnimationFrame(this.state.animationFrame);
    }
    
    const animate = () => {
      if (this.state.isWalking) {
        this.moveStep();
      }
      this.state.animationFrame = requestAnimationFrame(animate);
    };
    
    this.state.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Move the duck one step
   */
  moveStep() {
    // If duck has animation in progress, don't interrupt
    if (this.state.duckElement.style.animation) {
      return;
    }
    
    // Update position
    this.state.position += this.config.speed * this.state.direction;
    
    // Handle boundaries - use window width for full screen container
    if (this.state.position >= window.innerWidth - this.config.duckSize * 1.2) {
      // Reached right edge, change direction
      this.state.direction = -1;
      if (!this.config.duckImage) {
        this.state.duckElement.style.transform = 'scaleX(1)'; // Face left (since emoji naturally faces left)
      }
      // No quack on direction change
    } else if (this.state.position <= 0) {
      // Reached left edge, change direction
      this.state.direction = 1;
      if (!this.config.duckImage) {
        this.state.duckElement.style.transform = 'scaleX(-1)'; // Face right (flip the naturally left-facing emoji)
      }
      // No quack on direction change
    }
    
    // Apply the new position
    this.state.duckElement.style.left = `${this.state.position}px`;
    
    // Ensure duck is positioned from bottom during walking
    this.state.duckElement.style.top = 'auto';
    
    // Animate walking - simple bobbing effect
    this.state.frame = (this.state.frame + 1) % 20;
    const bobAmount = Math.sin(this.state.frame / 3) * 3;
    this.state.duckElement.style.bottom = `${this.config.bottomOffset + bobAmount}px`;
  }

  /**
   * Make the duck quack
   */
  quack() {
    const currentTime = Date.now();
    const timeSinceLastQuack = currentTime - this.lastQuackTime;
    
    // Only play sound if cooldown period has passed
    if (this.quackSound && timeSinceLastQuack > this.quackCooldown) {
      this.isQuacking = true;
      this.lastQuackTime = currentTime;
      
      // Create a new instance of the sound
      const quack = this.quackSound.cloneNode();
      quack.volume = 0.5; // Not too loud
      quack.play();
      
      // Track when sound finishes
      quack.onended = () => {
        this.isQuacking = false;
      };
      
      // Safety timeout in case onended doesn't fire
      setTimeout(() => {
        this.isQuacking = false;
      }, 500);
      
      return true; // Sound was played
    }
    
    return false; // Sound was not played (on cooldown)
  }

  /**
   * Start the timer for periodic quacking (not used anymore)
   */
  startSoundTimer() {
    if (this.state.soundTimer) {
      clearInterval(this.state.soundTimer);
    }
    
    // No periodic quacking
  }

  /**
   * Pause the duck animation
   */
  pause() {
    this.state.isWalking = false;
  }

  /**
   * Resume the duck animation
   */
  resume() {
    this.state.isWalking = true;
    
    // Make sure duck is positioned correctly for walking
    if (this.state.duckElement) {
      this.state.duckElement.style.top = 'auto';
      this.state.duckElement.style.bottom = `${this.config.bottomOffset}px`;
      
      // Clear any animations that might be running
      this.state.duckElement.style.animation = '';
      this.state.duckElement.style.transition = '';
    }
  }

  /**
   * Toggle the duck animation
   */
  toggle() {
    this.state.isWalking = !this.state.isWalking;
    return this.state.isWalking;
  }

  /**
   * Make the duck element draggable
   * @param {HTMLElement} duckElement - The duck DOM element
   */
  makeDuckDraggable(duckElement) {
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let originalBottom = 0;
    let wasWalking = false;

    // Mouse events for desktop
    duckElement.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only left mouse button
      this.startDrag(e.clientX, e.clientY, duckElement);
      e.preventDefault(); // Prevent text selection
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        this.moveDuck(e.clientX, e.clientY, duckElement);
      }
    });

    document.addEventListener('mouseup', () => {
      this.endDrag();
    });

    // Touch events for mobile
    duckElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.startDrag(touch.clientX, touch.clientY, duckElement);
        e.preventDefault(); // Prevent scrolling while dragging
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        this.moveDuck(touch.clientX, touch.clientY, duckElement);
        e.preventDefault(); // Prevent scrolling while dragging
      }
    });

    document.addEventListener('touchend', () => {
      this.endDrag();
    });

    document.addEventListener('touchcancel', () => {
      this.endDrag();
    });

    // Store methods in this instance for event handlers
    this.startDrag = (clientX, clientY, element) => {
      isDragging = true;
      wasWalking = this.state.isWalking;
      this.pause(); // Pause animation while dragging
      
      const rect = element.getBoundingClientRect();
      dragOffsetX = clientX - rect.left;
      dragOffsetY = clientY - rect.top;
      originalBottom = parseInt(element.style.bottom, 10);
      
      // Change cursor and add dragging class
      element.style.cursor = 'grabbing';
      element.classList.add('dragging');
      
      // Optional: Make duck quack when picked up
      this.quack();
    };

    this.moveDuck = (clientX, clientY, element) => {
      if (!isDragging) return;

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const duckWidth = element.offsetWidth;
      const duckHeight = element.offsetHeight;
      
      // Calculate new position relative to viewport
      let newX = clientX - dragOffsetX;
      let newY = clientY - dragOffsetY;
      
      // Constrain within viewport bounds
      newX = Math.max(0, Math.min(newX, viewportWidth - duckWidth));
      newY = Math.max(0, Math.min(newY, viewportHeight - duckHeight));
      
      // Switch from bottom-based to top-based positioning when dragging
      element.style.top = `${newY}px`;
      element.style.left = `${newX}px`;
      element.style.bottom = 'auto'; // Clear bottom positioning
      
      // Store horizontal position for when walking resumes
      this.state.position = newX;
    };

    this.endDrag = () => {
      if (!isDragging) return;
      
      isDragging = false;
      
      const duckElement = this.state.duckElement;
      // Reset cursor and remove dragging class
      duckElement.style.cursor = 'pointer';
      duckElement.classList.remove('dragging');
      
      // Get current position
      const currentRect = duckElement.getBoundingClientRect();
      const startY = currentRect.top;
      const finalY = window.innerHeight - this.config.duckSize - this.config.bottomOffset;
      
      // Clear any existing transitions
      duckElement.style.transition = '';
      
      // Animate falling with gravity effect
      this.animateFall(duckElement, startY, finalY);
      
      // Resume walking after animation
      if (wasWalking) {
        setTimeout(() => this.resume(), 1200); // Resume after fall animation
      }
    };
    
    // Add falling animation method to the scope
    this.animateFall = (element, startY, finalY) => {
      const fallDuration = 1000; // 1 second for fall
      const bounceDuration = 200; // 0.2 seconds for bounce
      const startTime = performance.now();
      const distance = finalY - startY;
      
      // Physics constants
      const gravity = 0.002; // Gravity acceleration
      let velocity = 0;      // Initial velocity
      
      // Use requestAnimationFrame for smooth animation
      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < fallDuration) {
          // Apply gravity physics
          velocity += gravity * elapsedTime;
          
          // Calculate new position using quadratic function (gravity)
          let newY = startY + (0.5 * gravity * elapsedTime * elapsedTime);
          
          // Don't go beyond the floor
          if (newY > finalY) {
            newY = finalY;
            
            // Start bounce if we hit floor
            element.style.animation = `duckBounce ${bounceDuration}ms ease-out`;
            
            // Maybe play another quack on bounce, only if enough time has passed
            // We'll check in the quack method itself if we can actually play
            // setTimeout(() => {
            //   this.quack(); // The quack method will handle timing logic
            // }, 200);
          }
          
          // Apply new position
          element.style.top = `${newY}px`;
          
          // Continue animation
          requestAnimationFrame(animate);
        } else {
          // Animation complete, set final position
          element.style.top = 'auto';
          element.style.bottom = `${this.config.bottomOffset}px`;
          
          // Add a small wobble effect at the end for cuteness
          element.style.animation = 'duckWobble 0.3s ease-in-out';
          
          // Clean up animation after it completes
          setTimeout(() => {
            element.style.animation = '';
          }, 300);
        }
      };
      
      // Add keyframes for bounce and wobble if not already added
      if (!document.getElementById('duckAnimations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'duckAnimations';
        styleSheet.textContent = `
          @keyframes duckBounce {
            0% { transform: translateY(0) scaleY(1); }
            30% { transform: translateY(-20px) scaleY(1.1); }
            60% { transform: translateY(-10px) scaleY(0.9); }
            100% { transform: translateY(0) scaleY(1); }
          }
          
          @keyframes duckWobble {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
            100% { transform: rotate(0deg); }
          }
        `;
        document.head.appendChild(styleSheet);
      }
      
      // Start animation
      requestAnimationFrame(animate);
    };
  }

  /**
   * Remove the duck from the page
   */
  remove() {
    if (this.state.animationFrame) {
      cancelAnimationFrame(this.state.animationFrame);
    }
    
    if (this.state.soundTimer) {
      clearInterval(this.state.soundTimer);
    }
    
    if (this.state.container && this.state.container.parentNode) {
      this.state.container.parentNode.removeChild(this.state.container);
    }
  }
}

// Export the Duck class for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Duck;
} else {
  window.Duck = Duck;
}
