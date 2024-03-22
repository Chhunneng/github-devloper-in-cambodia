import { Octokit } from "@octokit/core";
import { paginateGraphql } from "@octokit/plugin-paginate-graphql";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const MyOctokit = Octokit.plugin(paginateGraphql);
const octokit = new MyOctokit({ auth: process.env.GITHUB_TOKEN });

export type UserNode = {
    login: string;
    name: string;
    url: string;
    location: string;
    avatarUrl: string;
    bio: string;
}


export type Edge = {
    node: Node;
}

export type Node = {
    name: string;
    description: string;
    url: string;
}


const query = `query paginate($cursor: String) {
    search(type: USER query: "location:Cambodia", first: 100, after: $cursor) {
        userCount
        pageInfo {
            hasNextPage
            endCursor
        }
        nodes {
          ... on User{
            login,
            name
            url
            location
            avatarUrl
            bio
          }
       }
    }
}`;

const results: UserNode[] = [];

for await (const result of octokit.graphql.paginate.iterator(query)) {
    results.push(...result.search.nodes.filter((node: UserNode) => node.login !== undefined));
    console.log(`results: ${results.length}/${result.search.userCount}`);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const DATA_DIR = path.join(__dirname, "..", "data");
// const RESULT_FILE_PATH = path.join(DATA_DIR, "results.json");
// await fs.writeFile(RESULT_FILE_PATH, JSON.stringify(results, null, 2));
const escapeTable = (text?: string) => text ? text.replace(/\|/g, "｜").replace(/\r?\n/g, " ") : "";
const persons = results.map((person) => {
  return `
<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; height: 150px;">
  <img src="${person.avatarUrl}" alt="${person.login} Avatar" width="100" style="float: left; margin-right: 10px; border-radius: 2.5px;" />
  <div>
    <h3>${person.name ?? person.login ?? ""}</h3>
    <p>Location: ${person.location ?? "Unknown"}</p>
    <p style="max-height: 60px; overflow: hidden;">Bio: ${person.bio ?? ""}</p>
    <a href="${person.url}">GitHub Profile</a>
  </div>
</div>
`;
}).join("\n\n");

const totalUsers = results.length;
const searchResultsLink = "https://github.com/search?q=location%3ACambodia&type=users&ref=simplesearch";
const myProfileLine = "https://github.com/Chhunneng";
const OUTPUT = `# List of Developers in Cambodia

This repository is a list of GitHub user or developer who are putting location in Cambodia.

This repository maintenance by [Chhunneng](${myProfileLine}) or [Chrea Chanchhunneng](${myProfileLine}). Give a star or follow🥰.

- Total: ${totalUsers}
- Search Results: [GitHub Search](${searchResultsLink})

----

${persons}
`;

const README_FILE = path.join(__dirname, "../README.md");
await fs.writeFile(README_FILE, OUTPUT);
