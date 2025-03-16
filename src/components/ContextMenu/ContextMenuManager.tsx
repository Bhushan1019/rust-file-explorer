import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { ContextMenuType, EntityContextPayload } from "../../types";
import ContextMenu from "./ContextMenu";
import { useFileActions } from "../../hooks/useFileActions";
import InputModal from "../InputModal";

const ContextMenuManager = () => {
  const { type, position, payload } = useAppSelector(
    (state) => state.contextMenu
  );
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRename, setShowRename] = useState(false);

  const {
    handleCreateFile,
    handleCreateDirectory,
    handleRename,
    handleDelete,
  } = useFileActions();

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
        ];
      case ContextMenuType.FileEntity:
      case ContextMenuType.DirectoryEntity:
        const entity = payload as EntityContextPayload;
        return [
          {
            label: "Rename",
            action: () => setShowRename(true),
            icon: "✏️",
          },
          {
            label: "Delete",
            action: () => handleDelete(entity),
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
        onClose={() => {}}
      />

      <InputModal
        visible={showCreateFile}
        onClose={() => setShowCreateFile(false)}
        onSubmit={handleCreateFile}
        title="Create New File"
      />

      <InputModal
        visible={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSubmit={handleCreateDirectory}
        title="Create New Folder"
      />

      <InputModal
        visible={showRename}
        onClose={() => setShowRename(false)}
        onSubmit={(newName: string) =>
          handleRename(payload as EntityContextPayload, newName)
        }
        title="Rename"
        initialValue={(payload as EntityContextPayload)?.name || ""}
      />
    </>
  );
};

export default ContextMenuManager;
