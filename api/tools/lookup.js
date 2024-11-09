import fetch from "node-fetch";
const api_key = "E4/gdcfciJHSQdy4+9+Ryw==JHciNFemGqOVIbyv";
async function fetchDNSRecords(apiKey, domain) {
  try {
    const response = await fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain}`, {
      headers: {
        "X-Api-Key": apiKey
      },
      contentType: "application/json"
    });
    return await response.json();
  } catch (error) {
    throw console.log(error), new Error("❌ Gagal mengambil rekaman DNS.");
  }
}
async function fetchDNSRecordsFromHackertarget(domain) {
  try {
    const response = await fetch(`https://api.hackertarget.com/dnslookup/?q=${domain}`);
    return await response.text();
  } catch (error) {
    throw console.log(error), new Error("❌ Gagal mengambil rekaman DNS dari hackertarget.");
  }
}
async function convertRecords(domain) {
  try {
    return (await fetchDNSRecords(api_key, domain)).map((record, index) => `🔍 [${index + 1}]:\n${Object.entries(record).map(([ key, value ]) => {
const input = key;
return `*${input.charAt(0).toUpperCase() + input.slice(1).replace(/_/g, " ")}:* ${"string" == typeof value ? value.replace(/\.$/, "") : value}`;
}).join("\n")}`).join("\n");
  } catch (error) {
    return console.log(error), await fetchDNSRecordsFromHackertarget(domain);
  }
}
export default convertRecords;