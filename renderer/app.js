/* ========================================================= */
/* ELEMENTS                                                  */
/* ========================================================= */

const nodeControls =
    document.getElementById(
        "nodeControls"
    );


const zoneRisk =
    document.getElementById(
        "zoneRisk"
    );


const zoneLevel =
    document.getElementById(
        "zoneLevel"
    );


const clock =
    document.getElementById(
        "clock"
    );


const packetRate =
    document.getElementById(
        "packetRate"
    );


const packetCount =
    document.getElementById(
        "packetCount"
    );


const aiStatus =
    document.getElementById(
        "aiStatus"
    );


const aiConfidence =
    document.getElementById(
        "aiConfidence"
    );


const confidenceFill =
    document.getElementById(
        "confidenceFill"
    );


const aiMessage =
    document.getElementById(
        "aiMessage"
    );


const aiReasons =
    document.getElementById(
        "aiReasons"
    );


const recommendation =
    document.getElementById(
        "recommendation"
    );


const eventLog =
    document.getElementById(
        "eventLog"
    );


const scenarioStatus =
    document.getElementById(
        "scenarioStatus"
    );


const playbackFill =
    document.getElementById(
        "playbackFill"
    );


const playbackText =
    document.getElementById(
        "playbackText"
    );


const emergencyBanner =
    document.getElementById(
        "emergencyBanner"
    );


const deformationZone =
    document.getElementById(
        "deformationZone"
    );


const packetLayer =
    document.getElementById(
        "packetLayer"
    );


const chart =
    document.getElementById(
        "sensorChart"
    );


const ctx =
    chart.getContext(
        "2d"
    );


const selectedNodeLabel =
    document.getElementById(
        "selectedNodeLabel"
    );


const graphRisk =
    document.getElementById(
        "graphRisk"
    );


/* ========================================================= */
/* STATE                                                     */
/* ========================================================= */

let selectedNode =
    "N2";


let latestData =
    null;


let chartHistory = {};


/* ========================================================= */
/* NODE LIST                                                 */
/* ========================================================= */

const nodes = [

    {
        id: "N1",
        name: "Surface Node 01",
        location: "SURFACE"
    },


    {
        id: "N2",
        name: "Surface Node 02",
        location: "SURFACE"
    },


    {
        id: "N3",
        name: "Surface Node 03",
        location: "SURFACE"
    },


    {
        id: "N4",
        name: "Underground Node 01",
        location: "UNDERGROUND"
    },


    {
        id: "N5",
        name: "Underground Node 02",
        location: "UNDERGROUND"
    }

];


/* ========================================================= */
/* CREATE CONTROLS                                           */
/* ========================================================= */

function createNodeControls() {

    nodeControls.innerHTML = "";


    nodes.forEach(
        node => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "node-card";


            card.id =
                `control-${node.id}`;


            card.innerHTML = `

                <div
                    class="node-card-header"
                >

                    <div>

                        <div
                            class="node-name"
                        >
                            ${node.name}
                        </div>

                        <div
                            class="node-location"
                        >
                            ${node.location}
                        </div>

                    </div>

                    <div
                        class="node-risk"
                        id="risk-${node.id}"
                    >
                        0%
                    </div>

                </div>


                ${createSlider(
                    node.id,
                    "tilt",
                    "Tilt / Inclination"
                )}


                ${createSlider(
                    node.id,
                    "vibration",
                    "Vibration"
                )}


                ${createSlider(
                    node.id,
                    "displacement",
                    "Displacement"
                )}


                <div
                    class="crack-row"
                >

                    <label>
                        Crack Detected
                    </label>

                    <label
                        class="switch"
                    >

                        <input
                            type="checkbox"
                            id="crack-${node.id}"
                        >

                        <span
                            class="slider"
                        ></span>

                    </label>

                </div>

            `;


            nodeControls.appendChild(
                card
            );


            attachControls(
                node.id
            );


            card.addEventListener(
                "click",
                () => {

                    selectNode(
                        node.id
                    );

                }
            );

        }
    );


    selectNode(
        selectedNode
    );

}


/* ========================================================= */
/* SLIDER                                                    */
/* ========================================================= */

function createSlider(
    id,
    type,
    label
) {

    return `

        <div
            class="sensor-row"
        >

            <label>
                ${label}
            </label>

            <input
                type="range"
                min="0"
                max="100"
                value="10"
                id="${type}-${id}"
            >

            <div
                class="sensor-value"
                id="${type}-value-${id}"
            >
                10%
            </div>

        </div>

    `;

}


