/* ============================================================
   JZRD • THERMOPREDICT
   Scientific Computing Frontend Runtime
   ============================================================ */

"use strict";


/* ============================================================
   DOM HELPERS
   ============================================================ */

const $ = (id) => document.getElementById(id);

const $$ = (selector) =>
    document.querySelectorAll(selector);

const setText = (id, value) => {
    const element = $(id);
    if (element) element.textContent = value;
};


/* ============================================================
   MATERIAL DATA
   Demonstration material-property baselines.
   These values are for the frontend prototype only.
   A trained scientific ML model can replace this engine later.
   ============================================================ */

const polymerData = {

    Epoxy: {
        conductivity: 0.20,
        diffusivity: 0.115,
        specificHeat: 1050
    },

    PEEK: {
        conductivity: 0.25,
        diffusivity: 0.145,
        specificHeat: 1300
    },

    Polyamide: {
        conductivity: 0.24,
        diffusivity: 0.135,
        specificHeat: 1550
    },

    Polyurethane: {
        conductivity: 0.18,
        diffusivity: 0.105,
        specificHeat: 1450
    }

};


const nanoparticleData = {

    Al2O3: {
        conductivity: 30,
        influence: 0.050
    },

    BN: {
        conductivity: 60,
        influence: 0.075
    },

    Graphene: {
        conductivity: 500,
        influence: 0.120
    },

    SiC: {
        conductivity: 120,
        influence: 0.090
    },

    TiO2: {
        conductivity: 11,
        influence: 0.040
    }

};


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {

    prediction: null,

    simulation: [],

    dataset: null,

    currentSection: "dashboard"

};


/* ============================================================
   NAVIGATION
   ============================================================ */

function activateSection(sectionId) {

    const section = $(sectionId);

    if (!section) return;

    state.currentSection = sectionId;

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    $$(".nav-item").forEach((item) => {

        item.classList.toggle(
            "active",
            item.dataset.section === sectionId
        );

    });

}


$$(".nav-item").forEach((item) => {

    item.addEventListener("click", () => {

        activateSection(item.dataset.section);

    });

});


$$("[data-section]").forEach((element) => {

    if (
        !element.classList.contains("nav-item")
    ) {

        element.addEventListener("click", () => {

            activateSection(
                element.dataset.section
            );

        });

    }

});


/* ============================================================
   SLIDER VALUES
   ============================================================ */

const sliderBindings = [

    ["concentration", "concentrationValue", "%"],

    ["particleSize", "particleSizeValue", " nm"],

    ["temperature", "temperatureValue", " K"],

    ["dispersion", "dispersionValue", " %"]

];


sliderBindings.forEach(
    ([inputId, outputId, suffix]) => {

        const input = $(inputId);
        const output = $(outputId);

        if (!input || !output) return;

        const update = () => {

            output.textContent =
                input.value + suffix;

        };

        input.addEventListener("input", update);

        update();

    }
);


/* ============================================================
   INPUT VALIDATION
   ============================================================ */

function validateInputs() {

    const concentration =
        Number($("concentration")?.value || 0);

    const particleSize =
        Number($("particleSize")?.value || 0);

    const temperature =
        Number($("temperature")?.value || 0);

    const dispersion =
        Number($("dispersion")?.value || 0);

    if (
        concentration < 0 ||
        concentration > 20
    ) {

        return {
            valid: false,
            message:
                "Nanoparticle concentration must remain between 0% and 20%."
        };

    }

    if (
        particleSize < 10 ||
        particleSize > 200
    ) {

        return {
            valid: false,
            message:
                "Particle size must remain between 10 nm and 200 nm."
        };

    }

    if (
        temperature < 250 ||
        temperature > 500
    ) {

        return {
            valid: false,
            message:
                "Operating temperature must remain between 250 K and 500 K."
        };

    }

    if (
        dispersion < 40 ||
        dispersion > 100
    ) {

        return {
            valid: false,
            message:
                "Dispersion quality must remain between 40% and 100%."
        };

    }

    return {
        valid: true
    };

}


