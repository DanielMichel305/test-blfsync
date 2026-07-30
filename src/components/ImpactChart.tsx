import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Transaction, Track } from '../types';

interface ImpactChartProps {
  transactions: Transaction[];
  tracks: Track[];
  donorId: string;
}

export const ImpactChart: React.FC<ImpactChartProps> = ({ transactions, tracks, donorId }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 300 });

  useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height || 300
        });
      }
    });

    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || dimensions.width === 0) return;

    // Filter transactions for this donor
    const userTxs = transactions
      .filter(t => t.donor_id === donorId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate cumulative impact over time
    let cumulativeImpact = 0;
    const data: { date: Date; impact: number }[] = userTxs.map(tx => {
      const track = tracks.find(t => t.track_id === tx.track_id);
      if (track) {
        cumulativeImpact += tx.amount / track.cost_per_unit;
      }
      return {
        date: new Date(tx.date),
        impact: Math.round(cumulativeImpact)
      };
    });

    // If no data, render an empty state or just a flat line
    if (data.length === 0) {
      data.push({ date: new Date(), impact: 0 });
    }
    
    // Add dummy point for single data
    if (data.length === 1) {
      const pastDate = new Date(data[0].date);
      pastDate.setDate(pastDate.getDate() - 30);
      data.unshift({ date: pastDate, impact: 0 });
    }

    // Clear previous rendering
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    // Add a bit of padding to max Y to ensure top of line isn't cut off
    const maxImpact = d3.max(data, d => d.impact) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxImpact * 1.1])
      .range([height, 0]);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .attr('stroke-opacity', 0.1)
      .attr('stroke-dasharray', '3,3');

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('class', 'text-editorial-charcoal/60 text-[10px] font-mono')
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove());

    // Y Axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('class', 'text-editorial-charcoal/60 text-[10px] font-mono')
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove());

    // Line generator
    const line = d3.line<{ date: Date; impact: number }>()
      .x(d => x(d.date))
      .y(d => y(d.impact))
      .curve(d3.curveMonotoneX);

    // Area generator for the gradient below the line
    const area = d3.area<{ date: Date; impact: number }>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.impact))
      .curve(d3.curveMonotoneX);

    // Gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'impact-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981') // emerald-500
      .attr('stop-opacity', 0.2);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0);

    // Add area
    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#impact-gradient)')
      .attr('d', area);

    // Add line
    const path = svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#059669') // emerald-600
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Animation for line
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Add tooltip
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .attr('class', 'absolute hidden bg-editorial-charcoal text-editorial-cream text-xs font-mono px-3 py-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full z-10 transition-opacity duration-200');

    // Add overlay for hover events
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', (event) => {
        const x0 = x.invert(d3.pointer(event)[0]);
        const bisect = d3.bisector<{ date: Date; impact: number }, Date>(d => d.date).left;
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        if (!d0) return;
        const d = !d1 ? d0 : (x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0);

        tooltip
          .style('left', `${x(d.date) + margin.left}px`)
          .style('top', `${y(d.impact) + margin.top - 10}px`)
          .html(`
            <div class="font-bold mb-1">${d3.timeFormat('%b %d, %Y')(d.date)}</div>
            <div class="text-emerald-400">${d.impact.toLocaleString()} units reached</div>
          `)
          .classed('hidden', false)
          .style('opacity', 1);

        // Add a dot
        svg.selectAll('.focus-circle').remove();
        svg.append('circle')
          .attr('class', 'focus-circle')
          .attr('cx', x(d.date))
          .attr('cy', y(d.impact))
          .attr('r', 4)
          .attr('fill', '#059669')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0).on('end', function() {
          d3.select(this).classed('hidden', true);
        });
        svg.selectAll('.focus-circle').remove();
      });

    // Cleanup tooltips on unmount
    return () => {
      d3.select(containerRef.current).selectAll('.absolute').remove();
    };
  }, [transactions, tracks, donorId, dimensions]);

  return (
    <div className="relative w-full h-[300px]" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full overflow-visible" />
    </div>
  );
};
