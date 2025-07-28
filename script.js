import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

window.addEventListener("DOMContentLoaded", async () => {
  // Init Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Init Telegram
  const tg = window.Telegram.WebApp;
  tg.expand();

  const user = tg.initDataUnsafe?.user;
  let uid = "guest";

  if (user) {
    uid = user.id.toString();
    document.getElementById("username").textContent = user.username || "Anonymous";
    document.getElementById("avatar").src = user.photo_url || "";
  } else {
    document.getElementById("username").textContent = "Guest";
    document.getElementById("avatar").style.display = "none";
  }

  // Load user from Firestore
  async function loadUser() {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("refCount").textContent = data.refCount || 0;
      document.getElementById("refEarnings").textContent = (data.refCount || 0) * 100;
      document.getElementById("points").textContent = data.points || 0;
    } else {
      await setDoc(ref, { refCount: 0, points: 0 });
    }

    document.getElementById("refLink").value = `${window.location.origin}?ref=${uid}`;
  }

  await loadUser();

  // Task complete logic
  window.handleTaskComplete = async function () {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { points: increment(50) });
    alert("You earned 50 points!");
    await loadUser();
  };

  // Navigation
  document.querySelectorAll(".nav button").forEach(button => {
    button.addEventListener("click", () => {
      const sectionId = button.textContent.toLowerCase();
      document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");
    });
  });
});
