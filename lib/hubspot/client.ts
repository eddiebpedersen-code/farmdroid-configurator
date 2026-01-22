const HUBSPOT_API_BASE = "https://api.hubapi.com";

/**
 * Make an authenticated request to the HubSpot API
 */
export async function hubspotRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is not configured");
  }

  const response = await fetch(`${HUBSPOT_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("HubSpot API error:", response.status, errorBody);
    throw new Error(`HubSpot API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Search for existing records in HubSpot
 */
export async function searchHubSpot(
  objectType: "contacts" | "companies" | "deals",
  filterGroups: Array<{
    filters: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }>;
  }>
): Promise<{ results: Array<{ id: string; properties: Record<string, string> }> }> {
  return hubspotRequest(`/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups,
      limit: 1,
    }),
  });
}
