
const readline = require("readline");

const API_BASE = "https://apis.roblox.com";
const ROBLOSECURITY = process.env.ROBLOSECURITY;
const TEMPLATE_PLACE_ID = 95206881;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (!ROBLOSECURITY) {
    console.error("\nERROR: ROBLOSECURITY was not loaded.");
    console.error("\nRun:");
    console.error("read -s ROBLOSECURITY");
    console.error("export ROBLOSECURITY");
    console.error("node manager.js\n");
    process.exit(1);
}

function question(text) {
    return new Promise(resolve => {
        rl.question(text, answer => resolve(answer.trim()));
    });
}

async function confirm(text) {
    const answer = await question(`${text} [y/N]: `);
    return answer.toLowerCase() === "y";
}

function parseResponse(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function printResult(data) {
    console.log(JSON.stringify(data, null, 2));
}

// HTTP REQUEST HANDLER
async function robloxRequest(url, method = "GET", body = null) {
    const headers = {
        "Cookie": `.ROBLOSECURITY=${ROBLOSECURITY}`,
        "Accept": "application/json"
    };

    if (body !== null) {
        headers["Content-Type"] = "application/json";
    }

    const options = {
        method,
        headers
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    let response = await fetch(url, options);

    // Retry once if Roblox requires a CSRF token.
    if (response.status === 403) {
        const csrfToken = response.headers.get("x-csrf-token");

        if (csrfToken) {
            headers["X-CSRF-TOKEN"] = csrfToken;
            response = await fetch(url, options);
        }
    }

    const text = await response.text();

    return {
        status: response.status,
        ok: response.ok,
        data: parseResponse(text),
        text
    };
}

// REQUEST ERROR HANDLER
function checkResponse(result) {
    if (!result.ok) {
        console.error(`\nHTTP ERROR: ${result.status}`);
        console.error(result.text);
        return false;
    }

    return true;
}

// PAGINATED REQUEST
async function getAllPages(url) {
    let results = [];
    let nextCursor = null;

    do {
        const separator = url.includes("?") ? "&" : "?";
        const requestUrl = nextCursor
            ? `${url}${separator}cursor=${encodeURIComponent(nextCursor)}`
            : url;

        const result = await robloxRequest(requestUrl);

        if (!checkResponse(result)) {
            break;
        }

        const data = result.data?.data || [];

        results = results.concat(data);
        nextCursor = result.data?.nextPageCursor || null;

    } while (nextCursor);

    return results;
}

// GET AUTHENTICATED ACCOUNT INFORMATION
async function getAccountInfo() {
    console.log("\nFetching account information...");

    try {
        const result = await robloxRequest(
            "https://users.roblox.com/v1/users/authenticated"
        );

        if (!checkResponse(result)) return;

        console.log("\n========== ACCOUNT INFORMATION ==========");
        console.log(`Username: ${result.data.name}`);
        console.log(`Display Name: ${result.data.displayName}`);
        console.log(`User ID: ${result.data.id}`);
        console.log(`Description: ${result.data.description || "None"}`);
        console.log("=========================================");
    } catch (error) {
        console.error("\nRequest failed:", error.message);
    }
}

// LIST OWN EXPERIENCES
async function listExperiences() {
    console.log("\nFetching authenticated account...");

    try {
        const account = await robloxRequest(
            "https://users.roblox.com/v1/users/authenticated"
        );

        if (!checkResponse(account)) return;

        const userId = account.data.id;

        console.log(`\nFetching experiences for ${account.data.name}...`);

        const url =
            `https://games.roblox.com/v2/users/${userId}/games` +
            "?accessFilter=2&limit=50&sortOrder=Asc";

        const experiences = await getAllPages(url);

        console.log("\n========== MY EXPERIENCES ==========");

        if (experiences.length === 0) {
            console.log("No experiences found.");
            return;
        }

        experiences.forEach((game, index) => {
            console.log(`\n[${index + 1}] ${game.name}`);
            console.log(`Universe ID: ${game.id}`);
            console.log(`Root Place ID: ${game.rootPlaceId}`);
            console.log(`Visits: ${game.placeVisits ?? "Unknown"}`);
        });

        console.log("\n=====================================");
        console.log(`Total: ${experiences.length}`);
    } catch (error) {
        console.error("\nRequest failed:", error.message);
    }
}

// GET EXPERIENCE DETAILS
async function getExperienceDetails() {
    const universeId = await question("\nUniverse ID: ");

    if (!/^\d+$/.test(universeId)) {
        console.log("\nInvalid Universe ID.");
        return;
    }

    console.log("\nFetching experience details...");

    try {
        const url =
            `https://games.roblox.com/v1/games?universeIds=${universeId}`;

        const result = await robloxRequest(url);

        if (!checkResponse(result)) return;

        const game = result.data?.data?.[0];

        if (!game) {
            console.log("\nExperience not found.");
            return;
        }

        console.log("\n========== EXPERIENCE DETAILS ==========");
        console.log(`Name: ${game.name}`);
        console.log(`Universe ID: ${game.id}`);
        console.log(`Description: ${game.description || "None"}`);
        console.log(`Creator: ${game.creator?.name || "Unknown"}`);
        console.log(`Root Place ID: ${game.rootPlaceId}`);
        console.log(`Playing: ${game.playing ?? 0}`);
        console.log(`Visits: ${game.visits ?? 0}`);
        console.log(`Max Players: ${game.maxPlayers ?? "Unknown"}`);
        console.log(`Created: ${game.created || "Unknown"}`);
        console.log(`Updated: ${game.updated || "Unknown"}`);
        console.log("========================================");
    } catch (error) {
        console.error("\nRequest failed:", error.message);
    }
}

// LIST PLACES IN AN EXPERIENCE
async function listPlaces() {
    const universeId = await question("\nUniverse ID: ");

    if (!/^\d+$/.test(universeId)) {
        console.log("\nInvalid Universe ID.");
        return;
    }

    console.log("\nFetching places...");

    try {
        const url =
            `https://develop.roblox.com/v1/universes/${universeId}/places` +
            "?limit=100&sortOrder=Asc";

        const places = await getAllPages(url);

        console.log("\n========== EXPERIENCE PLACES ==========");

        if (places.length === 0) {
            console.log("No places found.");
            return;
        }

        places.forEach((place, index) => {
            console.log(`\n[${index + 1}] ${place.name}`);
            console.log(`Place ID: ${place.id}`);
            console.log(`Type: ${place.type || "Unknown"}`);
            console.log(`URL: https://www.roblox.com/games/${place.id}`);
        });

        console.log("\n========================================");
        console.log(`Total Places: ${places.length}`);
    } catch (error) {
        console.error("\nRequest failed:", error.message);
    }
}

// CREATE NEW EXPERIENCE
async function createUniverse() {
    const url = `${API_BASE}/universes/v1/universes/create`;

    const body = {
        templatePlaceId: TEMPLATE_PLACE_ID
    };

    console.log("\n========== CREATE EXPERIENCE ==========");
    console.log(`Template Place ID: ${TEMPLATE_PLACE_ID}`);

    if (!await confirm("Create a new Experience?")) {
        console.log("\nOperation cancelled.");
        return;
    }

    console.log("\nSending request...");

    try {
        const result = await robloxRequest(url, "POST", body);

        if (!checkResponse(result)) return;

        console.log("\nExperience created successfully!");
        printResult(result.data);
    } catch (error) {
        console.error("\nRequest failed:", error.message);
    }
}

// CREATE PLACE IN EXISTING EXPERIENCE
async function createPlace() {
    console.log("\n========== CREATE PLACE ==========");

    const universeId = await question("\nUniverse ID: ");

    if (!/^\d+$/.test(universeId)) {
        console.log("\nInvalid Universe ID.");
        return;
    }

    const url =
        `${API_BASE}/universes/v1/user/universes/${universeId}/places`;

    const body = {
        templatePlaceId: TEMPLATE_PLACE_ID
    };

    console.log(`\nUniverse ID: ${universeId}`);
    console.log(`Template Place ID: ${TEMPLATE_PLACE_ID}`);

    if (!await confirm("Create a new Place in this Experience?")) {
        console.log("\nOperation cancelled.");
        return;
    }

    console.log("\nSending request...");

    try {
        const result = await robloxRequest(url, "POST", body);

        if (!checkResponse(result)) return;

        const placeId = result.data?.placeId;

        console.log("\nPlace created successfully!");

        if (placeId) {
            console.log(`Place ID: ${placeId}`);
            console.log(`URL: https://www.roblox.com/games/${placeId}`);
        } else {
            printResult(result.data);
        }
    } catch (error) {
        console.error("\nRequest failed:", error.message);
    }
}

// MAIN MENU
async function main() {
    while (true) {
        console.clear();

        console.log("========================================");
        console.log("          ROBLOX PLACE MANAGER");
        console.log("========================================");
        console.log("");
        console.log("  [1] Create a new Experience");
        console.log("  [2] Create a Place in an Experience");
        console.log("  [3] Get account information");
        console.log("  [4] List my Experiences");
        console.log("  [5] Get Experience details");
        console.log("  [6] List Places in an Experience");
        console.log("  [7] Exit");
        console.log("");

        const option = await question("Select an option: ");

        switch (option) {
            case "1":
                await createUniverse();
                break;

            case "2":
                await createPlace();
                break;

            case "3":
                await getAccountInfo();
                break;

            case "4":
                await listExperiences();
                break;

            case "5":
                await getExperienceDetails();
                break;

            case "6":
                await listPlaces();
                break;

            case "7":
                console.log("\nExiting Roblox Place Manager...");
                return;

            default:
                console.log("\nInvalid option.");
        }

        await question("\nPress ENTER to return to the menu...");
    }
}

// EXECUTION
async function run() {
    try {
        await main();
    } catch (error) {
        console.error("\nFatal error:", error.message);
    } finally {
        rl.close();
    }
}

run();
