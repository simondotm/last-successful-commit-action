const core = require("@actions/core");
const github = require("@actions/github");

try {
  const octokit = github.getOctokit(core.getInput("github_token"));
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const params = {
    owner,
    repo,
    workflow_id: core.getInput("workflow_id"),
    status: "success",
    branch: core.getInput("branch"),
  }
  // filter workflow runs by the event that triggered them
  // this is an optional input and will default to "push"
  // if the input event is set to '*' then we will omit the event filter from the API query
  // so that all workflow runs are returned regardless of what event triggered them
  const event = core.getInput("workflow_event")
  if (event !== '*') {
      params.event = event || "push"
  }
  octokit.actions
    .listWorkflowRuns(params)
    .then((res) => {
      const lastSuccessCommitHash =
        res.data.workflow_runs.length > 0
          ? res.data.workflow_runs[0].head_commit.id
          : "";
      core.setOutput("commit_hash", lastSuccessCommitHash);
    })
    .catch((e) => {
      core.setFailed(e.message);
    });
} catch (e) {
  core.setFailed(e.message);
}
