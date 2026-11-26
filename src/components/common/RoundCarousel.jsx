import { useEffect, useRef } from 'react';

export default function RoundCarousel({
  images = [],
  imageWidth = 300,
  imageHeight = 300,
  spacing = 3,
  speed = 7,
  direction = 'right',
  drag = true,
  sensitivity = 5,
  tilt = -7,
  perspective = 3000,
  cornerRadius = 22,
  innerDim = 3.5,
  background = 'transparent',
  style = {},
}) {
  const items = images;
  const count = items.length || 1;

  const ringRef = useRef(null);
  const rafRef = useRef(0);
  const rotYRef = useRef(0);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const dragRef = useRef({ active: false, x: 0 });

  const angle = 360 / count;
  const factor = 1 + spacing * 0.15;
  const radius = (imageWidth * factor) / (2 * Math.tan(Math.PI / count));
  const degPerSec = speed * 6 * (direction === 'left' ? -1 : 1);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const apply = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`;
    };
    apply();

    const draw = now => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);
      if (!dragRef.current.active) {
        if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.94;
        } else {
          rotYRef.current += degPerSec * f;
        }
      }
      apply();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, degPerSec, count]);

  const onPointerDown = e => {
    if (!drag) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { active: true, x: e.clientX };
    velRef.current = 0;
  };
  const onPointerMove = e => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    const k = 0.3 * sensitivity;
    rotYRef.current += dx * k;
    velRef.current = dx * k * 60;
  };
  const onPointerUp = e => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current.active = false;
  };

  const faceBase = {
    position: 'absolute',
    inset: 0,
    borderRadius: cornerRadius,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div
      style={{
        ...style,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background,
        perspective: `${perspective}px`,
        cursor: drag ? 'grab' : 'default',
        touchAction: 'pan-y',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div style={{ transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg)` }}>
        <div
          ref={ringRef}
          style={{ position: 'relative', width: imageWidth, height: imageHeight, transformStyle: 'preserve-3d' }}
        >
          {items.map((img, i) => {
            const src = img?.src;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  style={{
                    ...faceBase,
                    backgroundColor: src ? '#f5f3ef' : '#222',
                    backgroundImage: src ? `url(${src})` : undefined,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                  }}
                />
                <div
                  style={{
                    ...faceBase,
                    transform: 'rotateY(180deg)',
                    backgroundColor: src ? 'transparent' : '#181818',
                    backgroundImage: src ? `url(${src})` : undefined,
                    filter: `brightness(${innerDim / 10})`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
