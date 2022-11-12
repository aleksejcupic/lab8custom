/* globals d3, _*/

const width = 800;
const height = 800;


const data = d3.csv("driving.csv", d3.autoType).then((data) => {
  
  let chart = ConnectedScatterplot(data, {
  x: d => d.miles,
  y: d => d.gas,
  title: d => d.year,
  orient: d => d.side,
  yFormat: ".2f",
  xLabel: "Miles per person per year",
  yLabel: "Cost per gallon",
  width: width,
  height: height,
  duration: 5000
});
  
  const svg = document.querySelector("svg");
  svg.appendChild(chart);
  
});


function ConnectedScatterplot(data, {
  x = ([x]) => x, 
  y = ([, y]) => y, 
  r = 3, 
  title, 
  orient = () => "top", 
  defined, 
  curve = d3.curveCatmullRom, 
  width, 
  height, 
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 30,
  inset = r * 2,
  xRange = [marginLeft + inset, width - marginRight - inset],
  xFormat, 
  xLabel, 
  yFormat, 
  yLabel,
  yRange = [height - marginBottom - inset, marginTop + inset],
  fill = 'white',
  stroke = 'currentColor',
  strokeWidth = 2,
  strokeLinecapLineJoin = 'round',
  halo = '#fff', 
  haloWidth = 6,
  duration = 5000
} = {}) {
  // Compute values.
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
  
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const T = title == null ? null : d3.map(data, title);
  const O = d3.map(data, orient);
  const I = d3.range(X.length);
  if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
  const D = d3.map(data, defined);

   // Compute default domains.
  const xDomain = d3.nice(...d3.extent(X), width / 50);
  const yDomain = d3.nice(...d3.extent(Y), height / 50);

  // Construct scales and axes.
  const xScale = d3.scaleLinear(xDomain, [marginLeft + inset, width - marginRight - inset]);
  const yScale = d3.scaleLinear(yDomain, [height - marginBottom - inset, marginTop + inset]);
  const xAxis = d3.axisBottom(xScale).ticks(width / 50, xFormat);
  const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

  // Construct the line generator.
  const line = d3.line()
      .curve(curve)
      .defined(i => D[i])
      .x(i => xScale(X[i]))
      .y(i => yScale(Y[i]));

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("y2", marginTop + marginBottom - height)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("font-size", 12)
          .attr("fill", stroke)
          .attr("font-weight", "bold")
          .attr("text-anchor", "end")
          .text(xLabel));

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - 50)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", stroke)
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .attr("font-size", 12)
          .text(yLabel));

  const path = svg.append("path")
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linejoin", strokeLinecapLineJoin)
      .attr("stroke-linecap", strokeLinecapLineJoin)
      .attr("d", line(I));
  
  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
    .selectAll("circle")
    .data(I.filter(i => D[i]))
    .join("circle")
      .attr("cx", i => xScale(X[i]))
      .attr("cy", i => yScale(Y[i]))
      .attr("r", r);

  const label = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(I.filter(i => D[i]))
    .join("g")
      .attr("transform", i => `translate(${xScale(X[i])},${yScale(Y[i])})`);

  if (T) label.append("text")
      .text(i => T[i])
      .each(function(i) {
        const t = d3.select(this);
        switch (O[i]) {
          case "bottom": t.attr("text-anchor", "middle").attr("dy", "1.4em"); break;
          case "left": t.attr("dx", "-0.5em").attr("dy", "0.32em").attr("text-anchor", "end"); break;
          case "right": t.attr("dx", "0.5em").attr("dy", "0.32em").attr("text-anchor", "start"); break;
          default: t.attr("text-anchor", "middle").attr("dy", "-0.7em"); break;
        }
      }) 
      .call(text => text.clone(true))
      .attr("fill", "none");  
  
  label.call(halo);
  
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

    function length(path) {
        return d3.create("svg:path").attr("d", path).node().getTotalLength();
    }

    function animate() {
        if (duration > 0) {
        const l = length(line(I));

        path
            .interrupt()
            .attr("stroke-dasharray", `0,${l}`)
            .transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .attr("stroke-dasharray", `${l},${l}`);

        label
            .interrupt()
            .attr("opacity", 0)
            .transition()
            .delay(i => length(line(I.filter(j => j <= i))) / l * (duration - 125))
            .attr("opacity", 1);
        }    
    }

  animate();

  return Object.assign(svg.node(), {animate});
}