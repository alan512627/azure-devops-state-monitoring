# C4143 DV-Scale Azure DevOps Extension

This extension packages the same live Dashboard core as the Tampermonkey version and adds:

- A full **C4143 DV-Scale** Hub under Azure Test Plans with exact `C4143_ScaleTest_Phase1`／`C4143_ScaleTest_Phase2` validation, Rack placement derived only from each parent Rack Feature title, all valid-Phase Cases included except the configured FPGA teardown Cases across title-format variants, compact Overview/Rack cards, one-decimal maximum percentage formatting, click/tap Execution date-time details, a fixed readable Actual/Estimated Execution Timeline, multi-project Query selector, five fixed Execute Test Point outcome summaries per Case (`Passed`, `Failed`, `Blocked`, `Not Applicable`, `Active`), PR #19-compatible Insights status cards in each phase's Insights panel, Phase 1 timeline extension through 2026-11-11 when needed, background Bug/Test Point outcome loading after the core dashboard appears, cached custom-field discovery, cross-plan Test Point lookup by Test Case ID with suite-tree fallback diagnostics, and verified Test Case Child ↔ Bug Parent ↔ Case History reconciliation plus Bug List and MSFT-Misc Portal tabs next to the Phase tabs, as userscript v1.13.0. Bug validation fetches fields and relations separately because Azure DevOps rejects combining `fields` with `$expand=relations` in one batch request. Overview and Rack tabs also show the five Execute Test Point Outcome distributions, with Overview bars split by Rack.
- A resizable **C4143 DV-Scale Status** Dashboard Widget.
- Azure DevOps-issued access tokens with read-only `vso.work` and `vso.test` scopes.

## Build and package

```powershell
cd .\azure-devops-extension
npm install
npm run package
```

The installable VSIX is written to:

```text
..\release\C4143-DVScale-Dashboard-Extension.vsix
```

Before publishing to the Visual Studio Marketplace, confirm that `publisher` in `vss-extension.json` matches your Marketplace publisher ID. Keep the extension private while validating it, upload the VSIX, share it with the `azurecsi` organization, install it, then add the widget from **Overview → Dashboards → Add a widget**.
