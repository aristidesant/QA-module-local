import { useEffect, useRef } from 'react';
import { useComputedColorScheme } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import styles from './ParticleField.module.css';

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
}

const LINK_DISTANCE = 110;
const AREA_PER_PARTICLE = 9000;
const MAX_PARTICLES = 70;
const SPEED = 0.12;

/**
 * A quiet field of drifting dots joined by faint lines, drawn behind its parent.
 * It pauses when the tab is hidden or the band is off screen, and draws a single
 * still frame when the user asks for reduced motion.
 */
export function ParticleField() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const reduced = useReducedMotion();
	const scheme = useComputedColorScheme('light');

	useEffect(() => {
		const canvas = canvasRef.current;
		const host = canvas?.parentElement;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !host || !ctx) return;

		const dark = scheme === 'dark';
		const css = getComputedStyle(document.documentElement);
		const tint =
			css
				.getPropertyValue(
					dark ? '--mantine-color-cyan-4' : '--mantine-color-cyan-6'
				)
				.trim() || '#22b8cf';
		const dotAlpha = dark ? 0.55 : 0.35;
		const linkAlpha = dark ? 0.18 : 0.1;

		let width = 0;
		let height = 0;
		let particles: Particle[] = [];
		let frame = 0;
		let onScreen = true;

		const spawn = (): Particle => ({
			x: Math.random() * width,
			y: Math.random() * height,
			vx: (Math.random() * 2 - 1) * SPEED,
			vy: (Math.random() * 2 - 1) * SPEED,
			r: 0.6 + Math.random(),
		});

		const draw = () => {
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = tint;
			ctx.strokeStyle = tint;
			ctx.lineWidth = 1;
			for (let i = 0; i < particles.length; i++) {
				const a = particles[i];
				ctx.globalAlpha = dotAlpha;
				ctx.beginPath();
				ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
				ctx.fill();
				for (let j = i + 1; j < particles.length; j++) {
					const b = particles[j];
					const d = Math.hypot(a.x - b.x, a.y - b.y);
					if (d < LINK_DISTANCE) {
						ctx.globalAlpha = (1 - d / LINK_DISTANCE) * linkAlpha;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.stroke();
					}
				}
			}
			ctx.globalAlpha = 1;
		};

		const step = () => {
			for (const p of particles) {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0) p.x = width;
				else if (p.x > width) p.x = 0;
				if (p.y < 0) p.y = height;
				else if (p.y > height) p.y = 0;
			}
		};

		const loop = () => {
			frame = 0;
			if (document.hidden || !onScreen) return;
			step();
			draw();
			frame = requestAnimationFrame(loop);
		};

		const start = () => {
			if (reduced || frame !== 0) return;
			frame = requestAnimationFrame(loop);
		};

		const resize = () => {
			const rect = host.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.max(1, Math.round(width * dpr));
			canvas.height = Math.max(1, Math.round(height * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const count = Math.min(
				MAX_PARTICLES,
				Math.max(12, Math.round((width * height) / AREA_PER_PARTICLE))
			);
			particles = Array.from({ length: count }, spawn);
			draw();
		};

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(host);
		const visibility = new IntersectionObserver(([entry]) => {
			onScreen = entry.isIntersecting;
			if (onScreen) start();
		});
		visibility.observe(host);
		const onVisibilityChange = () => {
			if (!document.hidden) start();
		};
		document.addEventListener('visibilitychange', onVisibilityChange);

		resize();
		start();

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			visibility.disconnect();
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, [reduced, scheme]);

	return (
		<canvas ref={canvasRef} className={styles.canvas} aria-hidden='true' />
	);
}

export default ParticleField;
