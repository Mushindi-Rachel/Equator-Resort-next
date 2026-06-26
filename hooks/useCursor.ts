import { useEffect, useRef } from 'react';

export function useCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = cursorDotRef.current;
    const outline = cursorOutlineRef.current;

    if (!dot || !outline) return;

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const animate = () => {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;

      outline.style.left = `${outlineX}px`;
      outline.style.top = `${outlineY}px`;

      animId = requestAnimationFrame(animate);
    };

    const hoverOn = () => outline.classList.add('cursor-hover');
    const hoverOff = () => outline.classList.remove('cursor-hover');

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(animate);

    const attachListeners = () => {
      const els = document.querySelectorAll(
        'a, button, [role="button"], input, select, textarea'
      );

      els.forEach((el) => {
        el.addEventListener('mouseenter', hoverOn);
        el.addEventListener('mouseleave', hoverOff);
      });
    };

    attachListeners();

    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return { cursorDotRef, cursorOutlineRef };
}