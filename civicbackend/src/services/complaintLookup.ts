import { CITIES_DATA } from "../data/cityData";

// Flatten every city's complaints into one searchable array once, at import time.
function getAllComplaints() {
  return Object.values(CITIES_DATA).flatMap((city) =>
    city.complaints.map((c) => ({ ...c, cityName: city.cityName }))
  );
}

export async function getComplaintById(complaintId: string) {
  const all = getAllComplaints();
  const found = all.find(
    (c) => c.id.toLowerCase() === complaintId.trim().toLowerCase()
  );
  return found ?? null;
}

export interface SearchComplaintsQuery {
  status?: string;
  category?: string;
  cityName?: string;
  limit?: number;
}

export async function searchComplaints(query: SearchComplaintsQuery) {
  let all = getAllComplaints();

  if (query.status) {
    all = all.filter(
      (c) => c.status.toLowerCase() === query.status!.toLowerCase()
    );
  }
  if (query.category) {
    all = all.filter((c) =>
      c.category.toLowerCase().includes(query.category!.toLowerCase())
    );
  }
  if (query.cityName) {
    all = all.filter(
      (c) => c.cityName.toLowerCase() === query.cityName!.toLowerCase()
    );
  }

  return all.slice(0, query.limit || 10);
}