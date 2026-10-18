/* ========================================================= */
/* MINEGUARD SIMULATION ENGINE                               */
/* ========================================================= */


/* ========================================================= */
/* NODE CONFIGURATION                                        */
/* ========================================================= */

const nodes = [

    {
        id: "N1",
        name: "Surface Node 01",
        location: "Surface",
        x: 18,
        y: 25,
        tilt: 8,
        vibration: 7,
        displacement: 9,
        crack: false,
        battery: 94,
        signal: 97
    },

    {
        id: "N2",
        name: "Surface Node 02",
        location: "Surface",
        x: 50,
        y: 18,
        tilt: 12,
        vibration: 9,
        displacement: 12,
        crack: false,
        battery: 87,
        signal: 94
    },

    {
        id: "N3",
        name: "Surface Node 03",
        location: "Surface",
        x: 82,
        y: 27,
        tilt: 7,
        vibration: 8,
        displacement: 10,
        crack: false,
        battery: 79,
        signal: 91
    },

    {
        id: "N4",
        name: "Underground Node 01",
        location: "Underground",
        x: 36,
        y: 70,
        tilt: 10,
        vibration: 12,
        displacement: 15,
        crack: false,
        battery: 91,
        signal: 89
    },

    {
        id: "N5",
        name: "Underground Node 02",
        location: "Underground",
        x: 68,
        y: 74,
        tilt: 9,
        vibration: 11,
        displacement: 14,
        crack: false,
        battery: 84,
        signal: 86
    }

];


/* ========================================================= */
/* MINING VEHICLES                                           */
/* ========================================================= */

const trucks = [

    {
        id: "TRUCK-01",

        // Starts on the RIGHT
        x: 110,

        y: 33,

        // Negative = LEFT
        speed: -3.2,

        active: true,

        direction: "left"
    },

    {
        id: "TRUCK-02",

        // Starts on the LEFT
        x: -10,

        y: 38,

        // Positive = RIGHT
        speed: 2.7,

        active: true,

        direction: "right"
    }

];


/* ========================================================= */
/* STATE                                                     */
/* ========================================================= */

let callback = null;

let timer = null;

let playbackTimer = null;

let playbackActive = false;

let playbackPaused = false;

let playbackStage = 0;

let playbackSeconds = 0;

let scenario = "normal";

let eventLog = [];

let dataHistory = [];


/* ========================================================= */
/* EVENTS                                                    */
/* ========================================================= */

function addEvent(type, message) {

    const event = {

        id:
            Date.now() +
            Math.random(),

        time:
            new Date()
                .toLocaleTimeString(),

        type,

        message

    };

    eventLog.unshift(event);

    if (eventLog.length > 25) {

        eventLog =
            eventLog.slice(
                0,
                25
            );

    }

}


/* ========================================================= */
/* RISK CALCULATION                                          */
/* ========================================================= */

function calculateRisk(node, vehicleInfluence) {

    const effectiveVibration =
        Math.min(
            100,
            node.vibration +
            vehicleInfluence
        );

    const risk =

        (
            node.tilt *
            0.30
        )

        +

        (
            node.displacement *
            0.30
        )

        +

        (
            effectiveVibration *
            0.20
        )

        +

        (
            (
                node.crack
                    ? 100
                    : 0
            )
            *
            0.20
        );

    return {

        risk:
            Math.min(
                100,
                Math.round(risk)
            ),

        effectiveVibration

    };

}


/* ========================================================= */
/* RISK LEVEL                                                */
/* ========================================================= */

function getRiskLevel(risk) {

    if (risk >= 70) {

        return "HIGH RISK";

    }

    if (risk >= 40) {

        return "WATCH";

    }

    return "NORMAL";

}


/* ========================================================= */
/* VEHICLE INFLUENCE                                        */
/* ========================================================= */

function getVehicleInfluence(node) {

    let strongest = 0;

    trucks.forEach(truck => {

        const dx =
            Math.abs(
                truck.x -
                node.x
            );

        const dy =
            Math.abs(
                truck.y -
                node.y
            );

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance < 20 &&
            node.location === "Surface"
        ) {

            const influence =
                Math.max(
                    0,
                    25 -
                    distance
                );

            strongest =
                Math.max(
                    strongest,
                    influence
                );

        }

    });

    return Math.round(strongest);

}


