// pages/api/bookmarks/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const POCKETBASE_URL = "http://localhost:8090"; // change if needed
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("Incoming Query:", req.query);  // 👈 log query params

    const { page = 1, perPage = 10, filter = "", expand = "", sort = "-created" } = req.query;

    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      sort: String(sort),
    });

    if (filter) params.append("filter", String(filter));
    if (expand) params.append("expand", String(expand));

    console.log("Requesting from PocketBase:", params.toString()); // 👈 log built URL

    const pbRes = await axios.get(`${POCKETBASE_URL}/api/collections/bookmarks/records`, {
      params,
    });

    res.status(200).json(pbRes.data);
  } catch (err: any) {
    console.error("API ERROR:", err.response?.data || err.message || err); // 👈 full error
    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Something went wrong",
    });
  }
}
