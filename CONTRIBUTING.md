# Help shape the showroom

THD AI is an independent place for people connected to Deggendorf Institute of Technology to share work, find inspiration, and collaborate in their own time. Personal work and university projects belong alongside one another. AI-assisted work is welcome; quality, care, accurate credit, and clear limitations matter.

## Share a project

Use the [project submission form](https://github.com/THD-AI/thd-ai.github.io/issues/new?template=project-submission.yml). Include a public repository, its creators, a clear description, a way to try or understand it, and what kind of collaboration you want. You can keep the repository in your own account. Organization membership is not required to submit or contribute.

The submission workflow leaves an acknowledgement and checks whether the repository is publicly readable. It does not approve or automatically publish a listing. A maintainer reviews the information and image permission, then opens a pull request to update `site/projects.json`. Keep source attribution in `asset-sources.json` and `site/credits/index.html`. Close the submission issue when the listing is published. An experimental project is welcome when it is described honestly and has a useful way in.

To update or remove your own listing, open an issue or pull request. If you need to discuss something privately, [email Alexander](mailto:alex.rudaev@outlook.com).

## Change the website

The website is buildless HTML, CSS, and JavaScript in `site/`. It uses a local JSON catalogue, with no visitor accounts or database. Search and filters run in the browser. An external Google Fonts stylesheet provides the fonts; system sans-serif fonts are the fallback.

1. Fork the repository or create a branch if you have write access.
2. Edit a focused piece of the site, add a credited project, or improve the documentation.
3. Run `node scripts/check.mjs` and `node --check site/app.js`.
4. Serve `site/` locally, for example with `python -m http.server 4173 --directory site`, and check the relevant desktop/mobile flow.
5. Open a pull request. The same validation runs in GitHub Actions. A checked merge to `main` publishes only `site/` to GitHub Pages.

Do not put private archive files or credentials in `site/`. Use text content for project metadata, not injected HTML. Keep the approved campus banner and existing project branding intact unless a change is agreed with its creators.

## Work together

Members can create and lead public and private repositories. Use [Discussions](https://github.com/orgs/THD-AI/discussions) to meet people, share a work in progress, or ask a question. Follow the [community conduct guidance](https://github.com/THD-AI/.github/blob/main/CODE_OF_CONDUCT.md), give people credit, and respect each project's licence and decisions.
