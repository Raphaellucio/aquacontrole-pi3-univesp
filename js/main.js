import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHy-j0OP1f8gBg5_waWzd__IhCc1uX_NQ",
  authDomain: "aquacontrole-pi3.firebaseapp.com",
  projectId: "aquacontrole-pi3",
  storageBucket: "aquacontrole-pi3.firebasestorage.app",
  messagingSenderId: "703904661098",
  appId: "1:703904661098:web:77af702c103ef64d1a9413"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const tempSlider = document.getElementById("tempSlider");
  const tempValue = document.getElementById("tempValue");

  if (tempSlider && tempValue) {
    tempValue.textContent = tempSlider.value + "°C";
    tempSlider.addEventListener("input", () => {
      tempValue.textContent = tempSlider.value + "°C";
    });
  }

  const btnTeste = document.getElementById("btnSalvarTeste");
  if (btnTeste) {
    btnTeste.addEventListener("click", salvarTeste);
  }

  const btnEntrar = document.getElementById("btnEntrar");
  const btnCadastrar = document.getElementById("btnCadastrar");
  const inputEmail = document.getElementById("email");
  const inputSenha = document.getElementById("senha");
  const msgLogin = document.getElementById("msg-login");

  if (btnEntrar && btnCadastrar && inputEmail && inputSenha) {
    btnEntrar.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signInWithEmailAndPassword(auth, inputEmail.value.trim(), inputSenha.value);
        if (msgLogin) msgLogin.textContent = "";
      } catch (error) {
        console.error("Erro no login:", error);
        if (msgLogin) msgLogin.textContent = "E-mail ou senha incorretos.";
      }
    });

    btnCadastrar.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await createUserWithEmailAndPassword(auth, inputEmail.value.trim(), inputSenha.value);
        if (msgLogin) msgLogin.textContent = "";
      } catch (error) {
        console.error("Erro no cadastro:", error);
        if (msgLogin) msgLogin.textContent = "Não foi possível cadastrar.";
      }
    });
  }

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      ouvirAquarios();
      ouvirRegistros();
    }
  });
});

function ouvirAquarios() {
  const lista = document.getElementById("aquarios-list");
  const count = document.getElementById("aquarios-count");
  if (!lista) return;

  onSnapshot(collection(db, "aquarios"), (snapshot) => {
    const dados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (count) count.textContent = String(dados.length);

    if (!dados.length) {
      lista.innerHTML = "<p>Nenhum aquário cadastrado.</p>";
      return;
    }

    lista.innerHTML = dados
      .map(
        (a) => `
          <div class="item-aquario">
            <strong>${a.nome || "Aquário sem nome"}</strong>
            <div>Espécie: ${a.especie || "-"}</div>
            <div>Tipo: ${a.tipo || "-"}</div>
          </div>
        `
      )
      .join("");
  });
}

function ouvirRegistros() {
  const lista = document.getElementById("registros-list");
  const count = document.getElementById("registros-count");
  const phAtual = document.getElementById("ph-atual");
  if (!lista) return;

  onSnapshot(collection(db, "registros"), (snapshot) => {
    const dados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (count) count.textContent = String(dados.length);

    const ultimoPh = dados.find((r) => r.ph !== undefined);
    if (phAtual) phAtual.textContent = ultimoPh ? String(ultimoPh.ph) : "-";

    if (!dados.length) {
      lista.innerHTML = "<p>Nenhum registro salvo.</p>";
      return;
    }

    lista.innerHTML = dados
      .map(
        (r) => `
          <div class="item-registro">
            <strong>${r.tipo || "Registro"}</strong>
            <div>Valor: ${r.valor ?? "-"}</div>
          </div>
        `
      )
      .join("");
  });
}

async function salvarTeste() {
  if (!currentUser) return;

  await addDoc(collection(db, "aquarios"), {
    nome: "Aquário Teste",
    especie: "Guppy",
    tipo: "Água doce",
    usuarioId: currentUser.uid,
    criadoEm: serverTimestamp()
  });
}

window.salvarAquarioTeste = salvarTeste;