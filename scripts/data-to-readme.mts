import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { UserNode } from "./search-github-sponsorable-in-cambodia.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datadir = path.join(__dirname, "../data");
const resultJSON: UserNode[] = JSON.parse(await fs.readFile(path.join(datadir, "results.json"), "utf-8"));

const escapeTable = (text?: string) => text ? text.replace(/\|/g, "｜").replace(/\r?\n/g, " ") : "";
const isAccount = (person: UserNode) => person.login !== undefined;

const persons = resultJSON.filter(isAccount).map((person) => {
    const firstPin = person.pinnedItems?.edges?.[0]?.node ?? {};
    const firstItem = firstPin.url ? `[${firstPin.name ?? person.login ?? ""}](${firstPin.url})` : "<!-- no item -->";
    const firstItemDescription = firstPin.description ? escapeTable(firstPin.description ?? "") : "<!-- no description -->";
    
    return `## [${person.name ?? person.login ?? ""}](${person.url})
    
| [@${person.login}](${person.url}) | [❤️Sponsor](https://github.com/sponsors/${person.login}) |
| --- | --- |
| <img src="${person.avatarUrl}" alt="" width="40" /> | ${escapeTable(person.bio ?? "")} |
| ${escapeTable(firstItem)} | ${escapeTable(firstItemDescription)} |
`;
}).join("\n\n");

const totalUsers = resultJSON.length;
const searchResultsLink = "https://github.com/search?q=location%3ACambodia++is%3Asponsorable&type=users&ref=simplesearch";

const OUTPUT = `# GitHub Sponsor-able Users in Cambodia

This repository is a list of GitHub users who are living in Cambodia and are sponsor-able.

- Total: ${totalUsers}
- Search Results: [GitHub Search](${searchResultsLink})

----

${persons}
`;

const README_FILE = path.join(__dirname, "../README.md");
await fs.writeFile(README_FILE, OUTPUT);
