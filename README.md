# Roblox Place Manager

Create and manage Roblox Experiences and Places directly from your Android device using Termux + Node.js.

Roblox Place Manager is a command-line tool designed to make Experience and Place management easier for mobile developers, especially those who use tools such as Roblox Studio Lite.

This project is a fork of the original Roblox Place Manager, expanded with additional API features, account information retrieval, Experience browsing, Place listing, and code improvements.

---

# Features

The current version provides six main functions:

Option| Feature
1| Create a new Experience
2| Create a Place inside an existing Experience
3| Get authenticated account information
4| List your Experiences
5| Get Experience details
6| List Places inside an Experience

Additional improvements include:

- Interactive terminal menu.
- Confirmation before creation operations.
- Automatic X-CSRF-TOKEN handling.
- Environment variable authentication.
- HTTP error handling.
- Automatic pagination for supported listing endpoints.
- Centralized HTTP request handling.
- JSON response processing.

---

# Important: ROBLOSECURITY

The ".ROBLOSECURITY" cookie is an authentication credential that grants access to your Roblox account session.

NEVER share your cookie with anyone.

This project is designed so that the cookie is not hardcoded into the source code.

Instead, it is temporarily loaded through an environment variable:

read -s ROBLOSECURITY
export ROBLOSECURITY

After using the application, remove the variable:

unset ROBLOSECURITY

Never hardcode your cookie:

const ROBLOSECURITY = "your_cookie_here";

Never publish your cookie on:

- GitHub;
- Discord;
- YouTube;
- Third-party websites;
- Public screenshots;
- Other people's messages.

If you believe your cookie has been exposed, terminate your Roblox sessions and follow Roblox's recommended account security procedures.

---

Requirements

You need:

- An Android device.
- Termux.
- Node.js 18 or newer.
- A Roblox account.
- Internet access.

An updated Termux installation is recommended.

---

Installation

Open Termux and update its packages:

pkg update && pkg upgrade

Install Node.js:

pkg install nodejs-lts git

Check the installed version:

node --version

---

Downloading the project

Clone the repository:

git clone https://github.com/Studio-Zee/roblox-place-manager.git

Enter the project directory:

cd roblox-place-manager

---

Configuring ROBLOSECURITY

Before running the application, load your Roblox cookie into the environment variable.

Execute:

read -s ROBLOSECURITY

The terminal will not display the characters while you type or paste your cookie. This is normal.

Press Enter when finished.

Then execute:

export ROBLOSECURITY

You can verify that the variable is loaded without displaying its contents:

if [ -n "$ROBLOSECURITY" ]; then
    echo "Cookie loaded."
else
    echo "Cookie NOT loaded."
fi

If the output says "Cookie loaded.", you are ready.

---

Running the application

Run:

node manager.js

The application will display the main menu:

========================================
          ROBLOX PLACE MANAGER
========================================

[1] Create a new Experience
[2] Create a Place in an Experience
[3] Get account information
[4] List my Experiences
[5] Get Experience details
[6] List Places in an Experience
[7] Exit

Select an option:

---

Available functions

# 1. Create a new Experience

Creates a new Roblox Experience using the template configured in the source code.

The application requests confirmation before sending the creation request.

# 2. Create a Place in an Experience

Creates an additional Place inside an existing Experience.

You will be asked to provide the Universe ID.

Example:

Universe ID: 8333219351

After confirmation, the application sends the creation request.

If successful, the result will contain information similar to:

Place created successfully!

Place ID: 92159367991281
URL: https://www.roblox.com/games/92159367991281

3. Get account information

Retrieves information about the authenticated Roblox account.

Available information includes:

- Username;
- Display name;
- User ID;
- Account description.

4. List my Experiences

Retrieves Experiences associated with the authenticated account.

The application displays:

- Experience name;
- Universe ID;
- Root Place ID;
- Visit count.

Supported pagination is used to retrieve additional result pages.

5. Get Experience details

Retrieves information about a specific Experience using its Universe ID.

Available information includes:

- Experience name;
- Universe ID;
- Description;
- Creator;
- Root Place ID;
- Current players;
- Total visits;
- Maximum players;
- Creation date;
- Last update date.

6. List Places in an Experience

Retrieves Places belonging to a specified Experience.

The output includes:

- Place name;
- Place ID;
- Place type;
- Direct Roblox URL.

---

Understanding Universe IDs and Place IDs

A Universe ID identifies an entire Roblox Experience, while a Place ID identifies an individual Place.

An Experience can contain multiple Places:

Experience (Universe ID)
│
├── Place 1 (Place ID)
├── Place 2 (Place ID)
└── Place 3 (Place ID)

When creating a new Place, you must provide the Universe ID of the destination Experience.

Do not confuse Universe IDs with Place IDs.

---

Removing the cookie after use

When you finish using the application, execute:

unset ROBLOSECURITY

You can verify that the variable has been removed:

if [ -n "$ROBLOSECURITY" ]; then
    echo "Cookie is still loaded."
else
    echo "Cookie removed from the environment."
fi

It is recommended to remove the variable after every session.

---

How it works

Roblox Place Manager communicates with Roblox API endpoints to perform its operations.

For authenticated POST requests, the application:

1. Sends an initial request.
2. Retrieves the X-CSRF-TOKEN when returned by Roblox.
3. Retries the request with the CSRF token.
4. Processes the HTTP response.
5. Displays the result in the terminal.

For GET requests, the application sends the authenticated request directly.

The ".ROBLOSECURITY" cookie is supplied through an environment variable rather than being hardcoded into "manager.js".

---

Limitations

This project relies on Roblox API endpoints, some of which are undocumented or subject to change.

Roblox may change:

- API endpoints;
- Authentication requirements;
- Permissions;
- Request parameters;
- Rate limits;
- API behavior.

Some operations may require specific account permissions or may stop working after API changes.

This project does not guarantee that every endpoint will remain available.

---

Project origin and fork information

Roblox Place Manager is a fork, based on the original project and its initial implementation.

The original idea and initial request implementation were discovered through content created by:

- "ZeeGameDev" (https://youtu.be/Gq9GWBBElH8?si=G5nfHvrVdIGtOGEi)

The project was subsequently rewritten, adapted, and expanded.

Improvements introduced in this fork

- Creation of new Experiences.
- Creation of Places in existing Experiences.
- Authenticated account information retrieval.
- Experience listing.
- Experience details retrieval.
- Place listing.
- Interactive menu.
- Operation confirmations.
- Universe ID validation.
- HTTP error handling.
- Automatic X-CSRF-TOKEN handling.
- Environment-based ROBLOSECURITY authentication.
- Automatic pagination.
- Centralized request handling.
- Improved code organization.

Credits are preserved to acknowledge the original inspiration and implementation.

---

Disclaimer

Roblox Place Manager is an independent, community-developed project.

It is not affiliated with, sponsored by, or officially maintained by Roblox Corporation.

Use it responsibly and protect your account credentials.
