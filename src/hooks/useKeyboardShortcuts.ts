import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectCurrentPath } from "../store/slices/navigationSlice";
import { goBack, goForward } from "../store/slices/navigationSlice";
import { useFileActions } from "./useFileActions";
import { useContextMenu } from "./useContextMenu";
import { ContextMenuType } from "../types";
import { EntityContextPayload } from "../types";
import { useClipboard } from "./useClipboard";
import { InputModalManager } from "../components/InputModalManager";

export const useKeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const currentPath = useAppSelector(selectCurrentPath);
  const { showContextMenu, hideContextMenu } = useContextMenu();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [selectedEntity, setSelectedEntity] =
    useState<EntityContextPayload | null>(null);

  // Reference to fileActions to avoid circular dependency
  const fileActions = useFileActions();

  // Get clipboard functionality
  const { copyToClipboard, cutToClipboard, pasteFromClipboard } =
    useClipboard();

  // File/folder creation modal states
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Toggle shortcuts help dialog with ? key
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShowShortcutsHelp((prev) => !prev);
        return;
      }

      // Toggle search with Ctrl+K
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setShowSearchBar((prev) => !prev);
        return;
      }

      // Navigation shortcuts
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        dispatch(goBack());
      }

      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        dispatch(goForward());
      }

      // File operation shortcuts (only when in a directory)
      if (currentPath) {
        // New file (Ctrl+N)
        if (e.ctrlKey && e.key === "n" && !e.shiftKey) {
          e.preventDefault();
          setShowCreateFileModal(true);
        }

        // New folder (Ctrl+Shift+N)
        if (e.ctrlKey && e.shiftKey && e.key === "N") {
          e.preventDefault();
          setShowCreateFolderModal(true);
        }

        // Clipboard operations
        if (selectedEntity) {
          // Copy (Ctrl+C)
          if (e.ctrlKey && e.key === "c") {
            e.preventDefault();
            copyToClipboard(selectedEntity);
          }

          // Cut (Ctrl+X)
          if (e.ctrlKey && e.key === "x") {
            e.preventDefault();
            cutToClipboard(selectedEntity);
          }
        }

        // Paste (Ctrl+V)
        if (e.ctrlKey && e.key === "v") {
          e.preventDefault();
          pasteFromClipboard();
        }

        // Context menu (Shift+F10 or context menu key)
        if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
          e.preventDefault();
          // Position in the middle of the screen as a fallback
          showContextMenu(ContextMenuType.Main, {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          });
        }

        // Escape to close context menu and dialogs
        if (e.key === "Escape") {
          hideContextMenu();
          setShowShortcutsHelp(false);
          setShowCreateFileModal(false);
          setShowCreateFolderModal(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPath, dispatch, showShortcutsHelp, selectedEntity]);

  return {
    showShortcutsHelp,
    setShowShortcutsHelp,
    showSearchBar,
    setShowSearchBar,
    setSelectedEntity,
    selectedEntity,
    showCreateFileModal,
    setShowCreateFileModal,
    showCreateFolderModal,
    setShowCreateFolderModal,
  };
};
