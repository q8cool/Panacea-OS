import { createIcons, icons } from "lucide";
import "./styles.css";
import { defaultRoute } from "./catalog";
import { probeFoundation } from "./foundation";
import { initialState, renderApp, type RenderState } from "./render";
import type { AppData } from "./types";

const root = document.querySelector<HTMLDivElement>("#app");

let data: AppData;
let state: RenderState = {
  ...initialState,
  theme: (localStorage.getItem("panacea-theme") as RenderState["theme"]) || "light",
  language: (localStorage.getItem("panacea-language") as RenderState["language"]) || "en"
};

async function bootstrap() {
  const response = await fetch("/panacea-data.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load Panacea data: HTTP ${response.status}`);
  data = (await response.json()) as AppData;
  window.addEventListener("hashchange", render);
  render();
}

function render() {
  if (!root) return;
  root.innerHTML = renderApp(data, currentRoute(), state);
  bindEvents();
  createIcons({ icons });
}

function currentRoute(): string {
  const route = window.location.hash.replace(/^#/, "");
  return route || defaultRoute;
}

function bindEvents() {
  document.querySelector<HTMLInputElement>("#global-search")?.addEventListener("input", (event) => {
    state = { ...state, globalSearch: (event.target as HTMLInputElement).value };
    render();
  });

  document.querySelector<HTMLButtonElement>("#theme-toggle")?.addEventListener("click", () => {
    state = { ...state, theme: state.theme === "light" ? "dark" : "light" };
    localStorage.setItem("panacea-theme", state.theme);
    render();
  });

  document.querySelector<HTMLButtonElement>("#language-toggle")?.addEventListener("click", () => {
    state = { ...state, language: state.language === "en" ? "ar" : "en" };
    localStorage.setItem("panacea-language", state.language);
    render();
  });

  document.querySelector<HTMLInputElement>("#api-query")?.addEventListener("input", (event) => {
    state = { ...state, apiQuery: (event.target as HTMLInputElement).value, selectedEndpointKey: "" };
    render();
  });

  document.querySelector<HTMLSelectElement>("#api-method")?.addEventListener("change", (event) => {
    state = { ...state, apiMethod: (event.target as HTMLSelectElement).value, selectedEndpointKey: "" };
    render();
  });

  document.querySelector<HTMLSelectElement>("#api-document")?.addEventListener("change", (event) => {
    state = { ...state, apiDocumentId: (event.target as HTMLSelectElement).value, selectedEndpointKey: "" };
    render();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-endpoint-key]").forEach((button) => {
    button.addEventListener("click", () => {
      state = { ...state, selectedEndpointKey: button.dataset.endpointKey ?? "" };
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-document-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state = { ...state, selectedDocumentId: button.dataset.documentId ?? "" };
      render();
    });
  });

  document.querySelector<HTMLButtonElement>("#probe-foundation")?.addEventListener("click", async () => {
    const button = document.querySelector<HTMLButtonElement>("#probe-foundation");
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i data-lucide="LoaderCircle"></i> Probing';
      createIcons({ icons });
    }
    state = { ...state, foundationProbe: await probeFoundation(data) };
    render();
  });
}

bootstrap().catch((error) => {
  if (!root) return;
  root.innerHTML = `
    <main class="load-error">
      <h1>Panacea OS Web Platform</h1>
      <p>${error instanceof Error ? error.message : "Startup failed"}</p>
    </main>
  `;
});
