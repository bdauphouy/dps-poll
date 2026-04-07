import { GeoLocation } from "@/types/poll";

export async function getGeoLocation(ip: string): Promise<GeoLocation> {
  try {
    // Skip geolocation for localhost/private IPs
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return { ip, country: "Local", city: "Local" };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,query`);
    const data = await response.json();

    if (data.status === "success") {
      return {
        ip: data.query || ip,
        country: data.country || "Unknown",
        city: data.city || "Unknown",
      };
    }

    return { ip, country: "Unknown", city: "Unknown" };
  } catch {
    return { ip, country: "Unknown", city: "Unknown" };
  }
}

export function getClientIP(request: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "127.0.0.1";
}
