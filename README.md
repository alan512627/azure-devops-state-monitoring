# Azure DevOps State Monitoring

Azure DevOps Rack Test Status Dashboard 提供 Tampermonkey userscript 與原生 Azure DevOps Extension。它能在同一個 Dashboard 切換多個專案 Query，並讀取 Work Items 與 Test Plans Test Points，建立 Overview、各 Rack、Insights、Test Features、State、真實測試 Outcome、Priority、Bug、Sample Size、Test Duration、`Number_of_cycles`、週報與快照差異統計。

## 目前版本

- Dashboard：[C4143-DVScale-Dashboard.user.js](./C4143-DVScale-Dashboard.user.js)（固定安裝網址，腳本內版本 v1.13.19；本分支待合併 `main`）
- 開發與維護文件：[C4143-DVScale-Dashboard-HANDOFF.md](./C4143-DVScale-Dashboard-HANDOFF.md)
- Azure DevOps Extension：[azure-devops-extension](./azure-devops-extension)；可安裝 VSIX 位於 `release/C4143-DVScale-Dashboard-Extension.vsix`
- Azure DevOps organization：`https://azurecsi.visualstudio.com`
- Azure DevOps project：`Dev`

頁面頂端（標題列、Query／Data source／Time range 等控制列、Phase 1／Phase 2／Bug List／MSFT-Misc Portal 分頁）與各分頁的 summary 卡片固定置頂，只有下方的圖表與清單會捲動；視窗高度低於 560px 時改為一般捲動。

Rack Case 列表的 Test Point 標籤會隨背景資料載入同步更新，與上方 Outcome 統計採用相同資料來源；不會重建列表或清除已展開的項目。

Overview 與各 Rack 的 summary 卡片另顯示 `NOT UPDATED CASES`（Execute Test Point 仍為 `Active` 的 Case 數）與 `UPDATE COMPLETE`（已有 Passed／Failed／Blocked／Not Applicable 結果的 Case ÷ 範圍內全部 Case）。

Overview 兩個圓餅圖（Test Case State、Test Point Outcome）下方各有可展開／收合的清單：每個 status → Rack 1–5 的數量長條 → 該 Rack 的 Case（可連到 Work Item）。點圓餅圖的區塊或圖例 chip 會自動展開並捲動到該 status；展開狀態在重新整理後保留；`Expand all` 會連同各 Rack 的 Case 清單一起展開。各 Rack 分頁的兩個圓餅圖下方也有同樣的清單（status → Case），同樣支援點選導航。清單中每個 Case 後面有 `R1`–`R5` 色塊，顯示同一個 Case（依標題對應）在各 Rack 的狀態：State 清單顯示各 Rack 的 Work Item State，Outcome 清單顯示各 Rack 的 Execute Test Point Outcome；白框為目前這一筆，點色塊可開啟該 Rack 的 Case。虛線空框表示該 Rack 沒有完全同名的 Case；Insights 的 **Cross-Rack title review** 會列出這些缺漏，並為每一筆建議該 Rack 上最相似的 Case（附相似度與 High／Medium／Low 信心），可篩選並下載 CSV 供確認後回 Azure DevOps 統一標題。

Overview 的 Outcome 區下方新增 **Test item × Rack outcome matrix**：每列一個測項（依標題跨 Rack 對應），R1–R5 每格是該 Rack 的 Execute Test Point Outcome（P／F／B／NA／A，點擊開啟 Case；虛線為該 Rack 沒有同名 Case），右側為該測項在各 Rack 的分佈與完成數，底部為各 Rack 合計。可依 Failed／Passed／Active／標題排序，並篩選「有 Failed／Blocked」「各 Rack 皆完成」「各 Rack 結果不同」「有 Rack 缺少」。Matrix 使用該 Phase 全部 Case，不套用時間範圍。Matrix 預設依測項分類分段（可切換為不分組），每段標題列顯示該分類的 Log reviewer、P／F 數與完成度，點標題可收合：BIOS OpMode、Enumeration、FW update、Power cycling、Stress、Virtualization、MPF、Performance、RSCM CLI，其餘歸 Other。Log reviewer：Enumeration／RSCM CLI — Penny、FW update — Paul、Power cycling — Raymond、Stress／Virtualization — Rex、MPF／Performance — Youyu（BIOS OpMode 尚未指定）。分類定義在 `D.TEST_CATEGORIES`（以 41 個標準標題編號指定，實際標題先以相似度對應標準標題，再以關鍵字判斷）。

