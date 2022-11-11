d3.csv('driving.csv', d3.autoType).then(data => {
    renderChart(data);
})

const margin = ({top: 50, right: 50, bottom: 50, left: 50})  
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const xScale = d3
    .scaleLinear()
    .rangeRound([0, height])
    .paddingInner(0.1)
    .nice();

const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .nice();

function renderChart(data){
    xScale.domain([d3.extent(data.miles)]);
    yScale.domain([d3.extent(data.gas)]);

    const xAxis = d3
        .axisBottom(xScale)
        .ticks('10', 's');
    svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(xAxis);
    
    const yAxis = d3
        .axisLeft(yScale)
        .ticks('10', 's');;
    svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(yAxis);

    axisGroup.call(yAxis)
        .call(g => g.select(".domain").remove());

    axisGroup.selectAll(".tick line")
        .clone()
        .attr("x2", width)
        .attr("stroke-opacity", 0.1)

    svg.call(g =>
        g.append("text")
          .text("Cost per gallon")
          .call(halo)
    );

    axisGroup.call(xAxis)
        .call(g => g.select(".domain").remove());

    axisGroup.selectAll(".tick line")
        .clone()
        .attr("x2", width)
        .attr("stroke-opacity", 0.1)

    svg.call(g =>
        g.append("text")
            .text("Miles per person per year")
            .call(halo)
    );

    let circles = svg
        .selectAll('.circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('cx', d => xScale(d.miles))
        .attr('cy', d => yScale(d.gas))
        .attr('r', 10);

    let text = svg
        .selectAll('.text')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'small')
        .attr('font-size', 11)
        .attr('text-anchor', 'middle')
        .each(d => position(d))
        .text(d => d.year)
        .call(halo);

    const line = d3
        .line()
        .x()
        .y();

    svg.append('path')
        .datum(data)
        .attr('d', line);
}

function position(d) {
    const t = d3.select(this);
    switch (d.side) {
      case "top":
        t.attr("text-anchor", "middle").attr("dy", "-0.7em");
        break;
      case "right":
        t.attr("dx", "0.5em")
          .attr("dy", "0.32em")
          .attr("text-anchor", "start");
        break;
      case "bottom":
        t.attr("text-anchor", "middle").attr("dy", "1.4em");
        break;
      case "left":
        t.attr("dx", "-0.5em")
          .attr("dy", "0.32em")
          .attr("text-anchor", "end");
        break;
    }
}

function halo(text) {
    text
      .select(function() {
        return this.parentNode.insertBefore(this.cloneNode(true), this);
      })
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 4)
      .attr("stroke-linejoin", "round");
}