/* ========================================================= */
/* AI ANALYSIS                                               */
/* ========================================================= */

function generateAIAnalysis(processedNodes) {

    const highNodes =
        processedNodes.filter(
            node =>
                node.risk >= 70
        );

    const watchNodes =
        processedNodes.filter(
            node =>
                node.risk >= 40
        );

    const undergroundHigh =
        processedNodes.filter(
            node =>
                node.location ===
                "Underground" &&
                node.risk >= 60
        );

    const cracked =
        processedNodes.filter(
            node =>
                node.crack
        );

    let confidence = 18;

    let status = "STABLE";

    let message =
        "No significant spatial anomaly detected.";

    let recommendation =
        "Continue routine monitoring.";

    const reasons = [];


    if (watchNodes.length >= 1) {

        confidence += 18;

        reasons.push(
            "Sensor anomaly detected"
        );

    }


    if (highNodes.length >= 2) {

        confidence += 25;

        reasons.push(
            "Multi-node anomaly"
        );

    }


    if (undergroundHigh.length >= 1) {

        confidence += 15;

        reasons.push(
            "Underground deformation"
        );

    }


    if (cracked.length >= 1) {

        confidence += 15;

        reasons.push(
            "Crack event detected"
        );

    }


    if (highNodes.length >= 3) {

        confidence += 12;

        reasons.push(
            "Spatial correlation"
        );

    }


    confidence =
        Math.min(
            97,
            confidence
        );


    if (highNodes.length >= 3) {

        status = "CRITICAL";

        message =
            "Multiple sensors indicate a correlated deformation pattern.";

        recommendation =
            "Issue warning and evaluate evacuation of affected zone.";

    }

    else if (
        highNodes.length >= 1 ||
        watchNodes.length >= 2
    ) {

        status = "DEVELOPING";

        message =
            "Abnormal sensor behavior requires continued observation.";

        recommendation =
            "Increase monitoring frequency.";

    }

    else {

        status = "STABLE";

    }


    const nearestTruck =
        getNearestTruck();


    if (
        nearestTruck.distance < 18
    ) {

        reasons.push(
            "Vehicle activity nearby"
        );

    }


    return {

        status,

        confidence,

        message,

        recommendation,

        reasons

    };

}


/* ========================================================= */
/* NEAREST TRUCK                                             */
/* ========================================================= */

function getNearestTruck() {

    let nearest = null;

    let nearestDistance = 999;


    trucks.forEach(truck => {

        nodes.forEach(node => {

            if (
                node.location !==
                "Surface"
            ) {

                return;

            }


            const dx =
                Math.abs(
                    truck.x -
                    node.x
                );

            const dy =
                Math.abs(
                    truck.y -
                    node.y
                );

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearest = {

                    truck,

                    node,

                    distance

                };

            }

        });

    });


    return {

        truck:
            nearest
                ? nearest.truck
                : null,

        node:
            nearest
                ? nearest.node
                : null,

        distance:
            nearestDistance

    };

}


/* ========================================================= */
/* UPDATE TRUCKS                                             */
/* ========================================================= */

function updateTrucks() {

    trucks.forEach(truck => {

        if (!truck.active) {

            return;

        }


        /*
         * Move truck.
         *
         * Positive speed = RIGHT
         * Negative speed = LEFT
         */

        truck.x += truck.speed;


        /*
         * RIGHT-MOVING TRUCK
         *
         * Once it leaves the right
         * side, bring it back to left.
         */

        if (
            truck.speed > 0 &&
            truck.x > 110
        ) {

            truck.x = -10;

        }


        /*
         * LEFT-MOVING TRUCK
         *
         * Once it leaves the left
         * side, bring it back to right.
         */

        if (
            truck.speed < 0 &&
            truck.x < -10
        ) {

            truck.x = 110;

        }

    });

}


/* ========================================================= */
/* GENERATE COMPLETE DATA                                    */
/* ========================================================= */

