// pages/api/bookmarks/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,

} from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, perPage = 10, filter = "", sort = "createdAt" } = req.query;

    const colRef = collection(db, "bookmarks");

    const constraints = [];

    // Optional filter (e.g., by user ID or anime title)
    if (filter) {
      constraints.push(where("userID", "==", String(filter))); // customize this field!
    }

    // Sorting
    constraints.push(orderBy(String(sort), "desc"));

    // Pagination logic (basic)
    constraints.push(limit(Number(perPage)));

    const q = query(colRef, ...constraints);

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      page: Number(page),
      perPage: Number(perPage),
      items: data,
      totalItems: data.length,
    });
  } catch (err: any) {
    console.error("Firebase API ERROR:", err);
    res.status(500).json({ error: "Failed to fetch bookmarks from Firestore" });
  }
}
