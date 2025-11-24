import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MiniSparkline } from './MiniSparkline';

describe('MiniSparkline', () => {
	it('renders nothing when data is empty', () => {
		const { container } = render(<MiniSparkline data={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders svg when data is provided', () => {
		const { container } = render(<MiniSparkline data={[1, 2, 3, 4, 5]} />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveAttribute('width', '80');
		expect(svg).toHaveAttribute('height', '40');
	});

	it('calculates points correctly', () => {
		const { container } = render(<MiniSparkline data={[0, 10]} height={100} />);
		const polyline = container.querySelector('polyline');
		expect(polyline).toBeInTheDocument();
		// With 2 points:
		// min=0, max=10, range=10
		// step = 80 / 1 = 80
		// Point 0: x=0, y=100 - ((0-0)/10)*100 = 100
		// Point 1: x=80, y=100 - ((10-0)/10)*100 = 0
		// Expected points: "0,100 80,0"
		expect(polyline).toHaveAttribute('points', '0,100 80,0');
	});

	it('uses custom color', () => {
		const { container } = render(<MiniSparkline data={[1, 2]} color='red' />);
		const polyline = container.querySelector('polyline');
		expect(polyline).toHaveAttribute('stroke', 'red');
	});
});
