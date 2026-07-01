import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

/* LOGIN */
export const googleProvider =
  new GoogleAuthProvider();

/* SIGNUP */
export const googleSignupProvider =
  new GoogleAuthProvider();

googleSignupProvider.setCustomParameters({
  prompt: "select_account",
});

export const githubProvider =
  new GithubAuthProvider();

export default app;