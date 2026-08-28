const SUPABASE_URL =
  "https://egigervixsqskrazrsch.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_hFgvltvDBupjjJaOkcAGSA_HomEsiay";

const API_URL =
  "https://bowling-deep-bat.abasthan.app";


let supabaseClient = null;
let resetEmail = "";

document.addEventListener("DOMContentLoaded", async () => {

  initSupabase();
  initNavigation();
  initModal();
  initLocations();
  initDashboard();
  initRevealAnimations();
  initParallax();

  await loadSession();

});


/* =========================================
   SUPABASE
========================================= */

function initSupabase(){

  if(
    typeof window.supabase === "undefined"
  ){
    console.warn(
      "Supabase library was not loaded."
    );

    return;
  }

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth:{
          persistSession:true,
          autoRefreshToken:true,
          detectSessionInUrl:true
        }
      }
    );

  supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

      if(event === "SIGNED_OUT"){
        updateNavbar(null);
        return;
      }

      if(session?.user){
        updateNavbar(session.user);
      }

    }
  );

}


/* =========================================
   SESSION
========================================= */

async function loadSession(){

  if(!supabaseClient){
    return;
  }

  try{

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();

    if(error){
      console.error(error);
      return;
    }

    updateNavbar(
      data.session?.user || null
    );

  }catch(error){

    console.error(
      "Session error:",
      error
    );

  }

}


/* =========================================
   NAVIGATION
========================================= */

function initNavigation(){

  document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const href =
            link.getAttribute("href");

          if(
            !href ||
            !href.startsWith("#")
          ){
            return;
          }

          const element =
            document.querySelector(
              href
            );

          if(!element){
            return;
          }

          event.preventDefault();

          element.scrollIntoView({
            behavior:"smooth",
            block:"start"
          });

        }
      );

    });

}


/* =========================================
   MODAL
========================================= */

function initModal(){

  const modal =
    document.getElementById(
      "authModal"
    );

  if(!modal){
    return;
  }

  bindClick(
    "loginButton",
    openAuth
  );

  bindClick(
    "signupButton",
    openAuth
  );

  bindClick(
    "heroSignup",
    openAuth
  );

  bindClick(
    "dashboardAddBot",
    openAuth
  );

  bindClick(
    "finalSignup",
    openAuth
  );

  bindClick(
    "modalClose",
    closeAuth
  );

  modal.addEventListener(
    "click",
    event => {

      if(event.target === modal){
        closeAuth();
      }

    }
  );

  document.addEventListener(
    "keydown",
    event => {

      if(event.key === "Escape"){
        closeAuth();
      }

    }
  );

  bindClick(
    "googleLogin",
    googleLogin
  );

  bindClick(
    "emailLogin",
    emailLogin
  );

  bindClick(
    "showSignup",
    showSignup
  );

  const password =
    document.getElementById(
      "passwordInput"
    );

  if(password){

    password.addEventListener(
      "keydown",
      event => {

        if(event.key === "Enter"){
          emailLogin();
        }

      }
    );

  }

}


function openAuth(){

  const modal =
    document.getElementById(
      "authModal"
    );

  if(!modal){
    return;
  }

  clearAuthMessage();

  modal.style.display = "flex";

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";

  setTimeout(() => {

    document
      .getElementById("emailInput")
      ?.focus();

  },100);

}


function closeAuth(){

  const modal =
    document.getElementById(
      "authModal"
    );

  if(!modal){
    return;
  }

  modal.style.display = "none";

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";

}


/* =========================================
   LOGIN
========================================= */

