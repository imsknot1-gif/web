const firebaseConfig = {
  apiKey: "AIzaSyCef88BHYjk0qlNzRRBDVgUuIUUbgw7EGA",
  authDomain: "webpage-ad87e.firebaseapp.com",
  projectId: "webpage-ad87e",
  storageBucket: "webpage-ad87e.firebasestorage.app",
  messagingSenderId: "446661907481",
  appId: "1:446661907481:web:617d3f0ccb7ae1f2570688",
  measurementId: "G-N8W6PE508W"
};

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");
const loginForm = document.getElementById("login-form");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
const googleButton = document.getElementById("google-button");
const resetPasswordButton = document.getElementById("reset-password");
const modeToggle = document.getElementById("mode-toggle");
const modePrompt = document.getElementById("mode-prompt");
const signedInPanel = document.getElementById("signed-in-panel");
const signedInEmail = document.getElementById("signed-in-email");
const signOutButton = document.getElementById("sign-out-button");

let isCreatingAccount = false;
let auth = null;

function showMessage(message, kind) {
  formMessage.textContent = message;
  formMessage.dataset.kind = kind || "";
}

function getFirebaseErrorMessage(error) {
  const messages = {
    "auth/configuration-not-found": "Firebase Authentication is not set up for this project yet. In Firebase Console, open Authentication and choose Get started.",
    "auth/email-already-in-use": "An account already exists for this email. Try signing in instead.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/weak-password": "Choose a stronger password (at least 6 characters).",
    "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups and try again.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase Authentication.",
    "auth/network-request-failed": "Could not reach Firebase. Check your internet connection and try again."
  };

  return messages[error.code] || error.message || "Authentication failed. Please try again.";
}

function isFirebaseConfigured() {
  return ["apiKey", "authDomain", "projectId", "appId"].every((key) => {
    return typeof firebaseConfig[key] === "string" && firebaseConfig[key].trim() !== "";
  });
}

togglePassword.addEventListener("click", () => {
  const showing = passwordInput.type === "password";
  passwordInput.type = showing ? "text" : "password";
  togglePassword.textContent = showing ? "Hide" : "Show";
  togglePassword.setAttribute("aria-pressed", String(showing));
});

modeToggle.addEventListener("click", () => {
  isCreatingAccount = !isCreatingAccount;
  document.getElementById("login-title").textContent = isCreatingAccount ? "Create your account" : "Welcome back";
  document.querySelector(".subtitle").textContent = isCreatingAccount
    ? "Create an account to get started."
    : "Enter your details to sign in to your account.";
  submitButton.textContent = isCreatingAccount ? "Create account" : "Sign in";
  modePrompt.textContent = isCreatingAccount ? "Already have an account?" : "Don't have an account?";
  modeToggle.textContent = isCreatingAccount ? "Sign in" : "Create account";
  resetPasswordButton.hidden = isCreatingAccount;
  passwordInput.autocomplete = isCreatingAccount ? "new-password" : "current-password";
  showMessage("", "");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("", "");

  if (!auth) {
    showMessage("Firebase isn't configured yet. Add your Firebase web app config in main.js to enable sign-in.", "error");
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;
  const rememberMe = loginForm.elements.remember.checked;
  submitButton.disabled = true;
  submitButton.textContent = isCreatingAccount ? "Creating account…" : "Signing in…";

  try {
    const persistence = rememberMe
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;
    await auth.setPersistence(persistence);

    if (isCreatingAccount) {
      await auth.createUserWithEmailAndPassword(email, password);
    } else {
      await auth.signInWithEmailAndPassword(email, password);
    }
  } catch (error) {
    showMessage(getFirebaseErrorMessage(error), "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = isCreatingAccount ? "Create account" : "Sign in";
  }
});

resetPasswordButton.addEventListener("click", async () => {
  showMessage("", "");

  if (!auth) {
    showMessage("Add your Firebase web app config in main.js to enable password reset.", "error");
    return;
  }

  const email = document.getElementById("email").value.trim();
  if (!email) {
    document.getElementById("email").focus();
    showMessage("Enter your email address first, then choose Forgot password.", "error");
    return;
  }

  resetPasswordButton.disabled = true;
  try {
    await auth.sendPasswordResetEmail(email);
    showMessage("If an account exists for that email, a password reset link is on its way.", "success");
  } catch (error) {
    showMessage(getFirebaseErrorMessage(error), "error");
  } finally {
    resetPasswordButton.disabled = false;
  }
});

googleButton.addEventListener("click", async () => {
  showMessage("", "");

  if (!auth) {
    showMessage("Add your Firebase web app config in main.js to enable Google sign-in.", "error");
    return;
  }

  googleButton.disabled = true;
  try {
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  } catch (error) {
    showMessage(getFirebaseErrorMessage(error), "error");
  } finally {
    googleButton.disabled = false;
  }
});

signOutButton.addEventListener("click", async () => {
  try {
    await auth.signOut();
    showMessage("You’ve been signed out.", "success");
  } catch (error) {
    showMessage(getFirebaseErrorMessage(error), "error");
  }
});

if (typeof firebase === "undefined") {
  showMessage("Firebase SDK failed to load. Check your internet connection and reload the page.", "error");
} else if (!isFirebaseConfigured()) {
  showMessage("Add your Firebase web app config in main.js to enable sign-in.", "error");
} else {
  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
      signedInPanel.hidden = !user;
      loginForm.hidden = Boolean(user);
      document.querySelector(".signup").hidden = Boolean(user);
      document.querySelector(".subtitle").hidden = Boolean(user);
      document.getElementById("login-title").textContent = user
        ? "You’re signed in"
        : isCreatingAccount ? "Create your account" : "Welcome back";
      if (!user) {
        document.querySelector(".subtitle").textContent = isCreatingAccount
          ? "Create an account to get started."
          : "Enter your details to sign in to your account.";
      }
      signedInEmail.textContent = user ? user.email || "your account" : "";
    }, (error) => {
      showMessage(getFirebaseErrorMessage(error), "error");
    });
  } catch (error) {
    showMessage("Firebase could not initialize: " + getFirebaseErrorMessage(error), "error");
  }
}