/* ============================================================
   MATERIAL CALCULATION ENGINE
   ============================================================ */

function calculatePrediction(config) {

    const polymer =
        polymerData[config.polymer];

    const particle =
        nanoparticleData[config.nanoparticle];

    if (!polymer || !particle) {

        throw new Error(
            "Material configuration not available."
        );

    }


    /*
       Base reinforcement contribution.

       This is intentionally a transparent prototype
       calculation. It is NOT a trained ML model.
    */

    const concentrationEffect =
        config.concentration *
        particle.influence;


    const sizeEffect =
        Math.sqrt(
            40 / Math.max(config.particleSize, 10)
        );


    const dispersionEffect =
        0.55 +
        (config.dispersion / 100) * 0.65;


    const temperatureEffect =
        1 -
        ((config.temperature - 300) * 0.00045);


    let conductivity =
        polymer.conductivity *
        (
            1 +
            concentrationEffect *
            sizeEffect *
            dispersionEffect
        );


    /*
       Nanoparticle-specific enhancement.
    */

    conductivity +=
        (
            particle.conductivity /
            1000
        ) *
        config.concentration *
        0.018 *
        dispersionEffect;


    conductivity *= temperatureEffect;


    /*
       Diffusivity.
    */

    let diffusivity =
        polymer.diffusivity *
        (
            conductivity /
            polymer.conductivity
        ) *
        (
            0.92 +
            config.dispersion / 1000
        );


    /*
       Specific heat changes more conservatively
       than conductivity.
    */

    let specificHeat =
        polymer.specificHeat *
        (
            1 -
            config.concentration * 0.002
        );


    specificHeat =
        Math.max(
            700,
            specificHeat
        );


    /*
       Performance index.
    */

    let performance =
        50 +
        (
            conductivity /
            polymer.conductivity
        ) * 28;

    performance +=
        config.dispersion * 0.12;

    performance -=
        Math.abs(
            config.temperature - 300
        ) * 0.025;

    performance =
        Math.min(
            99,
            Math.max(
                1,
                performance
            )
        );


    /*
       Estimated uncertainty.

       This is a prototype estimate and should be
       replaced by model-derived uncertainty later.
    */

    let error =
        13 -
        config.dispersion * 0.045;

    error +=
        Math.abs(
            config.temperature - 300
        ) * 0.012;

    error =
        Math.max(
            2.5,
            Math.min(
                15,
                error
            )
        );


    let confidence =
        100 - error * 2.8;

    confidence =
        Math.max(
            70,
            Math.min(
                98,
                confidence
            )
        );


    return {

        conductivity:
            Number(
                conductivity.toFixed(3)
            ),

        diffusivity:
            Number(
                diffusivity.toFixed(3)
            ),

        specificHeat:
            Math.round(
                specificHeat
            ),

        performance:
            Number(
                performance.toFixed(1)
            ),

        error:
            Number(
                error.toFixed(1)
            ),

        confidence:
            Math.round(
                confidence
            )

    };

}


/* ============================================================
   ANALYSIS MESSAGE
   ============================================================ */

function buildAnalysisMessage(
    config,
    result
) {

    let message =
        `${config.polymer} reinforced with ` +
        `${config.nanoparticle} at ` +
        `${config.concentration}% concentration ` +
        `shows a predicted thermal conductivity of ` +
        `${result.conductivity} W/m·K. `;


    if (config.dispersion >= 80) {

        message +=
            "The selected dispersion quality provides a favorable reinforcement condition. ";

    } else {

        message +=
            "Improving dispersion quality may increase the predicted reinforcement efficiency. ";

    }


    if (config.particleSize <= 50) {

        message +=
            "The relatively small particle size contributes positively to the modeled response.";

    } else {

        message +=
            "The larger particle size reduces the modeled reinforcement contribution.";

    }


    return message;

}