## 多專案 Query 選單

v1.10.0 在頂端控制列新增 **Query** 選單，內建以下兩個唯讀資料來源：

- `C4143_DV-Scale`：`9254024e-6a97-44ed-953b-1aa07d38fb48`
- `[EchoFalls][C4142][PSE] EVT - Scale Testing`：`6e06c765-2ff5-43c4-80c6-e78438eea6d9`

選擇另一個 Query 後，Dashboard 會重新執行該 Query，並以相同的 Overview、Rack、Insights、Test Features 與匯出格式呈現。標題、來源連結、Work Item hyperlinks 與匯出檔名也會同步改成目前選擇的 Query。

按 **Add / manage** 可以貼上其他 Azure DevOps Query URL，並自行設定顯示名稱。自訂清單只保存在目前瀏覽器的 `localStorage`，不會在 Azure DevOps 建立、修改或刪除 Query，也不會改動任何 Work Item。支援的網址格式為：

```text
https://{organization}.visualstudio.com/{project}/_queries/query/{query-id}/
https://dev.azure.com/{organization}/{project}/_queries/query/{query-id}/
```

每個 Query 的 snapshot 與最多 14 份每日歷史會使用各自的儲存 key，切換專案時不會拿另一個 Query 的 Case 做 Added／Removed／State Changed 比較。Live query 仍受瀏覽器同源規則限制；目前從 `azurecsi.visualstudio.com` 啟動時，最適合加入同一個 `azurecsi` organization 下的其他 project Query。

## Phase 1／Phase 2 主分頁

v1.11.0 在同一個 Query Dashboard 上方新增 **Phase 1** 與 **Phase 2** 兩個主分頁：

- Test Case 的 Tags 必須包含完整的 `C4143_ScaleTest_Phase1` 或 `C4143_ScaleTest_Phase2`（比對時忽略大小寫、空白、`-` 與 `_`）才會進入對應 Phase；缺少、同時含有兩個，或只是相似名稱的 Phase Tag 都不納入統計。
- Rack 歸屬只由 Azure DevOps hierarchy 中最外層 Rack Feature 的 title 擷取（例如 `[C4143][DV][Scale] Rack #1 - 11.3 HH Config` → Rack 1）；該 Feature 之下所有 System Requirement 與 Test Case 都屬於該 Rack。`Rack01`～`Rack05` Case tag 不再用來放置或排除 Case。
- 分流後 Phase 1／Phase 2 各只顯示自己的一組 Rack 1～5，不會在同一 Phase 重複列出十個 Rack。
- 所有位於 Rack Feature hierarchy 之下、且具有有效 Phase tag 的 Test Case 都會納入卡片、圖表、Bug、Test Result、快照差異與匯出；Case title 不再是一般篩選條件。唯一設定的例外是 `[System][Functionality] Dynamically Reconfig Glacier Peak / Castle Peak FPGA image (full link teardown)`；此項目會在每個 Rack／Phase 排除，且比對忽略大小寫、空白與標點格式差異。
- Overview 與各 Rack 都有 **EXCLUDED CASES** 卡片和可展開的 Case exclusion audit，逐筆顯示 Rack Feature、Case ID、Reason、目前 Title、Case Tags、預期 Phase Tag／scope 與 State。`PHASE TAG MISSING OR CONFLICT` 及明確設定的 scope exclusion 都會排除 Case。
- 若任一 Rack 超過舊有 41 項參考清單，Overview 與該 Rack 會顯示 **Additional Case title review**，列出沒有逐字對上參考清單的 Case ID、title、state 與 Phase tag。這是人工決策清單，不會自動排除任何 Case。
- 兩個 Phase 各自建立 Overview、Rack 1～5、Insights 與 Test Features；State、Closed／Blocked Rate、最新 Test Result Outcome、Priority、Sample Size、Number of Cycles、Duration、Bug 與 Rack 統計互不混用。
- Test Features 及週報 CSV／Excel 只匯出目前 Phase，檔名會加入 `Phase-1` 或 `Phase-2`；離線 Dashboard snapshot 仍保存完整 Query 的兩個 Phase。
- Phase 1／Phase 2 按鈕會顯示當次 Query 具有有效 Phase tag 的實際 Case 數；不會把缺少的 Case 補成固定數量。選擇的 Phase 會保存在目前瀏覽器，下一次開啟仍停留在同一 Phase。
- Overview 新增 **Phase / Rack Case count consistency** 稽核表，同時列出 Rack #1～#5 在 Phase 1、Phase 2 的實際 included Case 數。只有全部十個數字相同才顯示 `CONSISTENT`；不一致時明確警示，但不會為了湊數搬移、刪除或補造 Case。
- 每次開啟、F5、**Re-run query** 或自動刷新都會重新讀取兩個 Phase 的最新 Work Item State，並以 Case ID 跨所有 Test Plan 查詢 Execute Test Point，顯示目前的 Outcome；同名但 ID 不同的 Phase 1／Phase 2 Case 不會以 Title 誤配。

