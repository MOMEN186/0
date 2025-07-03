// src/lib/firebase/upload-avatar.ts
import { getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

// Uploads a profile picture to Firebase Storage and updates Firebase Auth
export const uploadAvatar = async (file: File): Promise<string | null> => {
    const { auth, setAuth } = useAuthStore.getState();
    const FireBaseAuth = getAuth();
  const user = FireBaseAuth.currentUser;


  if (!user) {
    toast.error("Not authenticated");
    return null;
  }

  try {
    const storage = getStorage();
    const avatarRef = ref(storage, `avatars/${user.uid}/avatar.jpg`);
    await uploadBytes(avatarRef, file);
    const avatarURL = await getDownloadURL(avatarRef);

      await updateProfile(user, { photoURL: avatarURL });
      
setAuth({
  id: user.uid,
  email: user.email || "",
  displayName: user.displayName || "",
  photoURL: avatarURL,
  collectionId: auth?.collectionId,
  collectionName: auth?.collectionName,
  autoSkip: auth?.autoSkip ?? false,
});
      
      
    toast.success("Avatar updated successfully");
    return avatarURL;
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    toast.error("Failed to upload avatar");
    return null;
  }
};
