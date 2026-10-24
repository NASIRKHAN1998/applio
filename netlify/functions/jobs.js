exports.handler = async (event) => {
  const q = (event.queryStringParameters?.q || "").slice(0, 80);
  try {
    const r = await fetch(`https://remotive.com/api/remote-jobs?limit=30&search=${encodeURIComponent(q)}`);
    const d = await r.json();
    const jobs = (d.jobs || []).map(j => ({
      id: j.id, title: j.title, company: j.company_name, url: j.url,
      location: j.candidate_required_location, type: j.job_type, salary: j.salary,
      date: j.publication_date,
      description: (j.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 3500)
    }));
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ jobs }) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: "Job source unavailable" }) };
  }
};