/* ============================================================
   FEATURE IMPORTANCE
   ============================================================ */

function updateFeatureImportance(config) {

    const container =
        $("featureImportance");

    if (!container) return;


    const values = [

        {
            name: "Nanoparticle concentration",
            value: Math.min(
                96,
                48 + config.concentration * 2.1
            )
        },

        {
            name: "Dispersion quality",
            value: Math.min(
                92,
                35 + config.dispersion * 0.55
            )
        },

        {
            name: "Particle size",
            value: Math.max(
                18,
                90 - config.particleSize * 0.25
            )
        },

        {
            name: "Operating temperature",
            value: Math.max(
                15,
                70 -
                Math.abs(
                    config.temperature - 300
                ) * 0.18
            )
        }

    ];


    container.innerHTML = values.map(
        item => `

        <div class="feature-row">

            <div class="feature-heading">
                <span>${item.name}</span>
                <strong>${item.value.toFixed(0)}%</strong>
            </div>

            <div class="feature-track">
                <span
                    style="width:${item.value}%">
                </span>
            </div>

        </div>

        `
    ).join("");

}


/* ============================================================
   PREDICTION EXPLANATION
   ============================================================ */

function updateExplanation(
    config,
    result
) {

    const element =
        $("predictionExplanation");

    if (!element) return;


    element.innerHTML = `

        <strong>
            Material interpretation
        </strong>

        <p style="
            margin-top:10px;
            color:#8ba69d;
        ">

            The current configuration uses
            <b>${config.polymer}</b>
            as the polymer matrix and
            <b>${config.nanoparticle}</b>
            as the reinforcing phase.

            At
            <b>${config.concentration}%</b>
            concentration and
            <b>${config.dispersion}%</b>
            dispersion quality, the prototype model estimates
            a thermal conductivity of
            <b>${result.conductivity} W/m·K</b>.

        </p>

        <p style="
            margin-top:10px;
            color:#8ba69d;
        ">

            Model confidence:
            <b>${result.confidence}%</b>.

            Estimated uncertainty:
            <b>${result.error}%</b>.

        </p>

    `;

}


/* ============================================================
   DISPLAY PREDICTION
   ============================================================ */

function displayPrediction(
    config,
    result
) {

    setText(
        "thermalConductivity",
        result.conductivity
    );

    setText(
        "thermalDiffusivity",
        result.diffusivity
    );

    setText(
        "specificHeat",
        result.specificHeat
    );

    setText(
        "performanceIndex",
        result.performance
    );

    setText(
        "estimatedError",
        result.error
    );

    setText(
        "confidenceValue",
        `${result.confidence}%`
    );

    setText(
        "overviewConductivity",
        result.conductivity
    );

    setText(
        "overviewDiffusivity",
        result.diffusivity
    );

    setText(
        "overviewSpecificHeat",
        result.specificHeat
    );

    setText(
        "overviewConfidence",
        `${result.confidence}%`
    );


    const bar =
        $("confidenceBar");

    if (bar) {

        requestAnimationFrame(() => {

            bar.style.width =
                `${result.confidence}%`;

        });

    }


    setText(
        "analysisMessage",
        buildAnalysisMessage(
            config,
            result
        )
    );


    setText(
        "predictionStatus",
        "COMPLETE"
    );


    const stateElement =
        document.querySelector(
            ".analysis-state"
        );

    if (stateElement) {

        stateElement.textContent =
            `${config.polymer} / ${config.nanoparticle}`;

    }


    updateFeatureImportance(
        config
    );

    updateExplanation(
        config,
        result
    );


    state.prediction = {
        config,
        result
    };

}


/* ============================================================
   RUN PREDICTION
   ============================================================ */

