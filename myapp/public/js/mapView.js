var mapView = (function () {
    var map = L.map("map", {
        zoomDelta: 0.1,
        zoomSnap: 0.1
    }).setView([22.631023, 114.164337], 10.8);
    var osmUrl =
        "https://api.mapbox.com/styles/v1/locknono/cjh7jj0mo0yu32rlnk52glz3f/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibG9ja25vbm8iLCJhIjoiY2poN2ppZHptMDM2bDMzbnhiYW9icjN4MiJ9.GalwMO67A3HawYH_Tg0-Qg",
        layer =
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
    L.tileLayer(osmUrl, {
        minZoom: 1,
        maxZoom: 17,
        //用了mapbox的图层
        attribution: layer,
        //访问令牌
        accessToken: "your.mapbox.access.token"
    }).addTo(map);
    map.zoomControl.remove();

    var classScale = d3.scaleOrdinal()
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628',
            '#f781bf', '#999999'
        ]);

    var d3Overlay = L.d3SvgOverlay(function (selection, projection) {
        addHexagonBorder(selection, projection);
    }, {
        zoomDraw: false,
    });
    d3Overlay.addTo(map);



    function pieViewForOneClass(thisClass) {
        var div = d3.select("#suspendingDiv")
            .transition()
            .duration(1500)
            .style("top", "0px");
        var svg = d3.select('#suspendingSvg');
        var width = parseFloat(svg.style("width").split('px')[0]),
            height = parseFloat(svg.style("height").split('px')[0]);

        var minRadius = 30;

        d3.json('data/drawData/clickData.json', function (clickData) {

            var thisClassClickData = clickData[thisClass];

            var maxOn = d3.max(clickData, function (d) {
                return d3.max(d.on)
            })
            var maxOff = d3.max(clickData, function (d) {
                return d3.max(d.off)
            })

            var thisClassMaxOn = d3.max(thisClassClickData.on);
            var thisClassMaxOff = d3.max(thisClassClickData.off);

            //on for radius:55-80
            //off for radius:55-30
            var circleRadius = 50;

            var onScale = d3.scaleLinear()
                .domain([0, thisClassMaxOn])
                .range([0, 30]);

            var offScale = d3.scaleLinear()
                .domain([0, thisClassMaxOff])
                .range([0, -30]);

            /*
               圆心坐标：(x0,y0)
               半径：r
               角度：a0

               则圆上任一点为：（x1,y1）
               x1   =   x0   +   r   *   cos(ao   *   3.14   /180   )
               y1   =   y0   +   r   *   sin(ao   *   3.14   /180   )
                        */

            var line = d3.line()
                .x(function (d) {
                    return d[0];
                })
                .y(function (d) {
                    return d[1];
                })
                .curve(d3.curveCardinal);

            svg.selectAll("path").remove();
            svg.selectAll("circle").remove();
            addCircle();
            addLine(0);

            function addCircle() {
                svg.append("circle")
                    .attr("cx", (width / 2))
                    .attr("cy", (height / 2))
                    .attr("r", circleRadius)
                    .attr("stroke", "black")
                    .attr("fill", "none")
            }


            function addLine(status) {
                if (status === 0) {
                    var scale = onScale;
                    var data = thisClassClickData.on;
                } else {
                    var scale = offScale;
                    var data = thisClassClickData.off;
                }
                let a0 = 360 / 24;
                var lineEndPoint = [];
                for (var i = 0; i < 24; i++) {
                    let lineEndPointX =
                        (width / 2) + (circleRadius + scale(data[i])) * Math.cos(a0 * (i + 1) * Math.PI / 180);
                    let lineEndPointY =
                        (height / 2) + (circleRadius + scale(data[i])) * Math.sin(a0 * (i + 1) * Math.PI / 180);
                    lineEndPoint.push([lineEndPointX, lineEndPointY]);
                }
                addCurveCircle();
                lineEndPoint.push(lineEndPoint[0]);
                svg.append("path")
                    .attr("d", line(lineEndPoint))
                    .attr("stroke", "black")
                    .attr("fill", "#7972FF")
                svg.append("circle")
                    .attr("cx", (width / 2))
                    .attr("cy", (height / 2))
                    .attr("r", circleRadius)
                    .attr("stroke", "black")
                    .attr("fill", "#D6BD3E")



                var data = thisClassClickData.off;

                var lineEndPoint = [];
                for (var i = 0; i < 24; i++) {
                    let lineEndPointX =
                        (width / 2) + (circleRadius + offScale(data[i])) * Math.cos(a0 * (i + 1) * Math.PI / 180);
                    let lineEndPointY =
                        (height / 2) + (circleRadius + offScale(data[i])) * Math.sin(a0 * (i + 1) * Math.PI / 180);
                    lineEndPoint.push([lineEndPointX, lineEndPointY]);
                }
                lineEndPoint.push(lineEndPoint[0]);
                addCurveCircle();
                svg.append("path")
                    .attr("d", line(lineEndPoint))
                    .attr("stroke", "black")
                    .attr("fill", "white")

                function addCurveCircle() {
                    lineEndPoint.map(d => {
                        svg.append("circle")
                            .attr("cx", d[0])
                            .attr("cy", d[1])
                            .attr("r", 1.5)
                            .attr("stroke", "#CEDDE8")
                            .attr("fill", "black")
                    })
                }
            }





        })




    }

    function addHexagonBorder(selection, projection) {
        var borderLine = d3.line()
            .x(function (d) {
                return projection.latLngToLayerPoint(d).x
            })
            .y(function (d) {
                return projection.latLngToLayerPoint(d).y
            })

        getBorderLineData().then(function (borderData) {

            let classNumber = d3.max(borderData, function (d) {
                return d.class
            })
            classDomain = []
            for (var i = 0; i <= classNumber; i++) {
                classDomain.push(i)
            }
            classScale.domain(classDomain);

            console.log('borderData: ', borderData);
            selection.append("g")
                .selectAll("path")
                .data(borderData)
                .enter()
                .append("path")
                .style("pointer-events", "auto")
                .attr("class", "hex-border")
                .attr("id", function (d) {
                    return d.class
                })
                .attr("d", function (d) {
                    return borderLine(d.path)
                })
                .style("fill", function (d) {
                    return classScale(d.class);
                })
                .on("mouseover", function (d) {
                    d3.select(this).style("opacity", 1);
                    d3.select("#netSvg").select("[id='" + d.class + "']")
                        .style("stroke", "black")
                        .style("stroke-width", 2)
                })
                .on("mouseout", function (d) {
                    d3.select(this).style("opacity", 0.6);
                    d3.select("#netSvg").select("[id='" + d.class + "']")
                        .style("stroke", "none")
                })
                .on("click", function (d) {
                    pieViewForOneClass(d.class);
                })
        })
    }

    function addHexagon() {
        d3.json('data/drawData/valueHexagon2.0_215.json', (error, hexagonData) => {

            var hexLine = d3.line()
                .x(function (d) {
                    return projection.latLngToLayerPoint(d).x
                })
                .y(function (d) {
                    return projection.latLngToLayerPoint(d).y
                })
            selection.append("g")
                .selectAll("path")
                .data(hexagonData)
                .enter()
                .append("path")
                .attr("d", function (d) {
                    return hexLine(d.path)
                })
                .attr("class", "hex")
                .style("pointer-events", "auto")
                .style("fill", function (d) {
                    return classScale(d.category);
                })
                .style("opacity", function (d) {
                    if (d.category === -1) {
                        return '0'
                    }
                    return "0.5"
                })
            /* .on("click", function (d) {
                console.log(d.category, d.value);
            }) */
        })
    }

    function getBorderLineData() {
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "get",
                url: "/showBorderLine",
                success: function (data) {
                    resolve(data);
                },
                error: function () {

                }
            });
        });
    }
    return {
        classScale: classScale
    };
})()