const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3001;

const CATALYST_BASE_URL =
    "https://crimelens-ai-60079382706.development.catalystserverless.in/server/crimelens_api";

app.use(cors());
app.use(express.json());


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CrimeLens local proxy is running"
    });
});


// ======================================================
// FORWARD REQUESTS TO CATALYST
// ======================================================

app.use(async (req, res) => {
    try {

        const targetUrl =
            `${CATALYST_BASE_URL}${req.originalUrl}`;

        console.log(
            `${req.method} ${req.originalUrl} -> ${targetUrl}`
        );

        const options = {
            method: req.method,
            headers: {
                Accept: "application/json"
            }
        };


        // Add JSON body only for requests that can contain one
        if (
            req.method !== "GET" &&
            req.method !== "HEAD"
        ) {

            options.headers["Content-Type"] =
                "application/json";

            options.body =
                JSON.stringify(req.body || {});
        }


        const catalystResponse =
            await fetch(targetUrl, options);


        const responseText =
            await catalystResponse.text();


        res.status(catalystResponse.status);


        const contentType =
            catalystResponse.headers.get(
                "content-type"
            );


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            try {

                return res.json(
                    JSON.parse(responseText)
                );

            } catch {

                return res.send(responseText);

            }

        }


        return res.send(responseText);

    }

    catch (error) {

        console.error(
            "CrimeLens proxy error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "CrimeLens proxy could not reach Catalyst",

            error:
                error instanceof Error
                    ? error.message
                    : String(error)

        });

    }
});


app.listen(PORT, () => {

    console.log(
        `CrimeLens proxy running at http://localhost:${PORT}`
    );

});