## Rack-aware Bug 追蹤

v1.10.3 將 Bug 資料來源改為 Test Case Links 下的 **Child link**，並執行三重一致性檢查：

- Test Case 目前必須有 `System.LinkTypes.Hierarchy-Forward`（Child）指向該 Work Item，而且目標型別必須是 `Bug`。
- 該 Bug 目前必須有 `System.LinkTypes.Hierarchy-Reverse`（Parent）反向指回同一個 Test Case ID。
- Test Case History／Updates 的 `relations.added` 也必須存在同一筆 `Child → Bug`；三者一致才加入 Bug List。
- Related、Parent-only、Dependency、Duplicate、Task，以及 Child／Parent／History 不一致的資料都會排除；排除或 History 讀取失敗時，右下角提示會列出數量。
- Bug 明細逐筆列出 **Rack → Case ID → Child／Parent／History matched → Added time／Added by**，可直接追查來源。

## Execution Timeline

v1.12.1 在每個 Phase 提供 **Execution Timeline** 分頁，資料直接來自各 Test Case 的 Define → Execution 欄位：

- `Actual Start Date`、`Actual Completion Date`、`Estimate/Estimated Start Date`、`Estimate/Estimated Completion Date` 會透過 Azure DevOps Fields API 解析實際 reference name；找不到的欄位會顯示 unavailable，不會用 Changed Date 代替。
- Case 順序依 Actual Start、Estimated Start、可用 Completion Date 排列。Estimated 為藍色外框、Actual 為綠色實線；只有單邊日期時顯示里程碑點。
- 可篩選 All Racks／單一 Rack、Actual + Estimate／Actual only／Estimate only，並以 Case ID、Title、State 搜尋。
- 每個 Case 可按 **Show date & time**（手機可直接點觸）在該列下方展開 Actual Start、Actual Completion、Estimate Start、Estimate Completion 的完整日期與時間；再次按下即可收合，也支援鍵盤 Enter／Space。
- `NO EXECUTION DATES` 與 `INVALID DATE RANGES` 卡片會顯示缺漏及 Completion 早於 Start 的資料；可展開清單逐筆修正，不會自行交換或推算日期。
- 四個日期欄位也會同步加入 Test Features 表格、Weekly CSV／Excel 與 Rack 1 Test Features Excel。

Overview 與各 Rack 的 Bug 顯示仍統一由同一份 `Bug × Rack × Case` inventory 計算：