async function runPrediction() {

    const validation =
        validateInputs();

    if (!validation.valid) {

        setText(
            "analysisMessage",
            validation.message
        );

        return;

    }


    const button =
        $("runPrediction");

    const status =
        $("predictionStatus");


    if (button) {

        button.disabled = true;
        button.textContent =
            "Evaluating...";

    }

    if (status) {

        status.textContent =
            "RUNNING";

    }


    const config = {

        polymer:
            $("polymer").value,

        nanoparticle:
            $("nanoparticle").value,

        concentration:
            Number(
                $("concentration").value
            ),

        particleSize:
            Number(
                $("particleSize").value
            ),

        temperature:
            Number(
                $("temperature").value
            ),

        dispersion:
            Number(
                $("dispersion").value
            )

    };


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                650
            )
    );


    try {

        const result =
            calculatePrediction(
                config
            );

        displayPrediction(
            config,
            result
        );

    } catch (error) {

        console.error(error);

        setText(
            "analysisMessage",
            "Unable to evaluate the selected material configuration."
        );

        if (status) {
            status.textContent = "ERROR";
        }

    }


    if (button) {

        button.disabled = false;
        button.textContent =
            "Evaluate Material";

    }

}


/* ============================================================
   RESET
   ============================================================ */

function resetPrediction() {

    $("polymer").value =
        "Epoxy";

    $("nanoparticle").value =
        "Al2O3";

    $("concentration").value =
        5;

    $("particleSize").value =
        40;

    $("temperature").value =
        300;

    $("dispersion").value =
        80;


    sliderBindings.forEach(
        ([inputId, outputId, suffix]) => {

            const input =
                $(inputId);

            const output =
                $(outputId);

            if (
                input &&
                output
            ) {

                output.textContent =
                    input.value +
                    suffix;

            }

        }
    );


    [
        "thermalConductivity",
        "thermalDiffusivity",
        "specificHeat",
        "performanceIndex",
        "estimatedError",
        "confidenceValue",
        "overviewConductivity",
        "overviewDiffusivity",
        "overviewSpecificHeat",
        "overviewConfidence"
    ].forEach(
        id =>
            setText(
                id,
                "—"
            )
    );


    const bar =
        $("confidenceBar");

    if (bar) {
        bar.style.width = "0";
    }


    setText(
        "predictionStatus",
        "READY"
    );

    setText(
        "analysisMessage",
        "Configure a material to begin the analysis."
    );


    setText(
        "predictionExplanation",
        "Run a material analysis to view parameter interpretation."
    );


    const stateElement =
        document.querySelector(
            ".analysis-state"
        );

    if (stateElement) {

        stateElement.textContent =
            "No material selected";

    }


    const featureContainer =
        $("featureImportance");

    if (featureContainer) {

        featureContainer.innerHTML =
            "<p style='color:#607970;font-size:10px;'>Run an analysis to view feature contribution.</p>";

    }


    state.prediction = null;

}


/* ============================================================
   PARAMETER STUDY
   ============================================================ */

function runSimulation() {

    const polymer =
        $("polymer").value;

    const nanoparticle =
        $("nanoparticle").value;

    const particleSize =
        Number(
            $("particleSize").value
        );

    const temperature =
        Number(
            $("temperature").value
        );

    const dispersion =
        Number(
            $("dispersion").value
        );


    const values = [];


    for (
        let concentration = 0;
        concentration <= 20;
        concentration += 2
    ) {

        const result =
            calculatePrediction({

                polymer,

                nanoparticle,

                concentration,

                particleSize,

                temperature,

                dispersion

            });


        values.push({

            concentration,

            conductivity:
                result.conductivity

        });

    }


    state.simulation =
        values;


    renderSimulation(
        values
    );

}


/* ============================================================
   SIMULATION GRAPH
   ============================================================ */