async function emailLogin(){

  const email =
    document
      .getElementById("emailInput")
      ?.value
      .trim();

  const password =
    document
      .getElementById("passwordInput")
      ?.value;

  if(!email){

    showAuthMessage(
      "Please enter your email.",
      true
    );

    return;
  }

  if(!password){

    showAuthMessage(
      "Please enter your password.",
      true
    );

    return;
  }

  if(!supabaseClient){

    showAuthMessage(
      "Authentication is not available.",
      true
    );

    return;
  }

  setAuthLoading(true);

  try{

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({
          email,
          password
        });

    if(error){
      throw error;
    }

    showAuthMessage(
      "Signed in successfully.",
      false
    );

    updateNavbar(
      data.user
    );

    setTimeout(
      closeAuth,
      450
    );

  }catch(error){

    showAuthMessage(
      error.message ||
      "Unable to sign in.",
      true
    );

  }finally{

    setAuthLoading(false);

  }

}


/* =========================================
   GOOGLE
========================================= */

async function googleLogin(){

  if(!supabaseClient){

    showAuthMessage(
      "Authentication is not available.",
      true
    );

    return;
  }

  setAuthLoading(true);

  try{

    const {
      error
    } =
      await supabaseClient.auth
        .signInWithOAuth({
          provider:"google",
          options:{
            redirectTo:
              window.location.href
          }
        });

    if(error){
      throw error;
    }

  }catch(error){

    showAuthMessage(
      error.message ||
      "Google sign-in failed.",
      true
    );

    setAuthLoading(false);

  }

}


/* =========================================
   SIGNUP
========================================= */

function showSignup(){

  showAuthMessage(
    "Account creation will use the TreePots authentication system.",
    false
  );

}


/* =========================================
   AUTH UI
========================================= */

function setAuthLoading(
  loading
){

  const emailButton =
    document.getElementById(
      "emailLogin"
    );

  const googleButton =
    document.getElementById(
      "googleLogin"
    );

  if(emailButton){

    emailButton.disabled =
      loading;

    emailButton.textContent =
      loading
        ? "Please wait..."
        : "Sign in";

  }

  if(googleButton){

    googleButton.disabled =
      loading;

  }

}


function showAuthMessage(
  text,
  error = false
){

  const message =
    document.getElementById(
      "authMessage"
    );

  if(!message){
    return;
  }

  message.textContent =
    text;

  message.className =
    error
      ? "auth-message show error"
      : "auth-message show";

}


function clearAuthMessage(){

  const message =
    document.getElementById(
      "authMessage"
    );

  if(!message){
    return;
  }

  message.textContent = "";

  message.className =
    "auth-message";

}


/* =========================================
   NAVBAR USER
========================================= */

function updateNavbar(
  user
){

  const loginButton =
    document.getElementById(
      "loginButton"
    );

  const signupButton =
    document.getElementById(
      "signupButton"
    );

  if(!user){

    if(loginButton){
      loginButton.style.display =
        "";
    }

    if(signupButton){
      signupButton.textContent =
        "Get started";
    }

    return;
  }

  if(loginButton){
    loginButton.textContent =
      user.email
        ? user.email
        : "Account";

    loginButton.onclick =
      showAccountToast;
  }

  if(signupButton){
    signupButton.textContent =
      "Dashboard";

    signupButton.onclick =
      () => {

        document
          .getElementById(
            "dashboard-preview"
          )
          ?.scrollIntoView({
            behavior:"smooth"
          });

      };
  }

}


/* =========================================
   ACCOUNT
========================================= */

function showAccountToast(){

  showToast(
    "You're already signed in."
  );

}


/* =========================================
   LOCATIONS
========================================= */

function initLocations(){

  const cards =
    document.querySelectorAll(
      ".location-card"
    );

  cards.forEach(card => {

    card.addEventListener(
      "click",
      () => {

        cards.forEach(item => {
          item.classList.remove(
            "selected"
          );
        });

        card.classList.add(
          "selected"
        );

        const name =
          card.querySelector(
            ".location-top strong"
          )?.textContent
          || "Location";

        showToast(
          `${name} selected`
        );

      }
    );

  });

}


/* =========================================
   DASHBOARD
========================================= */

