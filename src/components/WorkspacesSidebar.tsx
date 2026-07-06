import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Folder, 
  FolderOpen, 
  FileSpreadsheet, 
  Check, 
  X, 
  Edit2, 
  LogOut, 
  User, 
  Database,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles
} from "lucide-react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { Workspace } from "../lib/workspaceService";
import { motion, AnimatePresence } from "motion/react";

interface WorkspacesSidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
  onOpenAuth: () => void;
}

export default function WorkspacesSidebar({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  onRenameWorkspace,
  onOpenAuth
}: WorkspacesSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    onCreateWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName("");
    setIsCreating(false);
  };

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  const saveRename = (id: string) => {
    if (editValue.trim() && editValue.trim() !== workspaces.find(w => w.id === id)?.name) {
      onRenameWorkspace(id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  return (
    <>
      {/* Absolute floating toggle for mobile or closed state */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-20 z-40 p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[#00F5D4] rounded-xl hover:border-[#00F5D4]/40 transition-all duration-300 shadow-xl cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative shrink-0 h-full border-r border-slate-900 bg-slate-950 flex flex-col justify-between z-30"
          >
            {/* Header with toggle close */}
            <div className="p-4 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#00F5D4]" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Workspaces</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-500 hover:text-white bg-slate-900/40 border border-slate-800/40 rounded-md hover:border-slate-750 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* List of Workspaces */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {currentUser ? (
                <>
                  {/* Create Trigger */}
                  {!isCreating ? (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="w-full py-2.5 px-3 border border-dashed border-slate-800 hover:border-[#00F5D4]/30 hover:bg-slate-900/30 text-slate-400 hover:text-[#00F5D4] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Workspace</span>
                    </button>
                  ) : (
                    <form onSubmit={handleCreate} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-2">
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder="Workspace name..."
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00F5D4]/40"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsCreating(false)}
                          className="p-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="submit"
                          className="px-2 py-1 bg-indigo-600 hover:bg-[#00F5D4] text-white hover:text-slate-950 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Workspaces list */}
                  <div className="space-y-1.5">
                    {workspaces.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic text-center py-4">No active workspaces. Click above to create.</p>
                    ) : (
                      workspaces.map((ws) => {
                        const isActive = ws.id === activeWorkspaceId;
                        const isEditing = editingId === ws.id;
                        const isConfirmingDelete = confirmDeleteId === ws.id;

                        return (
                          <div
                            key={ws.id}
                            className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                              isActive
                                ? "bg-slate-900 border-slate-800 text-white shadow-sm"
                                : "border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              {isActive ? (
                                <FolderOpen className="w-4 h-4 text-[#00F5D4] shrink-0" />
                              ) : (
                                <Folder className="w-4 h-4 text-slate-500 shrink-0" />
                              )}

                              {isEditing ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => saveRename(ws.id)}
                                  onKeyDown={(e) => e.key === "Enter" && saveRename(ws.id)}
                                  className="w-full bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-xs text-white focus:outline-none"
                                />
                              ) : (
                                <button
                                  onClick={() => onSelectWorkspace(ws.id)}
                                  className="text-xs font-semibold text-left truncate flex-1 block focus:outline-none cursor-pointer"
                                >
                                  {ws.name}
                                </button>
                              )}
                            </div>

                            {/* Options on Hover */}
                            {!isEditing && !isConfirmingDelete && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                                <button
                                  onClick={() => startRename(ws.id, ws.name)}
                                  className="p-1 hover:text-[#00F5D4] rounded transition-colors cursor-pointer"
                                  title="Rename"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(ws.id)}
                                  className="p-1 hover:text-[#FF6B6B] rounded transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Confirm Delete state */}
                            {isConfirmingDelete && (
                              <div className="flex items-center gap-1 shrink-0 z-10 bg-slate-900 px-1.5 rounded-lg border border-slate-800">
                                <span className="text-[9px] text-slate-400 font-mono">Delete?</span>
                                <button
                                  onClick={() => onDeleteWorkspace(ws.id)}
                                  className="text-[9px] text-red-400 hover:text-red-300 font-bold px-1 py-0.5 cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-[9px] text-slate-400 hover:text-white px-1 py-0.5 cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 px-4 space-y-3 bg-slate-900/30 border border-slate-900 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-[#00F5D4] mx-auto animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-200">Sync with SaaS Profile</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Create a free profile to secure multiple independent workspaces, save custom configurations, and preserve your analytical insights.
                  </p>
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-2 bg-[#00F5D4] text-slate-950 hover:bg-[#00e1c2] rounded-xl text-xs font-bold transition-all duration-300 shadow-md cursor-pointer"
                  >
                    Set Up Sync
                  </button>
                </div>
              )}
            </div>

            {/* Footer Profile Area */}
            <div className="p-4 border-t border-slate-900 bg-slate-950/80">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-2 bg-indigo-600/15 border border-indigo-500/25 rounded-xl shrink-0">
                      <User className="w-4 h-4 text-[#00F5D4]" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{currentUser.displayName || "Subscriber"}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-slate-500 hover:text-white bg-slate-900/40 border border-slate-800/40 rounded-xl hover:border-slate-700 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 hover:border-[#00F5D4]/40 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#00F5D4]" />
                  <span>SaaS Login / Register</span>
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
