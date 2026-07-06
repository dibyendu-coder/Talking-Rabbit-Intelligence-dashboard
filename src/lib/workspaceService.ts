import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  orderBy, 
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { ParsedData, ChatMessage, AnalysisResponse } from "../types";

export interface Workspace {
  id: string;
  userId: string;
  name: string;
  parsedData: ParsedData | null;
  rawData: any[];
  chatHistory: ChatMessage[];
  currentResponse: AnalysisResponse | null;
  customApiKey: string;
  createdAt: any;
  updatedAt: any;
}

// Fetch all workspaces belonging to the authenticated user
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  try {
    const q = query(
      collection(db, "workspaces"), 
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const workspaces: Workspace[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      workspaces.push({
        id: doc.id,
        userId: data.userId,
        name: data.name || "Untitled Workspace",
        parsedData: data.parsedData || null,
        rawData: data.rawData || [],
        chatHistory: data.chatHistory || [],
        currentResponse: data.currentResponse || null,
        customApiKey: data.customApiKey || "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    return workspaces;
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    throw error;
  }
}

// Create a new empty or loaded workspace
export async function createWorkspace(
  userId: string, 
  name: string, 
  initialData?: {
    parsedData: ParsedData | null;
    rawData: any[];
    chatHistory: ChatMessage[];
    currentResponse: AnalysisResponse | null;
    customApiKey: string;
  }
): Promise<Workspace> {
  try {
    const newDocRef = doc(collection(db, "workspaces"));
    // Cap rawData saved to Firestore to a maximum of 500 rows to prevent exceeding the 1MB document limit
    const rawDataToSave = initialData?.rawData 
      ? initialData.rawData.slice(0, 500) 
      : [];

    const workspaceData = {
      id: newDocRef.id,
      userId,
      name,
      parsedData: initialData?.parsedData || null,
      rawData: rawDataToSave,
      chatHistory: initialData?.chatHistory || [],
      currentResponse: initialData?.currentResponse || null,
      customApiKey: initialData?.customApiKey || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(newDocRef, workspaceData);
    return {
      ...workspaceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error creating workspace:", error);
    throw error;
  }
}

// Update an existing workspace
export async function updateWorkspace(
  workspaceId: string, 
  updates: Partial<Omit<Workspace, "id" | "userId" | "createdAt">>
): Promise<void> {
  try {
    const docRef = doc(db, "workspaces", workspaceId);
    
    // Cap rawData to a maximum of 500 rows to prevent exceeding the 1MB Firestore document limit
    const updatesToSave = { ...updates };
    if (updatesToSave.rawData) {
      updatesToSave.rawData = updatesToSave.rawData.slice(0, 500);
    }

    await updateDoc(docRef, {
      ...updatesToSave,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating workspace:", error);
    throw error;
  }
}

// Delete a workspace
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  try {
    const docRef = doc(db, "workspaces", workspaceId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting workspace:", error);
    throw error;
  }
}