/* ========================================================= */
/* CONTROL EVENTS                                            */
/* ========================================================= */

function attachControls(
    id
) {

    [
        "tilt",
        "vibration",
        "displacement"

    ].forEach(
        type => {

            const slider =
                document.getElementById(
                    `${type}-${id}`
                );


            slider.addEventListener(
                "input",
                event => {

                    event.stopPropagation();


                    document.getElementById(
                        `${type}-value-${id}`
                    ).textContent =
                        `${slider.value}%`;


                    sendNode(
                        id
                    );

                }
            );

        }
    );


    document.getElementById(
        `crack-${id}`
    ).addEventListener(
        "change",
        event => {

            event.stopPropagation();


            sendNode(
                id
            );

        }
    );

}


/* ========================================================= */
/* SEND NODE                                                  */
/* ========================================================= */

function sendNode(
    id
) {

    window.mineguard.updateNode({

        id,

        tilt:
            Number(
                document.getElementById(
                    `tilt-${id}`
                ).value
            ),

        vibration:
            Number(
                document.getElementById(
                    `vibration-${id}`
                ).value
            ),

        displacement:
            Number(
                document.getElementById(
                    `displacement-${id}`
                ).value
            ),

        crack:
            document.getElementById(
                `crack-${id}`
            ).checked

    });

}


/* ========================================================= */
/* UPDATE UI                                                  */
/* ========================================================= */

function updateUI(
    data
) {

    latestData =
        data;


    zoneRisk.textContent =
        `${data.zoneRisk}%`;


    updateZoneLevel(
        data.zoneLevel
    );


    packetRate.textContent =
        `${data.gateway.packetRate}%`;


    packetCount.textContent =
        data.gateway.packetsReceived;


    clock.textContent =
        data.systemTime;


    updateNodes(
        data.nodes
    );


    updateAI(
        data.ai
    );


    updateEvents(
        data.events
    );


    updateTrucks(
        data.trucks
    );


    updateDeformationZone(
        data.zoneRisk
    );


    updateScenario(
        data
    );


    updateGraph(
        data
    );


    createPackets();

}


/* ========================================================= */
/* ZONE LEVEL                                                */
/* ========================================================= */

function updateZoneLevel(
    level
) {

    zoneLevel.textContent =
        level;


    zoneLevel.className =
        "risk-badge";


    if (
        level ===
        "HIGH RISK"
    ) {

        zoneLevel.classList.add(
            "high"
        );

    }

    else if (
        level ===
        "WATCH"
    ) {

        zoneLevel.classList.add(
            "watch"
        );

    }

    else {

        zoneLevel.classList.add(
            "normal"
        );

    }

}


/* ========================================================= */
/* NODES                                                      */
/* ========================================================= */

function updateNodes(
    nodeData
) {

    nodeData.forEach(
        node => {

            const risk =
                document.getElementById(
                    `risk-${node.id}`
                );


            if (risk) {

                risk.textContent =
                    `${node.risk}%`;


                risk.style.color =
                    getRiskColor(
                        node.risk
                    );

            }


            updateSlider(
                `tilt-${node.id}`,
                `tilt-value-${node.id}`,
                node.tilt
            );


            updateSlider(
                `vibration-${node.id}`,
                `vibration-value-${node.id}`,
                node.vibration
            );


            updateSlider(
                `displacement-${node.id}`,
                `displacement-value-${node.id}`,
                node.displacement
            );


            const crack =
                document.getElementById(
                    `crack-${node.id}`
                );


            if (crack) {

                crack.checked =
                    node.crack;

            }


            const mapNode =
                document.getElementById(
                    `map-${node.id}`
                );


            if (mapNode) {

                mapNode.classList.remove(
                    "watch",
                    "danger"
                );


                if (
                    node.risk >= 70
                ) {

                    mapNode.classList.add(
                        "danger"
                    );

                }

                else if (
                    node.risk >= 40
                ) {

                    mapNode.classList.add(
                        "watch"
                    );

                }


                if (
                    node.id ===
                    selectedNode
                ) {

                    mapNode.classList.add(
                        "selected"
                    );

                }

                else {

                    mapNode.classList.remove(
                        "selected"
                    );

                }


                mapNode.onclick =
                    () => {

                        selectNode(
                            node.id
                        );

                    };

            }

        }
    );

}


