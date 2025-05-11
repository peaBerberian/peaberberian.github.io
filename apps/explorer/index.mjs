export function create(_args, env, _abortSignal) {
  const { filesystem } = env;
  const { applyStyle, strHtml } = env.appUtils;

  class FileExplorer {
    constructor(container, fs, options = {}) {
      this.container = container;
      this.fs = fs;
      this.currentPath = "/";
      this.history = ["/"];
      this.historyIndex = 0;
      this.selectedItems = new Set();
      this.clipboardItems = [];
      this.clipboardOperation = null; // 'copy' or 'cut'
      this.viewMode = options.viewMode || "grid"; // 'grid' or 'list'
      this.sortBy = options.sortBy || "name"; // 'name', 'type', 'size', 'date'
      this.sortDirection = options.sortDirection || "asc"; // 'asc' or 'desc'
      this.showHidden = options.showHidden || false;
      this.isSearching = false;
      this.searchResults = [];

      this.container.innerHTML = "";
      applyStyle(this.container, {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      });

      this.toolbar = document.createElement("div");
      applyStyle(this.toolbar, {
        padding: "10px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid var(--window-line-color)",
        backgroundColor: "var(--window-sidebar-bg)",
      });

      // const navGroup = document.createElement("div");
      // applyStyle(navGroup, {
      //   display: "flex",
      //   marginRight: "15px",
      // });

      this.backBtn = createButton("←", "Go back");
      this.forwardBtn = createButton("→", "Go forward");
      this.upBtn = createButton("↑", "Go up one directory");
      this.refreshBtn = createButton("⟳", "Refresh");
      //
      // navGroup.appendChild(this.backBtn);
      // navGroup.appendChild(this.forwardBtn);
      // navGroup.appendChild(this.upBtn);
      // navGroup.appendChild(this.refreshBtn);

      this.pathBar = document.createElement("div");
      applyStyle(this.pathBar, {
        flex: "1",
        // marginRight: "15px",
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--window-content-bg)",
        borderRadius: "4px",
        padding: "5px 10px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflowX: "auto",
        whiteSpace: "nowrap",
      });

      this.searchBar = document.createElement("input");
      // this.searchBar.type = "text";
      // this.searchBar.placeholder = "Search files...";
      // this.searchBar.style.padding = "5px 10px";
      // this.searchBar.style.marginRight = "15px";
      // this.searchBar.style.borderRadius = "4px";
      // this.searchBar.style.border = "1px solid #ddd";

      // const viewControls = document.createElement("div");
      // this.gridViewBtn = document.createElement("button");
      // this.gridViewBtn.innerHTML = "⊞";
      // this.gridViewBtn.title = "Grid view";
      // this.gridViewBtn.style.margin = "0 5px";
      //
      // this.listViewBtn = document.createElement("button");
      // this.listViewBtn.innerHTML = "≡";
      // this.listViewBtn.title = "List view";
      // this.listViewBtn.style.margin = "0 5px";
      //
      // viewControls.appendChild(this.gridViewBtn);
      // viewControls.appendChild(this.listViewBtn);

      // this.toolbar.appendChild(navGroup);
      this.toolbar.appendChild(this.pathBar);
      // this.toolbar.appendChild(this.searchBar);
      // this.toolbar.appendChild(viewControls);

      this.actionsToolbar = document.createElement("div");
      applyStyle(this.actionsToolbar, {
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid var(--window-line-color)",
        backgroundColor: "var(--window-sidebar-bg)",
      });

      this.newDirectoryBtn = createButton("New Folder", "Create new folder");
      this.uploadBtn = createButton("Upload", "Upload files");
      this.downloadBtn = createButton("Download", "Download selected");
      this.deleteBtn = createButton("Delete", "Delete selected");
      this.copyBtn = createButton("Copy", "Copy selected");
      this.cutBtn = createButton("Cut", "Cut selected");
      this.pasteBtn = createButton("Paste", "Paste items");

      this.actionsToolbar.appendChild(this.newDirectoryBtn);
      this.actionsToolbar.appendChild(this.uploadBtn);
      this.actionsToolbar.appendChild(this.downloadBtn);
      this.actionsToolbar.appendChild(this.deleteBtn);
      this.actionsToolbar.appendChild(this.copyBtn);
      this.actionsToolbar.appendChild(this.cutBtn);
      this.actionsToolbar.appendChild(this.pasteBtn);

      this.contentArea = document.createElement("div");
      applyStyle(this.contentArea, {
        flex: "1",
        overflow: "auto",
        padding: "15px",
        position: "relative",
      });

      this.statusBar = document.createElement("div");
      applyStyle(this.statusBar, {
        padding: "5px 15px",
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#f5f5f5",
        fontSize: "12px",
      });
      this.statusBar.textContent = "Ready";

      this.overlay = document.createElement("div");
      applyStyle(this.overlay, {
        // position: "absolute",
        // top: "0",
        // left: "0",
        // right: "0",
        // bottom: "0",
        // backgroundColor: "rgba(255,255,255,0.8)",
        // display: "none",
        // justifyContent: "center",
        // alignItems: "center",
        // zIndex: "2",
      });

      this.overlayContent = document.createElement("div");
      applyStyle(this.overlayContent, {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      });
      this.overlay.appendChild(this.overlayContent);

      this.container.appendChild(this.toolbar);
      this.container.appendChild(this.actionsToolbar);
      this.container.appendChild(this.contentArea);
      this.container.appendChild(this.statusBar);
      this.contentArea.appendChild(this.overlay);

      this.backBtn.addEventListener("click", () => this.navigateBack());
      this.forwardBtn.addEventListener("click", () => this.navigateForward());
      this.upBtn.addEventListener("click", () => this.navigateUp());
      this.refreshBtn.addEventListener("click", () => this.refresh());

      // this.gridViewBtn.addEventListener("click", () => this.setViewMode("grid"));
      // this.listViewBtn.addEventListener("click", () => this.setViewMode("list"));

      // Actions
      this.newDirectoryBtn.addEventListener("click", () =>
        this.createDirectory(),
      );
      this.uploadBtn.addEventListener("click", () => this.uploadFiles());
      this.downloadBtn.addEventListener("click", () => this.downloadSelected());
      this.deleteBtn.addEventListener("click", () => this.deleteSelected());
      this.copyBtn.addEventListener("click", () => this.copySelected());
      this.cutBtn.addEventListener("click", () => this.cutSelected());
      this.pasteBtn.addEventListener("click", () => this.paste());

      // Search
      this.searchBar.addEventListener("input", () => this.handleSearch());
      this.searchBar.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.searchBar.value = "";
          this.isSearching = false;
          this.refresh();
        }
        if (e.key === "Enter") {
          this.handleSearch();
        }
      });
      this.refresh();
    }

    async refresh() {
      try {
        updatePathBarElement(this.pathBar, this.currentPath, (path) => {
          this.navigateTo(path);
        });
        this.updateButtonStates();
        await this.loadCurrentDirectory();
      } catch (error) {
        showError(this.container, `Error refreshing: ${error.message}`);
      }
    }

    updateButtonStates() {
      // Navigation buttons
      this.backBtn.disabled = this.historyIndex <= 0;
      this.forwardBtn.disabled = this.historyIndex >= this.history.length - 1;
      this.upBtn.disabled = this.currentPath === "/";

      // Action buttons
      const hasSelection = this.selectedItems.size > 0;
      this.downloadBtn.disabled = !hasSelection;
      this.deleteBtn.disabled = !hasSelection;
      this.copyBtn.disabled = !hasSelection;
      this.cutBtn.disabled = !hasSelection;
      this.pasteBtn.disabled = !(this.clipboardItems.length > 0);

      // Update styles based on disabled state
      [
        this.backBtn,
        this.forwardBtn,
        this.upBtn,
        this.downloadBtn,
        this.deleteBtn,
        this.copyBtn,
        this.cutBtn,
        this.pasteBtn,
      ].forEach((btn) => {
        if (btn.disabled) {
          btn.style.opacity = "0.5";
          btn.style.cursor = "not-allowed";
        } else {
          btn.style.opacity = "1";
          btn.style.cursor = "pointer";
        }
      });

      // this.gridViewBtn.style.backgroundColor =
      //   this.viewMode === "grid" ? "#ddd" : "#f0f0f0";
      // this.listViewBtn.style.backgroundColor =
      //   this.viewMode === "list" ? "#ddd" : "#f0f0f0";
    }

    async loadCurrentDirectory() {
      try {
        showLoading(this.overlay);

        let items;
        if (this.isSearching) {
          items = this.searchResults;
        } else {
          const dirContents = await this.fs.readDir(this.currentPath);
          items = dirContents.map((item) => {
            const path = pathJoin(this.currentPath, item.name);
            return {
              name: item.name,
              icon: item.icon,
              path,
              isDirectory: item.type === "directory",
              // TODO:
              size: 0,
              mtime: item.modified && new Date(item.modified),
              extension: getFileExtension(item.name),
            };
          });

          // Filter hidden files if needed
          if (!this.showHidden) {
            items = items.filter((item) => !item.name.startsWith("."));
          }
        }

        // Sort items
        items = sortItems(items, this.sortBy, this.sortDirection);

        // Update the view
        this.renderItems(items);
        this.updateStatusBar(items);
        hideLoading(this.overlay);
      } catch (err) {
        hideLoading(this.overlay);
        showError(this.container, `Error loading directory: ${err.message}`);
      }
    }

    renderItems(items) {
      this.contentArea.innerHTML = "";

      if (items.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.style.padding = "30px";
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.color = "#666";

        if (this.isSearching) {
          emptyMessage.textContent = "No search results found.";
        } else {
          emptyMessage.textContent = "This folder is empty.";
        }

        this.contentArea.appendChild(emptyMessage);
        return;
      }

      // Create the container based on view mode
      const container = document.createElement("div");

      if (this.viewMode === "grid") {
        container.style.display = "grid";
        container.style.gridTemplateColumns =
          "repeat(auto-fill, minmax(120px, 1fr))";
        container.style.gap = "15px";
        container.style.padding = "10px";
      } else {
        container.style.display = "table";
        container.style.width = "100%";
        container.style.borderCollapse = "collapse";

        // Add header row for list view
        const headerRow = document.createElement("div");
        headerRow.style.display = "table-row";
        headerRow.style.backgroundColor = "#f5f5f5";
        headerRow.style.fontWeight = "bold";

        const headers = ["Name", "Size", "Type", "Modified"];
        headers.forEach((header) => {
          const headerCell = document.createElement("div");
          headerCell.textContent = header;
          headerCell.style.display = "table-cell";
          headerCell.style.padding = "8px 10px";
          headerCell.style.borderBottom = "1px solid #ddd";
          headerCell.dataset.sort = header.toLowerCase();
          headerCell.style.cursor = "pointer";

          // Highlight current sort
          if (this.sortBy === headerCell.dataset.sort) {
            headerCell.style.backgroundColor = "#e0e0e0";
            headerCell.textContent +=
              this.sortDirection === "asc" ? " ↑" : " ↓";
          }

          // Add sort event
          headerCell.addEventListener("click", () => {
            if (this.sortBy === headerCell.dataset.sort) {
              this.sortDirection =
                this.sortDirection === "asc" ? "desc" : "asc";
            } else {
              this.sortBy = headerCell.dataset.sort;
              this.sortDirection = "asc";
            }
            this.refresh();
          });

          headerRow.appendChild(headerCell);
        });

        container.appendChild(headerRow);
      }

      // Render each item
      items.forEach((item) => {
        let itemElement;

        if (this.viewMode === "grid") {
          // Grid item
          itemElement = document.createElement("div");
          itemElement.className = "file-item";
          itemElement.dataset.path = item.path;
          itemElement.dataset.name = item.name;
          itemElement.dataset.type = item.isDirectory ? "directory" : "file";

          // Apply styles
          itemElement.style.display = "flex";
          itemElement.style.flexDirection = "column";
          itemElement.style.alignItems = "center";
          itemElement.style.padding = "10px";
          itemElement.style.borderRadius = "4px";
          itemElement.style.cursor = "pointer";
          itemElement.style.transition = "background-color 0.2s";

          // Icon
          const icon = document.createElement("div");
          icon.innerHTML = item.isDirectory ? "📁" : getFileIcon(item);
          icon.style.fontSize = "36px";
          icon.style.marginBottom = "5px";

          // Label
          const label = document.createElement("div");
          label.textContent = item.name;
          label.style.fontSize = "13px";
          label.style.textAlign = "center";
          label.style.wordBreak = "break-word";
          label.style.overflow = "hidden";
          label.style.textOverflow = "ellipsis";
          label.style.width = "100%";

          itemElement.appendChild(icon);
          itemElement.appendChild(label);
        } else {
          // List item
          itemElement = document.createElement("div");
          itemElement.className = "file-item";
          itemElement.dataset.path = item.path;
          itemElement.dataset.name = item.name;
          itemElement.dataset.type = item.isDirectory ? "directory" : "file";

          // Apply styles
          itemElement.style.display = "table-row";
          itemElement.style.cursor = "pointer";
          itemElement.style.transition = "background-color 0.2s";

          // Name cell with icon
          const nameCell = document.createElement("div");
          nameCell.style.display = "table-cell";
          nameCell.style.padding = "8px 10px";
          nameCell.style.borderBottom = "1px solid #ddd";
          nameCell.style.whiteSpace = "nowrap";

          const icon = document.createElement("span");
          icon.innerHTML = item.isDirectory ? "📁 " : getFileIcon(item) + " ";

          const name = document.createElement("span");
          name.textContent = item.name;

          nameCell.appendChild(icon);
          nameCell.appendChild(name);

          // Size cell
          const sizeCell = document.createElement("div");
          sizeCell.style.display = "table-cell";
          sizeCell.style.padding = "8px 10px";
          sizeCell.style.borderBottom = "1px solid #ddd";
          sizeCell.textContent = item.isDirectory
            ? "--"
            : formatSize(item.size);

          // Type cell
          const typeCell = document.createElement("div");
          typeCell.style.display = "table-cell";
          typeCell.style.padding = "8px 10px";
          typeCell.style.borderBottom = "1px solid #ddd";
          typeCell.textContent = getItemType(item) || "File";

          // Modified date cell
          const dateCell = document.createElement("div");
          dateCell.style.display = "table-cell";
          dateCell.style.padding = "8px 10px";
          dateCell.style.borderBottom = "1px solid #ddd";
          dateCell.textContent = item.mtime?.toLocaleString() ?? "Unknown";

          itemElement.appendChild(nameCell);
          itemElement.appendChild(sizeCell);
          itemElement.appendChild(typeCell);
          itemElement.appendChild(dateCell);
        }

        // Item selection and action events
        itemElement.addEventListener("click", (e) => {
          if (e.ctrlKey) {
            this.toggleItemSelection(item);
          } else if (e.shiftKey && this.lastSelectedItem) {
            this.selectItemRange(this.lastSelectedItem, item);
          } else {
            this.clearSelection();
            this.selectItem(item);
            this.lastSelectedItem = item;

            // Double-click to open
            if (
              this.lastClickedItem === item.path &&
              Date.now() - this.lastClickTime < 500
            ) {
              if (item.isDirectory) {
                this.navigateTo(item.path);
              } else {
                this.openFile(item);
              }
            }
          }

          this.lastClickedItem = item.path;
          this.lastClickTime = Date.now();
        });

        // Check if this item is selected
        if (this.selectedItems.has(item.path)) {
          if (this.viewMode === "grid") {
            itemElement.style.backgroundColor = "#e3f2fd";
            itemElement.style.outline = "2px solid #2196f3";
          } else {
            itemElement.style.backgroundColor = "#e3f2fd";
          }
        }

        container.appendChild(itemElement);
      });

      this.contentArea.appendChild(container);
      this.contentArea.appendChild(this.overlay);
    }

    updateStatusBar(items) {
      if (!items) return;

      const totalItems = items.length;
      const dirs = items.filter((item) => item.isDirectory).length;
      const files = totalItems - dirs;

      let status = `${totalItems} items`;
      if (dirs > 0 && files > 0) {
        status = `${dirs} folder${dirs !== 1 ? "s" : ""}, ${files} file${files !== 1 ? "s" : ""}`;
      } else if (dirs > 0) {
        status = `${dirs} folder${dirs !== 1 ? "s" : ""}`;
      } else if (files > 0) {
        status = `${files} file${files !== 1 ? "s" : ""}`;
      }

      // Add selected count
      if (this.selectedItems.size > 0) {
        status = `${this.selectedItems.size} selected - ${status}`;
      }

      this.statusBar.textContent = status;
    }

    selectItem(item) {
      this.selectedItems.add(item.path);
      this.lastSelectedItem = item;
      this.updateButtonStates();
      this.refresh();
    }

    toggleItemSelection(item) {
      if (this.selectedItems.has(item.path)) {
        this.selectedItems.delete(item.path);
      } else {
        this.selectedItems.add(item.path);
        this.lastSelectedItem = item;
      }
      this.updateButtonStates();
      this.refresh();
    }

    selectItemRange(fromItem, toItem) {
      // Get all items in the current view
      const allItems = Array.from(
        this.contentArea.getElementsByClassName("file-item"),
      ).map((el) => ({
        path: el.dataset.path,
        name: el.dataset.name,
        isDirectory: el.dataset.type === "directory",
      }));

      // Find indices of the fromItem and toItem
      const fromIndex = allItems.findIndex(
        (item) => item.path === fromItem.path,
      );
      const toIndex = allItems.findIndex((item) => item.path === toItem.path);

      if (fromIndex !== -1 && toIndex !== -1) {
        // Determine range start and end
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);

        // Select all items in the range
        for (let i = start; i <= end; i++) {
          this.selectedItems.add(allItems[i].path);
        }

        this.updateButtonStates();
        this.refresh();
      }
    }

    selectAll() {
      const allItems = Array.from(
        this.contentArea.getElementsByClassName("file-item"),
      );
      allItems.forEach((item) => {
        this.selectedItems.add(item.dataset.path);
      });
      this.updateButtonStates();
      this.refresh();
    }

    clearSelection() {
      this.selectedItems.clear();
      this.lastSelectedItem = null;
      this.updateButtonStates();
      this.refresh();
    }

    navigateTo(path) {
      if (path === this.currentPath) {
        return;
      }

      // Add to history if we're not just using back/forward
      if (this.historyIndex === this.history.length - 1) {
        this.history.push(path);
        this.historyIndex = this.history.length - 1;
      } else {
        // Replace everything forward from current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(path);
        this.historyIndex = this.history.length - 1;
      }

      this.currentPath = path;
      this.clearSelection();
      this.isSearching = false;
      this.searchBar.value = "";
      this.refresh();
    }

    navigateBack() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.currentPath = this.history[this.historyIndex];
        this.clearSelection();
        this.isSearching = false;
        this.refresh();
      }
    }

    navigateForward() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.currentPath = this.history[this.historyIndex];
        this.clearSelection();
        this.isSearching = false;
        this.refresh();
      }
    }

    navigateUp() {
      if (this.currentPath === "/") {
        return;
      }
      const parentPath = this.currentPath.substring(
        0,
        this.currentPath.lastIndexOf("/"),
      );
      this.navigateTo(parentPath || "/");
    }

    setViewMode(mode) {
      if (mode === this.viewMode) return;

      this.viewMode = mode;
      this.refresh();
    }

    async handleSearch() {
      const query = this.searchBar.value.trim();

      if (!query) {
        this.isSearching = false;
        this.refresh();
        return;
      }

      showLoading(this.overlay, "Searching...");

      try {
        // In a real implementation, you might want to use a more sophisticated search
        // This is a simple implementation that searches the current directory recursively
        this.searchResults = await this.searchFiles(this.currentPath, query);
        this.isSearching = true;
        this.refresh();
      } catch (error) {
        showError(this.container, `Search error: ${error.message}`);
      } finally {
        hideLoading(this.overlay);
      }
    }

    async searchFiles(directory, query) {
      query = query.toLowerCase();
      let results = [];

      try {
        const items = await this.fs.readDir(directory);

        for (const item of items) {
          if (!this.showHidden && item.name.startsWith(".")) continue;
          const path = pathJoin(directory, item.name);
          if (item.name.toLowerCase().includes(query)) {
            results.push({
              name: item.name,
              icon: item.icon,
              path,
              isDirectory: item.type === "directory",
              // TODO:
              size: item.size ?? 0,
              mtime: item.modified && new Date(item.modified),
              extension: getFileExtension(item.name),
            });
          }

          // Recursively search directories
          if (item.type === "directory") {
            const subResults = await this.searchFiles(path, query);
            results = results.concat(subResults);
          }
        }
      } catch (error) {
        console.error(`Error searching directory ${directory}:`, error);
      }

      return results;
    }

    async createDirectory() {
      const dirName = await askForUserInput(
        this.overlay,
        "Create New Folder",
        "Enter folder name:",
      );

      if (!dirName) {
        return;
      }

      try {
        const newDirPath = pathJoin(this.currentPath, dirName);
        await this.fs.mkdir(newDirPath);
        this.refresh();
        showAppMessage(
          this.container,
          `Folder "${dirName}" created successfully`,
        );
      } catch (error) {
        showError(this.container, `Failed to create folder: ${error.message}`);
      }
    }

    async uploadFiles() {
      const fileName = await askForUserInput(
        this.overlay,
        "Upload File",
        "Enter file name:",
      );
      if (!fileName) {
        return;
      }

      const content = await askForUserInput(
        this.overlay,
        "Upload File",
        "Enter file content:",
      );
      if (content === null) {
        return;
      }

      try {
        const filePath = pathJoin(this.currentPath, fileName);
        await this.fs.writeFile(filePath, content);
        this.refresh();
        showAppMessage(
          this.container,
          `File "${fileName}" uploaded successfully`,
        );
      } catch (error) {
        showError(this.container, `Failed to upload file: ${error.message}`);
      }
    }

    async downloadSelected() {
      if (this.selectedItems.size === 0) {
        return;
      }

      // In a real application, this would trigger actual downloads
      // For now, we'll just show the contents of the selected files

      try {
        for (const path of this.selectedItems) {
          // XXX TODO:
          const stats = await this.fs.stat(path);

          if (!stats.isDirectory()) {
            const content = await this.fs.readFile(path, { encoding: "utf8" });
            console.log(`Content of ${path}:`, content);
            showAppMessage(
              this.container,
              `File "${path.split("/").pop()}" downloaded`,
            );
          } else {
            showAppMessage(
              this.container,
              `Folders cannot be downloaded directly`,
            );
          }
        }
      } catch (error) {
        showError(this.container, `Failed to download: ${error.message}`);
      }
    }

    async deleteSelected() {
      if (this.selectedItems.size === 0) {
        return;
      }

      const itemCount = this.selectedItems.size;
      let confirmationMsg;
      if (itemCount > 1) {
        confirmationMsg = `Are you sure you want to delete ${itemCount} items?`;
      } else {
        confirmationMsg = `Are you sure you want to delete this?`;
      }
      if (
        !(await createConfirmationDialog(
          this.overlay,
          "Delete",
          confirmationMsg,
        ))
      ) {
        return;
      }

      showLoading(this.overlay, "Deleting...");

      try {
        await Promise.all(
          Array.from(this.selectedItems).map((path) => this.fs.rm(path)),
        );

        showAppMessage(
          this.container,
          `${itemCount} item${itemCount !== 1 ? "s" : ""} deleted successfully`,
        );
        this.selectedItems.clear();
        this.refresh();
      } catch (error) {
        showError(this.container, `Failed to delete: ${error.message}`);
      } finally {
        hideLoading(this.overlay);
      }
    }

    async deleteDirectory(dirPath) {
      await this.fs.rm(dirPath);
    }

    copySelected() {
      if (this.selectedItems.size === 0) {
        return;
      }

      this.clipboardItems = Array.from(this.selectedItems);
      this.clipboardOperation = "copy";
      this.updateButtonStates();

      const count = this.clipboardItems.length;
      showAppMessage(
        this.container,
        `${count} item${count !== 1 ? "s" : ""} copied to clipboard`,
      );
    }

    cutSelected() {
      if (this.selectedItems.size === 0) {
        return;
      }

      this.clipboardItems = Array.from(this.selectedItems);
      this.clipboardOperation = "cut";
      this.updateButtonStates();

      const count = this.clipboardItems.length;
      showAppMessage(
        this.container,
        `${count} item${count !== 1 ? "s" : ""} cut to clipboard`,
      );
    }

    async paste() {
      if (this.clipboardItems.length === 0) {
        return;
      }

      showLoading(
        this.overlay,
        this.clipboardOperation === "copy" ? "Copying..." : "Moving...",
      );

      try {
        for (const sourcePath of this.clipboardItems) {
          const fileName = sourcePath.split("/").pop();
          const destPath = pathJoin(this.currentPath, fileName);

          if (sourcePath === destPath) {
            continue;
          }

          // XXX TODO:
          const stats = await this.fs.stat(sourcePath);

          if (stats.isDirectory()) {
            if (this.clipboardOperation === "copy") {
              await this.copyDirectory(sourcePath, destPath);
            } else {
              await this.fs.mv(sourcePath, destPath);
            }
          } else {
            if (this.clipboardOperation === "copy") {
              const content = await this.fs.readFile(sourcePath);
              await this.fs.writeFile(destPath, content);
            } else {
              await this.fs.mv(sourcePath, destPath);
            }
          }
        }

        // Clear clipboard if it was a cut operation
        if (this.clipboardOperation === "cut") {
          this.clipboardItems = [];
          this.clipboardOperation = null;
        }

        this.refresh();
        showAppMessage(this.container, "Paste completed successfully");
      } catch (error) {
        showError(this.container, `Failed to paste: ${error.message}`);
      } finally {
        hideLoading(this.overlay);
      }
    }

    async copyDirectory(source, destination) {
      await this.fs.mkdir(destination);

      const items = await this.fs.readDir(source);

      for (const item of items) {
        const sourcePath = pathJoin(source, item);
        const destPath = pathJoin(destination, item);
        // XXX TODO:
        const stats = await this.fs.stat(sourcePath);

        if (stats.isDirectory()) {
          await this.copyDirectory(sourcePath, destPath);
        } else {
          const content = await this.fs.readFile(sourcePath);
          await this.fs.writeFile(destPath, content);
        }
      }
    }

    async openFile(item) {
      try {
        // In a real application, this might open the file in an appropriate viewer
        const content = await this.fs.readFile(item.path, { encoding: "utf8" });
        showDialog(this.overlay, "File Contents", content);
      } catch (error) {
        showError(this.container, `Failed to open file: ${error.message}`);
      }
    }

    async renameItem(item) {
      const newName = await askForUserInput(
        this.overlay,
        "Rename",
        "Enter new name:",
        item.name,
      );

      if (!newName || newName === item.name) return;

      try {
        const newPath = pathJoin(this.currentPath, newName);
        await this.fs.mv(item.path, newPath);

        // Update selection if needed
        if (this.selectedItems.has(item.path)) {
          this.selectedItems.delete(item.path);
          this.selectedItems.add(newPath);
        }

        this.refresh();
        showAppMessage(this.container, `Renamed successfully to "${newName}"`);
      } catch (error) {
        showError(this.container, `Failed to rename: ${error.message}`);
      }
    }
  }

  const container = document.createElement("div");
  applyStyle(container, {
    height: "100%",
    width: "100%",
    backgroundColor: "var(--window-content-bg)",
  });
  new FileExplorer(container, filesystem, {
    viewMode: "grid", // 'grid' or 'list'
    sortBy: "name", // 'name', 'size', 'type', or 'date'
    sortDirection: "asc",
    showHidden: false, // whether to show hidden files
  });
  return { element: container };

  function createButton(text, title) {
    const button = document.createElement("button");
    button.textContent = text;
    button.title = title || text;
    button.style.margin = "0 2px";
    button.style.padding = "5px 10px";
    button.style.backgroundColor = "#f0f0f0";
    button.style.border = "1px solid #ccc";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#e0e0e0";
    });
    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#f0f0f0";
    });
    return button;
  }

  function getFileExtension(filename) {
    const dotIndex = filename.lastIndexOf(".");
    return dotIndex === -1 ? "" : filename.slice(dotIndex + 1).toLowerCase();
  }

  function getFileIcon({ extension, icon }) {
    if (icon) {
      return icon;
    }
    const iconMap = {
      txt: "📄",
      md: "📝",
      html: "🌐",
      css: "🎨",
      js: "📜",
      json: "📋",
      pdf: "📑",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      svg: "🖼️",
      mp3: "🎵",
      mp4: "🎬",
      zip: "📦",
      tar: "📦",
      gz: "📦",
      doc: "📘",
      docx: "📘",
      xls: "📊",
      xlsx: "📊",
      ppt: "📊",
      pptx: "📊",
    };
    return iconMap[extension] || "📄";
  }

  function getItemType(item) {
    if (item.isDirectory) {
      return "Folder";
    }
    return getFileTypeFromExt(item.extension);
  }

  function getFileTypeFromExt(extension) {
    const typeMap = {
      css: "CSS Stylesheet",
      csv: "CSV Spreadsheet",
      gif: "GIF Image",
      gz: "Gzipped Archive",
      html: "HTML Document",
      jpeg: "JPEG Image",
      jpg: "JPEG Image",
      js: "JavaScript File",
      json: "JSON File",
      md: "Markdown Document",
      mp3: "MP3 Audio",
      mp4: "MP4 Video",
      pdf: "PDF Document",
      png: "PNG Image",
      svg: "SVG Image",
      tar: "TAR Archive",
      txt: "Text Document",
      zip: "ZIP Archive",
    };

    return typeMap[extension] || "File";
  }

  function formatSize(size) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;

    while (size >= 1000 && i < units.length - 1) {
      size /= 1000;
      i++;
    }

    return Math.round(size * 100) / 100 + " " + units[i];
  }

  function sortItems(items, sortBy, sortDirection) {
    // Always put directories first
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) {
        return -1;
      }
      if (!a.isDirectory && b.isDirectory) {
        return 1;
      }

      // Then sort by the selected criteria
      switch (sortBy) {
        case "name":
          return sortDirection === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "size":
          return sortDirection === "asc" ? a.size - b.size : b.size - a.size;
        case "type":
          const typeA = getItemType(a);
          const typeB = getItemType(b);
          return sortDirection === "asc"
            ? typeA.localeCompare(typeB)
            : typeB.localeCompare(typeA);
        case "modified":
          return sortDirection === "asc"
            ? (a?.mtime ?? 0) - (b?.mtime ?? 0)
            : (b?.mtime ?? 0) - (a?.mtime ?? 0);
        default:
          return 0;
      }
    });

    return items;
  }

  function pathJoin(base, name) {
    if (base.endsWith("/")) {
      return base + name;
    }
    return base + "/" + name;
  }

  function showDialog(containerElt, title, content) {
    containerElt.innerHTML = "";
    containerElt.style.display = "flex";
    const closeButton = strHtml`<button>Close</button>`;
    const dialogElt = strHtml`
      <div>
        <h3 style="margin-top: 0; margin-bottom: 15px;">${title}</h3>
        <div style="margin-bottom: 15px;">${content}</div>
        <div style="display: flex; justify-content: flex-end;">
          ${closeButton}
        </div>
      </div>
    `;
    applyStyle(dialogElt, {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    });
    closeButton.addEventListener("click", () => {
      // containerElt.style.display = "none";
    });
    containerElt.appendChild(dialogElt);
  }

  function showLoading(containerElt, message = "Loading...") {
    containerElt.style.display = "flex";
    containerElt.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 20px;">⏳</div>
        <div>${message}</div>
      </div>
    `;
  }

  function hideLoading(containerElt) {
    // containerElt.style.display = "none";
  }

  async function createConfirmationDialog(containerElt, title, message) {
    return new Promise((resolve) => {
      containerElt.innerHTML = "";

      const overlay = document.createElement("div");
      applyStyle(overlay, {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "var(--window-content-bg)",
        opacity: "0.8",
        zIndex: "2",
      });
      containerElt.appendChild(overlay);
      const cancelButton = strHtml`<button style="margin-right: 10px;" class="btn">Cancel</button>`;
      const confirmButton = strHtml`<button class="btn">OK</button>`;
      const promptElt = strHtml`
        <div>
          <p >${message}</p>
          <div style="display: flex; justify-content: center;">
						${cancelButton}
						${confirmButton}
          </div>
        </div>
      `;
      applyStyle(promptElt, {
        backgroundColor: "var(--window-content-bg)",
        padding: "15px",
        borderRadius: "10px",
        border: "1px solid var(--window-line-color)",
        zIndex: "3",
        // boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.3)",
      });
      containerElt.appendChild(promptElt);

      confirmButton.addEventListener("click", () => {
        try {
          promptElt.remove();
        } catch (_) {}
        containerElt.innerHTML = "";
        resolve(true);
      });
      cancelButton.addEventListener("click", () => {
        try {
          promptElt.remove();
        } catch (_) {}
        containerElt.innerHTML = "";
        resolve(false);
      });
      overlay.addEventListener("click", () => {
        containerElt.innerHTML = "";
        resolve(false);
      });
    });
  }

  async function askForUserInput(
    containerElt,
    title,
    message,
    defaultValue = "",
  ) {
    return new Promise((resolve) => {
      containerElt.innerHTML = "";
      applyStyle(containerElt, {
        display: "flex",
        // padding: "20px",
        // border: "1px solid var(--window-line-color)",
      });

      const promptInputElt = strHtml`<input type="text" value="${defaultValue}">`;
      applyStyle(promptInputElt, {
        width: "100%",
        padding: "8px",
        marginBottom: "15px",
      });
      const cancelButtonElt = strHtml`<button class="btn">Cancel</button>`;
      applyStyle(cancelButtonElt, {
        marginRight: "10px",
      });
      const okButtonElt = strHtml`<button class="btn">OK</button>`;
      const innerElt = strHtml`
        <div>
          <h3 style="margin-top: 0; margin-bottom: 15px;">${title}</h3>
          <p style="margin-bottom: 15px;">${message}</p>
					${promptInputElt}
          <div style="display: flex; justify-content: flex-end;">
						${cancelButtonElt}
						${okButtonElt}
          </div>
        </div>
      `;
      applyStyle(innerElt, {
        padding: "20px",
        border: "1px solid var(--window-line-color)",
      });
      containerElt.appendChild(innerElt);

      promptInputElt.focus();
      promptInputElt.select();

      okButtonElt.addEventListener("click", onOk);
      cancelButtonElt.addEventListener("click", onCancel);

      promptInputElt.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          onOk();
        }
        if (e.key === "Escape") {
          onCancel();
        }
      });

      function onOk() {
        containerElt.style.display = "none";
        resolve(promptInputElt.value);
      }

      function onCancel() {
        containerElt.style.display = "none";
        resolve(null);
      }
    });
  }

  // XXX TODO: communicate `navigate` function or something?
  function updatePathBarElement(pathBarElt, currentPath, navigateTo) {
    pathBarElt.innerHTML = "";

    // Split the path into segments
    const segments = currentPath.split("/").filter((segment) => segment);

    // Add root segment
    const rootSegment = document.createElement("span");
    rootSegment.textContent = "/";
    rootSegment.onclick = () => {
      navigateTo("/");
    };
    applyStyle(rootSegment, {
      cursor: "pointer",
      padding: "0 5px",
      color: "var(--app-primary-color)",
    });
    pathBarElt.appendChild(rootSegment);

    let iterPath = "";
    segments.forEach((segment, index) => {
      iterPath += "/" + segment;

      const separatorElt = document.createElement("span");
      separatorElt.textContent = ">";
      applyStyle(separatorElt, {
        padding: "0 5px",
      });
      pathBarElt.appendChild(separatorElt);

      const segmentPath = iterPath;
      const segmentElt = document.createElement("span");
      segmentElt.textContent = segment;
      segmentElt.onclick = () => {
        navigateTo(segmentPath);
      };
      applyStyle(segmentElt, {
        cursor: "pointer",
        padding: "0 5px",
        color: "var(--app-primary-color)",
      });

      // Last segment is the current directory
      if (index === segments.length - 1) {
        segmentElt.style.fontWeight = "bold";
      }
      pathBarElt.appendChild(segmentElt);
    });
  }
}

function showError(containerElt, message) {
  showAppMessage(containerElt, "❌ " + message, 5000);
}

function showAppMessage(containerElt, message, duration = 5000) {
  const messageElt = document.createElement("div");
  messageElt.textContent = message;
  messageElt.style.position = "absolute";
  messageElt.style.top = "10px";
  messageElt.style.left = "50%";
  messageElt.style.transform = "translateX(-50%)";
  messageElt.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  messageElt.style.color = "white";
  messageElt.style.padding = "10px 20px";
  messageElt.style.borderRadius = "4px";
  messageElt.style.zIndex = "1000";
  messageElt.style.transition = "opacity 0.3s";

  containerElt.appendChild(messageElt);

  setTimeout(() => {
    messageElt.style.opacity = "0";
    // After animation, remove
    setTimeout(() => {
      messageElt.remove();
    }, 350);
  }, duration);
}
