(async () => {
         const out = { drawerOpened: false, drawerTitle: '', drawerRows: 0, drawerActions: 0, moreItems: [], drawerClosed: false }
         // 先切到「全部资源」，保证网格里有卡片
         const navItems = Array.from(document.querySelectorAll('.nav-item'))
         const allView = navItems.find((el) => (el.querySelector('.nav-name')?.textContent ?? '').trim() === '全部资源')
         if (allView) allView.dispatchEvent(new MouseEvent('click', { bubbles: true }))
         const gridDeadline = Date.now() + 5000
         while (Date.now() < gridDeadline) {
           if (document.querySelectorAll('.grid .tile').length > 0) break
           await new Promise((r) => setTimeout(r, 150))
         }
         out.gridTiles = document.querySelectorAll('.grid .tile').length
         // Phase 10：虚拟滚动自检——滚动前后渲染的卡片数应远小于总数，且窗口内容会变
         const scroller = (() => {
           let node = document.querySelector('.grid-wrap')
           while (node) {
             const style = getComputedStyle(node)
             if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight - 1) return node
             node = node.parentElement
           }
           return null
         })()
         if (scroller) {
           scroller.scrollTop = 0
           await new Promise((r) => setTimeout(r, 300))
           const beforeCount = document.querySelectorAll('.grid .tile').length
           const beforeFirst = document.querySelector('.grid .tile .tile-label')?.textContent ?? ''
           scroller.scrollTop = 2400
           await new Promise((r) => setTimeout(r, 400))
           out.virtualGrid = {
             virtualClass: document.querySelector('.grid-wrap.virtual') !== null,
             total: document.querySelector('.grid-foot')?.textContent?.trim() ?? '',
             beforeCount,
             afterCount: document.querySelectorAll('.grid .tile').length,
             beforeFirst,
             afterFirst: document.querySelector('.grid .tile .tile-label')?.textContent ?? ''
           }
           scroller.scrollTop = 0
           await new Promise((r) => setTimeout(r, 200))
         }
         const tiles = Array.from(document.querySelectorAll('.grid .tile'))
         if (tiles[0]) tiles[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
         const deadline = Date.now() + 4000
         while (Date.now() < deadline) {
           if (document.querySelector('.drawer')) break
           await new Promise((r) => setTimeout(r, 120))
         }
         const drawer = document.querySelector('.drawer')
         if (drawer) {
           out.drawerOpened = true
           out.drawerTitle = document.querySelector('.drawer-title h2')?.textContent ?? ''
           out.drawerRows = drawer.querySelectorAll('.info-row').length
           out.drawerActions = drawer.querySelectorAll('button').length
           // 抽屉里所有「键 → 值」，用来验证元数据区块确实渲染了
           out.drawerInfo = Array.from(drawer.querySelectorAll('.info-row')).map((row) => {
             const key = row.querySelector('.info-key')?.textContent ?? ''
             const value = row.querySelector('.info-val')?.textContent ?? ''
             return key + '=' + value
           })
           const posterBox = drawer.querySelector('.drawer-poster')
           const posterImg = drawer.querySelector('.drawer-poster img')
           if (posterBox) {
             const rect = posterBox.getBoundingClientRect()
             out.posterBox = { w: Math.round(rect.width), h: Math.round(rect.height) }
           }
           if (posterImg) {
             const rect = posterImg.getBoundingClientRect()
             out.posterImg = {
               w: Math.round(rect.width),
               h: Math.round(rect.height),
               natural: posterImg.naturalWidth + 'x' + posterImg.naturalHeight
             }
           }
           const cardImg = document.querySelector('.grid .tile .tile-thumb img')
           if (cardImg) {
             const rect = cardImg.getBoundingClientRect()
             out.cardImg = {
               w: Math.round(rect.width),
               h: Math.round(rect.height),
               natural: cardImg.naturalWidth + 'x' + cardImg.naturalHeight
             }
           }
           const closeBtn = drawer.querySelector('.drawer-close')
           if (closeBtn) closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
           await new Promise((r) => setTimeout(r, 400))
           out.drawerClosed = document.querySelector('.drawer') === null
         }
         // 再切到「电影」看一次：影视属于作品实体，抽屉里应出现「作品信息」区块         const movieNav = Array.from(document.querySelectorAll('.nav-item')).find(
           (el) => (el.querySelector('.nav-name')?.textContent ?? '').trim() === '电影'
         )
         if (movieNav) {
           movieNav.dispatchEvent(new MouseEvent('click', { bubbles: true }))
           const isMovieActive = () =>
             Array.from(document.querySelectorAll('.nav-item')).some(
               (el) =>
                 el.classList.contains('active') &&
                 (el.querySelector('.nav-name')?.textContent ?? '').trim() === '电影'
             )
           const deadline2 = Date.now() + 6000
           while (Date.now() < deadline2) {
             if (isMovieActive() && document.querySelectorAll('.grid .tile').length > 0) break
             await new Promise((r) => setTimeout(r, 150))
           }
           out.movieViewActive = isMovieActive()
           const movieTile = document.querySelector('.grid .tile')
           if (movieTile) movieTile.dispatchEvent(new MouseEvent('click', { bubbles: true }))
           const deadline3 = Date.now() + 4000
           while (Date.now() < deadline3) {
             if (document.querySelector('.drawer')) break
             await new Promise((r) => setTimeout(r, 120))
           }
           const workDrawer = document.querySelector('.drawer')
           if (workDrawer) {
             out.workDrawerRows = Array.from(workDrawer.querySelectorAll('.info-row')).map((row) => {
               const key = row.querySelector('.info-key')?.textContent ?? ''
               const value = row.querySelector('.info-val')?.textContent ?? ''
               return key + '=' + value
             })
             out.workDrawerSections = Array.from(workDrawer.querySelectorAll('.drawer-section-title')).map(
               (el) => el.textContent
             )
           }
         }
         const moreBtn = Array.from(document.querySelectorAll('.topbar-tools .tool-btn')).find((el) =>
           (el.textContent ?? '').includes('更多')
         )
         if (moreBtn) {
           moreBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
           await new Promise((r) => setTimeout(r, 300))
           out.moreItems = Array.from(document.querySelectorAll('.ctx-item')).map((el) => (el.textContent ?? '').trim())
           window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
         }
         return out
       })()`,
      true
    )
    .catch((err: Error) => ({ probeError: err.message }))
  report.interactProbe = interactProbe

  // API Key「只写不读」自检：写进去、读回来必须是空，只有 hasKey 变化
  const keyProbe = await renderer.webContents
    .executeJavaScript(
      `(async () => {
         const before = await window.toolbox.getConfig()
         await window.toolbox.metaSetKey('smoke-key-not-a-real-secret-000000')
         const after = await window.toolbox.getConfig()
         const cleared = await window.toolbox.metaClearKey()
         const finalConfig = await window.toolbox.getConfig()
         return {
           beforeHasKey: before.metadata.tmdbKeySet === true,
           beforeValueLeaked: before.metadata.tmdbApiKey !== '',
           afterHasKey: after.metadata.tmdbKeySet === true,
           afterValueLeaked: after.metadata.tmdbApiKey !== '',
           clearedHasKey: cleared.hasKey,
           finalHasKey: finalConfig.metadata.tmdbKeySet === true,
           finalValueLeaked: finalConfig.metadata.tmdbApiKey !== ''
         }
       })()`,
      true
    )
    .catch((err: Error) => ({ probeError: err.message }))
  report.apiKeyProbe = keyProbe
  report.apiKeyInMainAfterProbe = configStore.all().metadata.tmdbApiKey.length > 0

  renderer.destroy()

  const text = `\n===== TOOLBOX_SMOKE =====\n${JSON.stringify(report, null, 2)}\n===== END =====\n