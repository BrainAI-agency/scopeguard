import { listReposTool, getRepoFilesTool, searchCodeTool } from "./github";
import { getEventsTool, checkAvailabilityTool } from "./calendar";
import { getInboxTool, searchEmailsTool } from "./gmail";

export const allTools = {
  listRepos: listReposTool,
  getRepoFiles: getRepoFilesTool,
  searchCode: searchCodeTool,
  getCalendarEvents: getEventsTool,
  checkAvailability: checkAvailabilityTool,
  getInbox: getInboxTool,
  searchEmails: searchEmailsTool,
};