- Overview 的 **Bug distribution by Rack** 會列出每個 Rack 的 unique Bug 數量，並可展開查看該 Rack 的 Bug IDs。
- Overview Bug 明細新增 **Racks** 欄位；同一個 Bug 若連結到多個 Rack 的 Test Cases，會在同一列列出所有 Rack。
- 只出現在單一 Rack 的 Bug 會以金色連結、Rack 標籤與列底色高亮；跨 Rack 重複的 Bug 維持一般顏色。
- Rack 1～5 分頁各自顯示該 Rack 通過三重檢查的 Child Bugs；數字卡、清單與 Overview 對應 Rack 的統計使用相同來源。
- Overview 的 `unique Bugs` 會依 Bug ID 去重；每 Rack 的數量會包含該 Rack 上的 shared Bugs，因此 Rack 數量相加可能大於 Overview unique total，這是正確的跨 Rack 關係呈現。

## Test Features 分頁

v1.8.2 的 `Test Features` 每次 Query 後直接遍歷 Rack 1 的最新 Work Item 階層，把全部 Rack 1 Test Case 依最近的上層 Feature 動態分組，不再依賴預先寫死的 Case Title 清單。畫面恢復為原本的 Feature 展開／收合與 Case 表格列表，顯示 ID、Title、State、Changed Date、Priority、Sample Size、Number of Cycles、Test Duration、Script type、CRC SDK、IGS Owner、Linked Bugs 與 Comments；Search 可同時篩選上述資料。

頁面上的 `LISTED / RACK 1 CASES` 卡片會直接比較最後一頁列出的 Case 數與 Rack 1 分頁的 Case 數，正常情況應顯示 `58 / 58`。

v1.8.6 起，Overview、各 Rack 與 Test Features 都只顯示 Azure DevOps Query 當次實際回傳的 Case 數量，不再顯示固定 Expected 數量，也不再因為總數不是 290 或單櫃不是 58 而產生 Coverage warning。`LISTED / RACK 1 CASES` 仍會比較 Test Features 列表與 Rack 1 的實際來源數量，確保兩個即時畫面同步。

v1.7.2 將 Overview、Rack 1～5 與最後一頁改為左側直式導覽。分頁上下排列，文字整段旋轉顯示；桌面版導覽寬 64px、按鈕寬 50px、字體 11px，窄螢幕自動縮為 54px／44px／10px，不占用右側 Dashboard 的資料空間。

v1.7.3 修正 re-query 完成提示的顯示時間：藍色資訊與黃色警告會在 4.5 秒開始淡出、5.2 秒完全隱藏；只有紅色載入錯誤會保留，方便使用者閱讀與排除問題。

v1.8.1 將固定範圍縮小為控制列、左側分頁與摘要卡；圓餅圖、比較圖及以下內容會正常跟隨頁面捲動。所有摘要卡強制維持單列，空間不足時只在卡片列內水平捲動，不會換到下一列。

v1.9.2 將 Rack 1 Test Features 與週報的 Excel 匯出改成真正的 Office Open XML `.xlsx`，不再使用 Excel 2003 XML `.xls`。所有 worksheet 均取消凍結窗格，保留 AutoFilter、欄寬、標題樣式及 Azure DevOps hyperlinks。

v1.8.4 讓同一列摘要卡維持完全相同的寬度與高度，並依每個數值的實際長度自動微調字級。`290 / 290`、Pass／Fail 數量與百分比等較長內容會完整顯示，不再使用省略號；窄螢幕仍維持單列，改由卡片列內的水平捲動查看其餘卡片。

v1.8.5 將 Overview 的 Pass／Fail Rate 限制為最多一位小數，整數百分比不保留 `.0`。例如一般結果顯示 `72 · 24.8%`、完整完成顯示 `290 · 100%`；當 Pass 或 Fail 尚無任何數量時，該卡片只顯示 `0%`。

v1.8.6 移除所有固定 Expected Case 數量與 Coverage warning。Case 新增、移除或移至不同 Rack 後，下一次重新查詢會直接顯示 Query 的實際結果，不需要同步修改 userscript 裡的基準值。

## Insights：趨勢、真實 Test Result、週報與差異

