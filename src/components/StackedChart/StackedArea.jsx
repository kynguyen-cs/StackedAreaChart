import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// TODO filtered needed library of d3js
import * as d3 from 'd3';

export default class StackGraph extends React.Component {
  // Checking types
  // TODO check input data
  static propTypes = {
    margin: React.PropTypes.object,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  };

  // Default margin
  static defaultProps = {
    margin: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50
    },
    width: 800,
    height: 600
  };

  // Using d3js to draw the chart
  drawChart() {
    // Set the dimensions and margins of the chart
    // TODO import data inside
    const {
      margin,
      width: widthIncludingMargins,
      height: heightIncludingMargins
    } = this.props;
    const width = widthIncludingMargins - margin.left - margin.right;
    const height = heightIncludingMargins - margin.top - margin.bottom;

    // Parse the date
    // TODO modified base on data
    const parseDate = d3.timeParse('%Y-%m-%d'); // 17-08-15

    // Format date time
    const formatTime = d3.timeFormat('%B %d');

    // Bisector for compute tooltip position
    const bisectDate = d3.bisector(function(d) {
      return d.date;
    }).left;

    // Set the scale of axes
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Put color
    const color = d3.scaleOrdinal(d3.schemeCategory20);

    // Ticks of axis
    const xAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat('%B %d'));
    const yAxis = d3.axisLeft().scale(y); // const yAxis = d3.axisLeft().scale(y).tickFormat(formatBillion);

    // Gridlines in y axis function
    function make_y_gridlines() {
      return d3.axisLeft(y).ticks(5);
    }

    // Set up the area
    const area = d3
      .area()
      .x(function(d) {
        return x(d.data.date);
      })
      .y0(function(d) {
        return y(d[0]);
      })
      .y1(function(d) {
        return y(d[1]);
      });

    // Set up the stack
    const stack = d3.stack();

    // START DRAWING
    // Adds the svg canvas
    const svg = d3
      .select('body')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'svgborder')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const legend = svg.append('g').attr('class', 'legend');
    const title = svg.append('g').attr('class', 'title');
    const mouse = svg.append('g').attr('class', 'mouse');

    // group class DOM of tooltip
    const tooltip = svg.append('g').attr('class', 'tooltip');

    // Define the circle for tooltip
    const focus = tooltip
      .append('svg')
      .attr('class', 'circle')
      .style('display', 'none');

    // Define rectangle for text display for tooltip
    const rectool = tooltip
      .append('svg')
      .attr('class', 'rectangle')
      .style('display', 'none');

    // Define text display for tooltip
    const nametool = tooltip
      .append('svg')
      .attr('class', 'text')
      .style('display', 'none');
    const typetool = tooltip
      .append('svg')
      .attr('class', 'text')
      .style('display', 'none');
    const datetool = tooltip
      .append('svg')
      .attr('class', 'text')
      .style('display', 'none');

    // Get the data from a .csv file with absolutely url
    d3.csv(
      // To request csv, download this file first to get direct link: http://www.mediafire.com/file/5n6zyqo8j9qazjn/crash.csv
      'http://download1081.mediafireuserdownload.com/5758p84mttcg/5n6zyqo8j9qazjn/crash.csv',
      function(error, data) {
        // Error handle
        if (error) throw error;

        // keys = the list of legends (versions)
        const keys = data.columns.filter(function(key) {
          return key !== 'date';
        });

        // Run date formated
        data.forEach(function(d) {
          d.date = parseDate(d.date);
        });

        // Compute the max value of data (highest point of y axis)
        const maxDateVal = d3.max(data, function(d) {
          const vals = d3.keys(d).map(function(key) {
            return key !== 'date' ? d[key] : 0;
          });
          return d3.sum(vals);
        });

        // Set domains for axes
        x.domain(
          d3.extent(data, function(d) {
            return d.date;
          })
        );
        y.domain([0, maxDateVal]);

        // Set the keys access
        stack.keys(keys);

        // Main area
        const browser = svg
          .selectAll('.browser')
          .data(stack(data))
          .enter()
          .append('g')
          .attr('class', function(d) {
            return d.index;
          })
          .attr('fill-opacity', 0.75);

        // Put color to area
        browser
          .append('path')
          .attr('class', 'area')
          .attr('d', area)
          .style('fill', function(d) {
            return color(d.key);
          });

        // Add legend to chart
        keys.map(function(d, i) {
          legend
            .append('rect') // rectangle
            .attr('x', i * 130) // position
            .attr('y', height + 50)
            .attr('width', d.length * 7.7) // width of rectangle hold the legend
            .attr('height', 20)
            .style('fill', color(d)); // put color base on method color()
          legend
            .append('text')
            .attr('x', i * 130 + 5)
            .attr('y', height + 65)
            .attr('class', 'legendtext' + i) // class name of this legend name
            .text(d);
          // .on('mouseover', function(d) {
          //   console.log(d3.selectAll('.legend').selectAll('text').select('.legendtext1').style('font-size', '24px'));
          // });
        });

        // Add the Y gridlines
        svg
          .append('g')
          .attr('class', 'grid')
          .call(make_y_gridlines().tickSize(-width).tickFormat(''))
          .attr('opacity', 0.25);

        // Draw x axis
        svg
          .append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

        // Draw y axis
        svg.append('g').attr('class', 'y axis').call(yAxis);

        // Name of the chart
        title
          .append('text')
          .attr('x', margin.left - 100)
          .attr('y', 0 - margin.top + 70)
          .attr('class', 'namechart')
          .style('fill', 'blue')
          .style('font-size', '24px')
          .text('Crash occurences');
        // Percentage of the chart
        title
          .append('text')
          .attr('x', margin.left + 550)
          .attr('y', 0 - margin.top + 60)
          .attr('class', 'percent')
          .attr('text-anchor', 'end')
          .style('font-size', '16px')
          .text('0.123%');
        // Quatity of the chart
        title
          .append('text')
          .attr('x', margin.left + 550)
          .attr('y', 0 - margin.top + 85)
          .attr('class', 'quatity')
          .attr('text-anchor', 'end')
          .style('font-size', '16px')
          .text('518 OCCURENCES');

        // TOOLTIP
        // Append the x line
        focus
          .append('line')
          .attr('class', 'x')
          .style('stroke', 'blue')
          .style('stroke-dasharray', '3,3')
          .style('opacity', 0.5)
          .attr('y1', 0)
          .attr('y2', height);
        // Append the y line
        focus
          .append('line')
          .attr('class', 'y')
          .style('stroke', 'blue')
          .style('stroke-dasharray', '3,3')
          .style('opacity', 0.5)
          .attr('x1', width)
          .attr('x2', width);
        // Append the circle at the intersection
        focus
          .append('circle')
          .attr('class', 'y')
          .style('fill', 'none')
          .style('stroke', 'blue')
          .attr('r', 4);

        // Append the rectangle show information
        rectool
          .append('rect')
          .attr('class', 'rectool')
          .attr('width', 160)
          .attr('height', 70)
          .attr('fill', 'white')
          .attr('stroke', 'gray')
          .attr('rx', 10);

        nametool
          .append('text')
          .attr('class', 'nametool')
          .attr('text-anchor', 'left');
        typetool
          .append('text')
          .attr('class', 'typetool')
          .attr('text-anchor', 'left');
        datetool
          .append('text')
          .attr('class', 'datetool')
          .attr('text-anchor', 'left');
        //.attr('alignment-baseline', 'central');

        // Append the rectangle to capture mouse
        svg
          .append('rect')
          .attr('width', width)
          .attr('height', height)
          .style('fill', 'none')
          .attr('class', 'mouse')
          .style('pointer-events', 'all')
          .on('mouseover', function(d) {
            focus.style('display', null);
            rectool.style('display', null);
            nametool.style('display', null);
            typetool.style('display', null);
            datetool.style('display', null);
          })
          .on('mouseout', function() {
            focus.style('display', 'none');
            rectool.style('display', 'none');
            nametool.style('display', 'none');
            typetool.style('display', 'none');
            datetool.style('display', 'none');
          })
          .on('mousemove', mousemove);

        // Capture mouse position and display tooltip
        function mousemove() {
          var x0 = x.invert(d3.mouse(this)[0]), // x coordinate recieve from mouse
            y0 = y.invert(d3.mouse(this)[1]), // y coordinate recieve from mouse
            i = bisectDate(data, x0, 1), // select the column base on x coordinate
            d0 = data[i - 1], // left size of data
            d1 = data[i], // right size of data
            d = -1; // for debugging
          // prevent i is the most right column in chart
          if (i < data.length) {
            //d = x0 - d0.date > d1.date - x0 ? d1 : d0; // choose which data show up
            if (x0 - d0.date > d1.date - x0) {
              d = d1;
            } else {
              d = d0;
            }
          } else {
            d = d0;
          }
          // determine which area that mouse pointing
          function computeArea() {
            let i = 0; // count keys lenght
            var value = 0; // hold the data of keys after "stacked"
            // if i > key.length causes key[i] is undefined
            while (value < y0 && i < keys.length) {
              value += parseInt(d[keys[i]]);
              i++;
            }
            return value;
          }
          var dy = computeArea(); // hold the stack area of mouse - above
          // if mouse get out of top area, dy2 = dy
          var i = 0; // store stacked position
          function computeArea2() {
            var value = 0; // hold the data of keys after "stacked"
            var valueTemp = 0;
            // if i > key.length causes key[i] is undefined
            while (value < y0 && i < keys.length) {
              value += parseInt(d[keys[i]]);
              i++;
              if (i == keys.length) {
                if (value < y0) return value;
                else return valueTemp;
              } else if (value >= y0) return valueTemp;
              valueTemp = value;
            }
          }
          var dy2 = computeArea2(); // hold the stack area of mouse - below

          console.log('Right:', i); // right
          console.log('Left: ', i - 1); // left
          console.log('Up:   ', dy); // up
          console.log('Down: ', dy2); // down
          console.log('Key:  ', i); // stack area
          console.log(keys[i - 1]);
          console.log('----------------');

          focus
            .select('circle.y')
            .attr('transform', 'translate(' + x(d.date) + ',' + y(dy) + ')'); // draw the circle
          // adding straight line to tooltip
          focus
            .select('.x')
            .attr('transform', 'translate(' + x(d.date) + ',' + y(dy) + ')')
            .attr('y2', height - y(dy));
          focus
            .select('.y')
            .attr('transform', 'translate(' + width * -1 + ',' + y(dy) + ')')
            .attr('x2', width + width);

          rectool
            .select('.rectool')
            .attr('x', function() {
              if (d3.mouse(this)[0] >= width / 2) return 15;
              else return 450;
            })
            .attr('y', 10);
          nametool
            .select('.nametool')
            .attr('x', function() {
              if (d3.mouse(this)[0] >= width / 2) return 30;
              else return 465;
            })
            .attr('y', 30)
            .text('Version: ' + keys[i - 1])
            .style('font-size', '14px');
          typetool
            .select('.typetool')
            .attr('x', function() {
              if (d3.mouse(this)[0] >= width / 2) return 30;
              else return 465;
            })
            .attr('y', 50)
            .text(dy - dy2 + ' occurences')
            .style('font-size', '14px');
          datetool
            .select('.datetool')
            .attr('x', function() {
              if (d3.mouse(this)[0] >= width / 2) return 30;
              else return 465;
            })
            .attr('y', 70)
            .text('On ' + formatTime(d.date))
            .style('font-size', '14px');
        }
      }
    );
  }

  // Render the chart
  render() {
    if (this.rootNode) {
      this.drawChart();
    }
    return <svg ref={node => (this.rootNode = node)} />;
  }
}
