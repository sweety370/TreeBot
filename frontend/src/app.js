
const API_URL = "https://bowling-deep-bat.abasthan.app";

document.addEventListener("DOMContentLoaded", () => {
  const toast = createToast();
  const modal = document.getElementById("authModal");

  const openAuth = () => {
    if (!modal) return;

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeAuth = () => {
    if (!modal) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const bind = (id, handler) => {
    const element = document.getElementById(id);

    if (element) {
      element.addEventListener("click", handler);
    }
  };

  bind("loginButton", openAuth);
  bind("signupButton", openAuth);
  bind("heroSignup", openAuth);
  bind("dashboardAddBot", openAuth);
  bind("finalSignup", openAuth);

  bind("heroDashboard", () => {
    document
      .getElementById("dashboard-preview")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  });

  bind("modalClose", closeAuth);

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeAuth();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAuth();
    }
  });

  document
    .querySelectorAll(".location-card")
    .forEach((card) => {
      card.addEventListener("click", () => {
        document
          .querySelectorAll(".location-card")
          .forEach((item) => {
            item.classList.remove("selected");
          });

        card.classList.add("selected");

        const country =
          card.querySelector(".location-top strong")
            ?.textContent || "Location";

        toast(`${country} selected`);
      });
    });

  document
    .querySelectorAll(".dashboard-item")
    .forEach((item) => {
      item.addEventListener("click", () => {
        document
          .querySelectorAll(".dashboard-item")
          .forEach((other) => {
            other.classList.remove("active");
          });

        item.classList.add("active");

        toast(
          `${item.textContent.trim()} selected`
        );
      });
    });

  setupAuth();
  setupRevealAnimations();
  setupHeroParallax();
});


/* =========================================
   TOAST
========================================= */

function createToast() {
  let element = document.getElementById("toast");

  if (element) {
    return (text) => {
      element.textContent = text;
      element.classList.add("show");

      clearTimeout(element._timer);

      element._timer = setTimeout(() => {
        element.classList.remove("show");
      }, 2200);
    };
  }

  element = document.createElement("div");

  element.id = "toast";
  element.className = "toast";

  document.body.appendChild(element);

  return (text) => {
    element.textContent = text;
    element.classList.add("show");

    clearTimeout(element._timer);

    element._timer = setTimeout(() => {
      element.classList.remove("show");
    }, 2200);
  };
}


/* =========================================
   AUTH
========================================= */

function setupAuth() {
  const emailLogin =
    document.getElementById("emailLogin");

  const googleLogin =
    document.getElementById("googleLogin");

  const showSignup =
    document.getElementById("showSignup");

  const message =
    document.getElementById("authMessage");

  if (googleLogin) {
    googleLogin.addEventListener("click", () => {
      showAuthMessage(
        message,
        "Google authentication will be connected next."
      );
    });
  }

  if (emailLogin) {
    emailLogin.addEventListener("click", () => {
      const email =
        document
          .getElementById("emailInput")
          ?.value
          .trim();

      const password =
        document
          .getElementById("passwordInput")
          ?.value;

      if (!email || !password) {
        showAuthMessage(
          message,
          "Enter your email and password.",
          true
        );

        return;
      }

      showAuthMessage(
        message,
        "Authentication will be connected to Supabase next."
      );
    });
  }

  if (showSignup) {
    showSignup.addEventListener("click", () => {
      showAuthMessage(
        message,
        "Sign-up flow will be connected next."
      );
    });
  }
}

function showAuthMessage(
  element,
  text,
  error = false
) {
  if (!element) return;

  element.textContent = text;

  element.className =
    error
      ? "auth-message show error"
      : "auth-message show";
}


/* =========================================
   SCROLL REVEAL
========================================= */

function setupRevealAnimations() {
  const elements =
    document.querySelectorAll(
      ".section, .final-cta, .feature-card, .host, .dashboard-preview"
    );

  elements.forEach((element) => {
    element.classList.add("reveal");
  });

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("visible");

          observer.unobserve(
            entry.target
          );
        });
      },
      {
        threshold: 0.12
      }
    );

  elements.forEach((element) => {
    observer.observe(element);
  });
}


/* =========================================
   HERO PARALLAX
========================================= */

function setupHeroParallax() {
  const visual =
    document.querySelector(".hero-visual");

  if (!visual) return;

  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  if (reduceMotion) return;

  visual.addEventListener(
    "mousemove",
    (event) => {
      const rect =
        visual.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) /
        rect.width -
        0.5;

      const y =
        (event.clientY - rect.top) /
        rect.height -
        0.5;

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
        "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    }
  );
}