/* ========================================================= */
/* SLIDER UPDATE                                             */
/* ========================================================= */

function updateSlider(
    sliderId,
    valueId,
    value
) {

    const slider =
        document.getElementById(
            sliderId
        );


    const valueElement =
        document.getElementById(
            valueId
        );


    if (!slider) {

        return;

    }


    slider.value =
        Math.round(
            value
        );


    valueElement.textContent =
        `${Math.round(value)}%`;

}


/* ========================================================= */
/* AI                                                        */
/* ========================================================= */

function updateAI(
    ai
) {

    aiConfidence.textContent =
        `${ai.confidence}%`;


    confidenceFill.style.width =
        `${ai.confidence}%`;


    aiMessage.textContent =
        ai.message;


    recommendation.textContent =
        ai.recommendation;


    aiReasons.innerHTML =
        "";


    ai.reasons.forEach(
        reason => {

            const chip =
                document.createElement(
                    "span"
                );


            chip.className =
                "reason-chip";


            chip.textContent =
                `✓ ${reason}`;


            aiReasons.appendChild(
                chip
            );

        }
    );


    aiStatus.textContent =
        ai.status;


    aiStatus.className =
        "ai-status";


    if (
        ai.status ===
        "CRITICAL"
    ) {

        aiStatus.classList.add(
            "critical"
        );

    }

    else if (
        ai.status ===
        "DEVELOPING"
    ) {

        aiStatus.classList.add(
            "developing"
        );

    }

    else {

        aiStatus.classList.add(
            "stable"
        );

    }


    if (
        ai.status ===
        "CRITICAL"
    ) {

        emergencyBanner.classList.remove(
            "hidden"
        );

    }

    else {

        emergencyBanner.classList.add(
            "hidden"
        );

    }

}


/* ========================================================= */
/* EVENTS                                                     */
/* ========================================================= */

function updateEvents(
    events
) {

    eventLog.innerHTML =
        "";


    events.forEach(
        event => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "event";


            const time =
                document.createElement(
                    "div"
                );


            time.className =
                "event-time";


            time.textContent =
                event.time;


            const message =
                document.createElement(
                    "div"
                );


            message.className =
                "event-message";


            if (
                event.type ===
                "CRITICAL"
            ) {

                message.classList.add(
                    "event-critical"
                );

            }


            if (
                event.type ===
                "WARNING"
            ) {

                message.classList.add(
                    "event-warning"
                );

            }


            if (
                event.type ===
                "SENSOR"
            ) {

                message.classList.add(
                    "event-sensor"
                );

            }


            message.textContent =
                event.message;


            row.appendChild(
                time
            );


            row.appendChild(
                message
            );


            eventLog.appendChild(
                row
            );

        }
    );

}


/* ========================================================= */
/* TRUCKS                                                     */
/* ========================================================= */

function updateTrucks(
    trucks
) {

    trucks.forEach(
        truck => {

            const element =
                document.getElementById(
                    `truck-${truck.id}`
                );


            if (!element) {

                return;

            }


            element.style.left =
                `${truck.x}%`;

        }
    );

}


/* ========================================================= */
/* DEFORMATION ZONE                                           */
/* ========================================================= */

function updateDeformationZone(
    risk
) {

    if (
        risk >= 60
    ) {

        deformationZone.classList.add(
            "active"
        );

    }

    else {

        deformationZone.classList.remove(
            "active"
        );

    }

}


/* ========================================================= */
/* SCENARIO                                                   */
/* ========================================================= */

function updateScenario(
    data
) {

    let label =
        "NORMAL";


    if (
        data.scenario ===
        "medium"
    ) {

        label =
            "DEVELOPING";

    }


    if (
        data.scenario ===
        "worst"
    ) {

        label =
            "CRITICAL";

    }


    scenarioStatus.textContent =
        label;


    if (
        data.playback.active
    ) {

        const progress =
            Math.min(
                100,
                (
                    data.playback.seconds /
                    24
                )
                *
                100
            );


        playbackFill.style.width =
            `${progress}%`;


        if (
            data.playback.paused
        ) {

            playbackText.textContent =
                "Scenario paused.";

        }

        else if (
            data.playback.stage ===
            0
        ) {

            playbackText.textContent =
                "Stage 1 — Normal mine operation.";

        }

        else if (
            data.playback.stage ===
            1
        ) {

            playbackText.textContent =
                "Stage 2 — Developing deformation pattern.";

        }

        else if (
            data.playback.stage ===
            2
        ) {

            playbackText.textContent =
                "Stage 3 — Critical multi-node event.";

        }

    }

    else {

        if (
            data.playback.stage ===
            3
        ) {

            playbackFill.style.width =
                "100%";


            playbackText.textContent =
                "Scenario complete — response assessment required.";

        }

        else {

            playbackText.textContent =
                "Ready for simulation.";

        }

    }

}