function initDashboard(){

  document
    .querySelectorAll(
      ".dashboard-item"
    )
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".dashboard-item"
            )
            .forEach(other => {

              other.classList.remove(
                "active"
              );

            });

          item.classList.add(
            "active"
          );

          showToast(
            `${item.textContent.trim()} selected`
          );

        }
      );

    });

}


/* =========================================
   REVEAL
========================================= */

function initRevealAnimations(){

  const elements =
    document.querySelectorAll(
      ".section, .feature-card, .location-card, .dashboard-preview, .final-cta"
    );

  if(!("IntersectionObserver" in window)){

    elements.forEach(
      element => {
        element.classList.add(
          "visible"
        );
      }
    );

    return;
  }

  elements.forEach(
    element => {
      element.classList.add(
        "reveal"
      );
    }
  );

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if(
              !entry.isIntersecting
            ){
              return;
            }

            entry.target
              .classList
              .add("visible");

            observer.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold:.1
      }
    );

  elements.forEach(
    element => {
      observer.observe(element);
    }
  );

}


/* =========================================
   PARALLAX
========================================= */

function initParallax(){

  const visual =
    document.querySelector(
      ".hero-visual"
    );

  if(!visual){
    return;
  }

  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  if(reduceMotion){
    return;
  }

  visual.addEventListener(
    "mousemove",
    event => {

      const rect =
        visual.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) /
        rect.width -
        .5;

      const y =
        (event.clientY - rect.top) /
        rect.height -
        .5;

      visual.style.transform =
        `
        perspective(1200px)
        rotateX(${y * -1.5}deg)
        rotateY(${x * 1.5}deg)
        `;

    }
  );

  visual.addEventListener(
    "mouseleave",
    () => {

      visual.style.transform =
        `
        perspective(1200px)
        rotateX(0deg)
        rotateY(0deg)
        `;

    }
  );

}


/* =========================================
   TOAST
========================================= */

function showToast(
  text
){

  let toast =
    document.getElementById(
      "treepotsToast"
    );

  if(!toast){

    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "treepotsToast";

    toast.className =
      "toast";

    document.body.appendChild(
      toast
    );

  }

  toast.textContent =
    text;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toast._timer
  );

  toast._timer =
    setTimeout(
      () => {
        toast.classList.remove(
          "show"
        );
      },
      2200
    );

}


/* =========================================
   API HELPER
========================================= */

async function getAccessToken(){

  if(!supabaseClient){
    throw new Error(
      "Supabase is not initialized."
    );
  }

  const {
    data,
    error
  } =
    await supabaseClient.auth
      .getSession();

  if(error){
    throw error;
  }

  if(!data.session){

    throw new Error(
      "Please sign in first."
    );

  }

  return data.session
    .access_token;

}


/* =========================================
   PUBLIC API
========================================= */

window.TreePots = {

  async getBots(){

    const token =
      await getAccessToken();

    const response =
      await fetch(
        `${API_URL}/api/bots`,
        {
          headers:{
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if(!response.ok){

      throw new Error(
        "Unable to load bots."
      );

    }

    return response.json();

  },


  async startBot(
    bot
  ){

    const token =
      await getAccessToken();

    const response =
      await fetch(
        `${API_URL}/api/bots/start`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body:
            JSON.stringify(bot)
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if(!response.ok){

      throw new Error(
        data.error ||
        "Unable to start bot."
      );

    }

    return data;

  },


  async stopBot(
    id
  ){

    const token =
      await getAccessToken();

    const response =
      await fetch(
        `${API_URL}/api/bots/stop`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body:
            JSON.stringify({
              id
            })
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if(!response.ok){

      throw new Error(
        data.error ||
        "Unable to stop bot."
      );

    }

    return data;

  }

};


/* =========================================
   SMALL HELPERS
========================================= */

function bindClick(
  id,
  handler
){

  const element =
    document.getElementById(id);

  if(element){
    element.addEventListener(
      "click",
      handler
    );
  }

}
