import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

const App = () => {
  const [proteins, setProteins] = useState([]);

  useEffect(() => {
    const fetchAllProteins = async () => {
      try {
        const response = await axios.get('https://cors-anywhere.herokuapp.com/https://gpcrdb.org/services/proteinfamily/proteins/');
        const allData = response.data;
        setProteins(allData);
        createChart(allData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllProteins();
  }, []);

  const createChart = (data) => {
    if (data.length === 0) {
      console.log('No data available for chart');
      return;
    }

    const speciesCount = d3.rollups(
      data,
      v => v.length,
      d => d.species
    );

    const top5Species = speciesCount.sort((a, b) => b[1] - a[1]).slice(0, 5);

    const chartDiv = d3.select('#chart');
    chartDiv.selectAll('svg').remove();

    const svg = chartDiv.append('svg')
      .attr('width', 600)
      .attr('height', 400);

    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(top5Species, d => d[1])])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(top5Species.map(d => d[0]))
      .range([0, height])
      .padding(0.1);

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px');

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px');

    g.selectAll('.bar')
      .data(top5Species)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d[0]))
      .attr('width', d => x(d[1]))
      .attr('height', y.bandwidth())
      .style('fill', 'steelblue');

    g.selectAll('.label')
      .data(top5Species)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => x(d[1]) + 5)
      .attr('y', d => y(d[0]) + y.bandwidth() / 2)
      .attr('dy', '.35em')
      .text(d => d[1])
      .style('font-size', '12px');
  };

  return (
    <div>
      <h1>Top 5 Species by Protein Count</h1>
      <div id="chart"></div>
    </div>
  );
};

export default App;
