import { FastifyReply, FastifyRequest } from "fastify";

export const checkIdExists = async (req: FastifyRequest, res: FastifyReply) => {
  const id = req.cookies.id;

  if (!id) {
    return res.status(401).send({
      error: "Unauthorized",
    });
  }
};
