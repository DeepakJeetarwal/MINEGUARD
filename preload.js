const {
    contextBridge,
    ipcRenderer
} = require("electron");


contextBridge.exposeInMainWorld(

    "mineguard",

    {


        updateNode:
            (data) => {

                ipcRenderer.send(
                    "update-node",
                    data
                );

            },


        setScenario:
            (scenario) => {

                ipcRenderer.send(
                    "set-scenario",
                    scenario
                );

            },


        startPlayback:
            () => {

                ipcRenderer.send(
                    "start-playback"
                );

            },


        pausePlayback:
            () => {

                ipcRenderer.send(
                    "pause-playback"
                );

            },


        resetSimulation:
            () => {

                ipcRenderer.send(
                    "reset-simulation"
                );

            },


        exportCSV:
            () => {

                return ipcRenderer.invoke(
                    "export-csv"
                );

            },


        onSimulationUpdate:
            (callback) => {

                ipcRenderer.on(

                    "simulation-update",

                    (event, data) => {

                        callback(data);

                    }

                );

            }

    }

);