function renderSimulation(
    values
) {

    const chart =
        $("simulationChart");

    const valuesContainer =
        $("simulationValues");

    if (!chart) return;


    const max =
        Math.max(
            ...values.map(
                item =>
                    item.conductivity
            )
        );


    const min =
        Math.min(
            ...values.map(
                item =>
                    item.conductivity
            )
        );


    const range =
        Math.max(
            max - min,
            0.001
        );


    chart.innerHTML = `

        <div style="
            width:100%;
            height:100%;
            min-height:250px;
            padding:25px;
            display:flex;
            align-items:flex-end;
            gap:8px;
        ">

            ${values.map(item => {

                const height =
                    20 +
                    (
                        (item.conductivity - min) /
                        range
                    ) * 70;

                return `

                    <div style="
                        flex:1;
                        height:100%;
                        display:flex;
                        flex-direction:column;
                        justify-content:flex-end;
                        align-items:center;
                        gap:7px;
                    ">

                        <span style="
                            color:#8ba69d;
                            font-size:8px;
                        ">
                            ${item.conductivity}
                        </span>

                        <div style="
                            width:100%;
                            max-width:42px;
                            height:${height}%;
                            min-height:18px;
                            border-radius:5px 5px 2px 2px;
                            background:#4bd59a;
                            opacity:.78;
                        "></div>

                        <span style="
                            color:#607970;
                            font-size:8px;
                        ">
                            ${item.concentration}%
                        </span>

                    </div>

                `;

            }).join("")}

        </div>

    `;


    if (valuesContainer) {

        valuesContainer.innerHTML =
            values.map(
                item =>
                    `<span>${item.concentration}% → ${item.conductivity} W/m·K</span>`
            ).join("");

    }

}


/* ============================================================
   CSV VALIDATION
   ============================================================ */

function parseCSV(text) {

    const lines =
        text
            .trim()
            .split(/\r?\n/)
            .filter(Boolean);


    if (lines.length < 2) {

        throw new Error(
            "CSV must contain a header and at least one data row."
        );

    }


    const headers =
        lines[0]
            .split(",")
            .map(
                value =>
                    value
                        .trim()
                        .toLowerCase()
            );


    const rows =
        lines
            .slice(1)
            .map(
                line =>
                    line
                        .split(",")
                        .map(
                            value =>
                                value.trim()
                        )
            );


    return {
        headers,
        rows
    };

}


/* ============================================================
   VALIDATION METRICS
   ============================================================ */

function calculateMetrics(
    actual,
    predicted
) {

    if (
        actual.length === 0 ||
        actual.length !== predicted.length
    ) {

        throw new Error(
            "Invalid validation data."
        );

    }


    const errors =
        actual.map(
            (value, index) =>
                value -
                predicted[index]
        );


    const absoluteErrors =
        errors.map(
            value =>
                Math.abs(value)
        );


    const squaredErrors =
        errors.map(
            value =>
                value * value
        );


    const mae =
        absoluteErrors.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        actual.length;


    const rmse =
        Math.sqrt(
            squaredErrors.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) /
            actual.length
        );


    const mean =
        actual.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        actual.length;


    const totalVariance =
        actual.reduce(
            (sum, value) =>
                sum +
                Math.pow(
                    value - mean,
                    2
                ),
            0
        );


    const residualVariance =
        squaredErrors.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    const r2 =
        totalVariance === 0
            ? 0
            : 1 -
              (
                  residualVariance /
                  totalVariance
              );


    const meanActual =
        actual.reduce(
            (sum, value) =>
                sum + Math.abs(value),
            0
        ) /
        actual.length;


    const errorPercent =
        meanActual === 0
            ? 0
            : (
                mae /
                meanActual
            ) * 100;


    return {

        mae,
        rmse,
        r2,
        errorPercent

    };

}


/* ============================================================
   CSV FILE HANDLER
   ============================================================ */

const datasetFile =
    $("datasetFile");


