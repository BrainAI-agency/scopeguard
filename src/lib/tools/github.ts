import { tool } from "ai";
import { z } from "zod/v3";
import { Octokit } from "@octokit/rest";
import { getAccessToken, withGitHubConnection } from "../auth0-ai";
import { auditToolCall } from "../audit-wrapper";

const GITHUB_SCOPES = ["read:user", "repo"];

export const listReposTool = withGitHubConnection(
  tool({
    description:
      "List the user's GitHub repositories. Returns repository names, descriptions, languages, and star counts.",
    inputSchema: z.object({
      sort: z
        .enum(["created", "updated", "pushed", "full_name"])
        .optional()
        .describe("Sort order for repositories"),
      limit: z
        .number()
        .min(1)
        .max(30)
        .optional()
        .describe("Maximum number of repos to return (default 10)"),
    }),
    execute: async ({ sort, limit }) => {
      const start = Date.now();
      try {
        const token = await getAccessToken();
        const octokit = new Octokit({ auth: token });

        const { data } = await octokit.repos.listForAuthenticatedUser({
          sort: sort ?? "updated",
          per_page: limit ?? 10,
        });

        const result = {
          repos: data.map((repo) => ({
            name: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            updatedAt: repo.updated_at,
            isPrivate: repo.private,
            url: repo.html_url,
          })),
        };

        await auditToolCall({
          toolName: "listRepos",
          connection: "github",
          scopes: GITHUB_SCOPES,
          apiEndpoint: "GET /user/repos",
          status: "success",
          durationMs: Date.now() - start,
        });

        return result;
      } catch (error) {
        await auditToolCall({
          toolName: "listRepos",
          connection: "github",
          scopes: GITHUB_SCOPES,
          apiEndpoint: "GET /user/repos",
          status: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        });
        throw error;
      }
    },
  })
);

export const getRepoFilesTool = withGitHubConnection(
  tool({
    description:
      "Read the contents of a file from a GitHub repository. Provide the owner, repo name, and file path.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (username or org)"),
      repo: z.string().describe("Repository name"),
      path: z.string().describe("File path within the repository"),
    }),
    execute: async ({ owner, repo, path }) => {
      const start = Date.now();
      try {
        const token = await getAccessToken();
        const octokit = new Octokit({ auth: token });

        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path,
        });

        let result;
        if (Array.isArray(data)) {
          result = {
            type: "directory" as const,
            entries: data.map((item) => ({
              name: item.name,
              type: item.type,
              path: item.path,
            })),
          };
        } else if (data.type === "file" && "content" in data) {
          const content = Buffer.from(data.content, "base64").toString("utf-8");
          result = {
            type: "file" as const,
            name: data.name,
            path: data.path,
            size: data.size,
            content: content.slice(0, 10000),
          };
        } else {
          result = { type: data.type, name: data.name };
        }

        await auditToolCall({
          toolName: "getRepoFiles",
          connection: "github",
          scopes: GITHUB_SCOPES,
          apiEndpoint: `GET /repos/${owner}/${repo}/contents/${path}`,
          status: "success",
          durationMs: Date.now() - start,
        });

        return result;
      } catch (error) {
        await auditToolCall({
          toolName: "getRepoFiles",
          connection: "github",
          scopes: GITHUB_SCOPES,
          apiEndpoint: `GET /repos/${owner}/${repo}/contents/${path}`,
          status: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        });
        throw error;
      }
    },
  })
);

export const searchCodeTool = withGitHubConnection(
  tool({
    description:
      "Search for code across the user's repositories. Returns matching files and code snippets.",
    inputSchema: z.object({
      query: z.string().describe("Search query (code content to find)"),
      language: z
        .string()
        .optional()
        .describe("Filter by programming language"),
    }),
    execute: async ({ query, language }) => {
      const start = Date.now();
      try {
        const token = await getAccessToken();
        const octokit = new Octokit({ auth: token });

        const q = language ? `${query} language:${language}` : query;

        const { data } = await octokit.search.code({
          q: `${q} user:@me`,
          per_page: 10,
        });

        const result = {
          totalCount: data.total_count,
          results: data.items.map((item) => ({
            repo: item.repository.full_name,
            path: item.path,
            name: item.name,
            url: item.html_url,
          })),
        };

        await auditToolCall({
          toolName: "searchCode",
          connection: "github",
          scopes: GITHUB_SCOPES,
          apiEndpoint: "GET /search/code",
          status: "success",
          durationMs: Date.now() - start,
        });

        return result;
      } catch (error) {
        await auditToolCall({
          toolName: "searchCode",
          connection: "github",
          scopes: GITHUB_SCOPES,
          apiEndpoint: "GET /search/code",
          status: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        });
        throw error;
      }
    },
  })
);