v1.9.0 新增左側 `Insights` 分頁：

- **真實 Pass／Fail**：每個 Case 的主要 outcome 以 Azure DevOps Test Plans「Execute」頁的 Test Point outcome 為準（以 `POST _apis/test/points` 依 Case ID 跨所有 Test Plan／Suite 查詢）；只呈現 `Passed`、`Failed`、`Blocked`、`Not Applicable`、`Active` 五種固定分類，分別使用綠、紅、橘、黃、靛色。Pass／Fail Rate 只顯示百分比，分母為選定時間範圍內的全部 Case，與 Outcome 圓餅圖同一基準。
- **快速 Re-query**：核心 Query、Rack、Case 與狀態先完成並呈現 Overview／Rack；Child Bug History 驗證與 Test Point outcome 會在背景補載，完成後只更新相關統計。Core Work Item、Relation 與 Child Work Item 批次採有限並行，避免循序等待又不造成無限制 API 壓力。背景完成前的卡片不會被當作最終 Bug／Test Result 統計。
- **Bug List 分頁**（Phase 2 旁）：唯讀執行 C4143 Bug query（`6f1d299f-eaa4-4d06-9d7f-0b6161f04788`），顯示 Total／Open／Resolved／Closed／Linked to Cases 卡片、State 圓餅圖、Severity 長條圖，以及可搜尋、依 State 篩選、點欄位排序的 Bug 表；`Linked Cases` 欄列出已驗證 Child link 的 Rack · Case。表格右上可 `Download CSV`、`Download Excel`（Bugs＋Summary 兩個工作表，ID 與 URL 為超連結）、`Download PDF`（A4 橫向，含統計卡、State／Severity 圖與 Bug 表；以瀏覽器列印對話框輸出，目的地選「另存為 PDF」）；三者皆匯出目前篩選與排序後的 Bug。
- **MSFT-Misc Portal 分頁**：C4143 Outline（SharePoint）、Test plan query、Test Plan、Bug query、Azure storage Logs container、CRC-SDK-Repo 連結卡；每張卡可 Edit／Reset，修改只存在本機瀏覽器（localStorage）。
- **Execution Timeline**：Phase 1 Execution Timeline 在資料較早結束時至少延伸至 2026-11-13，最早日期 bar 與左側分格線保留小間距。
- **Re-query timing**：完成後的提示會回報 core 與 supplemental 的秒數，方便區分主查詢與背景驗證的實際延遲。
- **Case 結果回填**：Rack 與 Test Features 的每個 Case 顯示 Execute Test Point Outcome，可連到對應 Test Point；優先以 Case ID 對應，僅在 Title 唯一且完全相符時才退回 Title 對應。
- **與上次快照比較**：列出 Added、Removed、State Changed，以及本週有更新的 Cases。第一次使用只有基準快照；下一次重新查詢後才會產生差異。
- **週報匯出**：`Download weekly CSV` 匯出全部 Case 明細；`Download weekly Excel (.xlsx)` 另外包含 Weekly Cases、Snapshot Changes 兩個未凍結的工作表，保留 Azure DevOps hyperlinks。

v1.9.1 移除跨網域 Analytics OData 趨勢與相關 PAT／登入流程，避免 Chrome 顯示原生帳密視窗。Insights 仍保留真實 Test Results、週報與快照比較。

## 發布成網頁與自動連動

這個 Dashboard 可以發布成網頁，但要依使用情境選擇方式：

- **目前 Tampermonkey 方式（建議內部使用）**：Dashboard 在 `azurecsi.visualstudio.com` 同源頁面內執行，直接沿用使用者已登入的 Azure DevOps session。按 `F5`、**Re-run query**，或啟用每 5 分鐘自動刷新時，就會重新查詢並顯示最新結果。
- **純靜態網站（例如 GitHub Pages）**：可以發布畫面或離線 snapshot，但瀏覽器通常無法從其他網域直接讀取私有 Azure DevOps Query，因為會遇到登入授權與跨網域限制；因此不能只把目前的 JS 放上靜態網站就得到即時資料。
- **可共用的即時介面**：v1.9.0 已提供 Azure DevOps Extension Hub 與 Dashboard Widget，使用 Azure DevOps 發出的 read-only access token，不需把 PAT 寫進前端。純外部網站仍需要受保護的後端 API／proxy 與適當身分驗證。

