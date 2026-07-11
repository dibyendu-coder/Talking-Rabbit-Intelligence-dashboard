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
  Sparkles,
  Wallet
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
          className="fixed left-4 top-20 z-40 p-2.5 bg-surface hover:bg-surface/80 border border-bitcoin/30 text-bitcoin rounded-xl hover:border-bitcoin transition-all duration-300 shadow-bitcoin-glow cursor-pointer"
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
            className="relative shrink-0 h-full border-r border-white/5 bg-surface flex flex-col justify-between z-30"
          >
            {/* Header with toggle close */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-bitcoin" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Workspaces</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-muted hover:text-white bg-[#030304]/40 border border-white/5 rounded-md hover:border-white/10 transition-colors cursor-pointer"
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
                      className="w-full py-2.5 px-3 border border-dashed border-white/10 hover:border-bitcoin/30 hover:bg-white/5 text-muted hover:text-bitcoin rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer font-mono"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Ledger Node</span>
                    </button>
                  ) : (
                    <form onSubmit={handleCreate} className="bg-[#030304]/50 border border-white/5 rounded-xl p-3 space-y-2">
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder="Workspace name..."
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#030304] border border-white/10 rounded-lg text-xs text-white placeholder-white/25 focus:outline-none focus:border-bitcoin/50"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsCreating(false)}
                          className="p-1 bg-[#030304] border border-white/5 text-muted hover:text-white rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-gradient-to-r from-bitcoin-burnt to-bitcoin text-white hover:text-black rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer shadow-bitcoin-glow"
                        >
                          Deploy
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Workspaces list */}
                  <div className="space-y-1.5">
                    {workspaces.length === 0 ? (
                      <p className="text-[11px] text-muted italic text-center py-4 font-mono">No active nodes. Deploy above.</p>
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
                                ? "bg-[#030304] border-bitcoin/30 text-white shadow-bitcoin-glow"
                                : "border-transparent text-muted hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              {isActive ? (
                                <FolderOpen className="w-4 h-4 text-bitcoin-gold shrink-0" />
                              ) : (
                                <Folder className="w-4 h-4 text-muted shrink-0" />
                              )}

                              {isEditing ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => saveRename(ws.id)}
                                  onKeyDown={(e) => e.key === "Enter" && saveRename(ws.id)}
                                  className="w-full bg-[#030304] border border-white/10 px-1.5 py-0.5 rounded text-xs text-white focus:outline-none focus:border-bitcoin"
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
                                  className="p-1 hover:text-bitcoin rounded transition-colors cursor-pointer"
                                  title="Rename"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(ws.id)}
                                  className="p-1 hover:text-bitcoin-burnt rounded transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Confirm Delete state */}
                            {isConfirmingDelete && (
                              <div className="flex items-center gap-1 shrink-0 z-10 bg-[#030304] px-1.5 py-0.5 rounded-lg border border-white/10">
                                <span className="text-[9px] text-muted font-mono">Prune?</span>
                                <button
                                  onClick={() => onDeleteWorkspace(ws.id)}
                                  className="text-[9px] text-bitcoin-burnt hover:text-bitcoin font-bold px-1 py-0.5 cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-[9px] text-muted hover:text-white px-1 py-0.5 cursor-pointer"
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
                <div className="text-center py-6 px-4 space-y-3 bg-[#030304]/30 border border-white/5 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-bitcoin-gold mx-auto animate-pulse" />
                  <h4 className="text-xs font-bold text-white font-heading">Protocol Cloud Sync</h4>
                  <p className="text-[11px] text-muted leading-relaxed font-body">
                    Secure multiple independent analytical workspaces, save custom configurations, and preserve your analytical insights in the decentralized cloud ledger.
                  </p>
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-2 bg-gradient-to-r from-bitcoin-burnt to-bitcoin text-white hover:text-black font-mono rounded-xl text-xs font-bold transition-all duration-300 shadow-bitcoin-glow hover:shadow-bitcoin-glow-intense cursor-pointer"
                  >
                    Sync Profile
                  </button>
                </div>
              )}
            </div>

            {/* Footer Profile Area */}
            <div className="p-4 border-t border-white/5 bg-[#030304]/80">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-2 bg-bitcoin/10 border border-bitcoin/30 rounded-xl shrink-0">
                      <User className="w-4 h-4 text-bitcoin-gold" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{currentUser.displayName || "Key Custodian"}</h4>
                      <p className="text-[10px] text-muted truncate font-mono">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-muted hover:text-white bg-[#030304]/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors cursor-pointer"
                    title="Disconnect"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2.5 bg-[#030304] hover:bg-white/5 hover:border-bitcoin/40 border border-white/5 text-muted hover:text-white rounded-xl text-xs font-bold font-mono transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-bitcoin" />
                  <span>Connect Analytics Profile</span>
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
