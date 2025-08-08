import axios from "axios";
import qs from "qs";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const API = axios.create({ baseURL });

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
export const getScenarios = () => API.get("/scenarios");
export const getScenarioQuestions = (name) =>
  API.get(`/scenarios/${encodeURIComponent(name)}/questions`);

export default API;