/* ========================================================= */
/* GRAPH                                                      */
/* ========================================================= */

function selectNode(
    id
) {

    selectedNode =
        id;


    document
        .querySelectorAll(
            ".node-card"
        )
        .forEach(
            card => {

                card.classList.remove(
                    "selected-card"
                );

            }
        );


    const card =
        document.getElementById(
            `control-${id}`
        );


    if (card) {

        card.classList.add(
            "selected-card"
        );

    }


    document
        .querySelectorAll(
            ".node"
        )
        .forEach(
            node => {

                node.classList.remove(
                    "selected"
                );

            }
        );


    const mapNode =
        document.getElementById(
            `map-${id}`
        );


    if (mapNode) {

        mapNode.classList.add(
            "selected"
        );

    }


    const dataNode =
        latestData &&
        latestData.nodes.find(
            node =>
                node.id ===
                id
        );


    if (dataNode) {

        selectedNodeLabel.textContent =
            `${dataNode.name} — ${dataNode.location}`;

        graphRisk.textContent =
            `${dataNode.risk}% RISK`;

    }

}


/* ========================================================= */
/* GRAPH DRAWING                                              */
/* ========================================================= */

function updateGraph(
    data
) {

    const node =
        data.nodes.find(
            n =>
                n.id ===
                selectedNode
        );


    if (!node) {

        return;

    }


    selectedNodeLabel.textContent =
        `${node.name} — ${node.location}`;


    graphRisk.textContent =
        `${node.risk}% RISK`;


    graphRisk.style.color =
        getRiskColor(
            node.risk
        );


    if (
        !chartHistory[selectedNode]
    ) {

        chartHistory[selectedNode] = {

            tilt: [],
            vibration: [],
            displacement: []

        };

    }


    const history =
        chartHistory[selectedNode];


    history.tilt.push(
        node.tilt
    );


    history.vibration.push(
        node.effectiveVibration
    );


    history.displacement.push(
        node.displacement
    );


    if (
        history.tilt.length >
        50
    ) {

        history.tilt.shift();

        history.vibration.shift();

        history.displacement.shift();

    }


    drawChart(
        history
    );

}


/* ========================================================= */
/* CANVAS GRAPH                                               */
/* ========================================================= */

function drawChart(
    history
) {

    const width =
        chart.width;


    const height =
        chart.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* GRID */

    ctx.strokeStyle =
        "rgba(255,255,255,.06)";


    ctx.lineWidth =
        1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            20 +
            (
                (
                    height -
                    40
                )
                *
                i /
                4
            );


        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();

    }


    /* LABELS */

    ctx.fillStyle =
        "#667d95";


    ctx.font =
        "10px Segoe UI";


    ctx.fillText(
        "100",
        5,
        15
    );


    ctx.fillText(
        "50",
        5,
        height / 2
    );


    ctx.fillText(
        "0",
        5,
        height - 5
    );


    drawLine(
        history.tilt,
        "#35d9ff"
    );


    drawLine(
        history.vibration,
        "#ffc857"
    );


    drawLine(
        history.displacement,
        "#b87cff"
    );


    /* LEGEND */

    ctx.fillStyle =
        "#35d9ff";

    ctx.fillText(
        "Tilt",
        width - 150,
        18
    );


    ctx.fillStyle =
        "#ffc857";

    ctx.fillText(
        "Vibration",
        width - 105,
        18
    );


    ctx.fillStyle =
        "#b87cff";

    ctx.fillText(
        "Displacement",
        width - 48,
        18
    );

}


