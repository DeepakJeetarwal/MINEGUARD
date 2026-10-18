const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require("electron");

const path = require("path");

let mainWindow = null;
let simulation = null;


function createWindow() {

    mainWindow = new BrowserWindow({

        width: 1600,
        height: 1000,

        minWidth: 1250,
        minHeight: 800,

        backgroundColor: "#050b13",

        autoHideMenuBar: true,

        title:
            "MINEGUARD — Mine Subsidence Monitoring",

        webPreferences: {

            preload:
                path.join(
                    __dirname,
                    "preload.js"
                ),

            contextIsolation: true,

            nodeIntegration: false

        }

    });


    mainWindow.loadFile(

        path.join(
            __dirname,
            "renderer",
            "index.html"
        )

    );


    simulation =
        require(
            "./backend/simulation"
        );


    simulation.start(

        (data) => {

            if (
                mainWindow &&
                !mainWindow.isDestroyed()
            ) {

                mainWindow.webContents.send(
                    "simulation-update",
                    data
                );

            }

        }

    );

}


/* ================================ */
/* MANUAL SENSOR UPDATE             */
/* ================================ */

ipcMain.on(

    "update-node",

    (event, data) => {

        if (simulation) {

            simulation.updateNode(
                data
            );

        }

    }

);


/* ================================ */
/* SCENARIO                         */
/* ================================ */

ipcMain.on(

    "set-scenario",

    (event, scenario) => {

        if (simulation) {

            simulation.setScenario(
                scenario
            );

        }

    }

);


/* ================================ */
/* PLAYBACK                         */
/* ================================ */

ipcMain.on(

    "start-playback",

    () => {

        if (simulation) {

            simulation.startPlayback();

        }

    }

);


ipcMain.on(

    "pause-playback",

    () => {

        if (simulation) {

            simulation.pausePlayback();

        }

    }

);


/* ================================ */
/* RESET                            */
/* ================================ */

ipcMain.on(

    "reset-simulation",

    () => {

        if (simulation) {

            simulation.reset();

        }

    }

);


/* ================================ */
/* CSV EXPORT                       */
/* ================================ */

ipcMain.handle(

    "export-csv",

    async () => {

        if (!simulation) {

            return {
                success: false
            };

        }


        const csv =
            simulation.getCSV();


        const result =
            await dialog.showSaveDialog(

                mainWindow,

                {

                    title:
                        "Export MINEGUARD Sensor Data",

                    defaultPath:
                        "mineguard_sensor_log.csv",

                    filters: [

                        {
                            name: "CSV Files",
                            extensions: ["csv"]
                        }

                    ]

                }

            );


        if (
            result.canceled ||
            !result.filePath
        ) {

            return {
                success: false
            };

        }


        const fs =
            require("fs");


        fs.writeFileSync(
            result.filePath,
            csv,
            "utf8"
        );


        return {

            success: true,

            path:
                result.filePath

        };

    }

);


/* ================================ */
/* APP                               */
/* ================================ */

app.whenReady().then(() => {

    createWindow();


    app.on(
        "activate",
        () => {

            if (
                BrowserWindow
                    .getAllWindows()
                    .length === 0
            ) {

                createWindow();

            }

        }
    );

});


app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !==
            "darwin"
        ) {

            app.quit();

        }

    }
);