function generateData() {

    /*
     * Update vehicle positions
     * before calculating sensor
     * influence.
     */

    updateTrucks();


    const processedNodes =
        nodes.map(node => {

            const vehicleInfluence =
                getVehicleInfluence(
                    node
                );

            const result =
                calculateRisk(
                    node,
                    vehicleInfluence
                );

            return {

                ...node,

                risk:
                    result.risk,

                effectiveVibration:
                    result.effectiveVibration,

                vehicleInfluence,

                level:
                    getRiskLevel(
                        result.risk
                    )

            };

        });


    const averageRisk =

        processedNodes.reduce(
            (
                sum,
                node
            ) =>
                sum +
                node.risk,

            0

        )

        /

        processedNodes.length;


    const highestRisk =

        Math.max(
            ...processedNodes.map(
                node =>
                    node.risk
            )
        );


    const zoneRisk =

        Math.round(

            (
                averageRisk *
                0.60
            )

            +

            (
                highestRisk *
                0.40
            )

        );


    const ai =
        generateAIAnalysis(
            processedNodes
        );


    const nearestTruck =
        getNearestTruck();


    const packets =
        processedNodes.length;


    const linkHealth =

        Math.round(

            processedNodes.reduce(
                (
                    sum,
                    node
                ) =>
                    sum +
                    node.signal,

                0
            )

            /

            processedNodes.length

        );


    const data = {

        nodes:
            processedNodes,


        trucks:

            trucks.map(
                truck => ({
                    ...truck
                })
            ),


        gateway: {

            status:
                "ONLINE",

            packetRate:
                linkHealth,

            packetsReceived:
                packets

        },


        zoneRisk,


        zoneLevel:
            getRiskLevel(
                zoneRisk
            ),


        ai,


        events:
            eventLog.slice(
                0,
                12
            ),


        scenario,


        playback: {

            active:
                playbackActive,

            paused:
                playbackPaused,

            stage:
                playbackStage,

            seconds:
                playbackSeconds

        },


        nearestTruck: {

            id:
                nearestTruck.truck
                    ? nearestTruck.truck.id
                    : null,

            node:
                nearestTruck.node
                    ? nearestTruck.node.id
                    : null,

            distance:
                Math.round(
                    nearestTruck.distance
                )

        },


        systemTime:
            new Date()
                .toLocaleTimeString()

    };


    recordHistory(
        processedNodes
    );


    return data;

}


/* ========================================================= */
/* HISTORY                                                   */
/* ========================================================= */

function recordHistory(processedNodes) {

    const timestamp =
        new Date()
            .toLocaleTimeString();


    processedNodes.forEach(node => {

        let history =
            dataHistory.find(
                item =>
                    item.id ===
                    node.id
            );


        if (!history) {

            history = {

                id:
                    node.id,

                values: []

            };


            dataHistory.push(
                history
            );

        }


        history.values.push({

            time:
                timestamp,

            tilt:
                Math.round(
                    node.tilt
                ),

            vibration:
                Math.round(
                    node.effectiveVibration
                ),

            displacement:
                Math.round(
                    node.displacement
                ),

            risk:
                node.risk

        });


        if (
            history.values.length >
            50
        ) {

            history.values.shift();

        }

    });

}


/* ========================================================= */
/* START                                                      */
/* ========================================================= */

function start(cb) {

    callback = cb;


    addEvent(
        "SYSTEM",
        "MINEGUARD monitoring system initialized."
    );


    callback(
        generateData()
    );


    timer =
        setInterval(
            () => {

                naturalSensorVariation();

                callback(
                    generateData()
                );

            },

            500
        );

}


/* ========================================================= */
/* NATURAL SENSOR MOVEMENT                                   */
/* ========================================================= */

function naturalSensorVariation() {

    nodes.forEach(node => {

        const multiplier =
            playbackActive
                ? 0.08
                : 0.25;


        node.tilt =
            clamp(

                node.tilt +

                (
                    Math.random() -
                    0.5
                )
                *
                multiplier,

                0,
                100

            );


        node.vibration =
            clamp(

                node.vibration +

                (
                    Math.random() -
                    0.5
                )
                *
                multiplier,

                0,
                100

            );


        node.displacement =
            clamp(

                node.displacement +

                (
                    Math.random() -
                    0.5
                )
                *
                multiplier,

                0,
                100

            );


        /*
         * Very slow battery drain
         * for demonstration.
         */

        node.battery =
            clamp(

                node.battery -
                0.002,

                0,
                100

            );

    });

}


/* ========================================================= */
/* MANUAL NODE UPDATE                                        */
/* ========================================================= */

