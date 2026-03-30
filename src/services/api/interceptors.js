export function applyRequestInterceptors(config = {}) {
  const nextConfig = {
    headers: {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    },
    ...config,
  };

  return nextConfig;
}

export async function applyResponseInterceptors(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