Azure DevOps Query 有更新時，資料是由 Dashboard 在下一次載入、手動重新查詢或排程刷新時「拉取」回來；Query 本身不會主動把更新推送到靜態網頁。若需要無人開啟頁面也持續更新，可由後端排程或 CI 工作定期執行 Query 並更新網站資料。

## 使用 Tampermonkey 安裝

### 1. 安裝 Tampermonkey

在 Chrome 安裝 [Tampermonkey](https://www.tampermonkey.net/)，安裝後確認擴充功能已啟用。

### 2. 下載目前的 JS

1. 開啟固定入口的 [Dashboard JS](./C4143-DVScale-Dashboard.user.js)。
2. 在 GitHub 檔案頁面按 **Download raw file**，把 `.js` 檔下載到電腦。

### 3. 匯入 Tampermonkey

1. 點 Chrome 工具列上的 Tampermonkey 圖示。
2. 開啟 **Dashboard**。
3. 切換到 **Utilities**。
4. 在 **Import from file** 選擇剛下載的 JS。
5. 按 **Install**。
6. 回到 Tampermonkey Dashboard，確認腳本狀態是 Enabled。

也可以在 Tampermonkey 選擇 **Create a new script**，將 JS 全部內容貼入編輯器後按 `Ctrl+S` 儲存。

> 從舊的版本檔名切換到固定入口時，需要最後一次手動安裝，並停用或刪除舊版。之後只保留一個 C4143 Dashboard userscript，避免兩個版本同時執行。

## Dashboard 腳本自動更新

固定入口的 userscript 已包含：

```text
@updateURL   https://raw.githubusercontent.com/alan512627/azure-devops-state-monitoring/main/C4143-DVScale-Dashboard.user.js
@downloadURL https://raw.githubusercontent.com/alan512627/azure-devops-state-monitoring/main/C4143-DVScale-Dashboard.user.js
```

第一次由固定入口安裝後，Tampermonkey 會依自己的更新檢查間隔讀取 GitHub 上的 `@version`；當 repository 的版本號提高時，它會下載並取代已安裝版本。更新完成後，重新整理 Azure DevOps 頁面就會執行新版，不需要再次 Import。

建議在 Tampermonkey Dashboard 的 **Settings → Script Update** 中，把更新檢查間隔調成你可接受的最短間隔，並確認該腳本的更新檢查沒有被關閉。如果剛 push 完希望立刻取得新版，可從 Tampermonkey 選單手動執行一次 **Check for userscript updates**，完成後再重新整理 Azure DevOps。

> Tampermonkey 的標準更新是定時檢查，並不保證每一次按 `F5` 都立即連到 GitHub。因此一般情況只要重新整理即可；剛發布、但尚未到下一次檢查時間時，需要等候更新間隔或手動檢查一次。

## 每次開啟 Azure DevOps 時自動抓取資料更新

### 專用 Dashboard 網址

先確認同一個 Chrome 已登入 Azure DevOps，然後開啟：

```text
https://azurecsi.visualstudio.com/_apis/projects?api-version=6.0#dvdash
```

建議把這個網址加入書籤。每次開啟書籤或按 `F5` 時，userscript 都會重新啟動 Dashboard。

### 確認使用 Live query

Dashboard 上方的 **Data source** 必須選擇：

```text
Live query (same-origin REST API)
```

選擇會儲存在瀏覽器中。只要維持 Live query，每次開啟專用網址或重新整理頁面，就會重新執行 Azure DevOps Query 並抓取最新 Work Items。

如果 Data source 選成 **Offline snapshot**，頁面只會讀取上一次的快照，不會向 Azure DevOps 抓取更新。

### 設為 Chrome 啟動頁面（選用）

如果希望每次啟動 Chrome 都自動開啟 Dashboard：

1. 開啟 Chrome **Settings**。
2. 進入 **On startup**。
3. 選擇 **Open a specific page or set of pages**。
4. 加入專用 Dashboard 網址：

```text
https://azurecsi.visualstudio.com/_apis/projects?api-version=6.0#dvdash
```

Chrome 啟動並載入這個頁面後，Tampermonkey 會自動執行腳本；Live query 隨即重新抓取資料。

> 腳本不會覆蓋所有一般 Azure DevOps 頁面。自動 Dashboard 只會在 `#dvdash` 專用入口，或 `/_apis/projects` 路徑啟動，避免影響 Boards、Queries、Test Plans 等正常操作。

## 使用 Azure DevOps Extension／Dashboard Widget

Extension 提供兩個入口：Azure Test Plans 下的完整 **C4143 DV-Scale** Hub，以及可加入 Azure DevOps Dashboard 的 **C4143 DV-Scale Status** Widget。安裝前需確認 [vss-extension.json](./azure-devops-extension/vss-extension.json) 的 `publisher` 是實際 Visual Studio Marketplace Publisher ID。

```powershell
cd .\azure-devops-extension
npm install
npm run package
```

完成後將 `release/C4143-DVScale-Dashboard-Extension.vsix` 上傳到 Visual Studio Marketplace，維持 Private、分享給 `azurecsi` organization，再從 Azure DevOps 安裝。Extension 只申請 `vso.work`、`vso.test` 讀取範圍；Widget 會顯示 Live Query 摘要並連到完整 Hub。

## Dashboard 更新方式

- 每次開啟專用網址或按 `F5`：重新執行 Query。
- 按 **Re-run query**：立即重新抓取。
- 勾選 **Auto refresh every 5 min**：頁面保持開啟時每 5 分鐘更新。
- **Time range (by Changed Date)**：只篩選指定期間內有更新的 Test Cases。
- 若短時間範圍沒有資料，可切回 **All time**。

## 常見問題

### 只看到 Azure DevOps Projects JSON，沒有 Dashboard

- 確認 Tampermonkey 已安裝且腳本是 Enabled。
- 確認網址是 `https://azurecsi.visualstudio.com/_apis/projects?api-version=6.0#dvdash`。
- 重新整理頁面。
- 確認沒有同時安裝多個舊版 Dashboard userscript。

### Live query 顯示載入失敗

- 確認目前 Chrome 已登入 `azurecsi.visualstudio.com`。
- 不要從本機 `file://` 直接開啟 Dashboard 並使用 Live query；Azure DevOps REST API 不允許跨網域請求。
- 重新開啟專用 Dashboard 網址後再按 **Re-run query**。

### Dashboard 顯示 0 筆

- 先把 Time range 切換成 **All time**。
- 確認 Azure DevOps Query 本身仍可存取。
- 如果只缺少自訂欄位統計，請查看右下角提示，可能是 Azure DevOps Fields API 或欄位名稱已變更。

## 安全性

- Userscript 只讀取 Azure DevOps 資料，不會修改 Work Item。
- Live query 使用目前瀏覽器的 Azure DevOps 登入狀態，不需要把 PAT 寫入 JS。
- Export offline snapshot 會包含實際 Work Item 資料，分享前請確認接收者與資料權限。

## 維護方式

後續 Dashboard 有更新時，請在本 repository 一併更新：

1. 最新版本的 userscript。
2. `C4143-DVScale-Dashboard-HANDOFF.md`。
3. README 中的目前版本號與固定安裝連結。
4. Tampermonkey `@version` 與檔頭說明。

詳細架構、欄位 mapping、版本歷程與驗證紀錄請參考 [HANDOFF](./C4143-DVScale-Dashboard-HANDOFF.md)。

## 運作流程圖

- [簡易概念流程](./docs/flowcharts/ado-dashboard-simple-flow.html)
- [認證、資料讀取與操作細節流程](./docs/flowcharts/ado-dashboard-auth-data-flow.html)