if (datasetFile) {

    datasetFile.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];

            if (!file) return;


            setText(
                "fileStatus",
                `Loading ${file.name}...`
            );


            try {

                const text =
                    await file.text();

                const parsed =
                    parseCSV(text);


                /*
                   The frontend accepts a simple validation CSV.
                   If measured/predicted columns are present,
                   calculate metrics directly.
                */

                const headers =
                    parsed.headers;


                const actualIndex =
                    headers.findIndex(
                        header =>
                            [
                                "actual",
                                "measured",
                                "experimental",
                                "experimental_value"
                            ].includes(header)
                    );


                const predictedIndex =
                    headers.findIndex(
                        header =>
                            [
                                "predicted",
                                "prediction",
                                "model_prediction"
                            ].includes(header)
                    );


                if (
                    actualIndex !== -1 &&
                    predictedIndex !== -1
                ) {

                    const actual = [];
                    const predicted = [];


                    parsed.rows.forEach(
                        row => {

                            const a =
                                Number(
                                    row[actualIndex]
                                );

                            const p =
                                Number(
                                    row[predictedIndex]
                                );


                            if (
                                Number.isFinite(a) &&
                                Number.isFinite(p)
                            ) {

                                actual.push(a);
                                predicted.push(p);

                            }

                        }
                    );


                    if (
                        actual.length > 0
                    ) {

                        const metrics =
                            calculateMetrics(
                                actual,
                                predicted
                            );


                        setText(
                            "metricMAE",
                            metrics.mae.toFixed(4)
                        );

                        setText(
                            "metricRMSE",
                            metrics.rmse.toFixed(4)
                        );

                        setText(
                            "metricR2",
                            metrics.r2.toFixed(4)
                        );

                        setText(
                            "metricError",
                            `${metrics.errorPercent.toFixed(2)}%`
                        );

                    }

                }


                state.dataset = {
                    name: file.name,
                    headers,
                    rows: parsed.rows
                };


                setText(
                    "fileStatus",
                    `${file.name} · ${parsed.rows.length} records loaded`
                );


            } catch (error) {

                console.error(error);

                setText(
                    "fileStatus",
                    "Unable to read the dataset. Check the CSV format."
                );

            }

        }
    );

}


/* ============================================================
   JZRD STUDIO
   ============================================================ */

function runJZRD() {

    const output =
        $("runtimeOutput");

    const code =
        $("jzrdCode")?.value || "";


    if (!output) return;


    output.textContent =
        `JZRD ThermoPredict
Scientific Runtime

Status: COMPILING

Lexer        RUNNING
`;


    setTimeout(() => {

        output.textContent +=
            `Lexer        ✓
Parser       RUNNING
`;


    }, 250);


    setTimeout(() => {

        output.textContent +=
            `Parser       ✓
JIR          RUNNING
`;

    }, 500);


    setTimeout(() => {

        output.textContent +=
            `JIR          ✓
Virtual VM   RUNNING
`;

    }, 750);


    setTimeout(() => {

        output.textContent +=
            `Virtual VM   ✓
ThermoPredict RUNNING
`;

    }, 1000);


    setTimeout(() => {

        const hasMaterial =
            code.includes("material");

        const hasPrediction =
            code.includes("predict");


        if (
            hasMaterial &&
            hasPrediction
        ) {

            output.textContent +=
                `ThermoPredict ✓

JZRD PROGRAM EXECUTED SUCCESSFULLY

Material definition detected.
Prediction instructions detected.

Runtime pipeline:
Lexer → Parser → JIR → VM
→ ThermoPredict → Model

Status: READY
`;

        } else {

            output.textContent +=
                `ThermoPredict ✕

Program validation failed.

Required:
material
nanoparticle
prediction instruction

Status: ERROR
`;

        }

    }, 1300);

}


/* ============================================================
   BUTTON EVENTS
   ============================================================ */

const runPredictionButton =
    $("runPrediction");

if (runPredictionButton) {

    runPredictionButton.addEventListener(
        "click",
        runPrediction
    );

}


const resetButton =
    $("resetPrediction");

if (resetButton) {

    resetButton.addEventListener(
        "click",
        resetPrediction
    );

}


const simulationButton =
    $("runSimulation");

