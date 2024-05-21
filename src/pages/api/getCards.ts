import { CardRepo } from "@/lib/classes/cardsRepo";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  cards: number[][];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const cardRepo = new CardRepo();
  await cardRepo.init();
  res.status(200).json({ cards: cardRepo.draw() });
}
