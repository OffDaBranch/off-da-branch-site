const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const publicIntakePath = "/api/public/intake/contact";

function resolvePublicIntakeEndpoint() {
  const explicitBaseUrl = document
    .querySelector('meta[name="branchops-public-api-base"]')
    ?.getAttribute('content')
    ?.trim();

  if (explicitBaseUrl) {
    return `${explicitBaseUrl.replace(/\/$/, '')}${publicIntakePath}`;
  }

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return `http://localhost:4000${publicIntakePath}`;
  }

  return `${window.location.origin}${publicIntakePath}`;
}

function ensureHoneypotField(form) {
  if (form.querySelector('input[name="website"]')) {
    return;
  }

  const honeypotWrapper = document.createElement('div');
  honeypotWrapper.setAttribute('aria-hidden', 'true');
  honeypotWrapper.style.position = 'absolute';
  honeypotWrapper.style.left = '-9999px';
  honeypotWrapper.style.width = '1px';
  honeypotWrapper.style.height = '1px';
  honeypotWrapper.style.overflow = 'hidden';

  const honeypotLabel = document.createElement('label');
  honeypotLabel.textContent = 'Leave this field empty';
  honeypotLabel.htmlFor = 'brand-contact-website';

  const honeypotInput = document.createElement('input');
  honeypotInput.type = 'text';
  honeypotInput.name = 'website';
  honeypotInput.id = 'brand-contact-website';
  honeypotInput.tabIndex = -1;
  honeypotInput.autocomplete = 'off';

  honeypotWrapper.append(honeypotLabel, honeypotInput);
  form.prepend(honeypotWrapper);
}

if (navLinks) {
  navLinks.dataset.open = "false";
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.dataset.open === "true";
    navLinks.dataset.open = String(!isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.dataset.open = "false";
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach((section) => section.classList.add("visible"));
}

if (contactForm && formStatus) {
  ensureHoneypotField(contactForm);

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const previousButtonLabel = submitButton?.textContent ?? 'Send inquiry';

    formStatus.textContent = 'Sending your inquiry…';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
    }

    try {
      const formData = new FormData(contactForm);
      const payload = {
        sourceSite: 'off-da-branch-site',
        inquiryType: String(formData.get("inquiryType") ?? 'general').trim() || 'general',
        name: String(formData.get("name") ?? '').trim(),
        email: String(formData.get("email") ?? '').trim(),
        companyName: String(formData.get("companyName") ?? '').trim() || null,
        phone: String(formData.get("phone") ?? '').trim() || null,
        message: String(formData.get("message") ?? '').trim(),
        website: String(formData.get("website") ?? '').trim(),
      };

      const response = await fetch(resolvePublicIntakeEndpoint(), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseBody?.message || 'The inquiry could not be sent right now. Please try again shortly.'
        );
      }

      contactForm.reset();
      ensureHoneypotField(contactForm);
      formStatus.textContent = 'Your inquiry was received. The brand team will follow up through your provided email.';
    } catch (error) {
      formStatus.textContent =
        error instanceof Error
          ? error.message
          : 'The inquiry could not be sent right now. Please try again shortly.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = previousButtonLabel;
      }
    }
  });
}