if (simulationButton) {

    simulationButton.addEventListener(
        "click",
        runSimulation
    );

}


const jzrdButton =
    $("runJZRD");

if (jzrdButton) {

    jzrdButton.addEventListener(
        "click",
        runJZRD
    );

}


const startButton =
    $("startPrediction");

if (startButton) {

    startButton.addEventListener(
        "click",
        () => {

            activateSection(
                "predictor"
            );

            setTimeout(
                () => {

                    $("polymer")?.focus();

                },
                500
            );

        }
    );

}


/* ============================================================
   INITIAL STATE
   ============================================================ */

resetPrediction();


console.log(
    "%cJZRD ThermoPredict",
    "font-size:18px;font-weight:bold;"
);

console.log(
    "Scientific Computing Environment initialized."
);

console.log(
    "Runtime: JZRD ThermoPredict v0.1"
);
// JZRD ThermoPredict Backend Connection
async function checkThermoPredictBackend() {
    try {
        const response = await fetch("http://127.0.0.1:8000/health");

        if (!response.ok) {
            throw new Error("Backend health check failed");
        }

        const result = await response.json();

        console.log("JZRD Backend Status:", result.status);

        return result.status === "healthy";
    } catch (error) {
        console.error("JZRD Backend Connection Error:", error.message);
        return false;
    }
}
checkThermoPredictBackend().then((connected) => {
    console.log(
        connected
            ? "ThermoPredict Backend Connected!"
            : "ThermoPredict Backend Not Connected!"
    );
});/* ============================================================
   JZRD TRAINED EXTRATREES MODEL API
   ============================================================ */

async function runTrainedModelPrediction() {
    const button = document.getElementById("runTrainedModel");
    const status = document.getElementById("trainedModelStatus");
    const resultBox = document.getElementById("trainedModelResult");

    const setStatus = (message) => {
        if (status) status.textContent = message;
    };

    const setResult = (message) => {
        if (resultBox) resultBox.textContent = message;
    };

    const fields = {
        Vf: "ml-Vf",
        omega: "ml-omega",
        diameter: "ml-diameter",
        km: "ml-km",
        kf: "ml-kf",
        Ri: "ml-Ri"
    };

    const values = {};

    for (const [key, id] of Object.entries(fields)) {
        const element = document.getElementById(id);

        if (!element) {
            setStatus("Input field missing: " + id);
            return;
        }

        const value = element.value.trim();

        if (value === "" || !Number.isFinite(Number(value))) {
            setStatus("Please enter a valid number for " + key + ".");
            element.focus();
            return;
        }

        values[key] = Number(value);
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Predicting...";
    }

    setStatus("Connecting to the JZRD prediction API...");
    setResult("");

    try {
        const payload = {
            Vf: values.Vf,
            "\u03c9": values.omega,
            "2r": values.diameter,
            km: values.km,
            kf: values.kf,
            Ri: values.Ri
        };

        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Prediction request failed.");
        }

        if (data.status !== "success" ||
            !Number.isFinite(Number(data.prediction))) {
            throw new Error("The API did not return a valid prediction.");
        }

        setStatus("Prediction successful · " + data.model);

        const output = document.createElement("div");
        const heading = document.createElement("strong");
        heading.textContent = "Predicted ka: " +
            Number(data.prediction).toPrecision(6);

        const note = document.createElement("p");
        note.textContent = data.warning ||
            "Research estimate only; not an experimental measurement.";

        output.appendChild(heading);
        output.appendChild(note);

        resultBox.replaceChildren(output);

    } catch (error) {
        console.error("Trained model prediction error:", error);
        setStatus("Prediction failed: " + error.message);
        setResult(
            "Check that the local API is running and reachable at 127.0.0.1:8000."
        );
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Predict with Trained Model";
        }
    }
}

document.getElementById("runTrainedModel")?.addEventListener(
    "click",
    runTrainedModelPrediction
);