function updateNode(data) {

    const node =
        nodes.find(
            n =>
                n.id ===
                data.id
        );


    if (!node) {

        return;

    }


    if (
        data.tilt !==
        undefined
    ) {

        node.tilt =
            Number(
                data.tilt
            );

    }


    if (
        data.vibration !==
        undefined
    ) {

        node.vibration =
            Number(
                data.vibration
            );

    }


    if (
        data.displacement !==
        undefined
    ) {

        node.displacement =
            Number(
                data.displacement
            );

    }


    if (
        data.crack !==
        undefined
    ) {

        node.crack =
            Boolean(
                data.crack
            );

    }


    addEvent(
        "SENSOR",
        `${node.id} manual sensor values updated.`
    );


    if (callback) {

        callback(
            generateData()
        );

    }

}


/* ========================================================= */
/* SCENARIOS                                                  */
/* ========================================================= */

function setScenario(selected) {

    playbackActive = false;

    playbackPaused = false;

    scenario = selected;


    if (
        selected ===
        "normal"
    ) {

        setNode(
            "N1",
            8,
            7,
            9,
            false
        );

        setNode(
            "N2",
            12,
            9,
            12,
            false
        );

        setNode(
            "N3",
            7,
            8,
            10,
            false
        );

        setNode(
            "N4",
            10,
            12,
            15,
            false
        );

        setNode(
            "N5",
            9,
            11,
            14,
            false
        );


        addEvent(
            "SCENARIO",
            "Normal operating conditions activated."
        );

    }


    else if (
        selected ===
        "medium"
    ) {

        setNode(
            "N1",
            20,
            22,
            23,
            false
        );

        setNode(
            "N2",
            48,
            54,
            51,
            false
        );

        setNode(
            "N3",
            26,
            31,
            28,
            false
        );

        setNode(
            "N4",
            54,
            51,
            57,
            false
        );

        setNode(
            "N5",
            32,
            36,
            34,
            false
        );


        addEvent(
            "WARNING",
            "Developing deformation pattern detected."
        );

    }


    else if (
        selected ===
        "worst"
    ) {

        setNode(
            "N1",
            70,
            74,
            72,
            false
        );

        setNode(
            "N2",
            90,
            91,
            94,
            true
        );

        setNode(
            "N3",
            76,
            79,
            77,
            true
        );

        setNode(
            "N4",
            93,
            90,
            95,
            true
        );

        setNode(
            "N5",
            85,
            88,
            91,
            true
        );


        addEvent(
            "CRITICAL",
            "Critical multi-node deformation scenario activated."
        );

    }


    if (callback) {

        callback(
            generateData()
        );

    }

}


/* ========================================================= */
/* FULL AUTOMATED PLAYBACK                                  */
/* ========================================================= */

function startPlayback() {

    if (
        playbackActive &&
        playbackPaused
    ) {

        playbackPaused = false;

        return;

    }


    playbackActive = true;

    playbackPaused = false;

    playbackStage = 0;

    playbackSeconds = 0;


    scenario = "normal";


    setScenarioWithoutStopping(
        "normal"
    );


    addEvent(
        "SYSTEM",
        "Automated deformation scenario started."
    );


    clearInterval(
        playbackTimer
    );


    playbackTimer =

        setInterval(
            () => {

                if (
                    playbackPaused
                ) {

                    return;

                }


                playbackSeconds++;


                /*
                 * Stage 1
                 * Normal -> Medium
                 */

                if (
                    playbackSeconds ===
                    6
                ) {

                    playbackStage = 1;


                    setScenarioWithoutStopping(
                        "medium"
                    );


                    addEvent(
                        "WARNING",
                        "Abnormal sensor pattern developing."
                    );

                }


                /*
                 * Stage 2
                 * Medium -> Worst
                 */

                if (
                    playbackSeconds ===
                    13
                ) {

                    playbackStage = 2;


                    setScenarioWithoutStopping(
                        "worst"
                    );


                    addEvent(
                        "CRITICAL",
                        "Multi-node deformation pattern detected."
                    );

                }


                /*
                 * End playback
                 */

                if (
                    playbackSeconds >=
                    24
                ) {

                    playbackActive = false;

                    playbackPaused = false;

                    playbackStage = 3;


                    addEvent(
                        "ALERT",
                        "Automated scenario complete — response recommended."
                    );


                    clearInterval(
                        playbackTimer
                    );

                }

            },

            1000
        );

}


/* ========================================================= */
/* PAUSE / RESUME PLAYBACK                                   */
/* ========================================================= */

