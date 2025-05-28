import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { useOrbContext } from './OrbContextProvider';

// Cache trig tables so we don't recalc sines/cosines each frame
const trigTableCache = new Map();

const getTrigTables = (points) => {
  const cached = trigTableCache.get(points);
  if (cached) return cached;
  const angles = new Array(points);
  const sin = new Array(points);
  const cos = new Array(points);
  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 * i) / points;
    angles[i] = angle;
    sin[i] = Math.sin(angle);
    cos[i] = Math.cos(angle);
  }
  const tables = { angles, sin, cos };
  trigTableCache.set(points, tables);
  return tables;
};

const AnimatedOrbHeroBG = ({ zIndex = 0, sx = {}, style = {}, className = "" }) => {
  const svgRef = useRef(null);
  const canvasRef = useRef(null);
  const parentOrbRef = useRef(null);
  const childrenGroupRef = useRef(null);

  // Refs to store mutable values that don't trigger re-renders
  const orbStatesRef = useRef([]);
  const childOrbsRef = useRef([]);
  const particlesRef = useRef([]);
  const viewportSizeRef = useRef({ vw: 800, vh: 800 });
  const parentCenterBaseRef = useRef({ x: 400, y: 400 });
  const parentCenterRef = useRef({ x: 400, y: 400 });
  const orbScaleRef = useRef(1);
  const lastWheelTimeRef = useRef(0);
  const animationFrameIdRef = useRef(null);
  
  // New refs for enhanced features
  const scrollPositionRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const orbReturnAnimationsRef = useRef([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isHeroVisibleRef = useRef(true);
  const childPositionsRef = useRef([]);
  const parentVelocityRef = useRef({ x: 0, y: 0 });
  const dataTransmissionsRef = useRef([]);
  const lastTransmissionTimeRef = useRef({});
  const childOrbitalDisruptionRef = useRef([]);
  const parentScrollVelocityRef = useRef({ x: 0, y: 0 });
  const childLagPositionsRef = useRef([]);

  const childCount = 5;
  const parentRadius = 30; // Reduced by 20% more (37 * 0.8)
  const childRadius = 11; // Reduced by 20% more (14 * 0.8)
  const parentPoints = 128; // High detail for smooth animation
  const childPoints = 64; // High detail for smooth animation
  const childAmp = 0.15; // Halfway to spherical - reduced from 0.3
  const orbMorphDirections = [];
  const orbMorphSpeeds = [];

  // --- Utility functions ---
  const hslToHex = (h, s, l) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return "#" + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
  };

  const lerpColor = (a, b, t) => {
    const ah = parseInt(a.replace('#', ''), 16), bh = parseInt(b.replace('#', ''), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
  };

  const generateSuperSmoothBlob = (cx, cy, r, points, t, amp = 1, phase = 0) => {
    const { angles, sin, cos } = getTrigTables(points);
    const pts = [];
    for (let i = 0; i < points; i++) {
      const angle = angles[i];
      // Full complexity noise for ethereal effect
      const noise =
        Math.sin(angle * 3 + t * 0.7 + phase) * 0.75 * amp +
        Math.sin(angle * 5 - t * 1.1 + phase) * 0.4 * amp +
        Math.sin(angle * 2 + t * 1.7 + phase) * 0.25 * amp;
      const rad = r + noise;
      pts.push({
        x: cx + cos[i] * rad,
        y: cy + sin[i] * rad
      });
    }
    let d = "";
    for (let i = 0; i < points; i++) {
      const p0 = pts[(i - 1 + points) % points];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % points];
      const p3 = pts[(i + 2) % points];
      if (i === 0) {
        d += `M${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
      }
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    d += "Z";
    return d;
  };

  const getDynamicColorFamily = (i, now) => {
    const baseHue = (i * 67 + now * 0.018) % 360;
    const hue2 = (baseHue + 40 + 20 * Math.sin(now * 0.0007 + i)) % 360;
    const sat = 80 + 10 * Math.sin(now * 0.0005 + i);
    const light1 = 60 + 10 * Math.cos(now * 0.0004 + i * 2);
    const light2 = 35 + 15 * Math.sin(now * 0.0006 + i * 3);
    return [hslToHex(baseHue, sat, light1), hslToHex(hue2, sat, light2)];
  };
  
  const approach = (current, target, speed) => {
    return current + (target - current) * speed;
  };

  const dampedSpring = (current, target, velocity, stiffness, damping) => {
    const force = (target - current) * stiffness;
    velocity += force;
    velocity *= damping;
    current += velocity;
    return [current, velocity];
  };

  const emitParticles = (x, y, color, count = 2, i = 0, now = 0) => {
    if (!particlesRef.current) particlesRef.current = [];
    for (let j = 0; j < count; j++) {
      let h = (i * 67 + now * 0.018) % 360 + (Math.random() - 0.5) * 24;
      let s = 85 + Math.random() * 10;
      let l = 55 + Math.random() * 20;
      const particleColor = hslToHex(h, s, l);
      const angle = Math.random() * 2 * Math.PI;
      const speed = 0.4 + Math.random() * 0.7;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      particlesRef.current.push({
        x, y, vx, vy,
        r: 1.1 + Math.random() * 1.2,
        life: 0.6,
        decay: 0.025 + Math.random() * 0.015,
        color: particleColor,
        opacity: 0.45
      });
    }
  };


  const createDataTransmission = (childIndex, childX, childY, parentX, parentY, color) => {
    const transmissionId = `${childIndex}_${Date.now()}`;
    dataTransmissionsRef.current.push({
      id: transmissionId,
      childIndex,
      startX: childX,
      startY: childY,
      endX: parentX,
      endY: parentY,
      progress: 0,
      color,
      opacity: 0.3, // Very subtle effect
      isLightning: true
    });
  };

  const updateDataTransmissions = () => {
    const transmissionsGroup = svgRef.current?.querySelector('#dataTransmissions');
    if (!transmissionsGroup) return;
    
    // Clear previous transmissions
    transmissionsGroup.innerHTML = '';
    
    // Update and filter active transmissions
    dataTransmissionsRef.current = dataTransmissionsRef.current.filter(t => t.progress < 1);
    
    for (const transmission of dataTransmissionsRef.current) {
      transmission.progress += 0.08; // Fast lightning strike
      
      if (transmission.progress < 1 && transmission.isLightning) {
        // Create a lightning strike effect
        const t = transmission.progress;
        
        // Create jagged lightning path
        const segments = 5;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let d = `M${transmission.startX},${transmission.startY}`;
        
        for (let seg = 1; seg <= segments; seg++) {
          const segProgress = (seg / segments) * t;
          const baseX = transmission.startX + (transmission.endX - transmission.startX) * segProgress;
          const baseY = transmission.startY + (transmission.endY - transmission.startY) * segProgress;
          
          // Add random offset for lightning effect
          const offset = (1 - segProgress) * 10; // Decreasing offset
          const offsetX = (Math.random() - 0.5) * offset;
          const offsetY = (Math.random() - 0.5) * offset;
          
          d += ` L${(baseX + offsetX).toFixed(1)},${(baseY + offsetY).toFixed(1)}`;
        }
        
        path.setAttribute("d", d);
        path.setAttribute("stroke", transmission.color);
        path.setAttribute("stroke-width", t < 0.5 ? "2" : "1");
        path.setAttribute("opacity", (transmission.opacity * 2 * (1 - t)).toFixed(2));
        path.setAttribute("fill", "none");
        path.setAttribute("filter", "url(#glow)");
        
        transmissionsGroup.appendChild(path);
        
        // Bright flash at start
        if (t < 0.2) {
          const flash = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          flash.setAttribute("cx", transmission.startX.toFixed(1));
          flash.setAttribute("cy", transmission.startY.toFixed(1));
          flash.setAttribute("r", (10 * (1 - t * 5)).toFixed(1));
          flash.setAttribute("fill", transmission.color);
          flash.setAttribute("opacity", (0.8 * (1 - t * 5)).toFixed(2));
          flash.setAttribute("filter", "url(#glow)");
          transmissionsGroup.appendChild(flash);
        }
      }
    }
  };

  // Canvas-based particle rendering for performance
  const renderCanvas = (ctx, now) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles only
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay;
      p.opacity = Math.max(0, p.life);
      
      ctx.globalAlpha = p.opacity * 0.7;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.opacity, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Get the context to update gradient colors
  const { updateGradientColors } = useOrbContext();

  useEffect(() => {
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    if (!svg || !canvas) {
      console.error('SVG or Canvas not initialized');
      return;
    }

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const ctx = canvas.getContext('2d');

    // Precompute trig tables for parent and child point counts
    getTrigTables(parentPoints);
    getTrigTables(childPoints);

    parentOrbRef.current = svg.querySelector('#parentOrb');
    childrenGroupRef.current = svg.querySelector('#children');
    
    const makeOrbState = () => ({
      drag: 0, dragTarget: 0, dragV: 0,
      squash: 0, squashTarget: 0, squashV: 0,
      mouseDir: 0, mouseDirTarget: 0, mouseDirV: 0,
      wobble: 0, lastUpdate: performance.now(),
      parallaxOffset: { x: 0, y: 0 },
      parallaxVelocity: { x: 0, y: 0 },
      isReturning: false, returnProgress: 0,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      // 3D Orbital parameters
      orbitalAngle: 0,  // Starting angle
      orbitalRadius: 0, // Base radius
      orbitalInclination: 0, // Tilt of orbital plane
      orbitalEccentricity: 0, // How elliptical (0 = circle, 1 = very elliptical)
      orbitalSpeed: 0, // Speed multiplier
      orbitalPhase: 0, // Phase offset for variety
      orbitalTilt: 0, // Additional axis tilt
      // Dynamic orbital changes
      orbitalPerturbation: { x: 0, y: 0, z: 0 }, // Temporary deviations
      orbitalTarget: { radius: 0, inclination: 0, eccentricity: 0 }, // Target state to return to
      wasVisible: true,
    });


    orbMorphDirections.length = 0;
    orbMorphSpeeds.length = 0;
    orbMorphDirections.push(Math.PI / 2); 
    orbMorphSpeeds.push(0.012);
    for (let i = 0; i < childCount; i++) {
      const angle = Math.PI / 2 + (i - (childCount - 1) / 2) * (Math.PI / 8) + (Math.random() - 0.5) * (Math.PI / 12);
      orbMorphDirections.push(angle);
      orbMorphSpeeds.push(0.014 + i * 0.004 + Math.random() * 0.003);
    }

    orbStatesRef.current = [makeOrbState()]; // Parent
    childOrbsRef.current = [];
    childPositionsRef.current = [];
    if (childrenGroupRef.current) {
        childrenGroupRef.current.innerHTML = '';
        for (let i = 0; i < childCount; i++) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("fill", `url(#childGrad${i})`); 
            path.setAttribute("opacity", "0.95");
            childrenGroupRef.current.appendChild(path);
            childOrbsRef.current.push(path);
            const childState = makeOrbState();
            // Initialize 3D orbital parameters - all children orbit around parent
            childState.orbitalAngle = (i * 2 * Math.PI / childCount); // Evenly spaced around circle
            childState.initialAngle = (i * 2 * Math.PI / childCount); // Store initial angle
            // Create cosmic orbital patterns with elliptical paths
            const orbitalVariations = [
              { radius: 60, inclination: Math.PI / 12, eccentricity: 0.6, speed: 1.2 },  // Fast inner ellipse
              { radius: 85, inclination: -Math.PI / 8, eccentricity: 0.3, speed: 0.7 },  // Medium tilted orbit
              { radius: 55, inclination: Math.PI / 6, eccentricity: 0.8, speed: 1.5 },   // Very fast, highly elliptical
              { radius: 95, inclination: Math.PI / 4, eccentricity: 0.4, speed: 0.5 },   // Slow outer orbit
              { radius: 75, inclination: -Math.PI / 10, eccentricity: 0.5, speed: 0.9 }  // Counter-tilted medium orbit
            ];
            const variation = orbitalVariations[i % orbitalVariations.length];
            childState.orbitalRadius = variation.radius;
            childState.orbitalInclination = variation.inclination;
            childState.orbitalEccentricity = variation.eccentricity;
            childState.orbitalSpeed = variation.speed;
            childState.orbitalPhase = i * Math.PI / 3; // Different start phases
            childState.orbitalTilt = 0; // No additional tilt
            childState.disruptionOffset = { x: 0, y: 0 };
            childState.returnVelocity = { x: 0, y: 0 };
            childState.isDisrupted = false;
            // Set targets for organized return
            childState.orbitalTarget = {
              radius: childState.orbitalRadius,
              inclination: childState.orbitalInclination,
              eccentricity: childState.orbitalEccentricity
            };
            orbStatesRef.current.push(childState);
            childPositionsRef.current.push({ x: 0, y: 0, z: 0 });
        }
    }

    const adjustSVGSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      viewportSizeRef.current = { vw, vh };
      
      const maxChildIndex = childCount - 1;
      const maxOrbit = parentRadius + 120 + maxChildIndex * 40;
      const maxReach = maxOrbit + childRadius + 8;
      const minDim = Math.min(vw, vh);
      const scale = minDim / (maxReach * 2);
      
      svg.setAttribute('width', vw.toString());
      svg.setAttribute('height', vh.toString());
      svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      
      // Position between navbar (height ~80px) and title (starts around 15% of viewport)
      const navbarHeight = 40; // Reduced to move orbs higher up
      const titleStartY = vh * 0.15; // Where title starts (from HeroSection pt values)
      
      // Calculate max orbital extent (largest orbit + child radius)
      const maxOrbitalRadius = 95; // Largest orbit from orbital variations
      const totalMaxRadius = maxOrbitalRadius + childRadius + 10; // Add buffer
      
      // Position orb in upper right, directly below navbar
      const minY = navbarHeight + 10; // Small buffer below navbar
      const maxY = titleStartY + 50; // Can go slightly behind title
      
      // Position orb at navbar level
      const upperY = navbarHeight - parentRadius; // Position center of orb overlapping with navbar
      
      // Dynamic positioning based on screen size
      const isMobile = vw < 768;
      const isTablet = vw >= 768 && vw < 1024;
      
      let xPosition;
      let dynamicScale;
      
      if (isMobile) {
        // Center on mobile
        xPosition = vw * 0.5;
        // Ensure orbs fit within viewport minus navbar
        const availableHeight = vh - navbarHeight - 40; // 40px bottom buffer
        const availableWidth = vw - 40; // 20px margins
        const maxDimension = Math.min(availableWidth, availableHeight);
        dynamicScale = Math.min(0.7, maxDimension / (totalMaxRadius * 2.2));
      } else if (isTablet) {
        // Position to the right on tablet
        xPosition = vw - parentRadius - 100; // Right side with margin (use parent radius for tighter positioning)
        dynamicScale = 0.85;
      } else {
        // Position to the right on desktop
        xPosition = vw - parentRadius - 120; // Right side with margin (use parent radius for tighter positioning)
        dynamicScale = 1;
      }
      
      const finalScale = scale * dynamicScale;
      
      parentCenterBaseRef.current = { x: xPosition, y: upperY };
      parentCenterRef.current = { x: xPosition, y: upperY };
      orbScaleRef.current = finalScale;
      
      // Debug log to verify positioning
      console.log('Orb positioned at:', { x: xPosition, y: upperY, viewport: { vw, vh }, device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop' });
    };

    adjustSVGSize();
    window.addEventListener('resize', adjustSVGSize);

    // Mouse move handler for cursor effect
    const handleMouseMove = (e) => {
      const rect = svg.getBoundingClientRect();
      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Enhanced scroll handling - only affects parent orb
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const now = performance.now();
      const dt = now - lastScrollTimeRef.current;
      
      if (dt > 0) {
        scrollVelocityRef.current = (scrollY - scrollPositionRef.current) / dt * 120;
      }
      
      scrollPositionRef.current = scrollY;
      lastScrollTimeRef.current = now;
      
      const heroHeight = window.innerHeight;
      const scrollProgress = Math.min(scrollY / heroHeight, 1);
      
      // Check if hero is visible
      const heroElement = document.querySelector('[data-hero-section]');
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect();
        const prev = isHeroVisibleRef.current;
        isHeroVisibleRef.current = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!prev && isHeroVisibleRef.current && !animationFrameIdRef.current) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
        }
      }
      
      // Parent orb responds to scroll with unique physics
      const parentState = orbStatesRef.current[0];
      if (parentState) {
        parentState.dragTarget += scrollVelocityRef.current * 0.5;
        parentVelocityRef.current.y = scrollVelocityRef.current * 0.3;
        parentScrollVelocityRef.current.x = scrollVelocityRef.current * 0.1;
        parentScrollVelocityRef.current.y = scrollVelocityRef.current * 0.25;
        
        // Disrupt child orbs based on scroll velocity
        const disruptionStrength = Math.min(Math.abs(scrollVelocityRef.current) * 0.02, 1);
        for (let i = 0; i < childCount; i++) {
          if (Math.abs(scrollVelocityRef.current) > 10) {
            childOrbitalDisruptionRef.current[i] = {
              x: (Math.random() - 0.5) * disruptionStrength * 30,
              y: scrollVelocityRef.current * 0.1
            };
            const childState = orbStatesRef.current[i + 1];
            if (childState) {
              childState.isDisrupted = true;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    const handleWheel = (e) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastWheelTimeRef.current);
      lastWheelTimeRef.current = now;
      const velocity = Math.max(-80, Math.min(80, e.deltaY / dt * 120));
      
      // Only affect parent orb with wheel
      const parentState = orbStatesRef.current[0];
      if (parentState && orbMorphDirections[0] !== undefined) {
        const angle = orbMorphDirections[0];
        parentState.dragTarget += (Math.sin(angle) * velocity * 1.8 + Math.cos(angle) * velocity * 0.7);
      }
      e.preventDefault();
    };
    
    const eventTarget = svg;
    eventTarget.addEventListener('wheel', handleWheel, { passive: false });

    const animate = () => {
      if (!svgRef.current || !parentOrbRef.current || !childrenGroupRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      // stop updates when hero is off screen
      if (!isHeroVisibleRef.current) {
        animationFrameIdRef.current = null;
        return;
      }

      const now = performance.now();
      
      // Update gradient colors in context for navbar orb
      const baseHue = (now * 0.01) % 360;
      const startHue = baseHue;
      const endHue = (baseHue + 60 * Math.sin(now * 0.00015 + Math.PI * 0.5)) % 360;
      const startColor = hslToHex(startHue, 80, 60);
      const endColor = hslToHex(endHue, 80, 60);
      updateGradientColors({ start: startColor, end: endColor });
      
      const parentStops = [
        { id: "p0", phase: 0 }, { id: "p1", phase: Math.PI * 0.5 },
        { id: "p2", phase: Math.PI }, { id: "p3", phase: Math.PI * 1.5 }
      ];
      for (let i = 0; i < parentStops.length; i++) {
        const stop = parentStops[i];
        const hue = (baseHue + 60 * Math.sin(now * 0.00015 + stop.phase)) % 360;
        const sat = 80 + 10 * Math.sin(now * 0.0002 + stop.phase);
        const light = 60 + 10 * Math.cos(now * 0.00018 + stop.phase);
        const stopEl = svgRef.current.querySelector(`#${stop.id}`);
        if (stopEl) stopEl.setAttribute("stop-color", hslToHex(hue, sat, light));
      }

      // Update parent orb physics
      const parentState = orbStatesRef.current[0];
      if (parentState && orbMorphDirections[0] !== undefined) {
        const spring = 0.06 * (1 + orbMorphSpeeds[0]);
        const damping = 0.94 - orbMorphSpeeds[0] * 0.2;
        [parentState.drag, parentState.dragV] = dampedSpring(parentState.drag, parentState.dragTarget, parentState.dragV, spring, damping);
        if (Math.abs(parentState.dragTarget) < 0.1 && Math.abs(parentState.drag) > 0.1) {
          parentState.wobble += 0.04 + orbMorphSpeeds[0] * 0.9;
          parentState.drag += Math.sin(parentState.wobble) * Math.max(0, Math.abs(parentState.drag) * 0.13 * (1 + orbMorphSpeeds[0]));
        } else if (Math.abs(parentState.dragTarget) < 0.1) {
          parentState.wobble = 0;
        }
        parentState.dragTarget = approach(parentState.dragTarget, 0, 0.025 + orbMorphSpeeds[0] * 0.4);
      }
      
      // Update parent orb position
      if (parentState && orbMorphDirections[0] !== undefined) {
        const parentMorphT = now * 0.00015; // Much slower morphing
        const parentDrag = parentState.drag;
        const parentAngle = orbMorphDirections[0];
        const parentDx = Math.cos(parentAngle) * parentDrag;
        const parentDy = Math.sin(parentAngle) * parentDrag;
        const scale = orbScaleRef.current || 1;
        
        const { vw, vh } = viewportSizeRef.current;
        
        // Define safe zones based on navbar and orb dimensions
        const navbarHeight = 80;
        const maxOrbitalRadius = 95;
        const totalMaxRadius = maxOrbitalRadius + childRadius + 10;
        
        // Gentler cursor effect
        const mouseX = mousePositionRef.current.x;
        const mouseY = mousePositionRef.current.y;
        const mouseDx = mouseX - parentCenterBaseRef.current.x;
        const mouseDy = mouseY - parentCenterBaseRef.current.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        const maxMouseEffect = 20;
        const mouseEffect = Math.max(0, 1 - mouseDistance / 400) * maxMouseEffect;
        
        // Smoother velocity damping
        parentVelocityRef.current.x *= 0.97;
        parentVelocityRef.current.y *= 0.96;
        
        // Gentler scroll response with bounds checking
        const scrollOffset = Math.max(-50, Math.min(50, scrollPositionRef.current * -0.08));
        
        // Subtle floating motion
        const floatX = Math.sin(now * 0.0001) * 15 + Math.cos(now * 0.00015) * 10;
        const floatY = Math.cos(now * 0.00012) * 10 + Math.sin(now * 0.00008) * 8;
        
        const px = parentCenterBaseRef.current.x + 
                   floatX +
                   (mouseDx / mouseDistance || 0) * mouseEffect +
                   parentVelocityRef.current.x;
        // Calculate parent Y with bounds to prevent navbar overlap
        const baseY = parentCenterBaseRef.current.y;
        const proposedY = baseY + 
                         floatY +
                         (mouseDy / mouseDistance || 0) * mouseEffect +
                         parentVelocityRef.current.y +
                         scrollOffset;
        
        // Allow orb to move freely, including overlapping navbar
        const safeMinY = parentRadius; // Only prevent going off screen
        const py = Math.max(safeMinY, proposedY);
        
        parentCenterRef.current = { x: px, y: py };

        const parentR = (parentRadius + parentDrag * 0.15) * scale;
        const parentAmp = (1 + Math.abs(parentDrag) * 0.008) * scale * 0.5; // More spherical parent orb
        const parentPath = generateSuperSmoothBlob(px + parentDx * scale, py + parentDy * scale, parentR, parentPoints, parentMorphT, parentAmp);
        if (parentOrbRef.current) parentOrbRef.current.setAttribute('d', parentPath);
      }

      // Update child orbs
      if (childrenGroupRef.current && childOrbsRef.current.length === childCount) {
        // Apply CSS rotation to the children group
        const parentState = orbStatesRef.current[0];
        if (parentState && orbMorphDirections[0] !== undefined) {
          const scale = orbScaleRef.current || 1;
          const parentAngle = orbMorphDirections[0];
          const parentDrag = parentState.drag;
          const parentDx = Math.cos(parentAngle) * parentDrag;
          const parentDy = Math.sin(parentAngle) * parentDrag;
          const parentX = parentCenterRef.current.x + parentDx * scale;
          const parentY = parentCenterRef.current.y + parentDy * scale;
          childrenGroupRef.current.style.transformOrigin = `${parentX}px ${parentY}px`;
          // Apply time-based rotation to ensure movement
          const rotationAngle = (now * 0.012) % 360; // Rotate based on time
          childrenGroupRef.current.style.transformOrigin = `${parentX}px ${parentY}px`;
          childrenGroupRef.current.style.transform = `rotate(${rotationAngle}deg)`;
          childrenGroupRef.current.style.transition = 'none'; // Ensure smooth animation
        }
        // Create array with indices for z-sorting
        const childIndices = Array.from({ length: childCount }, (_, i) => i);
        
        // Sort by z-position (back to front)
        childIndices.sort((a, b) => {
          const stateA = orbStatesRef.current[a + 1];
          const stateB = orbStatesRef.current[b + 1];
          return (stateA?.position?.z || 0) - (stateB?.position?.z || 0);
        });
        
        for (let idx = 0; idx < childCount; idx++) {
          const i = childIndices[idx];
          const state = orbStatesRef.current[i + 1];
          if (!state || orbMorphDirections[i+1] === undefined) continue;

          // Physics for orbital disruption and recovery
          state.drag *= 0.95; // Simple damping
          state.dragTarget = 0;
          
          // Handle disruption recovery with spring physics
          if (state.isDisrupted) {
            const disruption = childOrbitalDisruptionRef.current[i] || { x: 0, y: 0 };
            state.disruptionOffset.x += disruption.x;
            state.disruptionOffset.y += disruption.y;
            childOrbitalDisruptionRef.current[i] = { x: 0, y: 0 };
          }
          
          // Spring-based return to orbit
          const returnStiffness = 0.03;
          const returnDamping = 0.85;
          state.returnVelocity.x += -state.disruptionOffset.x * returnStiffness;
          state.returnVelocity.y += -state.disruptionOffset.y * returnStiffness;
          state.returnVelocity.x *= returnDamping;
          state.returnVelocity.y *= returnDamping;
          state.disruptionOffset.x += state.returnVelocity.x;
          state.disruptionOffset.y += state.returnVelocity.y;
          
          // Reset disrupted state when close to orbit
          if (Math.abs(state.disruptionOffset.x) < 1 && Math.abs(state.disruptionOffset.y) < 1) {
            state.isDisrupted = false;
          }

          const fam = getDynamicColorFamily(i, now);
          const tcol = 0.5 + 0.5 * Math.sin(now * 0.0005 + i);
          const childColor = lerpColor(fam[0], fam[1], tcol);
          const childGradStop0 = svgRef.current.querySelector(`#c${i}s0`);
          const childGradStop1 = svgRef.current.querySelector(`#c${i}s1`);
          if (childGradStop0) childGradStop0.setAttribute("stop-color", childColor);
          if (childGradStop1) childGradStop1.setAttribute("stop-color", lerpColor(fam[1], fam[0], tcol));
          
          // Color matching check will be done after position calculation
          
          // Use fixed angle for each child since CSS handles rotation
          const angle = state.initialAngle || (i * 2 * Math.PI / childCount);
          
          // No perturbations for stable orbits
          state.orbitalPerturbation.x = 0;
          state.orbitalPerturbation.y = 0;
          state.orbitalPerturbation.z = 0;
          
          const { vw, vh } = viewportSizeRef.current;
          const currentParentR = (parentRadius + (orbStatesRef.current[0]?.drag || 0) * 0.15) * (orbScaleRef.current || 1);
          
          // Simple 2D orbital calculations for clear motion
          const r = state.orbitalRadius;
          
          // Calculate orbital position relative to origin (0,0)
          const orbitalX = r * Math.cos(angle);
          const orbitalY = r * Math.sin(angle);
          
          // Simple 3D tilt for visual interest
          const inclination = state.orbitalInclination;
          const finalX = orbitalX;
          const finalY = orbitalY * Math.cos(inclination);
          const finalZ = orbitalY * Math.sin(inclination);
          
          // Project 3D to 2D with perspective
          const perspective = 800;
          const scale3D = perspective / (perspective + finalZ);
          
          // Get parent's current position (including any mouse effects from parent orb state)
          const parentState = orbStatesRef.current[0];
          const parentDrag = parentState?.drag || 0;
          const parentDragAngle = orbMorphDirections[0] || 0;
          const parentDx = Math.cos(parentDragAngle) * parentDrag;
          const parentDy = Math.sin(parentDragAngle) * parentDrag;
          const scale = orbScaleRef.current || 1;
          
          const parentX = parentCenterRef.current.x + parentDx * scale;
          const parentY = parentCenterRef.current.y + parentDy * scale;
          
          // Initialize lag positions if needed
          if (!childLagPositionsRef.current[i]) {
            childLagPositionsRef.current[i] = { x: 0, y: 0 };
          }
          
          // Target position with disruption offset
          const targetX = finalX * scale3D * (orbScaleRef.current || 1) + state.disruptionOffset.x;
          const targetY = finalY * scale3D * (orbScaleRef.current || 1) + state.disruptionOffset.y;
          
          // Apply lag to child movement relative to parent
          const lagFactor = 0.85; // How much the child lags behind (0.85 = 15% lag)
          childLagPositionsRef.current[i].x += (targetX - childLagPositionsRef.current[i].x) * (1 - lagFactor);
          childLagPositionsRef.current[i].y += (targetY - childLagPositionsRef.current[i].y) * (1 - lagFactor);
          
          // Position child with lag relative to parent's actual position
          const childX = parentX + childLagPositionsRef.current[i].x;
          const childY = parentY + childLagPositionsRef.current[i].y;
          
          // Check for color matching and create lightning strike
          const parentFam = getDynamicColorFamily(0, now);
          const parentTcol = 0.5 + 0.5 * Math.sin(now * 0.0002);
          const parentColor = lerpColor(parentFam[0], parentFam[1], parentTcol);
          
          // Simple color similarity check
          const colorSimilarity = Math.abs(parseInt(childColor.slice(1, 3), 16) - parseInt(parentColor.slice(1, 3), 16)) < 20;
          const lastTransmissionTime = lastTransmissionTimeRef.current[i] || 0;
          
          if (colorSimilarity && now - lastTransmissionTime > 2000) { // Lightning every 2 seconds max
            createDataTransmission(i, childX, childY, parentX, parentY, childColor);
            lastTransmissionTimeRef.current[i] = now;
          }
          
          // Store 3D position
          state.position.z = finalZ;
          
          // Remove drag effects for stable orbits
          const dx = 0;
          const dy = 0;
          
          // No collision detection - keep orbits stable
          state.velocity.x = 0;
          state.velocity.y = 0;
          
          // Check collision with parent
          const distToParent = Math.sqrt((childX - parentX) * (childX - parentX) + (childY - parentY) * (childY - parentY));
          const minDistance = (parentRadius + childRadius) * scale * 1.2; // Add some buffer
          
          let bounceX = 0, bounceY = 0;
          if (distToParent < minDistance && distToParent > 0) {
            // Calculate bounce direction (away from parent)
            const pushX = (childX - parentX) / distToParent;
            const pushY = (childY - parentY) / distToParent;
            const pushForce = (minDistance - distToParent) * 0.5;
            bounceX = pushX * pushForce;
            bounceY = pushY * pushForce;
          }
          
          // Use orbital position with bounce effect
          const x = childX + dx + bounceX;
          const y = childY + dy + bounceY;
          
          // Apply depth-based scaling and dimming
          const depthScale = scale3D * 0.8 + 0.2; // Keep minimum 20% size
          const depthOpacity = scale3D * 0.7 + 0.3; // Keep minimum 30% opacity
          
          const cR = (childRadius + state.drag * 0.08) * scale * depthScale;
          const currentChildAmp = (childAmp + Math.abs(state.drag) * 0.006) * scale * depthScale; // Already reduced childAmp
          const morphT = now * 0.0002 + i * 10; // Slower morphing
          
          const childPath = generateSuperSmoothBlob(x, y, cR, childPoints, morphT, currentChildAmp, i);
          
          
          const path = childOrbsRef.current[i];
          if (path) {
            path.setAttribute("d", childPath);
            
            const fadeStart = 40, fadeEnd = 340;
            const fade = Math.min(1, Math.max(0, (fadeEnd - Math.abs(state.dragTarget)) / (fadeEnd - fadeStart)));
            
            if (state.wasVisible === undefined) state.wasVisible = fade > 0.5;

            if (fade < 0.5 && fade > 0.05 && !state.isReturning) {
              const color = lerpColor(fam[0], fam[1], tcol);
              const emission = Math.ceil((0.5 - fade) * 8);
              emitParticles(x, y, color, emission, i, now);
              path.setAttribute("opacity", (fade * 0.95).toFixed(2));
            } else if (state.wasVisible && fade <= 0.05) {
              const color = lerpColor(fam[0], fam[1], tcol);
              emitParticles(x, y, color, 6, i, now);
              path.setAttribute("opacity", "0");
              state.wasVisible = false;
            } else if (!state.wasVisible && fade > 0.05) {
              const color = lerpColor(fam[0], fam[1], tcol);
              emitParticles(x, y, color, 5, i, now);
              path.setAttribute("opacity", (fade * 0.95).toFixed(2));
              state.wasVisible = true;
            } else {
              // Apply depth-based opacity
              path.setAttribute("opacity", (0.95 * depthOpacity).toFixed(2));
            }
            
            // Store position (for future use)
            childPositionsRef.current[i] = { x, y, z: finalZ };
            
            // Check for color matching and create data transmission
            // Get parent color
            const parentStop0 = svgRef.current.querySelector('#p0');
            const parentColor = parentStop0?.getAttribute('stop-color') || '#00E5FF';
            
            // Simple color similarity check (comparing first few characters)
            const colorMatch = childColor.substring(0, 4) === parentColor.substring(0, 4);
            
            // Intermittent transmission (random chance when colors match)
            const timeSinceLastTransmission = now - (lastTransmissionTimeRef.current[i] || 0);
            if (colorMatch && timeSinceLastTransmission > 3000 && Math.random() < 0.15) {
              createDataTransmission(i, x, y, parentX, parentY, childColor);
              lastTransmissionTimeRef.current[i] = now;
            }
            
            // Update z-order in DOM
            if (path.parentNode) {
              path.parentNode.appendChild(path);
            }
          }
        }
      }
      
      // Update data transmissions
      updateDataTransmissions();
      
      // Render particles on canvas
      renderCanvas(ctx, now);
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', adjustSVGSize);
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (eventTarget) {
        eventTarget.removeEventListener('wheel', handleWheel);
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [updateGradientColors]); // Include updateGradientColors in dependency array

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex,
        pointerEvents: "none", // Allows interaction with elements underneath
        touchAction: 'none', // For consistency with HTML
        background: 'transparent', // Ensure background is transparent
        ...sx,
      }}
      style={style}
      className={className}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <style>
        {`
          @keyframes rotateOrbs {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          #children {
            will-change: transform;
          }
        `}
      </style>
      <svg 
        ref={svgRef} 
        id="orbSVG"
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <defs>
          <radialGradient id="parentGrad" cx="50%" cy="50%" r="70%">
            <stop id="p0" offset="0%" stopColor="#00E5FF"/>
            <stop id="p1" offset="100%" stopColor="#5B3CFF"/>
            <stop id="p2" offset="50%" stopColor="#00E5FF"/>
            <stop id="p3" offset="75%" stopColor="#5B3CFF"/>
          </radialGradient>
          <radialGradient id="childGrad0" cx="50%" cy="50%" r="70%">
            <stop id="c0s0" offset="0%" stopColor="#B3D8FF"/>
            <stop id="c0s1" offset="100%" stopColor="#0A192F"/>
          </radialGradient>
          <radialGradient id="childGrad1" cx="50%" cy="50%" r="70%">
            <stop id="c1s0" offset="0%" stopColor="#C6FFD9"/>
            <stop id="c1s1" offset="100%" stopColor="#145A32"/>
          </radialGradient>
          <radialGradient id="childGrad2" cx="50%" cy="50%" r="70%">
            <stop id="c2s0" offset="0%" stopColor="#FFB3C9"/>
            <stop id="c2s1" offset="100%" stopColor="#7B1F3A"/>
          </radialGradient>
          <radialGradient id="childGrad3" cx="50%" cy="50%" r="70%">
            <stop id="c3s0" offset="0%" stopColor="#E0D1FF"/>
            <stop id="c3s1" offset="100%" stopColor="#311B4F"/>
          </radialGradient>
          <radialGradient id="childGrad4" cx="50%" cy="50%" r="70%">
            <stop id="c4s0" offset="0%" stopColor="#FFF5B3"/>
            <stop id="c4s1" offset="100%" stopColor="#4B3800"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path id="parentOrb" fill="url(#parentGrad)" opacity="0.95"/>
        <g id="dataTransmissions"></g>
        <g id="children"></g>
      </svg>
    </Box>
  );
};

export default AnimatedOrbHeroBG;