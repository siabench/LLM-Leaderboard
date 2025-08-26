import axios from "axios";
import qs from "qs";

const fallbackProdURL = "https://<your-render-service>.onrender.com";
const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? fallbackProdURL
    : "http://localhost:8000");

const API = axios.create({ baseURL });
console.log("[API] baseURL =", baseURL);

API.interceptors.request.use((config) => {
  const ts = Date.now().toString();
  config.params = config.params ? { ...config.params, _t: ts } : { _t: ts };
  config.headers = { ...config.headers, "Cache-Control": "no-cache" };
  return config;
});

export const getLanding = () => API.get("/");
export const getInfoData = () => API.get("/info");
export const getFooterInfo = () => API.get("/footer");
export const getTaskOptions = () => API.get("/leaderboard/task-options");
export const getLevelOptions = () => API.get("/leaderboard/level-options");
export const getLeaderboard = (tasks, levels) =>
  API.get("/leaderboard/", {
    params: { tasks, levels },
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });
export const getLatestResults = (tasks, levels) =>
  API.get("/leaderboard/latest", {
    params: { tasks, levels },
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });
export const getDetailedResults = () => API.get("/leaderboard/detailed");
export const getLegend = () => API.get("/leaderboard/legend");
export const getAlertTriagingLeaderboard = () =>
  API.get("/alert-triaging/leaderboard");
export const getModelDetails = (model_name) =>
  API.get(`/leaderboard/model-details/${encodeURIComponent(model_name)}`);
export const getModelIntegrations = () => API.get("/leaderboard/integrations");
export const getScenarios = () =>
  API.get("/scenarios").then((r) => {
    const items = Array.isArray(r.data)
      ? r.data
      : r.data?.scenarios ?? r.data?.items ?? [];
    return { data: items };
  });

export const getScenarioQuestions = (name) =>
  API.get(`/scenarios/${encodeURIComponent(name)}/questions`).then((r) => {
    const items = Array.isArray(r.data) ? r.data : r.data?.questions ?? [];
    return { data: items };
  });
export default API;