function pausePlayback() {

    if (
        !playbackActive
    ) {

        return;

    }


    playbackPaused =
        !playbackPaused;


    addEvent(

        "SYSTEM",

        playbackPaused
            ? "Scenario playback paused."
            : "Scenario playback resumed."

    );


    if (callback) {

        callback(
            generateData()
        );

    }

}


/* ========================================================= */
/* SCENARIO WITHOUT PLAYBACK RESET                           */
/* ========================================================= */

function setScenarioWithoutStopping(selected) {

    scenario = selected;


    if (
        selected ===
        "normal"
    ) {

        setNode(
            "N1",
            8,
            7,
            9,
            false
        );

        setNode(
            "N2",
            12,
            9,
            12,
            false
        );

        setNode(
            "N3",
            7,
            8,
            10,
            false
        );

        setNode(
            "N4",
            10,
            12,
            15,
            false
        );

        setNode(
            "N5",
            9,
            11,
            14,
            false
        );

    }


    if (
        selected ===
        "medium"
    ) {

        setNode(
            "N1",
            20,
            22,
            23,
            false
        );

        setNode(
            "N2",
            48,
            54,
            51,
            false
        );

        setNode(
            "N3",
            26,
            31,
            28,
            false
        );

        setNode(
            "N4",
            54,
            51,
            57,
            false
        );

        setNode(
            "N5",
            32,
            36,
            34,
            false
        );

    }


    if (
        selected ===
        "worst"
    ) {

        setNode(
            "N1",
            70,
            74,
            72,
            false
        );

        setNode(
            "N2",
            90,
            91,
            94,
            true
        );

        setNode(
            "N3",
            76,
            79,
            77,
            true
        );

        setNode(
            "N4",
            93,
            90,
            95,
            true
        );

        setNode(
            "N5",
            85,
            88,
            91,
            true
        );

    }

}


/* ========================================================= */
/* SET NODE                                                   */
/* ========================================================= */

function setNode(
    id,
    tilt,
    vibration,
    displacement,
    crack
) {

    const node =
        nodes.find(
            n =>
                n.id ===
                id
        );


    if (!node) {

        return;

    }


    node.tilt =
        tilt;

    node.vibration =
        vibration;

    node.displacement =
        displacement;

    node.crack =
        crack;

}


/* ========================================================= */
/* RESET                                                      */
/* ========================================================= */

function reset() {

    clearInterval(
        playbackTimer
    );


    playbackActive = false;

    playbackPaused = false;

    playbackStage = 0;

    playbackSeconds = 0;


    scenario = "normal";


    /*
     * Put trucks back at their
     * original starting positions.
     */

    trucks[0].x = 110;
    trucks[0].speed = -3.2;
    trucks[0].direction = "left";

    trucks[1].x = -10;
    trucks[1].speed = 2.7;
    trucks[1].direction = "right";


    setScenarioWithoutStopping(
        "normal"
    );


    addEvent(
        "SYSTEM",
        "Simulation reset to normal conditions."
    );


    if (callback) {

        callback(
            generateData()
        );

    }

}


/* ========================================================= */
/* CSV EXPORT                                                 */
/* ========================================================= */

function getCSV() {

    let csv =

        "Timestamp,Node,Tilt,Vibration,Displacement,Crack,Risk,Status,Battery,Signal\n";


    const timestamp =
        new Date()
            .toISOString();


    nodes.forEach(node => {

        const result =
            calculateRisk(
                node,
                getVehicleInfluence(
                    node
                )
            );


        csv +=

            `${timestamp},` +

            `${node.id},` +

            `${node.tilt.toFixed(2)},` +

            `${result.effectiveVibration.toFixed(2)},` +

            `${node.displacement.toFixed(2)},` +

            `${node.crack},` +

            `${result.risk},` +

            `"${getRiskLevel(
                result.risk
            )}",` +

            `${node.battery.toFixed(2)},` +

            `${node.signal}\n`;

    });


    return csv;

}


/* ========================================================= */
/* CLAMP                                                      */
/* ========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(

        min,

        Math.min(
            max,
            value
        )

    );

}


/* ========================================================= */
/* EXPORTS                                                    */
/* ========================================================= */

module.exports = {

    start,

    updateNode,

    setScenario,

    startPlayback,

    pausePlayback,

    reset,

    getCSV

};