import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { ContextMenuType, EntityContextPayload } from "../../types";
import ContextMenu from "./ContextMenu";
import { useFileActions } from "../../hooks/useFileActions";
import InputModal from "../InputModal";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useClipboard } from "../../hooks/useClipboard";
import { selectClipboardEntity } from "../../store/slices/clipboardSlice";

const ContextMenuManager = () => {
  const { type, position, payload } = useAppSelector(
    (state) => state.contextMenu
  );
  const clipboardEntity = useAppSelector(selectClipboardEntity);
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const { hideContextMenu } = useContextMenu();

  const {
    handleCreateFile,
    handleCreateDirectory,
    handleDeleteDirectory,
    handleDeleteFile,
    handlePaste,
  } = useFileActions();

  const { copyToClipboard, cutToClipboard } = useClipboard();

  const getMenuItems = () => {
    switch (type) {
      case ContextMenuType.Main:
        return [
          {
            label: "New File",
            action: () => setShowCreateFile(true),
            icon: "📄",
          },
          {
            label: "New Folder",
            action: () => setShowCreateFolder(true),
            icon: "📁",
          },
          {
            label: "Paste",
            action: () => {
              handlePaste();
              hideContextMenu();
            },
            icon: "📋",
            disabled: !clipboardEntity,
          },
        ];
      case ContextMenuType.FileEntity:
        const fileEntity = payload as EntityContextPayload;
        return [
          {
            label: "Copy",
            action: () => {
              copyToClipboard(fileEntity);
              hideContextMenu();
            },
            icon: "📋",
          },
          {
            label: "Cut",
            action: () => {
              cutToClipboard(fileEntity);
              hideContextMenu();
            },
            icon: "✂️",
          },
          {
            label: "Delete",
            action: () => handleDeleteFile(fileEntity),
            icon: "🗑️",
            danger: true,
          },
        ];
      case ContextMenuType.DirectoryEntity:
        const directoryEntity = payload as EntityContextPayload;
        return [
          {
            label: "Copy",
            action: () => {
              copyToClipboard(directoryEntity);
              hideContextMenu();
            },
            icon: "📋",
          },
          {
            label: "Cut",
            action: () => {
              cutToClipboard(directoryEntity);
              hideContextMenu();
            },
            icon: "✂️",
          },
          {
            label: "Delete",
            action: () => handleDeleteDirectory(directoryEntity),
            icon: "🗑️",
            danger: true,
          },
        ];
      default:
        return [];
    }
  };

  if (type === ContextMenuType.None) return null;

  return (
    <>
      <ContextMenu
        items={getMenuItems()}
        position={position}
        onClose={hideContextMenu}
      />

      <InputModal
        visible={showCreateFile}
        onClose={() => setShowCreateFile(false)}
        onSubmit={(name) => {
          handleCreateFile(name);
          hideContextMenu();
        }}
        title="Create New File"
      />

      <InputModal
        visible={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSubmit={(name) => {
          handleCreateDirectory(name);
          hideContextMenu();
        }}
        title="Create New Folder"
      />
    </>
  );
};

export default ContextMenuManager;