function drawLine(
    values,
    color
) {

    if (
        values.length <
        2
    ) {

        return;

    }


    ctx.beginPath();


    values.forEach(
        (
            value,
            index
        ) => {

            const x =
                20 +
                (
                    index /
                    (
                        values.length -
                        1
                    )
                )
                *
                (
                    chart.width -
                    30
                );


            const y =
                chart.height -
                20 -
                (
                    value /
                    100
                )
                *
                (
                    chart.height -
                    40
                );


            if (
                index === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }

            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    ctx.strokeStyle =
        color;


    ctx.lineWidth =
        2;


    ctx.stroke();

}


/* ========================================================= */
/* PACKET ANIMATION                                           */
/* ========================================================= */

function createPackets() {

    if (
        !latestData
    ) {

        return;

    }


    if (
        Math.random() >
        0.35
    ) {

        return;

    }


    const node =
        latestData.nodes[
            Math.floor(
                Math.random() *
                latestData.nodes.length
            )
        ];


    const packet =
        document.createElement(
            "div"
        );


    packet.className =
        "packet";


    const nodeElement =
        document.getElementById(
            `map-${node.id}`
        );


    if (!nodeElement) {

        return;

    }


    const map =
        document.querySelector(
            ".mine-map"
        );


    const startX =
        nodeElement.offsetLeft +
        18;


    const startY =
        nodeElement.offsetTop +
        18;


    const gateway =
        document.querySelector(
            ".gateway"
        );


    const endX =
        gateway.offsetLeft +
        70;


    const endY =
        gateway.offsetTop +
        25;


    packet.style.left =
        `${startX}px`;


    packet.style.top =
        `${startY}px`;


    map.appendChild(
        packet
    );


    const duration =
        650;


    const start =
        performance.now();


    function animate(
        now
    ) {

        const progress =
            Math.min(
                1,
                (
                    now -
                    start
                )
                /
                duration
            );


        const x =
            startX +
            (
                endX -
                startX
            )
            *
            progress;


        const y =
            startY +
            (
                endY -
                startY
            )
            *
            progress;


        packet.style.left =
            `${x}px`;


        packet.style.top =
            `${y}px`;


        if (
            progress <
            1
        ) {

            requestAnimationFrame(
                animate
            );

        }

        else {

            packet.remove();

        }

    }


    requestAnimationFrame(
        animate
    );

}


/* ========================================================= */
/* RISK COLOR                                                 */
/* ========================================================= */

function getRiskColor(
    risk
) {

    if (
        risk >= 70
    ) {

        return "#ff5263";

    }


    if (
        risk >= 40
    ) {

        return "#ffc857";

    }


    return "#25e58a";

}


/* ========================================================= */
/* SCENARIO BUTTONS                                           */
/* ========================================================= */

document
    .getElementById(
        "normalScenario"
    )
    .addEventListener(
        "click",
        () => {

            window.mineguard
                .setScenario(
                    "normal"
                );

        }
    );


document
    .getElementById(
        "mediumScenario"
    )
    .addEventListener(
        "click",
        () => {

            window.mineguard
                .setScenario(
                    "medium"
                );

        }
    );


document
    .getElementById(
        "worstScenario"
    )
    .addEventListener(
        "click",
        () => {

            window.mineguard
                .setScenario(
                    "worst"
                );

        }
    );


/* ========================================================= */
/* PLAYBACK                                                  */
/* ========================================================= */

document
    .getElementById(
        "playButton"
    )
    .addEventListener(
        "click",
        () => {

            window.mineguard
                .startPlayback();

        }
    );


document
    .getElementById(
        "pauseButton"
    )
    .addEventListener(
        "click",
        () => {

            window.mineguard
                .pausePlayback();

        }
    );


/* ========================================================= */
/* RESET                                                      */
/* ========================================================= */

document
    .getElementById(
        "resetButton"
    )
    .addEventListener(
        "click",
        () => {

            window.mineguard
                .resetSimulation();

            chartHistory = {};

        }
    );


/* ========================================================= */
/* EXPORT                                                     */
/* ========================================================= */

document
    .getElementById(
        "exportButton"
    )
    .addEventListener(
        "click",
        async () => {

            const result =
                await window.mineguard
                    .exportCSV();


            if (
                result &&
                result.success
            ) {

                playbackText.textContent =
                    "Sensor data exported successfully.";

            }

        }
    );


/* ========================================================= */
/* RECEIVE DATA                                               */
/* ========================================================= */

window.mineguard
    .onSimulationUpdate(
        updateUI
    );


/* ========================================================= */
/* INITIALIZE                                                  */
/* ========================================================= */

createNodeControls();