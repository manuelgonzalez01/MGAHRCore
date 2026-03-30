import appEnv from "../../config/env";
import { applyRequestInterceptors, applyResponseInterceptors } from "./interceptors";

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${appEnv.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(path, config = {}) {
  const finalConfig = applyRequestInterceptors(config);
  const response = await fetch(buildUrl(path), finalConfig);
  return applyResponseInterceptors(response);
}

function withJsonBody(method, path, body, config = {}) {
  return request(path, {
    ...config,
    method,
    body: body == null ? undefined : JSON.stringify(body),
  });
}

const apiClient = {
  request,
  get: (path, config) => request(path, { ...config, method: "GET" }),
  post: (path, body, config) => withJsonBody("POST", path, body, config),
  put: (path, body, config) => withJsonBody("PUT", path, body, config),
  patch: (path, body, config) => withJsonBody("PATCH", path, body, config),
  delete: (path, config) => request(path, { ...config, method: "DELETE" }),
};

export default apiClient;
