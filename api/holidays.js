module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const country = String(url.searchParams.get("country") || "").trim();
  const year = Number(url.searchParams.get("year") || new Date().getFullYear());
  const code = resolveCountryCode(country);

  if (!code) {
    return response.status(200).json({ ok: true, country, code: "", holidays: [] });
  }

  try {
    const upstream = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`, {
      headers: { Accept: "application/json" },
    });

    if (!upstream.ok) {
      return response.status(200).json({ ok: true, country, code, holidays: [] });
    }

    const holidays = await upstream.json();
    return response.status(200).json({
      ok: true,
      country,
      code,
      holidays: holidays.map((holiday) => ({
        date: holiday.date,
        localName: holiday.localName,
        name: holiday.name,
        global: holiday.global,
      })),
    });
  } catch (error) {
    return response.status(200).json({
      ok: true,
      country,
      code,
      holidays: [],
      warning: error?.message || "Unable to load holidays",
    });
  }
};

function resolveCountryCode(value) {
  const text = String(value || "").toLowerCase();
  const compact = text.replace(/[^a-z]/g, "");
  const aliases = [
    ["united states", "US"],
    ["usa", "US"],
    ["us", "US"],
    ["united kingdom", "GB"],
    ["uk", "GB"],
    ["great britain", "GB"],
    ["england", "GB"],
    ["germany", "DE"],
    ["deutschland", "DE"],
    ["france", "FR"],
    ["spain", "ES"],
    ["italy", "IT"],
    ["portugal", "PT"],
    ["netherlands", "NL"],
    ["holland", "NL"],
    ["belgium", "BE"],
    ["sweden", "SE"],
    ["norway", "NO"],
    ["denmark", "DK"],
    ["finland", "FI"],
    ["poland", "PL"],
    ["austria", "AT"],
    ["switzerland", "CH"],
    ["turkey", "TR"],
    ["turkiye", "TR"],
    ["uae", "AE"],
    ["united arab emirates", "AE"],
    ["dubai", "AE"],
    ["saudi", "SA"],
    ["saudi arabia", "SA"],
    ["qatar", "QA"],
    ["kuwait", "KW"],
    ["oman", "OM"],
    ["bahrain", "BH"],
    ["israel", "IL"],
    ["jordan", "JO"],
    ["egypt", "EG"],
    ["morocco", "MA"],
    ["tunisia", "TN"],
    ["kazakhstan", "KZ"],
    ["uzbekistan", "UZ"],
    ["kyrgyzstan", "KG"],
    ["russia", "RU"],
    ["ukraine", "UA"],
    ["georgia", "GE"],
    ["azerbaijan", "AZ"],
    ["india", "IN"],
    ["philippines", "PH"],
    ["malaysia", "MY"],
    ["indonesia", "ID"],
    ["australia", "AU"],
    ["new zealand", "NZ"],
    ["canada", "CA"],
    ["mexico", "MX"],
    ["brazil", "BR"],
    ["chile", "CL"],
    ["costa rica", "CR"],
    ["china", "CN"],
  ];

  for (const [name, code] of aliases) {
    if (compact.includes(name.replace(/[^a-z]/g, ""))) return code;
  }

  const iso = text.match(/\b[A-Z]{2}\b/i)?.[0];
  return iso ? iso.toUpperCase() : "";
}
